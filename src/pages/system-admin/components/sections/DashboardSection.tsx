import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarClock,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const DASHBOARD_SUMMARY = [
  {
    label: "Tổng tenant",
    value: "1,248",
    note: "+34 trong tháng này",
    trend: "+2.8%",
    icon: Building2,
    tone: "text-blue-700 bg-blue-100",
  },
  {
    label: "Gói đang hoạt động",
    value: "1,102",
    note: "88.3% tổng số tenant",
    trend: "+1.6%",
    icon: CreditCard,
    tone: "text-emerald-700 bg-emerald-100",
  },
  {
    label: "Tỷ lệ chuyển đổi dùng thử",
    value: "31.6%",
    note: "30 ngày gần nhất",
    trend: "+4.2%",
    icon: TrendingUp,
    tone: "text-cyan-700 bg-cyan-100",
  },
  {
    label: "MRR",
    value: "$482K",
    note: "Doanh thu định kỳ ròng theo tháng",
    trend: "+8.4%",
    icon: BarChart3,
    tone: "text-amber-700 bg-amber-100",
  },
]

const PLAN_DISTRIBUTION = [
  { label: "Cơ bản", tenants: 468, percent: 38, color: "bg-slate-500" },
  { label: "Chuyên nghiệp", tenants: 592, percent: 47, color: "bg-blue-500" },
  { label: "Doanh nghiệp", tenants: 188, percent: 15, color: "bg-emerald-500" },
]

const TENANT_LIFECYCLE = [
  {
    stage: "Bắt đầu dùng thử",
    count: "312",
    percent: 100,
    color: "bg-slate-500",
    note: "Toàn bộ tenant đăng ký mới",
  },
  {
    stage: "Đã kích hoạt",
    count: "225",
    percent: 72,
    color: "bg-blue-600",
    note: "Đã hoàn tất đặt mật khẩu",
  },
  {
    stage: "Chuyển đổi trả phí",
    count: "99",
    percent: 31.6,
    color: "bg-emerald-500",
    note: "Chuyển đổi từ gói dùng thử",
  },
]

const EXECUTIVE_ALERTS = [
  {
    title: "Gia hạn trong 7 ngày tới",
    value: "48 tenant",
    description: "Ưu tiên nhóm chăm sóc khách hàng cho các hợp đồng MRR cao để giảm rủi ro rời bỏ.",
    tone: "border-amber-200 bg-amber-50 text-amber-900",
  },
  {
    title: "Tenant gần chạm giới hạn người dùng",
    value: "27 tenant",
    description: "Nhóm khách hàng tiềm năng cho chiến dịch nâng cấp gói.",
    tone: "border-blue-200 bg-blue-50 text-blue-900",
  },
  {
    title: "Tín hiệu hạ cấp gói",
    value: "12 tenant",
    description: "Mức sử dụng giảm dưới 40% trong hai chu kỳ thanh toán liên tiếp.",
    tone: "border-rose-200 bg-rose-50 text-rose-900",
  },
]

export const DashboardSection = () => {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <Card className="relative overflow-hidden border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <CardHeader className="pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
              Tổng quan danh mục
            </p>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Hiệu suất tenant & gói đăng ký
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="max-w-2xl text-sm text-slate-200">
              Tăng trưởng doanh thu đang ổn định với tỷ lệ dùng gói Pro cao. Trọng tâm trước mắt là
              tăng tốc chuyển đổi từ dùng thử sang trả phí và bảo toàn các hợp đồng gia hạn doanh nghiệp.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/15 bg-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Dự báo ARR</p>
                <p className="mt-1 text-xl font-semibold">$5.78M</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Tỷ lệ giữ chân doanh thu ròng</p>
                <p className="mt-1 text-xl font-semibold">116%</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Giá trị hợp đồng trung bình</p>
                <p className="mt-1 text-xl font-semibold">$438</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-slate-900">Trọng tâm quý này</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Chiến dịch nâng cấp gói", owner: "Nhóm tăng trưởng", due: "18/04" },
              { label: "Rà soát gia hạn doanh nghiệp", owner: "Nhóm chăm sóc khách hàng", due: "22/04" },
              { label: "Tối ưu onboarding dùng thử", owner: "Nhóm sản phẩm", due: "29/04" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{item.owner}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {item.due}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_SUMMARY.map((item) => (
          <Card key={item.label} className="border-slate-200 bg-white/95 shadow-sm">
            <CardHeader className="pb-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
              <CardTitle className="text-4xl font-bold text-slate-900">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{item.note}</p>
                <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", item.tone)}>
                  {item.trend}
                </span>
              </div>
              <div className="flex items-center justify-end">
                <item.icon className="h-4 w-4 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Phân bổ tenant theo gói</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="flex h-full w-full">
                {PLAN_DISTRIBUTION.map((plan) => (
                  <div key={plan.label} className={cn("h-full", plan.color)} style={{ width: `${plan.percent}%` }} />
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {PLAN_DISTRIBUTION.map((plan) => (
                <div key={plan.label} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{plan.label}</p>
                    <span className="text-xs font-semibold text-slate-500">{plan.percent}%</span>
                  </div>
                  <p className="text-xs text-slate-500">{plan.tenants.toLocaleString("vi-VN")} tenant</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Phễu vòng đời tenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {TENANT_LIFECYCLE.map((stage) => (
              <div key={stage.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>{stage.stage}</span>
                  <span>{stage.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className={cn("h-2 rounded-full", stage.color)} style={{ width: `${stage.percent}%` }} />
                </div>
                <p className="text-xs text-slate-500">{stage.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Động lực doanh thu & tenant</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "Tenant mới",
                value: "82",
                note: "Trong tháng này",
                icon: Users,
                tone: "bg-blue-100 text-blue-700",
              },
              {
                title: "MRR mở rộng",
                value: "$96K",
                note: "Bán nâng cấp + tiện ích bổ sung",
                icon: ArrowUpRight,
                tone: "bg-emerald-100 text-emerald-700",
              },
              {
                title: "Tenant rời bỏ",
                value: "11",
                note: "0.9% theo tháng",
                icon: TrendingUp,
                tone: "bg-amber-100 text-amber-700",
              },
              {
                title: "Sức khỏe giữ chân",
                value: "Tốt",
                note: "Nhóm doanh nghiệp ổn định",
                icon: ShieldCheck,
                tone: "bg-cyan-100 text-cyan-700",
              },
            ].map((metric) => (
              <div key={metric.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{metric.title}</p>
                  <span className={cn("rounded-full p-1.5", metric.tone)}>
                    <metric.icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">{metric.value}</p>
                <p className="text-xs text-slate-500">{metric.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Cảnh báo điều hành</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {EXECUTIVE_ALERTS.map((alert) => (
              <div key={alert.title} className={cn("rounded-xl border px-3 py-3", alert.tone)}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <span className="text-xs font-bold uppercase tracking-wide">{alert.value}</span>
                </div>
                <p className="mt-1 text-xs opacity-90">{alert.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
