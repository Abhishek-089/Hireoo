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
  const userId = (session?.user as any)?.id

  if (!userId) {
    redirect("/signin")
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: userId },
    select: { resume_uploaded: true, preferred_job_titles: true },
  })

  const hasProfile = !!(
    userProfile?.resume_uploaded ||
    (userProfile?.preferred_job_titles && userProfile.preferred_job_titles.length > 0)
  )

  return (
    <DashboardShell user={session!.user as any} hasProfile={hasProfile}>
      {children}
    </DashboardShell>
  )
}
