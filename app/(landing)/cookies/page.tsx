import { LandingNav } from "@/components/landing-nav"
import { LandingFooter } from "@/components/landing-footer"

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>

          <div className="prose max-w-none">
            <p className="text-lg mb-6">Last updated: April 10, 2024</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              This Cookie Policy explains how GroupPulse ("we," "our," or "us") uses cookies and similar technologies to
              recognize you when you visit our website and use our interactive audience engagement platform. It explains
              what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. What Are Cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website.
              Cookies are widely used by website owners to make their websites work, or to work more efficiently, as
              well as to provide reporting information.
            </p>
            <p>
              Cookies set by the website owner (in this case, GroupPulse) are called "first-party cookies." Cookies set
              by parties other than the website owner are called "third-party cookies." Third-party cookies enable
              third-party features or functionality to be provided on or through the website (e.g., advertising,
              interactive content, and analytics). The parties that set these third-party cookies can recognize your
              computer both when it visits the website in question and also when it visits certain other websites.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Why Do We Use Cookies?</h2>
            <p>
              We use first-party and third-party cookies for several reasons. Some cookies are required for technical
              reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary"
              cookies. Other cookies also enable us to track and target the interests of our users to enhance the
              experience on our website and platform. Third parties serve cookies through our website for analytics and
              other purposes.
            </p>

            <p>
              The specific types of first and third-party cookies served through our website and the purposes they
              perform are described below:
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Essential Cookies</h3>
            <p>
              These cookies are strictly necessary to provide you with services available through our website and to use
              some of its features, such as access to secure areas. Because these cookies are strictly necessary to
              deliver the website, you cannot refuse them without impacting how our website functions.
            </p>

            <ul className="list-disc pl-6 mb-6">
              <li>
                Session cookies: These are used to maintain your session state and authenticate you during your visit to
                our platform.
              </li>
              <li>Security cookies: These help us detect and prevent security risks and unauthorized activities.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Performance and Functionality Cookies</h3>
            <p>
              These cookies are used to enhance the performance and functionality of our website but are non-essential
              to their use. However, without these cookies, certain functionality may become unavailable.
            </p>

            <ul className="list-disc pl-6 mb-6">
              <li>
                Preference cookies: These remember your settings and preferences to enhance your experience (e.g.,
                language preferences).
              </li>
              <li>Feature cookies: These provide enhanced functionality and personalization.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Analytics and Customization Cookies</h3>
            <p>
              These cookies collect information that is used either in aggregate form to help us understand how our
              website is being used or how effective our marketing campaigns are, or to help us customize our website
              for you.
            </p>

            <ul className="list-disc pl-6 mb-6">
              <li>Google Analytics: We use Google Analytics to understand how visitors interact with our website.</li>
              <li>Usage pattern cookies: These help us understand how users navigate through our platform.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. How Can You Control Cookies?</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences
              by clicking on the appropriate opt-out links provided in the cookie banner that appears when you first
              visit our website.
            </p>

            <p>
              You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject
              cookies, you may still use our website though your access to some functionality and areas of our website
              may be restricted. As the means by which you can refuse cookies through your web browser controls vary
              from browser to browser, you should visit your browser's help menu for more information.
            </p>

            <p>
              In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would
              like to find out more information, please visit{" "}
              <a href="http://www.aboutads.info/choices/" className="text-primary hover:underline">
                http://www.aboutads.info/choices/
              </a>{" "}
              or{" "}
              <a href="http://www.youronlinechoices.com" className="text-primary hover:underline">
                http://www.youronlinechoices.com
              </a>
              .
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. How Often Will We Update This Cookie Policy?</h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the
              cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this
              Cookie Policy regularly to stay informed about our use of cookies and related technologies.
            </p>

            <p>The date at the top of this Cookie Policy indicates when it was last updated.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Where Can You Get Further Information?</h2>
            <p>
              If you have any questions about our use of cookies or other technologies, please email us at
              privacy@grouppulse.com or use the contact details provided on our website.
            </p>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
