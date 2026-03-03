import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { SettingsClient } from "@/components/dashboard/SettingsClient"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      current_role: true,
      experience_level: true,
      skills: true,
      preferred_job_titles: true,
      preferred_locations: true,
      remote_work_preferred: true,
      job_types: true,
      resume_uploaded: true,
      gmail_connected: true,
      extension_installed: true,
      email_template_config: true,
      created_at: true,
    },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <SettingsClient
      initialData={{
        name: user.name || "",
        email: user.email,
        image: user.image,
        currentRole: user.current_role || "",
        experienceLevel: user.experience_level || "",
        skills: user.skills || [],
        preferredJobTitles: user.preferred_job_titles || [],
        preferredLocations: user.preferred_locations || [],
        remoteWorkPreferred: user.remote_work_preferred,
        jobTypes: user.job_types || [],
        resumeUploaded: user.resume_uploaded,
        gmailConnected: user.gmail_connected,
        extensionInstalled: user.extension_installed,
        emailTemplateConfig: user.email_template_config as any,
        createdAt: user.created_at.toISOString(),
      }}
    />
  )
}
