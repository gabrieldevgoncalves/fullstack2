import { RouteGuard } from "@/components/auth/route-guard"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <RouteGuard requireAuth={false}>
      <LoginForm />
    </RouteGuard>
  )
}
