import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

// Pin the workspace root to this project directory so Turbopack does not infer
// it from an unrelated parent lockfile (which can happen on dev machines).
const projectRoot = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: projectRoot,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
