import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!(session?.user as any)?.id) {
    redirect("/signin")
  }

  return (
    <DashboardShell user={session!.user as any}>
      {children}
    </DashboardShell>
  )
}
