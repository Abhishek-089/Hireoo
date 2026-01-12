import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user onboarding data
    const user = await prisma.user.findUnique({
      where: { id: (session!.user as any).id },
      select: {
        id: true,
        name: true,
        current_role: true,
        experience_level: true,
        skills: true,
        preferred_job_titles: true,
        preferred_locations: true,
        remote_work_preferred: true,
        date_posted_preference: true, // New
        email_template_config: true, // New
        job_types: true,
        resume_uploaded: true,
        gmail_connected: true,
        extension_installed: true,
        onboarding_step: true,
        resumes: {
          take: 1,
          orderBy: { created_at: 'desc' },
          select: {
            file_url: true,
            file_name: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Flatten data for frontend usage
    const templateConfig = user.email_template_config as any || {}
    const latestResume = (user as any).resumes?.[0]

    return NextResponse.json({
      onboarding_step: user.onboarding_step,
      // Search Info Step Data
      jobKeywords: user.skills, // Using skills field for keywords
      experienceLevel: user.experience_level,
      datePosted: user.date_posted_preference,

      // Email Template Step Data
      templateId: templateConfig.templateId,
      templateName: templateConfig.templateName,
      subject: templateConfig.subject,
      body: templateConfig.body,

      // Resume
      resume: latestResume ? {
        uploaded: true,
        fileUrl: latestResume.file_url,
        fileName: latestResume.file_name
      } : null,

      // Settings/Progress
      extensionInstalled: user.extension_installed,
      completed: user.onboarding_step > 3,

      // Legacy / Extra data
      basicInfo: {
        name: user.name,
        currentRole: user.current_role,
        experienceLevel: user.experience_level,
      },
      skills: user.skills,
      jobPreferences: {
        preferredJobTitles: user.preferred_job_titles,
        preferredLocations: user.preferred_locations,
        remoteWorkPreferred: user.remote_work_preferred,
        jobTypes: user.job_types,
      },
      resumeUploaded: user.resume_uploaded,
      gmailConnected: user.gmail_connected,
    })
  } catch (error) {
    console.error("Onboarding progress error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
