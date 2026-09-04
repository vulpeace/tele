🚧 WORK IN PROGRESS 🚧

# Tele
### An extended API for Mihomo/Clash Meta server. [^1]
Do **not expose** to WAN without a reverse proxy that handles TLS!    

Can be run using Docker (see Dockerfile and compose.yaml) or with

```
pnpm install --frozen-lockfile && pnpm build && pnpm start
```
Working directory structure:  
- ./bin/:  automatically detects the platform and downloads the latest Mihomo binary to this location  
- ./data/:  
  * holds the database db.sqlite3 (schema is defined in ./src/db/index.ts)  
  * secrets in config.json  
  * proxy server configuration in mihomo-config.yaml  
- ./version: deployed project version

Environment (with defaults):
- TEST_ENV (false) – moves ./bin and ./data to ./temp 
- PORT (3000) – API listens to this port
- SUBSCRIPTION_PATH (/sub) – path for end users to get their proxy configs
- ALLOW_PRERELEASE (false) – whether to download Mihomo prereleases
- CORE_REPO (MetaCubeX/mihomo) – place where to download the binary from
- ARCH – overrides which platform to download Mihomo for

Built according to the OpenAPI Specification v3 with the help of tsoa library.

[^1]: Until the Mihomo devs come with the official implementation of /listeners route.  
