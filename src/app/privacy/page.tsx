export default function PrivacyPage() {
  const sections = [
    {
      title: "1. 取得する情報",
      body: [
        "本サービスでは、利用者の操作内容に応じて、メールアドレス、パスワード等の認証情報、アカウント種別、来店記録、待ち時間の投稿内容、スタンプ取得状況、店舗管理者が入力する店舗情報、問い合わせ内容を取得することがあります。",
        "ログインせずに利用する場合でも、来店記録やスタンプ表示のため、端末内に保存される匿名の識別子を利用することがあります。"
      ]
    },
    {
      title: "2. 位置情報の取扱い",
      body: [
        "本サービスは、来店記録の正当性を確認するため、利用者の端末から現在地情報を取得することがあります。",
        "位置情報は、対象店舗の付近にいるかどうかを判定するために利用し、継続的な移動履歴や詳細な位置履歴を保存することを目的としません。",
        "端末やブラウザの設定により位置情報の取得を拒否できます。ただし、その場合は来店記録やスタンプ等の一部機能を利用できないことがあります。"
      ]
    },
    {
      title: "3. 利用目的",
      body: [
        "取得した情報は、本サービスの提供、本人確認、来店記録およびスタンプの表示、混雑状況や待ち時間目安の算出、店舗管理機能の提供、不正利用の防止、問い合わせ対応、サービス改善のために利用します。"
      ]
    },
    {
      title: "4. 匿名識別子とスタンプ情報",
      body: [
        "本サービスは、ログインしていない利用者について、端末内に保存される匿名の識別子を利用し、スタンプ数や来店記録を管理することがあります。",
        "匿名の識別子は、来店記録やスタンプ表示、不正利用の防止、サービスの安定運用のために利用し、個人を直接特定する目的では利用しません。"
      ]
    },
    {
      title: "5. 第三者提供",
      body: [
        "運営者は、法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供しません。",
        "ただし、混雑状況や待ち時間目安のように、個人を識別できない形に集計・加工した情報は、本サービス上で表示されることがあります。"
      ]
    },
    {
      title: "6. 外部サービスの利用",
      body: [
        "本サービスは、認証、データ保存、配信、保守管理等のために外部サービスを利用することがあります。",
        "外部サービスにおいて取り扱われる情報は、各サービスの規約およびプライバシーポリシーに従って管理されます。"
      ]
    },
    {
      title: "7. 安全管理",
      body: [
        "運営者は、取得した情報の漏えい、滅失、毀損、不正アクセス等を防止するため、合理的な安全管理措置を講じます。"
      ]
    },
    {
      title: "8. 保存期間",
      body: [
        "運営者は、利用目的の達成に必要な範囲で情報を保存します。不要となった情報は、法令または運用上必要な保存期間を考慮したうえで、適切な方法により削除または匿名化します。"
      ]
    },
    {
      title: "9. 開示・訂正・削除等",
      body: [
        "利用者は、運営者に対し、自己に関する個人情報の開示、訂正、利用停止、削除等を求めることができます。運営者は、本人確認のうえ、法令に従って対応します。"
      ]
    },
    {
      title: "10. ポリシーの変更",
      body: [
        "運営者は、必要に応じて本ポリシーを変更することがあります。変更後のポリシーは、本サービス上に掲載された時点から効力を生じるものとします。"
      ]
    },
    {
      title: "11. お問い合わせ",
      body: [
        "本ポリシーに関するお問い合わせは、本サービス内のお問い合わせ窓口または運営者が別途指定する連絡先までお願いいたします。"
      ]
    }
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
      <div className="space-y-3 border-b border-slate-200 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Privacy</p>
        <h1 className="text-2xl font-black text-slate-950">プライバシーポリシー</h1>
        <p className="text-sm leading-7 text-slate-700">
          KANMAE は、利用者のプライバシーを尊重し、サービス提供に必要な範囲で情報を取り扱います。正確な位置履歴、学生番号、その他不要な個人情報を収集することを目的としません。
        </p>
      </div>

      <div className="mt-6 space-y-7">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-base font-black text-slate-950">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-slate-700">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <dl className="mt-8 space-y-2 border-t border-slate-200 pt-5 text-sm leading-7 text-slate-700">
        <div className="flex gap-3">
          <dt className="shrink-0 font-bold text-slate-950">制定日</dt>
          <dd>2026年9月15日</dd>
        </div>
        <div className="flex gap-3">
          <dt className="shrink-0 font-bold text-slate-950">運営者</dt>
          <dd>KANMAE 運営者</dd>
        </div>
      </dl>
    </main>
  );
}
