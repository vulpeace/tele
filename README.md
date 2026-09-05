🚧 WORK IN PROGRESS 🚧

# Tele
### An extended API for Mihomo/Clash Meta server. [^1]
Do **not expose** to WAN without a reverse proxy that handles TLS!    

Can be run using Docker (see Dockerfile and compose.yaml) or with

```
pnpm install --frozen-lockfile && pnpm build && pnpm start
```

Introduces routes under /api:
- /auth(/register | /login) – plaintext credentials, all other routes except for /sub require Bearer auth with JWT
- /configs (managing templates for Mihomo client configs)
- /listeners (managing proxy listeners on the server)
- /proxies (managing how clients would receive proxy)
- /system/version (get Tele installed version)
- /users (manage users inside proxies and their access credentials)
- /core (passthrough to Mihomo while still being under)

> Refer to ./src/routes/*Controller.ts for available methods and response formats

Another base URL is:
- /sub (can be overridden via env) – constructs and serves Mihomo configuration if User-Agent contains Mihomo or Clash (case-insensitive) or vless:// URIs for any other UA
> Only vless:// is currently supported

Working directory structure:  
- ./bin/:  automatically detects the platform and downloads the latest Mihomo binary to this location  
- ./data/:  
  * holds the database db.sqlite3 (schema is defined in ./src/db/index.ts)  
  * secrets in config.json  
  * proxy server configuration in mihomo-config.yaml  
- ./version: deployed project version

Environment (can be omitted):
- TEST_ENV (false) – moves ./bin and ./data to ./temp 
- PORT (3000) – API listens to this port
- SUBSCRIPTION_PATH (/sub) – path for end users to get their proxy configs
- ALLOW_MIHOMO_PRERELEASE (false) – whether to download Mihomo prereleases
- MIHOMO_REPO (MetaCubeX/mihomo) – place where to download the binary from
- MIHOMO_ARCH – overrides which platform to download Mihomo for

Built according to the OpenAPI Specification v3 with the help of tsoa library.

[^1]: Until the Mihomo devs come with the official implementation of /listeners route.  
