import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy — SocialPulse",
    description: "How SocialPulse collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "April 29, 2026";
const CONTACT_EMAIL = "privacy@socialpulse.app";

export default function PrivacyPolicyPage() {
    return (
        <article className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
                <p className="text-muted-foreground text-sm">Last updated: {LAST_UPDATED}</p>
            </div>

            <Section title="1. Introduction">
                <p>
                    SocialPulse ("we", "our", or "us") operates a social media management platform that allows
                    users to connect, schedule, and publish content to multiple social media platforms including
                    Instagram, Facebook, Twitter/X, LinkedIn, and YouTube. This Privacy Policy explains how we
                    collect, use, disclose, and safeguard your information when you use our service.
                </p>
                <p>
                    By using SocialPulse, you agree to the collection and use of information in accordance with
                    this policy. If you do not agree, please discontinue use of the service.
                </p>
            </Section>

            <Section title="2. Information We Collect">
                <h3>2.1 Account Information</h3>
                <p>When you register, we collect:</p>
                <ul>
                    <li>Email address and password (managed via Supabase Auth)</li>
                    <li>Name and profile information you provide</li>
                    <li>Payment information (processed by third-party providers; we do not store card details)</li>
                </ul>

                <h3>2.2 Social Media Account Data</h3>
                <p>
                    When you connect a social media account, we receive and store OAuth tokens and limited
                    profile information (username, profile picture, platform user ID) necessary to authenticate
                    and publish on your behalf. Specifically:
                </p>
                <ul>
                    <li><strong>Instagram / Facebook (Meta):</strong> Access tokens, Instagram Business or Creator account ID, username, and profile picture. We request only the permissions required to publish media and read basic analytics.</li>
                    <li><strong>Twitter/X:</strong> OAuth 2.0 access and refresh tokens, Twitter user ID, and handle.</li>
                    <li><strong>LinkedIn:</strong> OAuth 2.0 access tokens, LinkedIn member URN, name, and profile picture.</li>
                    <li><strong>YouTube (Google):</strong> OAuth 2.0 access and refresh tokens, channel ID, and channel name.</li>
                </ul>

                <h3>2.3 Content You Create</h3>
                <p>
                    We store posts, captions, hashtags, media files, and scheduling metadata that you create
                    within SocialPulse in order to publish them at your chosen time.
                </p>

                <h3>2.4 Usage Data</h3>
                <p>
                    We automatically collect information about how you interact with our service, including
                    IP address, browser type, pages visited, and timestamps. This data is used for security,
                    debugging, and improving the platform.
                </p>

                <h3>2.5 Cookies and Tracking</h3>
                <p>
                    We use strictly necessary cookies for session management and authentication. We do not use
                    advertising or third-party tracking cookies. You can control cookie settings in your browser.
                </p>
            </Section>

            <Section title="3. How We Use Your Information">
                <p>We use your information to:</p>
                <ul>
                    <li>Authenticate you and maintain your session</li>
                    <li>Connect to social media platforms on your behalf via OAuth</li>
                    <li>Schedule and publish posts to your connected accounts</li>
                    <li>Display analytics and performance data</li>
                    <li>Send transactional notifications (post published, errors, etc.)</li>
                    <li>Detect and prevent fraud and abuse</li>
                    <li>Improve and develop the platform</li>
                    <li>Comply with legal obligations</li>
                </ul>
                <p>
                    We do not sell your personal data to third parties. We do not use your social media content
                    for advertising or train AI models on your private data without explicit consent.
                </p>
            </Section>

            <Section title="4. Meta (Instagram / Facebook) Data">
                <p>
                    SocialPulse integrates with Meta's platforms (Instagram, Facebook) via the Meta Graph API.
                    Our use of Meta user data is limited to:
                </p>
                <ul>
                    <li>Publishing posts, images, videos, and stories on your behalf</li>
                    <li>Reading basic profile information (username, profile picture) to display in our UI</li>
                    <li>Reading post-level insights and analytics you have authorized</li>
                </ul>
                <p>
                    We do not access your friends list, private messages, or any data beyond what is required
                    to provide the scheduling and publishing service. Access tokens are stored encrypted in our
                    database and are never shared with third parties beyond what is necessary to call the
                    Meta API.
                </p>
                <p>
                    Users may revoke access at any time by visiting
                    <strong> Facebook Settings → Apps and Websites</strong> or by disconnecting the account
                    within SocialPulse. When access is revoked, we delete all associated tokens immediately.
                    See our <a href="/data-deletion">Data Deletion Instructions</a> for the full process.
                </p>
            </Section>

            <Section title="5. Data Sharing and Disclosure">
                <p>We share your data only in the following circumstances:</p>
                <ul>
                    <li><strong>Social Media Platforms:</strong> Data is transmitted to the respective platforms (Meta, Twitter/X, LinkedIn, Google) solely to fulfill your publishing requests.</li>
                    <li><strong>Infrastructure Providers:</strong> We use Supabase (database and auth), Vercel (hosting), Cloudinary (media storage), and Upstash (task queuing). Each is bound by their own privacy policies and data processing agreements.</li>
                    <li><strong>Legal Requirements:</strong> We may disclose data if required by law, court order, or governmental authority.</li>
                    <li><strong>Business Transfers:</strong> If SocialPulse is acquired or merged, your data may be transferred as part of that transaction, with notice provided.</li>
                </ul>
            </Section>

            <Section title="6. Data Retention">
                <p>
                    We retain your account and content data for as long as your account is active. If you
                    delete your account, we will delete your personal data within <strong>30 days</strong>,
                    except where retention is required by law or for legitimate business purposes (e.g.,
                    fraud prevention records).
                </p>
                <p>
                    OAuth tokens for disconnected social accounts are deleted immediately upon disconnection.
                    Aggregated, anonymized analytics data may be retained indefinitely.
                </p>
            </Section>

            <Section title="7. Data Security">
                <p>
                    We implement industry-standard security measures including:
                </p>
                <ul>
                    <li>Encryption of data in transit (TLS 1.2+) and at rest (AES-256)</li>
                    <li>OAuth tokens stored encrypted in our database</li>
                    <li>Access controls and principle of least privilege for internal systems</li>
                    <li>Regular security reviews and dependency audits</li>
                </ul>
                <p>
                    No method of transmission over the Internet is 100% secure. We strive to protect your
                    information but cannot guarantee absolute security.
                </p>
            </Section>

            <Section title="8. Your Rights">
                <p>Depending on your jurisdiction, you may have the right to:</p>
                <ul>
                    <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                    <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                    <li><strong>Erasure:</strong> Request deletion of your personal data (see <a href="/data-deletion">Data Deletion Instructions</a>)</li>
                    <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                    <li><strong>Objection:</strong> Object to certain types of processing</li>
                    <li><strong>Restriction:</strong> Request that we restrict processing of your data</li>
                </ul>
                <p>
                    To exercise any of these rights, contact us at{" "}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                    We will respond within 30 days.
                </p>
            </Section>

            <Section title="9. Children's Privacy">
                <p>
                    SocialPulse is not intended for children under 13 years of age (or 16 in the EU/EEA).
                    We do not knowingly collect personal information from children. If you believe a child
                    has provided us with personal data, contact us immediately at{" "}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                </p>
            </Section>

            <Section title="10. International Transfers">
                <p>
                    Your data may be processed in countries outside your own, including the United States,
                    where our infrastructure providers operate. We ensure appropriate safeguards are in place,
                    including Standard Contractual Clauses where required by GDPR.
                </p>
            </Section>

            <Section title="11. Changes to This Policy">
                <p>
                    We may update this Privacy Policy from time to time. We will notify you of significant
                    changes via email or a prominent notice in the application. The "Last updated" date at
                    the top of this page reflects the most recent revision. Continued use of SocialPulse
                    after changes constitutes acceptance of the updated policy.
                </p>
            </Section>

            <Section title="12. Contact Us">
                <p>For privacy-related questions, requests, or concerns:</p>
                <div className="not-prose bg-muted/50 border border-border rounded-xl p-6 mt-4 space-y-1 text-sm">
                    <p><strong>SocialPulse</strong></p>
                    <p>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a></p>
                    <p>Data Deletion: <a href="/data-deletion" className="text-primary hover:underline">socialpulse.app/data-deletion</a></p>
                </div>
            </Section>
        </article>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">{title}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">{children}</div>
        </section>
    );
}
