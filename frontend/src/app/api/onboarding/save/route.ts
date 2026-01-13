import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!(session?.user as any)?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { step, data, stepKey } = await request.json()

    if (!step || data === undefined) {
      return NextResponse.json(
        { error: "Missing step or data" },
        { status: 400 }
      )
    }

    // Update user onboarding data based on step
    // We update onboarding_step logic: if user is on step X and completes it, we set to X+1, but capped at 3 for now, or just track logic.
    // Actually, let's just save the data. The "step" tracking on user model might need to align with 1-3.
    const updateData: any = {}

    // Track max step progress
    // If current step is 1, they completed 1, so moving to 2.
    // user.onboarding_step should reflect the NEXT step to do, or the highest completed?
    // Usually "onboarding_step" = "current active step".
    // So if I finish step 1, set to 2.
    const nextStep = Math.min(step + 1, 3) // Cap at 3 for now
    updateData.onboarding_step = nextStep

    // Handle new step keys from refactor
    if (stepKey === 'searchInfo') {
      if (data.jobKeywords) updateData.skills = data.jobKeywords // Mapping keywords to skills for now, or new field? Schema has skills[].
      if (data.experienceLevel) updateData.experience_level = data.experienceLevel
      if (data.datePosted) updateData.date_posted_preference = data.datePosted

      // Handle Resume
      if (data.resume?.uploaded && data.resume.fileUrl) {
        // Check if this resume already exists to avoid duplicates or just create new
        // For simplicity, we create a new entry as it tracks history
        await prisma.resume.create({
          data: {
            user_id: (session!.user as any).id,
            file_url: data.resume.fileUrl,
            file_name: data.resume.fileName,
          }
        })
        updateData.resume_uploaded = true
      }
    }
    else if (stepKey === 'emailTemplate') {
      // Save email template config as JSON
      updateData.email_template_config = {
        templateId: data.templateId,
        templateName: data.templateName,
        subject: data.subject,
        body: data.body
      }
    }
    else if (stepKey === 'settings') {
      if (data.extensionInstalled) updateData.extension_installed = data.extensionInstalled
      if (data.completed) {
        // Mark entire onboarding flow as done? 
        // Maybe set a flag or just leave step at max?
        // If we have a 'completed' flag on user, set it. 
        // For now, step > 3 implies done in some logic, but let's just stick to 3 or 4.
        updateData.onboarding_step = 4 // 4 = Dashboard
      }
    }
    // Legacy fallback or additional handling
    else {
      // If generic step number logic needed
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: (session!.user as any).id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        onboarding_step: updatedUser.onboarding_step,
      }
    })
  } catch (error) {
    console.error("Onboarding save error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
