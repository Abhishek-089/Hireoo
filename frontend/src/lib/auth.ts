import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { TokenEncryption } from "@/lib/encryption"

// Lazy adapter initialization - only create when actually needed
let adapterInstance: any = null
function getAdapter() {
  // Only create adapter if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    return undefined // No adapter if no database
  }
  if (!adapterInstance) {
    try {
      adapterInstance = PrismaAdapter(prisma) as any
    } catch (error) {
      console.warn('Failed to create Prisma adapter:', error)
      return undefined
    }
  }
  return adapterInstance
}

export const authOptions: NextAuthOptions = {
  // Don't set adapter if database is not available - NextAuth will use JWT only
  ...(process.env.DATABASE_URL ? { adapter: getAdapter() } : {}),
  providers: [
    // Only add Google provider if credentials are configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            scope: 'openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify',
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
    ] : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password_hash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }

      // Handle Gmail OAuth tokens
      if (account?.provider === 'google' && account.scope?.includes('gmail')) {
        token.gmailAccessToken = account.access_token
        token.gmailRefreshToken = account.refresh_token
        token.gmailExpiresAt = account.expires_at
        token.gmailScope = account.scope
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string

        // Include Gmail connection status in session
        if (token.gmailAccessToken) {
          try {
            const gmailCredential = await prisma.gmailCredentials.findUnique({
              where: { user_id: session.user.id }
            })
            session.user.gmailConnected = !!gmailCredential
          } catch (error) {
            console.error('Error checking Gmail connection:', error)
            session.user.gmailConnected = false
          }
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Handle Gmail OAuth connection
      if (account?.provider === 'google' && account.scope?.includes('gmail') && user.email) {
        try {
          // Ensure we have a corresponding User record in our database
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          // If no user exists yet (e.g. first-time Google connection), create one
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name ?? null,
                onboarding_step: 7, // Mark onboarding as complete for extension access
              },
            })
          }

          // Encrypt tokens
          const encryptedAccessToken = TokenEncryption.encryptToken(account.access_token!)
          const encryptedRefreshToken = TokenEncryption.encryptToken(account.refresh_token!)

          // Calculate expiry date
          const expiresAt = new Date((account.expires_at! * 1000))

          // Store Gmail credentials linked to the DB user
          await prisma.gmailCredentials.upsert({
            where: { user_id: dbUser.id },
            update: {
              access_token: encryptedAccessToken,
              refresh_token: encryptedRefreshToken,
              token_expiry: expiresAt,
              scopes: account.scope!.split(' '),
              updated_at: new Date(),
            },
            create: {
              user_id: dbUser.id,
              email_address: user.email!,
              access_token: encryptedAccessToken,
              refresh_token: encryptedRefreshToken,
              token_expiry: expiresAt,
              scopes: account.scope!.split(' '),
            },
          })

          // Update user onboarding status
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { gmail_connected: true }
          })

        } catch (error) {
          console.error('Error storing Gmail credentials:', error)
          return false
        }
      }

      return true
    },
  },
  pages: {
    signIn: "/signin",
    newUser: "/signup",
  },
}
