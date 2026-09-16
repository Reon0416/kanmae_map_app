"use client";

import { Trash2 } from "lucide-react";
import { deleteStoreAction } from "@/app/admin/actions";

type DeleteStoreButtonProps = {
  storeId: string;
  storeName: string;
};

export function DeleteStoreButton({ storeId, storeName }: DeleteStoreButtonProps) {
  return (
    <form
      action={deleteStoreAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `${storeName} を削除します。店舗情報、待ち時間、来店記録、担当店舗の紐づけもデータベースから削除されます。よろしいですか？`
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="storeId" value={storeId} />
      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-red-200 px-3 text-sm font-black text-red-700 transition hover:bg-red-50"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        削除
      </button>
    </form>
  );
}
