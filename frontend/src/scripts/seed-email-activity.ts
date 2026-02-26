
import { prisma } from '../lib/prisma'

async function seedEmailActivity() {
    try {
        console.log('Starting Email Activity seeding...')

        const user = await prisma.user.findFirst()
        if (!user) {
            console.error('No user found.')
            return
        }

        console.log(`Seeding for user: ${user.email}`)

        // 1. Create a better mock ScrapedPost/Job
        // We need to create a Job to have company/title if ScrapedPost doesn't parse well,
        // but the API I wrote checks `app.scrapedPost.job`.
        const scrapedPost = await prisma.scrapedPost.create({
            data: {
                post_url: 'https://www.linkedin.com/jobs/view/senior-react-dev-999',
                linkedin_id: `mock-job-${Date.now()}`,
                text: 'Senior React Developer at TechCorp...',
                processed: true,
                raw_html: '<div>Mock HTML</div>',
            }
        })

        // Create the associated Job to ensure "Unknown Company" is fixed
        await prisma.job.create({
            data: {
                scraped_post_id: scrapedPost.id,
                title: 'Senior React Developer',
                company: 'TechCorp Inc.',
                location: 'San Francisco, CA (Remote)',
                description: 'We are looking for a Senior React Developer...',
            }
        })

        // 2. Create ScrapedApplication
        const hrEmail = 'jenny.hr@techcorp.com'
        const coverLetter = `Dear Hire Team,

I've been following TechCorp's work on AI-driven interfaces and I'm impressed by your recent launch.

With 5 years of experience in React and Node.js, I believe I can contribute significantly to your frontend team. I have implemented similar complex dashboards in my previous role.

Please find my resume attached. I look forward to hearing from you.

Best regards,
Abhishek`

        const application = await prisma.scrapedApplication.create({
            data: {
                user_id: user.id,
                scraped_post_id: scrapedPost.id,
                hr_email: hrEmail,
                cover_letter: coverLetter,
                sent_at: new Date(Date.now() - 172800000), // 2 days ago
                gmail_thread_id: `thread-${Date.now()}`,
                gmail_message_id: `msg-${Date.now()}-1`,
            }
        })

        // 3. Create EmailThread
        const thread = await prisma.emailThread.create({
            data: {
                user_id: user.id,
                gmail_thread_id: application.gmail_thread_id!,
                subject: 'Application for Senior React Developer - Abhishek',
                participants: [user.email, hrEmail],
                last_message_at: new Date(),
                message_count: 2,
            }
        })

        // 4. Create EmailLogs - ONLY the reply. 
        await prisma.emailLog.create({
            data: {
                user_id: user.id,
                gmail_message_id: `msg-${Date.now()}-2`,
                thread_id: thread.id,
                from_email: hrEmail,
                to_email: user.email,
                subject: 'Re: Application for Senior React Developer - Abhishek',
                snippet: 'Hi Abhishek, Thanks for the application. Your experience looks relevant. Are you available for a quick chat this Thursday? - Jenny',
                direction: 'received',
                status: 'received',
                sent_at: new Date(Date.now() - 86400000), // 1 day ago
                gmail_timestamp: new Date(Date.now() - 86400000),
                is_reply: true,
            }
        })

        console.log('Successfully seeded SINGLE high-quality entry!')

    } catch (error) {
        console.error('Error seeding data:', error)
    } finally {
        await prisma.$disconnect()
    }
}

seedEmailActivity()
