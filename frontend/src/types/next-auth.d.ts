import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            gmailConnected?: boolean
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        id: string
        gmailConnected?: boolean
    }
}
