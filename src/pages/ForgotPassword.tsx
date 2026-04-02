import { AlertCircle, ArrowLeft, Eye, EyeOff, KeyRound, Mail, Moon, Shield, Sun } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { useMemo, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { ROUTES } from "@/constants/routes"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useForgotPassword } from "@/hooks/use-forgot-password"

export const ForgotPassword = () => {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)

  const {
    step,
    email,
    code,
    newPassword,
    confirmPassword,
    isLoading,
    error,
    isCodeStep,
    isResetStep,
    setEmail,
    setCode,
    setNewPassword,
    setConfirmPassword,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
    handleBackStep,
  } = useForgotPassword({
    onCompleted: () => {
      navigate(ROUTES.SIGN_IN)
    },
  })

  const isDarkTheme =
    theme === "dark" ||
    (theme === "system" && document.documentElement.classList.contains("dark"))

  const stepLabel = useMemo(() => {
    if (step === 1) {
      return "Step 1 of 3 - Send code"
    }

    if (step === 2) {
      return "Step 2 of 3 - Verify code"
    }

    return "Step 3 of 3 - Reset password"
  }, [step])

  const handleThemeToggle = () => {
    setTheme(isDarkTheme ? "light" : "dark")
  }

  const handleCodeChange = (value: string) => {
    const normalizedCode = value.replace(/\D/g, "").slice(0, 6)
    setCode(normalizedCode)
  }

  const handleBackClick = () => {
    if (step === 1) {
      navigate(ROUTES.SIGN_IN)
      return
    }

    handleBackStep()
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
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-20 pt-8 sm:px-6">
        <Card className="w-full max-w-sm border-border/70 bg-card/95 p-5 shadow-xl shadow-primary/10 backdrop-blur-sm sm:p-6">
          <CardContent className="space-y-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/35">
              <KeyRound className="h-6 w-6 text-white" />
            </div>

            <div className="space-y-1 text-center">
              <h1 className="text-3xl font-bold tracking-[-0.03em] text-foreground">Forgot Password</h1>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{stepLabel}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className={`h-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-1 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {!isCodeStep && !isResetStep && (
              <form className="space-y-4" onSubmit={handleSendCode}>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-foreground" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      className="h-10 w-full rounded-md border border-border bg-muted/60 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/35"
                      id="email"
                      placeholder="name@company.com"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? "Sending..." : "Send Verification Code"}
                </Button>
              </form>
            )}

            {isCodeStep && (
              <form className="space-y-4" onSubmit={handleVerifyCode}>
                <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  A verification code has been sent to
                  <span className="ml-1 font-semibold text-foreground">{email}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-foreground" htmlFor="code">
                    6-digit code
                  </label>
                  <input
                    className="h-10 w-full rounded-md border border-border bg-muted/60 px-3 text-center text-sm tracking-[0.36em] text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/35"
                    id="code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    type="text"
                    value={code}
                    onChange={(event) => handleCodeChange(event.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>

                <Button
                  variant="outline"
                  className="h-10 w-full rounded-md"
                  disabled={isLoading}
                  type="button"
                  onClick={() => {
                    void handleResendCode()
                  }}
                >
                  Resend Code
                </Button>
              </form>
            )}

            {isResetStep && (
              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  Password reset will be applied to
                  <span className="ml-1 font-semibold text-foreground">{email}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-foreground" htmlFor="newPassword">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      className="h-10 w-full rounded-md border border-border bg-muted/60 px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/35"
                      id="newPassword"
                      placeholder="Enter new password"
                      type={isNewPasswordVisible ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      disabled={isLoading}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8 text-muted-foreground"
                      type="button"
                      onClick={() => setIsNewPasswordVisible((previous) => !previous)}
                    >
                      {isNewPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-foreground" htmlFor="confirmPassword">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      className="h-10 w-full rounded-md border border-border bg-muted/60 px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/35"
                      id="confirmPassword"
                      placeholder="Re-enter new password"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      disabled={isLoading}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8 text-muted-foreground"
                      type="button"
                      onClick={() => setIsConfirmPasswordVisible((previous) => !previous)}
                    >
                      {isConfirmPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="h-auto px-0 text-xs text-muted-foreground"
                type="button"
                disabled={isLoading}
                onClick={handleBackClick}
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Back
              </Button>

              <Button
                variant="link"
                className="h-auto p-0 text-xs font-medium text-primary hover:text-primary/80"
                type="button"
                onClick={() => navigate(ROUTES.SIGN_IN)}
              >
                Return to Sign In
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Recovery channel</span>
              <Separator className="flex-1" />
            </div>

            <p className="text-center text-xs text-foreground/85">
              Need administrator help?{" "}
              <a className="font-semibold text-primary hover:text-primary/80" href="#">
                Contact support
              </a>
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border/60 bg-background/75 px-6 py-5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm md:px-10">
        <p>© 2024 The Vault Architectural Archive. All rights reserved.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <a className="transition-colors hover:text-foreground" href="#">Privacy Policy</a>
          <a className="transition-colors hover:text-foreground" href="#">Terms of Service</a>
          <a className="transition-colors hover:text-foreground" href="#">Security Audit</a>
          <a className="transition-colors hover:text-foreground" href="#">Contact</a>
        </div>
      </footer>

      <Shield className="pointer-events-none absolute bottom-16 right-8 hidden h-4 w-4 text-muted-foreground sm:block" />
    </div>
  )
}
