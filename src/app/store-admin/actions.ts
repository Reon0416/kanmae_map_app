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
