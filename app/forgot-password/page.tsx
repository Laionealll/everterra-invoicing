import { AuthShell } from "@/components/auth-shell"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset password" description="Enter your email to receive a reset link.">
      <ForgotPasswordForm />
    </AuthShell>
  )
}
