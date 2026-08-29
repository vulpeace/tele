import { chmod, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { unzip } from "node:zlib";

const CORE_REPO = process.env.CORE_REPO ?? "MetaCubeX/mihomo";

const pArch = process.arch;
let arch = "";
switch (pArch) {
  case "x64":
    arch = "amd64-v2";
    break;
  case "arm64":
    arch = "arm64-v8a";
    break;
  default:
    if (!process.env.ARCH) {
      throw new Error(
        "Please refer to mihomo releases \
        and specify the architecture accordingly in .env",
      );
    }
}

const pPlatform = process.platform;
let platform = "";
switch (pPlatform) {
  case "win32":
    platform = "windows";
    break;
  default:
    platform = pPlatform;
}

export async function fetchLatesMihomoRelease() {
  const url = `https://api.github.com/repos/${CORE_REPO}/releases`;
  const ALLOW_PRERELEASE = process.env.ALLOW_PRERELEASE ?? false;

  console.info("Fetching available mihomo releases from Github...");
  const response = await fetch(url, {
    headers: {
      "X-GitHub-Api-Version": "2026-03-10",
    },
  });
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const result = await response.json();
  if (!result.length) {
    throw new Error("Github returned empty response");
  }

  let prereleaseTag = "";
  let releaseTag = "";

  // Compare release and prerelease date
  for (let i = 0; i < result.length; i++) {
    let release: { prerelease: boolean; tag_name: string } = result[i];
    if (release.prerelease && !prereleaseTag) {
      prereleaseTag = release.tag_name;
      console.info(`Found prerelease ${prereleaseTag}`);
    } else {
      releaseTag = release.tag_name;
      console.info(`Found release ${releaseTag}`);
      break;
    }
  }

  return ALLOW_PRERELEASE ? (prereleaseTag ?? releaseTag) : releaseTag;
}

const unzipAsync = promisify(unzip);
export async function downloadMihomo(tag: string, executableLocation: string) {
  const url = `https://github.com/${CORE_REPO}/releases/download/${tag}/mihomo-${platform}-${arch}-${tag}.gz`;

  console.info(`Downloading mihomo ${tag} for ${platform}-${arch}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const responseBuffer = await response.arrayBuffer();
  const gz = Buffer.from(responseBuffer);

  console.info("Extracting mihomo...");
  const buffer = await unzipAsync(gz);
  await writeFile(executableLocation, buffer);
  await chmod(executableLocation, 0o755);
  console.info("Success");
}
