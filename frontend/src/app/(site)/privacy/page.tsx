import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Hireoo",
  description: "Learn how Hireoo protects your privacy and handles your data securely.",
  alternates: {
    canonical: "/privacy",
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: December 16, 2024</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At Hireoo ("we," "us," or "our"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered job search automation platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-medium text-gray-900 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect personal information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Name and contact information (email address)</li>
              <li>Professional information (resume, skills, work experience)</li>
              <li>Job search preferences and criteria</li>
              <li>Account credentials and profile information</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">2.2 Gmail Integration Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you connect your Gmail account via OAuth:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Email address and basic profile information</li>
              <li>Access to send emails on your behalf</li>
              <li>Ability to read responses to emails we send</li>
              <li>Email metadata (subject, timestamps, sender/recipient info)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2.3 Professional Network Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Through our Chrome extension, we collect job posting information from professional networks, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Job titles, descriptions, and requirements</li>
              <li>Company information and hiring details</li>
              <li>Application deadlines and contact information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Provide and improve our job search automation services</li>
              <li>Match you with relevant job opportunities</li>
              <li>Generate personalized cold emails and follow-ups</li>
              <li>Send you important service updates and notifications</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Provide customer support and respond to your inquiries</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>End-to-end encryption for data transmission</li>
              <li>Secure server infrastructure with regular security audits</li>
              <li>Access controls and authentication requirements</li>
              <li>Regular security updates and monitoring</li>
              <li>Secure OAuth integration with Gmail (we never store passwords)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With trusted service providers who help us operate our platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Account Deletion:</strong> Delete your account and associated data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Typically, we retain account data while your account is active and for a reasonable period thereafter for legal, regulatory, and business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience on our platform. You can control cookie preferences through your browser settings. Our Chrome extension may collect usage data to improve functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during such transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through our platform. Your continued use of our services after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@hireoo.com</p>
              <p className="text-gray-700"><strong>Address:</strong> 123 Innovation Drive, San Francisco, CA 94103</p>
              <p className="text-gray-700"><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
