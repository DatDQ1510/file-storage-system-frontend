import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Moon,
  Shield,
  Sun,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/components/theme-provider"
import { ROUTES } from "@/constants/routes"
import { completeTenantActivation, verifyActivationToken } from "@/pages/system-admin/services/tenant-service"
import { storeAuthSession } from "@/lib/api/auth-service"
import {
  buildActivationPayload,
  evaluatePasswordStrength,
  isStrongPassword,
} from "@/helpers/validators/tenant-provision"
import type { ITenantActivationTokenInfo } from "@/pages/system-admin/types"

export const SetupPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { theme, setTheme } = useTheme()
  const [tokenInfo, setTokenInfo] = useState<ITenantActivationTokenInfo | null>(null)
  const [isTokenLoading, setIsTokenLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)

  const token = searchParams.get("token") ?? ""

  const isDarkTheme =
    theme === "dark" ||
    (theme === "system" && document.documentElement.classList.contains("dark"))

  const strength = useMemo(() => evaluatePasswordStrength(password), [password])
  const requirementsMetCount = strength.requirements.filter((requirement) => requirement.isMet).length
  const hasPasswordMismatch = Boolean(confirmPassword) && password !== confirmPassword

  const handleThemeToggle = () => {
    setTheme(isDarkTheme ? "light" : "dark")
  }

  useEffect(() => {
    const validateToken = async () => {
      setIsTokenLoading(true)
      setError(null)

      try {
        const result = await verifyActivationToken(token)
        setTokenInfo(result)

        if (!result.isValid) {
          setError(result.message)
        }
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to validate activation token")
      } finally {
        setIsTokenLoading(false)
      }
    }

    void validateToken()
  }, [token])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!tokenInfo?.isValid) {
      setError("Activation token is invalid or expired.")
      return
    }

    if (!password.trim()) {
      setError("Please enter a new password.")
      return
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your password.")
      return
    }

    if (!isStrongPassword(password)) {
      setError("Password does not meet the strength requirements.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await completeTenantActivation(
        buildActivationPayload(token, password, confirmPassword)
      )

      if (result.accessToken) {
        storeAuthSession({
          accessToken: result.accessToken,
          role: "TENANT_ADMIN",
          email: tokenInfo.adminEmail ?? "",
          username: tokenInfo.adminEmail ?? "",
        })
      }

      toast.success(result.message ?? "Account activated successfully.")
      navigate(ROUTES.TENANT_ADMIN_DASHBOARD)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to activate account")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(59,130,246,0.18),transparent_42%),radial-gradient(circle_at_86%_80%,rgba(249,115,22,0.16),transparent_38%)] dark:bg-[radial-gradient(circle_at_12%_14%,rgba(59,130,246,0.24),transparent_42%),radial-gradient(circle_at_86%_80%,rgba(249,115,22,0.18),transparent_38%)]" />

      <header className="relative z-10 flex items-center justify-between px-5 pb-4 pt-6 md:px-9">
        <Link
          className="text-[34px] font-semibold tracking-[-0.03em] text-primary transition-colors hover:text-primary/85"
          to={ROUTES.SIGN_IN}
        >
          The Vault
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-[10px] uppercase tracking-[0.32em] text-muted-foreground sm:block">
            Activation flow
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-muted-foreground transition-all duration-200 hover:bg-primary/15 hover:text-primary dark:hover:bg-primary/35 dark:hover:text-primary-foreground dark:hover:ring-1 dark:hover:ring-primary/40"
            onClick={handleThemeToggle}
            title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
            type="button"
          >
            {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Shield className="h-4 w-4 text-primary" strokeWidth={2.2} />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-20 pt-8 sm:px-6">
        <Card className="w-full max-w-lg border-border/70 bg-card/95 p-5 shadow-xl shadow-primary/10 backdrop-blur-sm sm:p-6">
          <CardContent className="space-y-5">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/35">
              <KeyRound className="h-6 w-6 text-white" />
            </div>

            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-[-0.03em] text-foreground">Set your password</h1>
              <p className="text-sm text-muted-foreground">
                Use the activation token from the welcome email to unlock the root admin account.
              </p>
            </div>

            {isTokenLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-md border border-border/70 bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating activation token...
              </div>
            ) : tokenInfo?.isValid ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Activation token accepted</p>
                    <p className="mt-1 text-xs text-emerald-700">
                      {tokenInfo.companyName} • {tokenInfo.subdomain}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Token validation failed</p>
                    <p className="mt-1 text-sm">{error ?? "The activation link is invalid or has expired."}</p>
                  </div>
                </div>
              </div>
            )}

            {error && tokenInfo?.isValid && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground" htmlFor="password">
                  New password
                </label>
                <div className="relative">
                  <input
                    className="h-11 w-full rounded-md border border-border bg-muted/60 px-3 pr-10 text-sm tracking-[0.18em] text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/35"
                    id="password"
                    placeholder="Create a strong password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isTokenLoading || isSubmitting || !tokenInfo?.isValid}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-9 w-9 text-muted-foreground"
                    type="button"
                    onClick={() => setIsPasswordVisible((previous) => !previous)}
                  >
                    {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-900">Password strength</span>
                  <span className="text-slate-600">{strength.label}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-all duration-300" style={{ width: `${strength.percent}%` }} />
                </div>
                <p className="text-xs text-slate-500">
                  {requirementsMetCount}/5 requirements satisfied
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {strength.requirements.map((requirement) => (
                    <div key={requirement.key} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${requirement.isMet ? "bg-emerald-50 text-emerald-800" : "bg-white text-slate-500"}`}>
                      <CheckCircle2 className={`h-3.5 w-3.5 ${requirement.isMet ? "text-emerald-600" : "text-slate-300"}`} />
                      {requirement.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    className="h-11 w-full rounded-md border border-border bg-muted/60 px-3 pr-10 text-sm tracking-[0.18em] text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/35"
                    id="confirmPassword"
                    placeholder="Re-enter password"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={isTokenLoading || isSubmitting || !tokenInfo?.isValid}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-9 w-9 text-muted-foreground"
                    type="button"
                    onClick={() => setIsConfirmPasswordVisible((previous) => !previous)}
                  >
                    {isConfirmPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {hasPasswordMismatch && <p className="text-xs text-destructive">Passwords do not match.</p>}
              </div>

              <Button
                className="h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
                disabled={isTokenLoading || isSubmitting || !tokenInfo?.isValid}
                type="submit"
              >
                {isSubmitting ? "Activating..." : "Activate Account"}
              </Button>
            </form>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Secure provisioning</span>
              <Separator className="flex-1" />
            </div>

            <p className="text-center text-xs text-foreground/85">
              Need another activation link?{" "}
              <Link className="font-semibold text-primary hover:text-primary/80" to={ROUTES.SIGN_IN}>
                Contact your platform admin
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border/60 bg-background/75 px-6 py-5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm md:px-10">
        <p>© 2024 The Vault Architectural Archive. All rights reserved.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <a className="transition-colors hover:text-foreground" href="#">
            Privacy Policy
          </a>
          <a className="transition-colors hover:text-foreground" href="#">
            Terms of Service
          </a>
          <a className="transition-colors hover:text-foreground" href="#">
            Security Audit
          </a>
          <a className="transition-colors hover:text-foreground" href="#">
            Contact
          </a>
        </div>
      </footer>

      <Shield className="pointer-events-none absolute bottom-16 right-8 hidden h-4 w-4 text-muted-foreground sm:block" />
    </div>
  )
}
