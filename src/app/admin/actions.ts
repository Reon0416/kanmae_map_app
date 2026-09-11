"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { WAIT_TIME_BUCKET } from "@/constants/wait-time-options";
import { ensureProfileAndGetRole } from "@/features/auth/auth-server";
import { USER_ROLE } from "@/features/auth/roles";
import { createSupabaseAdminClient, hasSupabaseAdminEnvironment } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const storeSchema = z.object({
  name: z.string().trim().min(1, "店舗名を入力してください。").max(80),
  hours: z.string().trim().min(1, "営業時間を入力してください。").max(80)
});

const operatorSchema = z.object({
  displayName: z.string().trim().min(1, "運営者名を入力してください。").max(40),
  email: z.string().trim().email("メールアドレスを確認してください。"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
  role: z.enum([USER_ROLE.ADMIN, USER_ROLE.STORE])
});

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const role = await ensureProfileAndGetRole(supabase, user);

  if (role !== USER_ROLE.ADMIN) {
    redirect("/");
  }

  return { supabase, user };
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateWaitTimeAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = z
    .object({
      storeId: z.string().uuid(),
      waitTime: z.enum([
        WAIT_TIME_BUCKET.NO_WAIT,
        WAIT_TIME_BUCKET.WITHIN_5,
        WAIT_TIME_BUCKET.BETWEEN_5_10,
        WAIT_TIME_BUCKET.BETWEEN_10_20,
        WAIT_TIME_BUCKET.OVER_20
      ])
    })
    .parse({
      storeId: getString(formData, "storeId"),
      waitTime: getString(formData, "waitTime")
    });

  const { error } = await supabase.rpc("admin_update_wait_time", {
    p_store_id: parsed.storeId,
    p_wait_time: parsed.waitTime
  });

  if (error) {
    throw new Error(`待ち時間を保存できませんでした: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath("/admin");
  revalidatePath("/admin/wait-times");
}

export async function updateStoreAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const storeId = z.string().uuid().parse(getString(formData, "storeId"));
  const parsed = storeSchema.parse({
    name: getString(formData, "name"),
    hours: getString(formData, "hours")
  });

  const { error } = await supabase.rpc("admin_update_store", {
    p_store_id: storeId,
    p_name: parsed.name,
    p_hours: parsed.hours
  });

  if (error) {
    throw new Error(`店舗情報を保存できませんでした: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath(`/stores/${storeId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/stores");
  revalidatePath(`/admin/stores/${storeId}`);
  redirect("/admin/stores");
}

export async function createStoreAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = storeSchema.parse({
    name: getString(formData, "name"),
    hours: getString(formData, "hours")
  });

  const { data, error } = await supabase.rpc("admin_create_store", {
    p_name: parsed.name,
    p_hours: parsed.hours
  });

  if (error || !data) {
    throw new Error(`店舗を追加できませんでした: ${error?.message ?? "店舗IDを取得できませんでした。"}`);
  }

  revalidatePath("/");
  revalidatePath("/stores");
  revalidatePath("/admin");
  revalidatePath("/admin/stores");
  redirect(`/admin/stores/${data}`);
}

export async function createOperatorAction(formData: FormData) {
  await requireAdmin();

  if (!hasSupabaseAdminEnvironment()) {
    throw new Error("運営者を追加するには SUPABASE_SERVICE_ROLE_KEY の設定が必要です。");
  }

  const parsed = operatorSchema.parse({
    displayName: getString(formData, "displayName"),
    email: getString(formData, "email"),
    password: getString(formData, "password"),
    role: getString(formData, "role")
  });
  const adminSupabase = createSupabaseAdminClient();
  const { data, error } = await adminSupabase.auth.admin.createUser({
    email: parsed.email,
    password: parsed.password,
    email_confirm: true,
    user_metadata: {
      display_name: parsed.displayName,
      role: parsed.role
    }
  });

  if (error || !data.user) {
    throw new Error(`運営者アカウントを作成できませんでした: ${error?.message ?? "ユーザー情報を取得できませんでした。"}`);
  }

  const { error: profileError } = await adminSupabase.from("profiles").upsert({
    id: data.user.id,
    display_name: parsed.displayName,
    role: parsed.role,
    updated_at: new Date().toISOString()
  });

  if (profileError) {
    throw new Error(`運営者権限を保存できませんでした: ${profileError.message}`);
  }

  revalidatePath("/admin/settings");
}

export async function updateCurrentUserEmailAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const email = z.string().trim().email().parse(getString(formData, "email"));
  const { error } = await supabase.auth.updateUser({ email });

  if (error) {
    throw new Error(`メールアドレスを変更できませんでした: ${error.message}`);
  }

  revalidatePath("/admin/settings");
}

export async function updateCurrentUserPasswordAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const password = z.string().min(8).parse(getString(formData, "password"));
  const confirmPassword = getString(formData, "confirmPassword");

  if (password !== confirmPassword) {
    throw new Error("確認用パスワードが一致しません。");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    throw new Error(`パスワードを変更できませんでした: ${error.message}`);
  }

  revalidatePath("/admin/settings");
}
