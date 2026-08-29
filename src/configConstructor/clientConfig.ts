import { getClientConfig } from "@/src/db/config/index.js";

export function constructClientConfig(path: string) {
  const clientConfigParts = getClientConfig(path);
  if (clientConfigParts.length === 0) {
    throw new Error("Not found");
  }

  let clientConfig = {
    ...JSON.parse(clientConfigParts[0].baseConfig),
    proxies: [],
  };

  for (let i = 0; i < clientConfigParts.length; i++) {
    clientConfig.proxies.push({
      name: clientConfigParts[i].proxyName,
      type: clientConfigParts[i].type,
      ...JSON.parse(clientConfigParts[i].typeSpecific),
      ...(clientConfigParts[i].type === "vless" && {
        uuid: clientConfigParts[i].uuid,
        ...(clientConfigParts[i].flow && {
          flow: clientConfigParts[i].flow,
        }),
      }),
      ...(clientConfigParts[i].type === "tuic" && {
        uuid: clientConfigParts[i].uuid,
        password: clientConfigParts[i].password,
      }),
      ...(["trojan", "anytls", "mieru"].find(
        (type) => type === clientConfigParts[i].type,
      ) && {
        password: clientConfigParts[i].password,
      }),
      ...(clientConfigParts[i].type === "mieru" && {
        username: clientConfigParts[i].userName,
      }),
    });
  }
  return clientConfig;
}
