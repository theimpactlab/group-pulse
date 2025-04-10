import { redirect } from "next/navigation"

export default function DashboardPage() {
  // Redirect to the sessions page
  redirect("/sessions")
}
