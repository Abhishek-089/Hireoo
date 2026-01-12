# Database Tables Explanation

## ✅ **Currently Used Tables** (Active in your app)

### **Authentication & User Management**
- **`User`** - Main user accounts (email, name, onboarding data, skills, preferences)
- **`Account`** - OAuth provider accounts (Google, etc.) linked to users
- **`Session`** - Active login sessions (NextAuth)
- **`VerificationToken`** - Email verification tokens (if using email auth)

### **Scraping & Job Matching** (Your Core Features)
- **`ScrapedPost`** - Raw LinkedIn posts scraped by Chrome extension
  - **Status**: ✅ **ACTIVE** - You have 13 posts here
  - Stores: post text, HTML, URL, timestamp
  
- **`ScrapedPostMatch`** - **NEW!** Tracks which scraped posts match which users
  - **Status**: 🆕 **JUST ADDED** - Run `npx prisma db push` to create
  - Tracks: match score, quality (good/medium/bad), shown/applied status
  - **This answers your question**: "13 posts scraped, 5 matched"
  
- **`ScrapedApplication`** - Applications sent via "Apply via email" button
  - **Status**: ✅ **ACTIVE** - Records when you send emails to HR
  - Stores: cover letter, HR email, sent timestamp

### **Resume & Gmail**
- **`Resume`** - User uploaded resumes (Cloudinary URLs)
  - **Status**: ✅ **ACTIVE** - Used when sending applications
  
- **`GmailCredentials`** - Gmail OAuth tokens for sending emails
  - **Status**: ✅ **ACTIVE** - Used for "Apply via email" feature
  - **Note**: `GmailCredential` (singular) is legacy/unused

---

## ⚠️ **Partially Used / Legacy Tables**

### **Job Matching System** (Advanced feature - not fully implemented)
- **`Job`** - Structured job postings extracted from scraped posts
  - **Status**: ⚠️ **EMPTY** - AI extraction worker is a stub, doesn't create Job records
  - **Purpose**: Would store structured job data (title, company, skills, etc.)
  - **Why empty**: The queue worker that creates Jobs isn't working yet
  
- **`JobMatch`** - AI-powered matches between Jobs and Users
  - **Status**: ⚠️ **EMPTY** - Can't create matches without Jobs
  - **Purpose**: Would store match scores, quality, applied status
  - **Why empty**: Depends on `Job` table being populated

### **Email System** (Advanced feature - not fully implemented)
- **`EmailDraft`** - AI-generated cold email drafts
  - **Status**: ⚠️ **EMPTY** - Not used in current "Apply via email" flow
  - **Purpose**: Would store AI-generated email templates
  - **Current flow**: Generates cover letter on-the-fly, doesn't save drafts
  
- **`Email`** - Sent emails (legacy)
  - **Status**: ⚠️ **EMPTY** - Not used
  - **Current flow**: Uses `ScrapedApplication` instead
  
- **`EmailLog`** - Gmail API message logs
  - **Status**: ⚠️ **EMPTY** - Gmail sync worker not running
  - **Purpose**: Would track all Gmail messages (sent/received)
  
- **`EmailThread`** - Gmail conversation threads
  - **Status**: ⚠️ **EMPTY** - Gmail sync worker not running
  - **Purpose**: Would track email conversations
  
- **`EmailReply`** - Email replies (legacy)
  - **Status**: ⚠️ **EMPTY** - Not used

### **Billing** (Not implemented)
- **`Subscription`** - User subscription status
  - **Status**: ⚠️ **EMPTY** - Billing not implemented yet
  
- **`SubscriptionPlan`** - Available subscription plans
  - **Status**: ⚠️ **EMPTY** - Billing not implemented yet

---

## 📊 **Summary**

### **Active Tables** (Have data):
1. ✅ `User` - Your user accounts
2. ✅ `ScrapedPost` - 13 scraped posts
3. ✅ `ScrapedApplication` - Applications you've sent
4. ✅ `Resume` - Uploaded resumes
5. ✅ `GmailCredentials` - Gmail connection
6. ✅ `Account` / `Session` - Auth data

### **New Table** (Needs migration):
7. 🆕 `ScrapedPostMatch` - **Run `npx prisma db push` to create this!**

### **Empty Tables** (Not used yet):
- `Job` - AI extraction not working
- `JobMatch` - Depends on Job
- `EmailDraft` - Not used in current flow
- `Email` / `EmailLog` / `EmailThread` / `EmailReply` - Gmail sync not running
- `Subscription` / `SubscriptionPlan` - Billing not implemented
- `GmailCredential` (singular) - Legacy, use `GmailCredentials` instead

---

## 🚀 **Next Steps**

1. **Add ScrapedPostMatch table:**
   ```bash
   cd frontend
   npx prisma db push
   npx prisma generate
   ```

2. **Match existing posts:**
   - Call `POST /api/scraping/match-posts` to match your 13 existing posts
   - Or wait for new posts to auto-match

3. **View statistics:**
   - Call `GET /api/scraping/match-posts` to see:
     - Total scraped: 13
     - Total matched: 5 (or however many match)
     - Total shown: X
     - Total applied: Y





