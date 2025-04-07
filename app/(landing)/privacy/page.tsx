import { LandingNav } from "@/components/landing-nav"
import { LandingFooter } from "@/components/landing-footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

          <div className="prose max-w-none">
            <p className="text-lg mb-6">Last updated: April 2, 2024</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to GroupPulse ("we," "our," or "us"). We are committed to protecting your privacy and handling
              your data in an open and transparent manner. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our interactive audience engagement platform.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
            <p>We collect several types of information from and about users of our platform, including:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>
                Personal information such as name, email address, and company/organization name when you register for an
                account.
              </li>
              <li>
                Usage data including how you interact with our platform, features you use, and content you create.
              </li>
              <li>Participant responses to polls, quizzes, and other interactive elements you create.</li>
              <li>Device information including IP address, browser type, and operating system.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Provide, maintain, and improve our platform.</li>
              <li>Process transactions and send related information.</li>
              <li>Send administrative messages, updates, and security alerts.</li>
              <li>Respond to your comments, questions, and requests.</li>
              <li>Analyze usage patterns and trends to enhance user experience.</li>
              <li>Protect against, identify, and prevent fraud and other illegal activities.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Service providers who perform services on our behalf.</li>
              <li>Business partners with your consent or as necessary to provide services you've requested.</li>
              <li>Legal authorities when required by law or to protect our rights.</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method
              of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute
              security.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>The right to access and receive a copy of your personal information.</li>
              <li>The right to rectify inaccurate personal information.</li>
              <li>The right to request deletion of your personal information.</li>
              <li>The right to restrict or object to processing of your personal information.</li>
              <li>The right to data portability.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Children's Privacy</h2>
            <p>
              Our platform is not intended for children under 16 years of age. We do not knowingly collect personal
              information from children under 16. If you are a parent or guardian and believe your child has provided us
              with personal information, please contact us.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy
              Policy periodically for any changes.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p>
              Email: privacy@grouppulse.com
              <br />
              Address: 123 Innovation Street, Tech City, London, EC1V 1AB, United Kingdom
            </p>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}

