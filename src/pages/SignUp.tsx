import { CircleHelp, Moon, Shield } from "lucide-react";
import { Link } from "react-router";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const SignUp = () => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#e8ecef] text-[#111827]">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] bg-[#d6e5f6] [clip-path:polygon(100%_0,100%_100%,0_100%)] md:block" />

      <header className="relative z-10 flex items-center justify-between border-b border-[#dfe4ea] px-5 pb-4 pt-6 md:px-9">
        <Link
          className="text-[34px] font-semibold tracking-[-0.03em] text-[#0f3e98]"
          to={ROUTES.SIGN_IN}
        >
          The Vault
        </Link>
        <div className="flex items-center gap-5 text-[#556071]">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Help"
            className="hover:text-[#1f2937]"
            type="button"
          >
            <CircleHelp className="h-5 w-5" strokeWidth={2.2} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="hover:text-[#1f2937]"
            type="button"
          >
            <Moon className="h-5 w-5" strokeWidth={2.2} />
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-12 pt-14 sm:px-6">
        <section className="w-full max-w-sm">
          <h1 className="text-center text-3xl font-bold tracking-[-0.03em] text-[#151d2a]">Create your archive</h1>
          <p className="mt-1.5 text-center text-xs uppercase tracking-[0.12em] text-[#5f6977]">
            Enterprise identity &amp; access
          </p>

          <div className="mx-auto mt-6 w-full">
            <Card className="bg-[#f7f8fa] p-5 sm:p-6">
              <CardContent className="space-y-4">
                <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#161d29]" htmlFor="fullName">
                      Full Name
                    </label>
                    <input
                      className="h-9 w-full rounded-[2px] bg-[#dfe3e8] px-3 text-sm text-[#1f2937] placeholder:text-[#8a93a1] focus:outline-none"
                      id="fullName"
                      placeholder="Alexander Sterling"
                      type="text"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#161d29]" htmlFor="workEmail">
                      Work Email
                    </label>
                    <input
                      className="h-9 w-full rounded-[2px] bg-[#dfe3e8] px-3 text-sm text-[#1f2937] placeholder:text-[#8a93a1] focus:outline-none"
                      id="workEmail"
                      placeholder="a.sterling@firm.arch"
                      type="email"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#161d29]" htmlFor="signupPassword">
                      Password
                    </label>
                    <input
                      className="h-9 w-full rounded-[2px] bg-[#dfe3e8] px-3 text-sm tracking-[0.2em] text-[#1f2937] placeholder:text-[#8a93a1] focus:outline-none"
                      id="signupPassword"
                      placeholder="..........."
                      type="password"
                    />
                    <p className="text-xs text-[#5f6977]">Minimum 12 characters with biometric support.</p>
                  </div>

                  <Button
                    className="h-9 w-full rounded-[3px] bg-[#0f59b6] text-sm font-semibold text-white shadow-[0_10px_16px_-12px_rgba(15,89,182,0.85)] hover:bg-[#0c4c9b]"
                    type="submit"
                  >
                    Create Account
                  </Button>
                </form>

                <div className="flex items-center gap-4">
                  <Separator className="flex-1 bg-[#d8dde3]" />
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#8c95a1]">Secure identity provider</span>
                  <Separator className="flex-1 bg-[#d8dde3]" />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex w-full gap-2 rounded-[3px] bg-[#e0e4e8] text-base font-medium text-[#1f2937] hover:bg-[#d6dbe0]"
                  type="button"
                >
                  <span aria-hidden className="flex items-center text-lg font-bold leading-none">
                    <span className="text-[#ea4335]">G</span>
                  </span>
                  Sign up with Google
                </Button>

                <p className="text-center text-xs text-[#1f2937]">
                  Already have access?{" "}
                  <Link className="font-semibold text-[#0f4ea6]" to={ROUTES.SIGN_IN}>
                    Sign In
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-7 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8e97a3]">
            <Shield className="h-3.5 w-3.5" />
            End-to-end encrypted provisioning
          </div>
        </section>
      </main>

      <footer className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-[#d2d8df] bg-[#edf0f4] px-6 py-5 text-[10px] uppercase tracking-[0.18em] text-[#9aa3af] md:px-10">
        <p>© 2024 The Vault Architectural Archive. All rights reserved.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <a className="hover:text-[#5d6775]" href="#">Privacy Policy</a>
          <a className="hover:text-[#5d6775]" href="#">Terms of Service</a>
          <a className="hover:text-[#5d6775]" href="#">Security Audit</a>
          <a className="hover:text-[#5d6775]" href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
};
