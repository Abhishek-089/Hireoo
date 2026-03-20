import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      current_role,
      experience_level,
      skills,
      preferred_job_titles,
      preferred_locations,
      remote_work_preferred,
      job_types,
      job_keyword,
      email_template_config,
    } = body

    const updateData: any = {}
    if (current_role           !== undefined) updateData.current_role           = current_role
    if (experience_level       !== undefined) updateData.experience_level       = experience_level
    if (skills                 !== undefined) updateData.skills                 = skills
    if (preferred_job_titles   !== undefined) updateData.preferred_job_titles   = preferred_job_titles
    if (preferred_locations    !== undefined) updateData.preferred_locations    = preferred_locations
    if (remote_work_preferred  !== undefined) updateData.remote_work_preferred  = remote_work_preferred
    if (job_types              !== undefined) updateData.job_types              = job_types
    if (email_template_config  !== undefined) updateData.email_template_config  = email_template_config
    // job_keyword maps to skills[0] — the primary search term
    if (job_keyword            !== undefined) updateData.skills                 = [job_keyword, ...(skills ?? []).filter((s: string) => s !== job_keyword)]

    await prisma.user.update({ where: { id: userId }, data: updateData })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Preferences save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
