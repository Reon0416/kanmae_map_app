import { createHash } from "node:crypto";

const visitorIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function hashAnonymousVisitorId(visitorId: string) {
  if (!visitorIdPattern.test(visitorId)) {
    throw new Error("Invalid anonymous visitor id.");
  }

  const secret =
    process.env.ANONYMOUS_VISITOR_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXTAUTH_SECRET ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "kanmae-local-anonymous-visitor-secret";

  return createHash("sha256")
    .update(`${visitorId}:${secret}`)
    .digest("hex");
}
