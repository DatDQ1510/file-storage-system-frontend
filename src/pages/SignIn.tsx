import { Building2, Lock, Moon, Shield, Sun, AlertCircle, Eye, EyeOff, Smartphone } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { useSignIn } from "@/hooks/use-sign-in";

export const SignIn = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { usernameOrEmail, password, error, isLoading, setUsernameOrEmail, setPassword, handleSubmit } = useSignIn({
    onSuccess: () => {
      navigate(ROUTES.HOME);
    },
  });

  const isDarkTheme =
    theme === "dark" ||
    (theme === "system" && document.documentElement.classList.contains("dark"));

  const handleThemeToggle = () => {
    setTheme(isDarkTheme ? "light" : "dark");
  };

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
            Secure environment
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
          <Lock className="h-4 w-4 text-primary" strokeWidth={2.2} />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-20 pt-8 sm:px-6">
        <Card className="w-full max-w-sm border-border/70 bg-card/95 p-5 shadow-xl shadow-primary/10 backdrop-blur-sm sm:p-6">
          <CardContent className="space-y-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/35">
              <Building2 className="h-6 w-6 text-white" />
            </div>

            <div className="space-y-1 text-center">
              <h1 className="text-3xl font-bold tracking-[-0.03em] text-foreground">Sign In</h1>
              <p className="text-sm text-muted-foreground">Access the architectural archives</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-1 w-full gap-2 rounded-md border-border bg-muted/70 text-base font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent"
              type="button"
            >
              <span aria-hidden className="flex items-center text-lg font-bold leading-none">
                <span className="text-[#ea4335]">G</span>
              </span>
              Continue with Google
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 rounded-md border-border bg-muted/70 text-base font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent"
              type="button"
              onClick={() => navigate(ROUTES.TOTP_SIGN_IN)}
            >
              <Smartphone className="h-4 w-4 text-primary" />
              Sign in with TOTP
            </Button>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Corporate credentials</span>
              <Separator className="flex-1" />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground" htmlFor="usernameOrEmail">
                  Username or Email
                </label>
                <input
                  className="h-10 w-full rounded-md border border-border bg-muted/60 px-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/35"
                  id="usernameOrEmail"
                  placeholder="name@company.com or username"
                  type="text"
                  value={usernameOrEmail}
                  onChange={(event) => setUsernameOrEmail(event.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-foreground" htmlFor="password">
                    Password
                  </label>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs font-medium text-primary hover:text-primary/80"
                    type="button"
                    onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                  >
                    Forgot Password?
                  </Button>
                </div>
                <div className="relative">
                  <input
                    className="h-10 w-full rounded-md border border-border bg-muted/60 px-3 pr-10 text-sm tracking-[0.2em] text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/35"
                    id="password"
                    placeholder="........"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8 text-muted-foreground"
                    type="button"
                    onClick={() => setIsPasswordVisible((previous) => !previous)}
                  >
                    {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                className="mt-1 h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>


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
  );
};
