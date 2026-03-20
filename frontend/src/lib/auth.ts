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
            scope: 'openid email profile',
            prompt: 'select_account',
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
    maxAge: 365 * 24 * 60 * 60,   // 1 year — session stays alive unless user explicitly logs out
    updateAge: 24 * 60 * 60,       // Refresh JWT once per day on activity (resets the 1-year clock)
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }

      // Persist the sign-in provider so we can show the indicator in the UI
      if (account?.provider) {
        token.lastSignInProvider = account.provider
      }

      // When the user explicitly connects Gmail (scope includes gmail), store credentials
      if (account?.provider === 'google' && account.scope?.includes('gmail') && user?.id) {
        try {
          const encryptedAccessToken = TokenEncryption.encryptToken(account.access_token!)
          const encryptedRefreshToken = account.refresh_token
            ? TokenEncryption.encryptToken(account.refresh_token)
            : null
          const expiresAt = new Date(account.expires_at! * 1000)

          await prisma.gmailCredentials.upsert({
            where: { user_id: user.id },
            update: {
              access_token: encryptedAccessToken,
              ...(encryptedRefreshToken && { refresh_token: encryptedRefreshToken }),
              token_expiry: expiresAt,
              scopes: account.scope!.split(' '),
              updated_at: new Date(),
            },
            create: {
              user_id: user.id,
              email_address: user.email!,
              access_token: encryptedAccessToken,
              refresh_token: encryptedRefreshToken ?? '',
              token_expiry: expiresAt,
              scopes: account.scope!.split(' '),
            },
          })

          await prisma.user.update({
            where: { id: user.id },
            data: { gmail_connected: true },
          })
        } catch (error) {
          console.error('Error storing Gmail credentials in jwt callback:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        if (token.lastSignInProvider) {
          session.user.lastSignInProvider = token.lastSignInProvider
        }

        // Fetch fresh user data from database to reflect any manual changes
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
              name: true,
              email: true,
              image: true,
            }
          })

          if (dbUser) {
            session.user.name = dbUser.name
            session.user.email = dbUser.email
            if (dbUser.image) {
              session.user.image = dbUser.image
            }
          }
        } catch (error) {
          console.error('Error fetching fresh user data:', error)
        }

        // Include Gmail connection status in session
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
      return session
    },
    async signIn({ user, account }) {
      // For Google sign-ins, check if this email already exists as a
      // credentials-based account and link it so OAuthAccountNotLinked never fires.
      if (account?.provider === 'google' && user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          })

          if (dbUser) {
            // User registered with email+password — create the Google Account link
            await (prisma as any).account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              update: {
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
              create: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            })
            user.id = dbUser.id
          }
          // New users: return true and let the PrismaAdapter create User + Account.
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }

      return true
    },
  },
  pages: {
    signIn: "/signin",
    newUser: "/dashboard",
  },
}
