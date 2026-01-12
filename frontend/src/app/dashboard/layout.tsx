import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!(session?.user as any)?.id) {
    redirect("/signin")
  }

  // Note: Onboarding is now optional and triggered by "New Campaign" button
  // Users can access dashboard immediately after signup

  return (
    <DashboardShell user={session!.user as any}>
      {children}
    </DashboardShell>
  )
}
