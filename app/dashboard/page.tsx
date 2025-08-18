import { redirect } from "next/navigation";

export default function DashboardIndexPage() {
  const currentYear = new Date().getFullYear();
  redirect(`/dashboard/${currentYear}`);
}
