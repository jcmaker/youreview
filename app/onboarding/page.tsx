import { requireUserId } from "@/lib/auth/user";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import { redirect } from "next/navigation";
import ClientForm from "./ClientForm";

export default async function Page() {
  const userId = await requireUserId();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  const existing = (data?.username as string | null) ?? null;
  if (existing) redirect("/create/movie");
  return <ClientForm />;
}
