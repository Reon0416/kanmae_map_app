"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { STORE_STATUS } from "@/constants/crowd-status";
import { ensureProfileAndGetRole } from "@/features/auth/auth-server";
import { USER_ROLE } from "@/features/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const storeSettingsSchema = z.object({
  storeId: z.string().uuid(),
  name: z.string().trim().min(1, "店舗名を入力してください。").max(80),
  genre: z.string().trim().min(1, "ジャンルを入力してください。").max(40),
  hours: z.string().trim().min(1, "営業時間を入力してください。").max(80),
  closed: z.string().trim().min(1, "定休日を入力してください。").max(80),
  priceBand: z.enum(["under_800", "800_1200", "1200_1800", "over_1800"])
});

export type StoreAdminActionState = {
  ok: boolean;
  message?: string;
  savedAt?: string;
};

async function requireStoreAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/store-admin");
  }

  const role = await ensureProfileAndGetRole(supabase, user);

  if (role !== USER_ROLE.STORE) {
    redirect("/");
  }

  return { supabase, user };
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateStoreAdminStatusAction(formData: FormData) {
  const { supabase } = await requireStoreAdmin();
  const parsed = z
    .object({
      storeId: z.string().uuid(),
      status: z.enum([STORE_STATUS.AVAILABLE, STORE_STATUS.LIMITED, STORE_STATUS.FULL])
    })
    .parse({
      storeId: getString(formData, "storeId"),
      status: getString(formData, "status")
    });

  const { error } = await supabase.rpc("store_admin_update_status", {
    p_store_id: parsed.storeId,
    p_status: parsed.status
  });

  if (error) {
    throw new Error(`混雑ステータスを保存できませんでした: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath(`/stores/${parsed.storeId}`);
  revalidatePath("/store-admin");
  revalidatePath("/store-admin/status");
}

export async function markCurrentStoreAvailableAction() {
  const { supabase } = await requireStoreAdmin();
  const { data: stores, error: storeError } = await supabase.rpc("get_current_store_admin_store");
  const store = stores?.[0];

  if (storeError || !store?.id) {
    throw new Error("担当店舗が設定されていません。");
  }

  const { error } = await supabase.rpc("store_admin_update_status", {
    p_store_id: store.id,
    p_status: STORE_STATUS.AVAILABLE
  });

  if (error) {
    throw new Error(`空席状態を保存できませんでした: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath(`/stores/${store.id}`);
  revalidatePath("/store-admin");
}

export async function markCurrentStoreAvailableFormAction(
  previousState: StoreAdminActionState,
  formData: FormData
): Promise<StoreAdminActionState> {
  void previousState;
  void formData;

  try {
    const { supabase } = await requireStoreAdmin();
    const { data: stores, error: storeError } = await supabase.rpc("get_current_store_admin_store");
    const store = stores?.[0];

    if (storeError || !store?.id) {
      return { ok: false, message: "担当店舗が設定されていません。" };
    }

    const { error } = await supabase.rpc("store_admin_update_status", {
      p_store_id: store.id,
      p_status: STORE_STATUS.AVAILABLE
    });

    if (error) {
      return { ok: false, message: `反映できませんでした。理由: ${error.message}` };
    }

    revalidatePath("/");
    revalidatePath("/stores");
    revalidatePath(`/stores/${store.id}`);
    revalidatePath("/store-admin");

    return {
      ok: true,
      message: "できました。待ち時間を0分にしました。",
      savedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "反映できませんでした。"
    };
  }
}

export async function updateStoreAdminEmailFormAction(
  _previousState: StoreAdminActionState,
  formData: FormData
): Promise<StoreAdminActionState> {
  const { supabase } = await requireStoreAdmin();

  try {
    const email = z.string().trim().email("メールアドレスを確認してください。").parse(getString(formData, "email"));
    const { error } = await supabase.auth.updateUser({ email });

    if (error) {
      return { ok: false, message: `メールアドレスを変更できませんでした。理由: ${error.message}` };
    }

    revalidatePath("/store-admin/settings");

    return {
      ok: true,
      message: "メールアドレスの変更を受け付けました。確認メールが届いた場合は、メール内のリンクを開いてください。",
      savedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof z.ZodError ? error.issues[0]?.message : "メールアドレスを変更できませんでした。"
    };
  }
}

export async function updateStoreAdminPasswordFormAction(
  _previousState: StoreAdminActionState,
  formData: FormData
): Promise<StoreAdminActionState> {
  const { supabase } = await requireStoreAdmin();

  try {
    const password = z.string().min(8, "パスワードは8文字以上で入力してください。").parse(getString(formData, "password"));
    const confirmPassword = getString(formData, "confirmPassword");

    if (password !== confirmPassword) {
      return { ok: false, message: "確認用パスワードが一致しません。" };
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { ok: false, message: `パスワードを変更できませんでした。理由: ${error.message}` };
    }

    return {
      ok: true,
      message: "パスワードを変更しました。",
      savedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof z.ZodError ? error.issues[0]?.message : "パスワードを変更できませんでした。"
    };
  }
}

export async function updateStoreAdminSettingsAction(formData: FormData) {
  const { supabase } = await requireStoreAdmin();
  const parsed = storeSettingsSchema.parse({
    storeId: getString(formData, "storeId"),
    name: getString(formData, "name"),
    genre: getString(formData, "genre"),
    hours: getString(formData, "hours"),
    closed: getString(formData, "closed"),
    priceBand: getString(formData, "priceBand")
  });

  const { error } = await supabase.rpc("store_admin_update_own_store", {
    p_store_id: parsed.storeId,
    p_name: parsed.name,
    p_genre: parsed.genre,
    p_hours: parsed.hours,
    p_closed: parsed.closed,
    p_price_band: parsed.priceBand
  });

  if (error) {
    throw new Error(`店舗設定を保存できませんでした: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath(`/stores/${parsed.storeId}`);
  revalidatePath("/store-admin");
  revalidatePath("/store-admin/settings");
}
