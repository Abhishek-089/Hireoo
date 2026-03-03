import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  const allowedFields: Record<string, boolean> = {
    name: true,
    current_role: true,
    experience_level: true,
    skills: true,
    preferred_job_titles: true,
    preferred_locations: true,
    remote_work_preferred: true,
    job_types: true,
    email_template_config: true,
  }

  const updateData: Record<string, any> = {}
  for (const [key, value] of Object.entries(body)) {
    if (allowedFields[key]) {
      updateData[key] = value
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      current_role: true,
      experience_level: true,
      skills: true,
      preferred_job_titles: true,
      preferred_locations: true,
      remote_work_preferred: true,
      job_types: true,
      email_template_config: true,
    },
  })

  return NextResponse.json({ success: true, user: updated })
}
