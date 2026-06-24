import { betterAuth } from "better-auth"
import { pool } from "@/lib/db"

// Public URL resolution: an explicit BETTER_AUTH_URL wins, then Railway's
// injected domain. If neither is set (local dev), Better Auth infers it from
// the incoming request.
const railwayUrl = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : undefined

const appUrl = process.env.BETTER_AUTH_URL ?? railwayUrl

export const auth = betterAuth({
  database: pool,
  baseURL: appUrl,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    // Email sending is deferred. When RESEND_API_KEY is configured, the reset
    // link is emailed; otherwise it is logged so the flow still works in dev.
    sendResetPassword: async ({ user, url }) => {
      try {
        const { sendPasswordResetEmail } = await import("@/lib/email")
        await sendPasswordResetEmail({ to: user.email, name: user.name, url })
      } catch (err) {
        console.log("[everterra] Password reset link for", user.email, "->", url)
      }
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(railwayUrl ? [railwayUrl] : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
})

export type SessionUser = typeof auth.$Infer.Session.user
