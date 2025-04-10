import { LandingNav } from "@/components/landing-nav"
import { LandingFooter } from "@/components/landing-footer"

export default function GDPRCompliancePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">GDPR Compliance</h1>

          <div className="prose max-w-none">
            <p className="text-lg mb-6">Last updated: April 10, 2024</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Commitment to GDPR Compliance</h2>
            <p>
              At GroupPulse, we are committed to ensuring the privacy and protection of your personal data in accordance
              with the General Data Protection Regulation (GDPR). This page outlines how we comply with GDPR
              requirements and your rights under this regulation.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Data Controller Information</h2>
            <p>
              GroupPulse acts as a data controller for the personal information collected through our website and
              platform. You can contact our Data Protection Officer at:
            </p>
            <p>
              Email: dpo@grouppulse.com
              <br />
              Address: 123 Innovation Street, Tech City, London, EC1V 1AB, United Kingdom
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Personal Data We Process</h2>
            <p>We collect and process the following categories of personal data:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>
                <strong>Account Information:</strong> Name, email address, and company/organization name when you
                register for an account.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact with our platform, features you use, and
                content you create.
              </li>
              <li>
                <strong>Participant Data:</strong> When you participate in sessions, we collect your responses and, if
                provided, your name or identifier.
              </li>
              <li>
                <strong>Technical Data:</strong> IP address, browser type, operating system, and other device
                information.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Legal Basis for Processing</h2>
            <p>We process your personal data on the following legal grounds:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>
                <strong>Contract:</strong> Processing necessary for the performance of our contract with you to provide
                our services.
              </li>
              <li>
                <strong>Legitimate Interests:</strong> Processing necessary for our legitimate interests, such as
                improving our services, preventing fraud, and ensuring the security of our platform.
              </li>
              <li>
                <strong>Consent:</strong> Where you have given us specific consent to process your data for particular
                purposes.
              </li>
              <li>
                <strong>Legal Obligation:</strong> Processing necessary to comply with our legal obligations.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Your Rights Under GDPR</h2>
            <p>Under the GDPR, you have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>
                <strong>Right to Access:</strong> You have the right to request a copy of the personal data we hold
                about you.
              </li>
              <li>
                <strong>Right to Rectification:</strong> You have the right to request that we correct any inaccurate or
                incomplete personal data.
              </li>
              <li>
                <strong>Right to Erasure:</strong> You have the right to request that we delete your personal data in
                certain circumstances.
              </li>
              <li>
                <strong>Right to Restrict Processing:</strong> You have the right to request that we restrict the
                processing of your personal data in certain circumstances.
              </li>
              <li>
                <strong>Right to Data Portability:</strong> You have the right to request that we transfer your personal
                data to another service provider in a structured, commonly used, and machine-readable format.
              </li>
              <li>
                <strong>Right to Object:</strong> You have the right to object to the processing of your personal data
                in certain circumstances, including for direct marketing purposes.
              </li>
              <li>
                <strong>Right to Withdraw Consent:</strong> Where we process your data based on consent, you have the
                right to withdraw that consent at any time.
              </li>
            </ul>
            <p>To exercise any of these rights, please contact us at privacy@grouppulse.com.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Retention</h2>
            <p>
              We retain your personal data only for as long as necessary to fulfill the purposes for which it was
              collected, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
            <p>
              For account information, we retain your data for as long as your account is active. If you delete your
              account, we will delete or anonymize your personal data within 30 days, unless we are required to retain
              it for legal reasons.
            </p>
            <p>
              For session and response data, we retain this information for as long as the session creator maintains
              their account, or until they delete the specific session.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. International Data Transfers</h2>
            <p>
              GroupPulse is based in the United Kingdom, and your data may be processed in countries outside the
              European Economic Area (EEA). Whenever we transfer your personal data out of the EEA, we ensure a similar
              degree of protection is afforded to it by implementing appropriate safeguards, such as:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>
                Using specific contracts approved by the European Commission that give personal data the same protection
                it has in Europe.
              </li>
              <li>
                Transferring data to countries that have been deemed to provide an adequate level of protection for
                personal data by the European Commission.
              </li>
              <li>
                Using providers who are certified under approved certification mechanisms such as the EU-US Privacy
                Shield.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational measures to protect your personal data
              against unauthorized or unlawful processing, accidental loss, destruction, or damage. These measures
              include:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Encryption of personal data in transit and at rest</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Access controls and authentication procedures</li>
              <li>Regular backups and disaster recovery procedures</li>
              <li>Staff training on data protection and security</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Data Breach Procedures</h2>
            <p>
              In the event of a personal data breach, we will notify the relevant supervisory authority within 72 hours
              of becoming aware of the breach, where feasible. If the breach is likely to result in a high risk to your
              rights and freedoms, we will also notify you directly.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Data Protection Impact Assessments</h2>
            <p>
              We conduct Data Protection Impact Assessments (DPIAs) for processing activities that are likely to result
              in a high risk to the rights and freedoms of individuals, particularly when implementing new technologies.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Data Protection Officer</h2>
            <p>
              We have appointed a Data Protection Officer (DPO) responsible for overseeing our data protection strategy
              and implementation to ensure compliance with GDPR requirements. You can contact our DPO at
              dpo@grouppulse.com.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Complaints</h2>
            <p>
              If you have any concerns about our processing of your personal data, you have the right to lodge a
              complaint with the Information Commissioner's Office (ICO), the UK supervisory authority for data
              protection issues (www.ico.org.uk), or the supervisory authority in your country of residence.
            </p>
            <p>
              However, we would appreciate the chance to deal with your concerns before you approach a supervisory
              authority, so please contact us in the first instance at privacy@grouppulse.com.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Changes to This GDPR Compliance Statement</h2>
            <p>
              We may update this GDPR Compliance Statement from time to time. We will notify you of any changes by
              posting the new statement on this page and updating the "Last updated" date at the top.
            </p>
            <p>
              You are advised to review this statement periodically for any changes. Changes to this statement will be
              effective when they are posted on this page.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">13. Contact Us</h2>
            <p>
              If you have any questions about this GDPR Compliance Statement or our data protection practices, please
              contact us at:
            </p>
            <p>
              Email: ryan@theimpactlab.co.uk
            </p>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
