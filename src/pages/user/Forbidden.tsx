import { ArrowLeft, Home, ShieldAlert } from "lucide-react"
import { Link } from "react-router"
import { ROUTES } from "@/constants/routes"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const Forbidden = () => {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_84%_82%,rgba(249,115,22,0.16),transparent_38%)] dark:bg-[radial-gradient(circle_at_12%_20%,rgba(59,130,246,0.24),transparent_40%),radial-gradient(circle_at_84%_82%,rgba(249,115,22,0.18),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-primary/10 [clip-path:polygon(100%_0,100%_100%,0_100%)] md:block dark:bg-primary/15" />

      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground shadow-sm backdrop-blur">
              <ShieldAlert className="h-4 w-4 text-primary" />
              Access Restricted
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.32em] text-muted-foreground">
                403 Forbidden
              </p>
              <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                Bạn không có quyền truy cập trang này.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Đường dẫn bạn vừa mở không khả dụng, bị giới hạn quyền hoặc không còn tồn tại trong hệ thống.
                Vui lòng quay lại trang đăng nhập hoặc trở về màn hình chính của bạn.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="gap-2 rounded-full px-5 shadow-lg shadow-primary/20">
                <Link to={ROUTES.SIGN_IN}>
                  <ArrowLeft className="h-4 w-4" />
                  Quay về Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 rounded-full px-5">
                <Link to={ROUTES.HOME}>
                  <Home className="h-4 w-4" />
                  Về trang chủ
                </Link>
              </Button>
            </div>
          </div>

          <Card className="border-border/70 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-sm">
            <CardContent className="space-y-5 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Status</p>
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">403</h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
                  <ShieldAlert className="h-7 w-7" />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/30 p-4">
                <p className="text-sm font-semibold text-foreground">Gợi ý xử lý</p>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                  <li>• Kiểm tra lại tài khoản đang đăng nhập có đúng vai trò không.</li>
                  <li>• Nếu vừa đổi tài khoản, hãy đăng xuất và đăng nhập lại.</li>
                  <li>• Nếu bạn thấy đây là nhầm lẫn, liên hệ quản trị hệ thống.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-dashed border-border/70 px-4 py-3 text-sm text-muted-foreground">
                Màn hình này được thiết kế để thay thế việc tự động đá về sign-in khi gặp đường dẫn lỗi hoặc truy cập bị chặn.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
