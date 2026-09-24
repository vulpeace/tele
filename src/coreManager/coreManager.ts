import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { fetchLatesMihomoRelease, downloadMihomo } from "./fetchCore.js";

const executableLocation = process.cwd() + "/bin/mihomo";
const configLocation = process.cwd() + "/data/mihomo-config.yaml";
export let mihomo: ChildProcessWithoutNullStreams;
let restarting: Promise<void> | null = null;

async function spawnMihomoProcess() {
  console.info("mihomo is starting up");
  mihomo = spawn(executableLocation, ["-f", configLocation]);
  mihomo.stdout.on("data", (data) => {
    console.log(data.toString());
  });
  mihomo.stderr?.on("data", (data) => {
    console.error(data.toString());
  });
  mihomo.once("error", (err) => {
    console.error(`mihomo spawn error: ${err.message}`);
  });
}

export async function initializeCore() {
  try {
    await access(executableLocation);
  } catch (e: any) {
    const latestMihomoTag = await fetchLatesMihomoRelease();
    await downloadMihomo(latestMihomoTag, executableLocation);
  } finally {
    await spawnMihomoProcess();
  }
}

export async function restartCore(): Promise<void> {
  if (restarting) return restarting;

  restarting = (async () => {
    const old = mihomo;
    if (old && old.exitCode === null) {
      let sigkillTimer: NodeJS.Timeout | undefined;
      let timeoutTimer: NodeJS.Timeout | undefined;

      const exited = new Promise<void>((resolve, reject) => {
        old.once("error", reject);
        old.once("exit", () => resolve());
      });

      try {
        old.kill("SIGTERM");

        sigkillTimer = setTimeout(() => {
          if (old.exitCode === null) old.kill("SIGKILL");
        }, 3000);

        const timeoutPromise = new Promise<void>((_, reject) => {
          timeoutTimer = setTimeout(
            () => reject(new Error("mihomo shutdown timeout")),
            5000,
          );
        });

        await Promise.race([exited, timeoutPromise]);
      } finally {
        clearTimeout(sigkillTimer);
        clearTimeout(timeoutTimer);
        old.removeAllListeners();
        old.stdout?.removeAllListeners();
        old.stderr?.removeAllListeners();
      }
    }
    await spawnMihomoProcess();
  })();

  try {
    await restarting;
  } catch (e: any) {
    throw new Error(`Could not restart core, reason: ${e.message}`);
  } finally {
    restarting = null;
  }
}

export async function testConfiguration(testConfigLocation: string) {
  const successTemplate = /(test is successful)/;
  const failTemplate = /(test failed)/;
  const mihomoTest = spawn(executableLocation, ["-t", testConfigLocation]);
  let pastMessage = "";
  mihomoTest.stdout.on("data", (data) => {
    const message = data.toString();
    if (successTemplate.test(message)) {
      return;
    }
    if (failTemplate.test(message)) {
      throw new Error(`Error in configuration:\n${pastMessage}`);
    }
    pastMessage = message;
  });
}
