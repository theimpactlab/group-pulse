import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect root to the landing page
  redirect("/landing")
}
