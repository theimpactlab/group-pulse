import { LandingNav } from "@/components/landing-nav"
import { LandingFooter } from "@/components/landing-footer"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

          <div className="prose max-w-none">
            <p className="text-lg mb-6">Last updated: April 2, 2024</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using GroupPulse's platform, you agree to be bound by these Terms of Service and all
              applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
              using or accessing this platform.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use License</h2>
            <p>
              Subject to your compliance with these Terms of Service, GroupPulse grants you a limited, non-exclusive,
              non-transferable, revocable license to access and use our platform for your personal or business purposes.
            </p>
            <p>You may not:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Modify or copy the materials except as explicitly permitted</li>
              <li>Use the materials for any commercial purpose not authorized by GroupPulse</li>
              <li>Attempt to decompile or reverse engineer any software contained on GroupPulse's platform</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Subscription and Payments</h2>
            <p>
              GroupPulse offers various subscription plans, including a free trial. By selecting a paid subscription,
              you agree to pay the subscription fees indicated for your selected plan. Subscription fees are billed in
              advance on a monthly or annual basis based on your selection.
            </p>
            <p>
              You are responsible for all charges incurred under your account, including applicable taxes. If you do not
              cancel your subscription before the end of your free trial period, you will be automatically charged for
              the subscription plan you selected.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Content</h2>
            <p>
              You retain all rights to any content you submit, post, or display on or through GroupPulse. By submitting,
              posting, or displaying content, you grant GroupPulse a worldwide, non-exclusive, royalty-free license to
              use, reproduce, adapt, publish, translate, and distribute your content in any existing or future media.
            </p>
            <p>
              You are solely responsible for any content you post and its legality, reliability, and appropriateness.
              GroupPulse does not claim ownership of your content but requires the rights to use it as necessary to
              operate and improve the platform.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Prohibited Uses</h2>
            <p>
              You agree not to use GroupPulse for any purpose that is unlawful or prohibited by these Terms, including
              but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Harassing, abusing, or threatening others</li>
              <li>Distributing malicious code or interfering with the platform's functionality</li>
              <li>Impersonating any person or entity</li>
              <li>Collecting user information without consent</li>
              <li>Posting content that is defamatory, obscene, or otherwise objectionable</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Termination</h2>
            <p>
              GroupPulse may terminate or suspend your account and access to the platform immediately, without prior
              notice or liability, for any reason, including without limitation if you breach the Terms of Service.
            </p>
            <p>
              Upon termination, your right to use the platform will immediately cease. All provisions of the Terms which
              by their nature should survive termination shall survive, including ownership provisions, warranty
              disclaimers, indemnity, and limitations of liability.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Disclaimer</h2>
            <p>
              GroupPulse's platform is provided on an "AS IS" and "AS AVAILABLE" basis. GroupPulse makes no warranties,
              expressed or implied, and hereby disclaims all warranties, including without limitation implied warranties
              of merchantability, fitness for a particular purpose, and non-infringement.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
            <p>
              In no event shall GroupPulse be liable for any damages (including, without limitation, damages for loss of
              data or profit, or due to business interruption) arising out of the use or inability to use the materials
              on GroupPulse's platform, even if GroupPulse or a GroupPulse authorized representative has been notified
              orally or in writing of the possibility of such damage.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, without
              regard to its conflict of law provisions.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
            <p>
              GroupPulse reserves the right to modify these Terms of Service at any time. We will notify you of any
              changes by posting the new Terms of Service on this page and updating the "Last updated" date. Your
              continued use of the platform after any such changes constitutes your acceptance of the new Terms of
              Service.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
            <p>If you have any questions about these Terms of Service, please contact us at:</p>
            <p>
              Email: legal@grouppulse.com
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

