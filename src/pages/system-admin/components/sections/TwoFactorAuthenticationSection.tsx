import { LoaderCircle, ShieldCheck, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTwoFactorAuth } from "@/hooks/use-two-factor-auth"
import type { IAuthUser } from "@/types/auth"

interface ITwoFactorAuthenticationSectionProps {
  initialUser?: IAuthUser
  shouldFetchCurrentUser?: boolean
}

export const TwoFactorAuthenticationSection = ({
  initialUser,
  shouldFetchCurrentUser,
}: ITwoFactorAuthenticationSectionProps) => {
  const {
    setupData,
    verificationCode,
    isLoadingStatus,
    isSettingUp,
    isVerifying,
    isDisabling,
    isTwoFactorEnabled,
    isBusy,
    qrCodeSrc,
    manualEntryKey,
    pendingAction,
    setVerificationCode,
    openToggleConfirmation,
    closeToggleConfirmation,
    confirmToggleAction,
    verifyEnableAction,
  } = useTwoFactorAuth({
    initialUser,
    shouldFetchCurrentUser,
  })

  if (isLoadingStatus) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="flex items-center gap-2 p-6 text-slate-600">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Đang tải trạng thái xác thực hai lớp...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200/80 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            {isTwoFactorEnabled ? <ShieldCheck className="h-5 w-5 text-emerald-600" /> : <ShieldOff className="h-5 w-5 text-amber-600" />}
            Xác thực hai lớp (2FA)
          </CardTitle>

          <button
            type="button"
            aria-label="Bật hoặc tắt xác thực hai lớp"
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isTwoFactorEnabled ? "bg-emerald-600" : "bg-slate-300"}`}
            disabled={isBusy}
            onClick={openToggleConfirmation}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${isTwoFactorEnabled ? "translate-x-7" : "translate-x-1"}`}
            />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 md:p-5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {isTwoFactorEnabled
            ? "2FA hiện đang bật. Bạn có thể tắt nếu cần."
            : "2FA hiện đang tắt. Hãy bật và xác minh mã dùng một lần để tăng cường bảo mật tài khoản."}
        </div>

        {(setupData || isTwoFactorEnabled) && (
          <div className="space-y-3">
            <div className="grid gap-3 rounded-xl border border-slate-200 p-3 lg:grid-cols-[180px_minmax(0,1fr)]">
              <div className="flex justify-center rounded-lg border border-slate-200 bg-white p-2">
                {qrCodeSrc ? (
                  <img alt="Mã QR 2FA" className="h-36 w-36 object-contain" src={qrCodeSrc} />
                ) : (
                  <p className="text-xs text-slate-500">Không có mã QR khả dụng</p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm text-slate-700">
                  Quét mã QR bằng Google Authenticator hoặc Authy, sau đó nhập mã 6 chữ số để xác minh.
                </p>

                {manualEntryKey && (
                  <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Khóa nhập thủ công</p>
                    <p className="font-mono text-sm font-semibold text-slate-800">{manualEntryKey}</p>
                  </div>
                )}

                {!isTwoFactorEnabled && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700" htmlFor="two-fa-verification-code">
                        Mã xác minh
                      </label>
                      <input
                        id="two-fa-verification-code"
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        value={verificationCode}
                        onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))}
                      />
                    </div>

                    <Button
                      type="button"
                      className="bg-emerald-700 text-white hover:bg-emerald-800"
                      onClick={verifyEnableAction}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <>
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Đang xác minh
                        </>
                      ) : (
                        "Xác minh & bật 2FA"
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {!isTwoFactorEnabled && !setupData && (
          <Button
            type="button"
            className="bg-blue-700 text-white hover:bg-blue-800"
            onClick={openToggleConfirmation}
            disabled={isSettingUp}
          >
            {isSettingUp ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Đang chuẩn bị thiết lập
              </>
            ) : (
              "Bật 2FA"
            )}
          </Button>
        )}

        {pendingAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900">
                  {pendingAction === "enable" ? "Bật xác thực hai lớp?" : "Tắt xác thực hai lớp?"}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {pendingAction === "enable"
                    ? "Sau khi bật, vui lòng quét mã QR và xác minh mã 6 chữ số để hoàn tất thiết lập."
                    : "Tắt 2FA sẽ bỏ qua bước xác minh ứng dụng xác thực khi đăng nhập."}
                </p>

              <div className="mt-5 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeToggleConfirmation}>
                  Hủy
                </Button>
                <Button
                  type="button"
                  variant={pendingAction === "enable" ? "default" : "destructive"}
                  onClick={confirmToggleAction}
                  disabled={isDisabling || isSettingUp}
                >
                  {pendingAction === "enable" && isSettingUp ? "Đang chuẩn bị..." : pendingAction === "disable" && isDisabling ? "Đang tắt..." : "Xác nhận"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
