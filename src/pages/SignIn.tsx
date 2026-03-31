import { Building2, Lock, Shield } from "lucide-react";
import { Link } from "react-router";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const SignIn = () => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#e8ecef] text-[#111827]">
      <header className="flex items-center justify-between px-5 pb-4 pt-6 md:px-9">
        <Link
          className="text-[34px] font-semibold tracking-[-0.03em] text-[#0f3e98]"
          to={ROUTES.SIGN_IN}
        >
          The Vault
        </Link>
        <div className="flex items-center gap-6">
          <span className="hidden text-[10px] uppercase tracking-[0.32em] text-[#a1a8b3] sm:block">
            Secure environment
          </span>
          <Lock className="h-4 w-4 text-[#0f3e98]" strokeWidth={2.2} />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-26 pt-8 sm:px-6">
        <Card className="w-full max-w-sm bg-[#f7f8fa] p-5 sm:p-6">
          <CardContent className="space-y-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0f59b6]">
              <Building2 className="h-6 w-6 text-white" />
            </div>

            <div className="space-y-1 text-center">
              <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#111827]">Sign In</h1>
              <p className="text-sm text-[#4b5563]">Access the architectural archives</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-1 w-full gap-2 rounded-[3px] bg-[#e0e4e8] text-base font-medium text-[#1f2937] hover:bg-[#d6dbe0]"
              type="button"
            >
              <span aria-hidden className="flex items-center text-lg font-bold leading-none">
                <span className="text-[#ea4335]">G</span>
              </span>
              Continue with Google
            </Button>

            <div className="flex items-center gap-4">
              <Separator className="flex-1 bg-[#d8dde3]" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#8c95a1]">Corporate credentials</span>
              <Separator className="flex-1 bg-[#d8dde3]" />
            </div>

            <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#161d29]" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="h-9 w-full rounded-[2px] bg-[#dfe3e8] px-3 text-sm text-[#1f2937] placeholder:text-[#8a93a1] focus:outline-none"
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-[#161d29]" htmlFor="password">
                    Password
                  </label>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs font-medium text-[#0f4ea6]"
                    type="button"
                  >
                    Forgot Password?
                  </Button>
                </div>
                <input
                  className="h-9 w-full rounded-[2px] bg-[#dfe3e8] px-3 text-sm tracking-[0.2em] text-[#1f2937] placeholder:text-[#8a93a1] focus:outline-none"
                  id="password"
                  placeholder="........"
                  type="password"
                />
              </div>

              <Button
                className="mt-1 h-9 w-full rounded-[3px] bg-[#0f59b6] text-sm font-semibold text-white hover:bg-[#0c4c9b]"
                type="submit"
              >
                Sign In
              </Button>
            </form>

            <p className="text-center text-xs text-[#1f2937]">
              Don&apos;t have access?{" "}
              <Link className="font-semibold text-[#0f4ea6]" to={ROUTES.SIGN_UP}>
                Request Entry
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-[#d2d8df] bg-[#edf0f4] px-6 py-5 text-[10px] uppercase tracking-[0.18em] text-[#9aa3af] md:px-10">
        <p>© 2024 The Vault Architectural Archive. All rights reserved.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <a className="hover:text-[#5d6775]" href="#">Privacy Policy</a>
          <a className="hover:text-[#5d6775]" href="#">Terms of Service</a>
          <a className="hover:text-[#5d6775]" href="#">Security Audit</a>
          <a className="hover:text-[#5d6775]" href="#">Contact</a>
        </div>
      </footer>

      <Shield className="pointer-events-none absolute bottom-16 right-8 hidden h-4 w-4 text-[#99a2ad] sm:block" />
    </div>
  );
};
