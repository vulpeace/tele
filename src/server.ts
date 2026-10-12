import { app } from "./app.js";
import { mihomo } from "./coreManager/coreManager.js";
import { db } from "./db/index.js";
import { restarting } from "./coreManager/coreManager.js";

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

let shuttingDown = false;

function stopMihomo(): Promise<void> {
  return new Promise((resolve) => {
    const proc = mihomo;

    if (!proc || proc.exitCode !== null || proc.signalCode !== null) {
      resolve();
      return;
    }

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      clearTimeout(sigkillTimer);
      clearTimeout(giveUpTimer);
      proc.removeListener("exit", settle);
      proc.removeListener("error", settle);
      resolve();
    };

    const sigkillTimer = setTimeout(() => {
      if (proc.exitCode === null) {
        console.error("mihomo ignored SIGTERM, sending SIGKILL");
        proc.kill("SIGKILL");
      }
    }, 2000);

    const giveUpTimer = setTimeout(settle, 2500);

    proc.once("exit", settle);
    proc.once("error", settle);
    proc.kill("SIGTERM");
  });
}

async function gracefulShutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.info(`Received ${signal}, shutting down...`);

  setTimeout(() => {
    console.error(
      "Shutdown timed out, exiting anyway. Mihomo might still be running",
    );
    process.exit(1);
  }, 5000);

  try {
    if (restarting) await restarting.catch(() => {});
    const drain = new Promise<void>((resolve) => {
      server.close(() => resolve());
      server.closeIdleConnections();
      setTimeout(() => server.closeAllConnections(), 3000);
    });

    await drain;

    try {
      db.close();
    } catch (e: any) {
      console.error(e.message);
    }

    await stopMihomo();
    process.exit(0);
  } catch (e: any) {
    console.error(`Shutdown failed: ${e.message}`);
    process.exit(1);
  }
}

process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));

process.on("SIGINT", () => void gracefulShutdown("SIGINT"));
