import { getCurrentStampCardNumber, STAMP_EVENT_FETCH_LIMIT, STAMPS_PER_CARD } from "@/features/visit-records/stamp-card-config";
import { hashAnonymousVisitorId } from "@/features/visit-records/anonymous-visitor-server";
import { createSupabaseServerClient, getSupabaseServerUser } from "@/lib/supabase/server";

export type StampCount = {
  storeId: string;
  storeName: string;
  stampCount: number;
  lastStampedAt: string | null;
};

export type StampResponse = {
  stores: StampCount[];
  totalStampCount: number;
  cardStamps: {
    id: string;
    storeId: string;
    storeName: string;
    stampedAt: string;
    stampOrdinal: number;
  }[];
};

export type StampDisplayData = {
  stores: Pick<StampCount, "storeId" | "stampCount">[];
  totalStampCount: number;
  cardStamps: Pick<StampResponse["cardStamps"][number], "storeId" | "storeName" | "stampOrdinal">[];
};

export function toStampDisplayData(data: StampResponse | null): StampDisplayData | null {
  if (!data) return null;
  const firstOrdinal = (getCurrentStampCardNumber(data.totalStampCount) - 1) * STAMPS_PER_CARD + 1;
  return {
    totalStampCount: data.totalStampCount,
    stores: data.stores.map(({ storeId, stampCount }) => ({ storeId, stampCount })),
    cardStamps: data.cardStamps
      .filter(stamp => stamp.stampOrdinal >= firstOrdinal)
      .map(({ storeId, storeName, stampOrdinal }) => ({ storeId, storeName, stampOrdinal }))
  };
}

export async function getCurrentUserStampData(): Promise<StampResponse | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await getSupabaseServerUser();

  if (userError || !user) {
    return null;
  }

  const [{ data, error }, { data: events, error: eventsError }] = await Promise.all([
    supabase
      .from("user_store_stamp_counts")
      .select("store_key, store_name, stamp_count, last_stamped_at")
      .eq("user_id", user.id)
      .order("stamp_count", { ascending: false })
      .order("store_name", { ascending: true }),
    supabase
      .from("stamp_events")
      .select("id, store_key, store_name, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(STAMP_EVENT_FETCH_LIMIT)
  ]);

  if (error || eventsError) {
    throw new Error("Failed to load stamp data.");
  }

  const stores = (data ?? []).map((item) => ({
    storeId: item.store_key,
    storeName: item.store_name,
    stampCount: item.stamp_count,
    lastStampedAt: item.last_stamped_at
  }));

  const totalStampCount = stores.reduce((total, item) => total + item.stampCount, 0);
  const chronologicalCardStamps = (events ?? []).reverse();
  const firstStampOrdinal = totalStampCount - chronologicalCardStamps.length + 1;
  const cardStamps = chronologicalCardStamps.map((event, index) => ({
    id: event.id,
    storeId: event.store_key,
    storeName: event.store_name,
    stampedAt: event.created_at,
    stampOrdinal: firstStampOrdinal + index
  }));

  return {
    stores,
    totalStampCount,
    cardStamps
  };
}

type AnonymousStampRow = {
  row_type: "count" | "event";
  id: string | null;
  store_key: string;
  store_name: string;
  stamp_count: number | null;
  last_stamped_at: string | null;
  created_at: string | null;
};

export async function getAnonymousStampData(visitorId: string): Promise<StampResponse> {
  const supabase = await createSupabaseServerClient();
  const visitorHash = hashAnonymousVisitorId(visitorId);
  const { data, error } = await supabase.rpc("get_anonymous_stamp_data", {
    p_visitor_hash: visitorHash,
    p_event_limit: STAMP_EVENT_FETCH_LIMIT
  });

  if (error) {
    throw new Error("Failed to load stamp data.");
  }

  const rows = (data ?? []) as AnonymousStampRow[];
  const stores = rows
    .filter((item) => item.row_type === "count")
    .map((item) => ({
      storeId: item.store_key,
      storeName: item.store_name,
      stampCount: item.stamp_count ?? 0,
      lastStampedAt: item.last_stamped_at
    }))
    .sort((a, b) => {
      if (b.stampCount !== a.stampCount) return b.stampCount - a.stampCount;
      return a.storeName.localeCompare(b.storeName, "ja");
    });

  const events = rows
    .filter((item) => item.row_type === "event" && item.id && item.created_at)
    .sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));

  const totalStampCount = stores.reduce((total, item) => total + item.stampCount, 0);
  const firstStampOrdinal = totalStampCount - events.length + 1;
  const cardStamps = events.map((event, index) => ({
    id: event.id ?? `${event.store_key}-${index}`,
    storeId: event.store_key,
    storeName: event.store_name,
    stampedAt: event.created_at ?? new Date().toISOString(),
    stampOrdinal: firstStampOrdinal + index
  }));

  return {
    stores,
    totalStampCount,
    cardStamps
  };
}
