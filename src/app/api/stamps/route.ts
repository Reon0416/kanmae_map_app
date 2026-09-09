import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const STAMP_GOAL = 12;

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_store_stamp_counts")
    .select("store_key, store_name, stamp_count, last_stamped_at")
    .eq("user_id", user.id)
    .order("stamp_count", { ascending: false })
    .order("store_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to load stamps" }, { status: 500 });
  }

  const { data: events, error: eventsError } = await supabase
    .from("stamp_events")
    .select("id, store_key, store_name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(STAMP_GOAL);

  if (eventsError) {
    return NextResponse.json({ error: "Failed to load stamp events" }, { status: 500 });
  }

  const stores = (data ?? []).map((item) => ({
    storeId: item.store_key,
    storeName: item.store_name,
    stampCount: item.stamp_count,
    lastStampedAt: item.last_stamped_at
  }));

  const totalStampCount = stores.reduce((total, item) => total + item.stampCount, 0);
  const currentCardStampCount = totalStampCount === 0 ? 0 : totalStampCount % STAMP_GOAL || STAMP_GOAL;
  const cardStamps = (events ?? [])
    .slice(0, currentCardStampCount)
    .reverse()
    .map((event) => ({
      id: event.id,
      storeId: event.store_key,
      storeName: event.store_name,
      stampedAt: event.created_at
    }));

  return NextResponse.json({
    stores,
    totalStampCount,
    cardStamps
  });
}
