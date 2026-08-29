import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { fetchLatesMihomoRelease, downloadMihomo } from "./fetchCore.js";

async function spawnMihomoProcess(
  executableLocation: string,
  configLocation: string,
) {
  const mihomo = spawn(executableLocation, ["-f", configLocation]);
  console.info("mihomo is running");
  return mihomo;
}

export async function initializeCore(
  executableLocation: string,
  configLocation: string,
) {
  try {
    await access(executableLocation);
  } catch (e: any) {
    const latestMihomoTag = await fetchLatesMihomoRelease();
    await downloadMihomo(latestMihomoTag, executableLocation);
  } finally {
    const mihomo = await spawnMihomoProcess(executableLocation, configLocation);
    return mihomo;
  }
}

export async function restartCore() {
  const request = new Request("http://127.0.0.1:9090/restart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MIHOMO_SECRET}`,
    },
  });

  const res = await fetch(request);
  if (res.status !== 200) {
    throw new Error("Could not restart the core");
  }
}

export async function testConfiguration(
  executableLocation: string,
  configLocation: string,
) {
  const successTemplate = /(test is successful)/;
  const failTemplate = /(test failed)/;
  const mihomo = spawn(executableLocation, ["-t", configLocation]);
  let pastMessage = "";
  mihomo.stdout.on("data", (data) => {
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
