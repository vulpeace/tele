FROM node:24-alpine AS builder
RUN export COREPACK_ENABLE_DOWNLOAD_PROMPT=0 && corepack enable pnpm
WORKDIR /app
RUN chown node:node /app
USER node

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    pnpm install --frozen-lockfile

COPY --chown=node:node . .
RUN pnpm run build

FROM node:24-alpine AS deps
RUN export COREPACK_ENABLE_DOWNLOAD_PROMPT=0 && corepack enable pnpm
WORKDIR /app
RUN chown node:node /app
USER node

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    pnpm install --prod --frozen-lockfile

FROM node:24-alpine AS runner
ENV PATH=/app/node_modules/.bin:$PATH
WORKDIR /app

COPY --link --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
RUN chown node:node /app

EXPOSE 3000

USER node

CMD ["node", "build/src/server.js"]
