import type { VisitLocationStatus } from "@/features/visit-records/use-visit-location";

export function getVisitLocationButtonLabel(status: VisitLocationStatus) {
  if (status === "requesting") return "位置情報を取得中";
  if (status === "ready") return "記録する";
  if (status === "idle") return "位置情報を使って記録する";
  return "もう一度取得する";
}

export function VisitLocationNotice({
  status,
  message
}: {
  status: VisitLocationStatus;
  message: string;
}) {
  if (status === "ready") return null;

  const showSafariPermissionSteps = status === "denied";
  const showPreciseLocationSteps =
    status === "imprecise" || status === "position_unavailable" || status === "timeout";

  return (
    <div className="mt-3 rounded-md bg-amber-50 px-3 py-3 text-sm font-bold leading-6 text-amber-900">
      {status === "idle" ? (
        <p>
          スタンプの不正取得を防ぐため、店舗付近にいることだけを確認します。位置情報や移動履歴は保存しません。
        </p>
      ) : (
        <p>{message}</p>
      )}

      {showSafariPermissionSteps ? (
        <div className="mt-2 font-semibold">
          <p className="font-black">Safariで許可を変更する手順</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            <li>アドレスバー左側のページメニューを開く</li>
            <li>「Webサイトの設定」から「位置情報」を「許可」にする</li>
            <li>このページに戻り「もう一度取得する」を押す</li>
          </ol>
        </div>
      ) : null}

      {showPreciseLocationSteps ? (
        <div className="mt-2 font-semibold">
          <p>
            iPhoneの「設定」→「プライバシーとセキュリティ」→「位置情報サービス」→「SafariのWebサイト」を開き、「正確な位置情報」をオンにしてください。
          </p>
          <p className="mt-1">その後Safariへ戻り、「もう一度取得する」を押してください。</p>
        </div>
      ) : null}

      {status === "unavailable" ? (
        <p className="mt-2 font-semibold">位置情報に対応したSafariまたはChromeで開いてください。閲覧はこのまま続けられます。</p>
      ) : null}
    </div>
  );
}
