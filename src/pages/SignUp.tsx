import { CircleHelp, Moon, Shield, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";

export const SignUp = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const isDarkTheme =
    theme === "dark" ||
    (theme === "system" && document.documentElement.classList.contains("dark"));

  const handleThemeToggle = () => {
    setTheme(isDarkTheme ? "light" : "dark");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(ROUTES.SIGN_IN);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] bg-primary/12 [clip-path:polygon(100%_0,100%_100%,0_100%)] md:block dark:bg-primary/18" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_18%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_82%_78%,rgba(249,115,22,0.15),transparent_36%)] dark:bg-[radial-gradient(circle_at_8%_18%,rgba(59,130,246,0.24),transparent_40%),radial-gradient(circle_at_82%_78%,rgba(249,115,22,0.18),transparent_36%)]" />

      <header className="relative z-10 flex items-center justify-between border-b border-border/60 px-5 pb-4 pt-6 md:px-9">
        <Link
          className="text-[34px] font-semibold tracking-[-0.03em] text-primary transition-colors hover:text-primary/85"
          to={ROUTES.SIGN_IN}
        >
          The Vault
        </Link>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Help"
            className="h-9 w-9 rounded-lg transition-all duration-200 hover:bg-primary/15 hover:text-primary dark:hover:bg-primary/35 dark:hover:text-primary-foreground dark:hover:ring-1 dark:hover:ring-primary/40"
            type="button"
          >
            <CircleHelp className="h-5 w-5" strokeWidth={2.2} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="h-9 w-9 rounded-lg transition-all duration-200 hover:bg-primary/15 hover:text-primary dark:hover:bg-primary/35 dark:hover:text-primary-foreground dark:hover:ring-1 dark:hover:ring-primary/40"
            onClick={handleThemeToggle}
            type="button"
            title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDarkTheme ? <Sun className="h-5 w-5" strokeWidth={2.2} /> : <Moon className="h-5 w-5" strokeWidth={2.2} />}
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-12 pt-14 sm:px-6">
        <section className="w-full max-w-sm">
          <h1 className="text-center text-3xl font-bold tracking-[-0.03em] text-foreground">Create your archive</h1>
          <p className="mt-1.5 text-center text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Enterprise identity &amp; access
          </p>

          <div className="mx-auto mt-6 w-full">
            <Card className="border-border/70 bg-card/95 p-5 shadow-xl shadow-primary/10 backdrop-blur-sm sm:p-6">
              <CardContent className="space-y-4">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-foreground" htmlFor="fullName">
                      Full Name
                    </label>
                    <input
                      className="h-10 w-full rounded-md border border-border bg-muted/60 px-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/35"
                      id="fullName"
                      placeholder="Alexander Sterling"
                      type="text"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-foreground" htmlFor="workEmail">
                      Work Email
                    </label>
                    <input
                      className="h-10 w-full rounded-md border border-border bg-muted/60 px-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/35"
                      id="workEmail"
                      placeholder="a.sterling@firm.arch"
                      type="email"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-foreground" htmlFor="signupPassword">
                      Password
                    </label>
                    <input
                      className="h-10 w-full rounded-md border border-border bg-muted/60 px-3 text-sm tracking-[0.2em] text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/35"
                      id="signupPassword"
                      placeholder="..........."
                      type="password"
                    />
                    <p className="text-xs text-muted-foreground">Minimum 12 characters with biometric support.</p>
                  </div>

                  <Button
                    className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
                    type="submit"
                  >
                    Create Account
                  </Button>
                </form>

                <div className="flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Secure identity provider</span>
                  <Separator className="flex-1" />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex w-full gap-2 rounded-md border-border bg-muted/70 text-base font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent"
                  type="button"
                >
                  <span aria-hidden className="flex items-center text-lg font-bold leading-none">
                    <span className="text-[#ea4335]">G</span>
                  </span>
                  Sign up with Google
                </Button>

                <p className="text-center text-xs text-foreground/85">
                  Already have access?{" "}
                  <Link className="font-semibold text-primary hover:text-primary/80" to={ROUTES.SIGN_IN}>
                    Sign In
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-7 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            End-to-end encrypted provisioning
          </div>
        </section>
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
    </div>
  );
};
