import { redirect } from "next/navigation";

export default async function SignUpPage({
  searchParams: _searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  await _searchParams;
  redirect("/login");
}
