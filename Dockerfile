# Everterra Invoicing — build & run without corepack.
#
# Railway's Nixpacks builder launches pnpm through the corepack bundled with
# Node, which crashes on pnpm 11.3.0 (ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING)
# on both Node 22 and 24. Installing pnpm directly with npm sidesteps corepack
# entirely and makes the build deterministic.

FROM node:22-slim

# The exact pnpm this repo pins (packageManager field), installed via npm — no corepack.
RUN npm install -g pnpm@11.3.0

WORKDIR /app

# Install deps first for layer caching. devDependencies (tailwind, typescript)
# are needed for `next build`, so NODE_ENV must NOT be "production" here.
# pnpm-workspace.yaml carries the allowBuilds decision (sharp) and the hono override.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Build the app. (.dockerignore keeps node_modules/.next out of the context,
# so this COPY won't clobber the freshly installed node_modules.)
COPY . .
RUN pnpm build

# Runtime. `pnpm start` runs scripts/migrate.mjs (idempotent schema bootstrap)
# then `next start`. Railway injects PORT; Next binds to it automatically.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["pnpm", "start"]
