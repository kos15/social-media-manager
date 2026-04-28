import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service — SocialPulse",
    description: "Terms and conditions governing your use of SocialPulse.",
};

const LAST_UPDATED = "April 29, 2026";
const CONTACT_EMAIL = "legal@socialpulse.app";

export default function TermsOfServicePage() {
    return (
        <article className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: {LAST_UPDATED}</p>
            </div>

            <Section title="1. Acceptance of Terms">
                <p>
                    By accessing or using SocialPulse ("the Service"), you agree to be bound by these Terms
                    of Service ("Terms"). If you do not agree to all of these Terms, you may not use the
                    Service. These Terms apply to all visitors, users, and others who access or use the Service.
                </p>
                <p>
                    We reserve the right to update these Terms at any time. We will notify you of material
                    changes via email or in-app notification. Continued use of the Service after changes
                    constitutes acceptance of the revised Terms.
                </p>
            </Section>

            <Section title="2. Description of Service">
                <p>
                    SocialPulse is a social media management platform that allows users to:
                </p>
                <ul>
                    <li>Connect social media accounts (Instagram, Facebook, Twitter/X, LinkedIn, YouTube) via OAuth</li>
                    <li>Compose, schedule, and publish posts across multiple platforms</li>
                    <li>View analytics and performance data for published content</li>
                    <li>Generate AI-assisted content suggestions</li>
                    <li>Manage team access and collaboration</li>
                </ul>
            </Section>

            <Section title="3. Eligibility">
                <p>
                    You must be at least 13 years of age (or 16 in the EU/EEA) to use SocialPulse. By using
                    the Service, you represent that you meet this age requirement. If you are using the Service
                    on behalf of an organization, you represent that you have the authority to bind that
                    organization to these Terms.
                </p>
            </Section>

            <Section title="4. User Accounts">
                <h3>4.1 Registration</h3>
                <p>
                    You must create an account to use SocialPulse. You agree to provide accurate, current,
                    and complete information during registration and to keep your account information updated.
                </p>

                <h3>4.2 Account Security</h3>
                <p>
                    You are responsible for maintaining the confidentiality of your account credentials and
                    for all activities that occur under your account. You agree to notify us immediately at{" "}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> of any unauthorized use of your account.
                    We are not liable for any loss resulting from unauthorized access to your account.
                </p>

                <h3>4.3 Account Termination</h3>
                <p>
                    You may delete your account at any time. We reserve the right to suspend or terminate
                    your account if you violate these Terms or engage in any activity that harms the Service,
                    other users, or third parties.
                </p>
            </Section>

            <Section title="5. Social Media Platform Compliance">
                <p>
                    SocialPulse integrates with third-party social media platforms. Your use of these
                    integrations is subject to the respective platform's terms of service:
                </p>
                <ul>
                    <li><a href="https://www.facebook.com/policies_center" target="_blank" rel="noopener noreferrer">Meta (Instagram &amp; Facebook) Terms</a></li>
                    <li><a href="https://twitter.com/en/tos" target="_blank" rel="noopener noreferrer">Twitter/X Terms of Service</a></li>
                    <li><a href="https://www.linkedin.com/legal/user-agreement" target="_blank" rel="noopener noreferrer">LinkedIn User Agreement</a></li>
                    <li><a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube Terms of Service</a></li>
                </ul>
                <p>
                    You agree to comply with all applicable platform policies when publishing content through
                    SocialPulse. We may suspend access to platform integrations if we receive notice of policy
                    violations.
                </p>

                <h3>5.1 Meta Platform Policy</h3>
                <p>
                    Our integration with Instagram and Facebook is governed by the{" "}
                    <a href="https://developers.facebook.com/policy/" target="_blank" rel="noopener noreferrer">Meta Platform Terms</a>.
                    You authorize SocialPulse to access, store, and use your Meta account data only to the
                    extent necessary to provide the scheduling and publishing features. We adhere to Meta's
                    Platform Policy and use data only for the purposes disclosed in our{" "}
                    <a href="/privacy-policy">Privacy Policy</a>.
                </p>
            </Section>

            <Section title="6. User Content">
                <h3>6.1 Your Content</h3>
                <p>
                    You retain all rights to content you create, upload, or publish through SocialPulse
                    ("User Content"). By using the Service, you grant SocialPulse a limited, non-exclusive,
                    royalty-free license to store, process, and transmit your User Content solely for the
                    purpose of providing the Service.
                </p>

                <h3>6.2 Content Responsibility</h3>
                <p>
                    You are solely responsible for all User Content you publish through SocialPulse. You
                    represent that you have all necessary rights to publish such content and that it does not
                    violate any applicable laws or third-party rights.
                </p>

                <h3>6.3 Prohibited Content</h3>
                <p>You may not use SocialPulse to publish content that:</p>
                <ul>
                    <li>Is illegal, fraudulent, defamatory, or obscene</li>
                    <li>Infringes on intellectual property rights of others</li>
                    <li>Contains malware, spam, or unsolicited commercial messages</li>
                    <li>Violates the terms of service of any connected social media platform</li>
                    <li>Promotes hate speech, violence, or discrimination</li>
                    <li>Misrepresents your identity or affiliation</li>
                </ul>
            </Section>

            <Section title="7. Prohibited Uses">
                <p>In addition to prohibited content, you may not use SocialPulse to:</p>
                <ul>
                    <li>Automate mass-spam or coordinated inauthentic behavior on social media platforms</li>
                    <li>Scrape, harvest, or collect data from social media platforms in violation of their policies</li>
                    <li>Circumvent any platform's rate limits, security measures, or terms of service</li>
                    <li>Attempt to gain unauthorized access to SocialPulse systems or other user accounts</li>
                    <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                    <li>Use the Service to compete with SocialPulse by building a substantially similar product</li>
                    <li>Resell or sublicense the Service without our written permission</li>
                </ul>
            </Section>

            <Section title="8. AI-Generated Content">
                <p>
                    SocialPulse offers AI-assisted content generation features. You acknowledge that:
                </p>
                <ul>
                    <li>AI-generated suggestions are provided as-is and may not be accurate or appropriate for all audiences</li>
                    <li>You are responsible for reviewing and approving all content before publishing</li>
                    <li>SocialPulse is not liable for any issues arising from AI-generated content that you choose to publish</li>
                    <li>Your use of AI features is subject to the applicable AI provider's terms</li>
                </ul>
            </Section>

            <Section title="9. Intellectual Property">
                <h3>9.1 SocialPulse IP</h3>
                <p>
                    The Service, including its design, code, trademarks, logos, and all content created by
                    SocialPulse, is protected by copyright, trademark, and other intellectual property laws.
                    You may not copy, modify, distribute, or create derivative works based on our IP without
                    our prior written consent.
                </p>

                <h3>9.2 Feedback</h3>
                <p>
                    If you provide feedback or suggestions about the Service, you grant us a perpetual,
                    irrevocable, royalty-free right to use that feedback to improve the Service without
                    any obligation to you.
                </p>
            </Section>

            <Section title="10. Payments and Subscriptions">
                <p>
                    Certain features of SocialPulse may require a paid subscription. By subscribing, you
                    agree to pay all applicable fees. Fees are billed in advance on a recurring basis.
                    Subscriptions auto-renew unless cancelled before the renewal date. Refunds are handled
                    on a case-by-case basis at our discretion. We reserve the right to change pricing with
                    30 days' notice.
                </p>
            </Section>

            <Section title="11. Disclaimers and Limitation of Liability">
                <h3>11.1 Disclaimer of Warranties</h3>
                <p>
                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS
                    FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL
                    BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
                </p>

                <h3>11.2 Limitation of Liability</h3>
                <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOCIALPULSE SHALL NOT BE LIABLE FOR ANY
                    INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF
                    PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE, EVEN IF ADVISED OF
                    THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF
                    $100 USD OR THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
                </p>

                <h3>11.3 Social Media Platform Actions</h3>
                <p>
                    SocialPulse is not responsible for actions taken by social media platforms, including
                    account suspension, removal of content, changes to API access, or any other platform
                    decisions that affect your ability to publish through our Service.
                </p>
            </Section>

            <Section title="12. Indemnification">
                <p>
                    You agree to indemnify, defend, and hold harmless SocialPulse and its officers, directors,
                    employees, and agents from and against any claims, liabilities, damages, losses, costs,
                    or expenses (including reasonable attorneys' fees) arising out of or relating to your use
                    of the Service, your User Content, or your violation of these Terms.
                </p>
            </Section>

            <Section title="13. Governing Law and Dispute Resolution">
                <p>
                    These Terms shall be governed by and construed in accordance with the laws of the
                    jurisdiction in which SocialPulse operates, without regard to conflict of law principles.
                    Any disputes arising under these Terms shall be resolved through binding arbitration,
                    except that either party may seek injunctive relief in a court of competent jurisdiction.
                </p>
            </Section>

            <Section title="14. Contact Information">
                <p>For questions about these Terms, contact us at:</p>
                <div className="not-prose bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mt-4 space-y-1 text-sm">
                    <p><strong>SocialPulse Legal</strong></p>
                    <p>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-gray-900 dark:text-white hover:underline font-medium">{CONTACT_EMAIL}</a></p>
                    <p>Privacy Policy: <a href="/privacy-policy" className="text-gray-900 dark:text-white hover:underline font-medium">socialpulse.app/privacy-policy</a></p>
                    <p>Data Deletion: <a href="/data-deletion" className="text-gray-900 dark:text-white hover:underline font-medium">socialpulse.app/data-deletion</a></p>
                </div>
            </Section>
        </article>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">{title}</h2>
            <div className="space-y-4 text-gray-500 dark:text-gray-400 leading-relaxed">{children}</div>
        </section>
    );
}
