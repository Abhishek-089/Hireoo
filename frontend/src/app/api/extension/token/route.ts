import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function base64UrlEncode(obj: any): string {
  return Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        onboarding_step: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.onboarding_step < 7) {
      return NextResponse.json(
        { error: "Onboarding not complete" },
        { status: 403 }
      )
    }

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      iat: now,
      exp: now + 24 * 60 * 60, // 24 hours
    }

    // Minimal JWT compatible with ExtensionAuth.decodeJWT (no signature verification)
    const header = { alg: "none", typ: "JWT" }
    const encodedHeader = base64UrlEncode(header)
    const encodedPayload = base64UrlEncode(payload)
    const token = `${encodedHeader}.${encodedPayload}.`

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Extension token error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}











