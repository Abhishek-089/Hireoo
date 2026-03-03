import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function JobSearchPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return <div>Please sign in.</div>
  }

  redirect("/dashboard/job-matches")
}
