import { Activity, AlertTriangle, CheckCircle2, Lock, Radar, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const SECURITY_SUMMARY = [
  { label: "Sự kiện đe dọa (24h)", value: "42", foot: "đã giảm thiểu toàn bộ", icon: Radar },
  { label: "Tuân thủ chính sách", value: "98%", foot: "2 cảnh báo", icon: Shield },
  { label: "Đăng nhập thất bại", value: "17", foot: "-11 so với hôm qua", icon: Lock },
  { label: "Phiên hoạt động", value: "211", foot: "ổn định", icon: Activity },
]

const SECURITY_POLICIES = [
  { title: "Bắt buộc MFA", description: "Yêu cầu MFA cho tất cả vai trò quản trị và quản lý", enabled: true },
  { title: "Hết hạn liên kết ngoài", description: "Liên kết chia sẻ công khai hết hạn sau 7 ngày", enabled: true },
  { title: "Giới hạn theo khu vực", description: "Giới hạn đăng nhập từ khu vực không xác định", enabled: false },
  { title: "Hết phiên theo mức độ rủi ro", description: "Tự động đăng xuất khi có hành vi bất thường", enabled: true },
]

const AUDIT_EVENTS = [
  {
    title: "Đã chặn nỗ lực nâng quyền",
    detail: "user_analytics_bot yêu cầu quyền admin ngoài mẫu chính sách",
    tone: "critical",
  },
  {
    title: "Xác thực MFA thành công",
    detail: "workspace-admin hoàn tất lớp xác thực thứ hai từ thiết bị tin cậy",
    tone: "ok",
  },
  {
    title: "Phát hiện đột biến gọi API",
    detail: "rate limiter đã giới hạn 418 request từ integration key #a2f9",
    tone: "warn",
  },
]

const toneClassMap = {
  ok: "text-emerald-700 bg-emerald-100",
  warn: "text-amber-700 bg-amber-100",
  critical: "text-red-700 bg-red-100",
}

export const SecuritySection = () => {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SECURITY_SUMMARY.map((item) => (
          <Card key={item.label} className="border-slate-200 bg-white">
            <CardHeader className="pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
              <CardTitle className="text-4xl font-bold text-slate-900">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{item.foot}</p>
              <item.icon className="h-4 w-4 text-cyan-700" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Thiết lập chính sách bảo mật</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SECURITY_POLICIES.map((policy) => (
              <div key={policy.title} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{policy.title}</p>
                  <p className="text-xs text-slate-500">{policy.description}</p>
                </div>
                <button
                  className={cn("h-6 w-11 rounded-full p-0.5 transition", policy.enabled ? "bg-cyan-600" : "bg-slate-300")}
                  type="button"
                >
                  <span className={cn("block h-5 w-5 rounded-full bg-white transition", policy.enabled ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Mức sẵn sàng ứng phó</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2.5 text-sm text-cyan-800">
              Kênh sự cố đã kết nối với SIEM và luồng pager.
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
              Diễn tập khôi phục sao lưu hoàn tất trong 14 phút 22 giây.
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
              Mốc tuân thủ tiếp theo: hoàn thiện bộ bằng chứng ISO-27001 trong 5 ngày.
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Tín hiệu kiểm toán gần đây</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {AUDIT_EVENTS.map((event) => (
            <div key={event.title} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              {event.tone === "ok" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />}
              {event.tone === "warn" && <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />}
              {event.tone === "critical" && <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />}

              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                <p className="text-sm text-slate-600">{event.detail}</p>
              </div>

              <span className={cn("inline-flex rounded-md px-2 py-1 text-xs font-semibold", toneClassMap[event.tone as keyof typeof toneClassMap])}>
                {event.tone === "ok" ? "Ổn định" : event.tone === "warn" ? "Cảnh báo" : "Nghiêm trọng"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
