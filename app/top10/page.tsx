import { redirect } from "next/navigation";

export default function Top10IndexPage() {
  const currentYear = new Date().getFullYear();
  redirect(`/top10/${currentYear}`);
}
