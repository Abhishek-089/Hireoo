import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            gmailConnected?: boolean
            lastSignInProvider?: string   // "google" | "credentials"
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        id: string
        gmailConnected?: boolean
        lastSignInProvider?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string
        gmailAccessToken?: string
        gmailRefreshToken?: string
        gmailExpiresAt?: number
        gmailScope?: string
        lastSignInProvider?: string
    }
}
