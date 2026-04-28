import type { Metadata } from "next";
import { Trash2, ShieldCheck, Clock, Mail, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
    title: "Data Deletion Instructions — SocialPulse",
    description: "How to delete your SocialPulse account and data, including Meta platform data.",
};

const LAST_UPDATED = "April 29, 2026";
const CONTACT_EMAIL = "privacy@socialpulse.app";

export default function DataDeletionPage() {
    return (
        <article className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight mb-3">Data Deletion Instructions</h1>
                <p className="text-muted-foreground text-sm">Last updated: {LAST_UPDATED}</p>
            </div>

            <p className="text-lg text-muted-foreground mb-10">
                You have the right to delete your data from SocialPulse at any time. This page explains
                how to remove your account, disconnect social media platforms, and request full data deletion —
                including data collected through Meta (Instagram / Facebook) integrations.
            </p>

            {/* Quick action cards */}
            <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                <Card
                    icon={<Trash2 className="w-5 h-5 text-error" />}
                    title="Delete Account"
                    description="Remove your SocialPulse account and all associated data"
                    color="error"
                />
                <Card
                    icon={<ShieldCheck className="w-5 h-5 text-primary" />}
                    title="Disconnect Platforms"
                    description="Revoke SocialPulse access from a specific social media platform"
                    color="primary"
                />
                <Card
                    icon={<Mail className="w-5 h-5 text-success" />}
                    title="Contact Us"
                    description="Email us directly to request data deletion or export"
                    color="success"
                />
            </div>

            <Section title="1. Deleting Your SocialPulse Account">
                <p>
                    To permanently delete your SocialPulse account and all associated data:
                </p>
                <ol>
                    <li>Log in to your SocialPulse account</li>
                    <li>Navigate to <strong>Settings → Account</strong></li>
                    <li>Scroll to the <strong>"Danger Zone"</strong> section</li>
                    <li>Click <strong>"Delete Account"</strong> and confirm your decision</li>
                </ol>
                <p>
                    Account deletion is <strong>permanent and irreversible</strong>. Once deleted:
                </p>
                <ul>
                    <li>All scheduled posts and drafts are permanently removed</li>
                    <li>All connected social media tokens are revoked and deleted</li>
                    <li>All analytics and notification history is erased</li>
                    <li>Your email address and profile information are deleted</li>
                    <li>Any uploaded media files are removed from our storage</li>
                </ul>
                <p>
                    Data deletion is completed within <strong>30 days</strong> of your request.
                    You will receive a confirmation email when the deletion is complete.
                </p>
            </Section>

            <Section title="2. Disconnecting a Social Media Platform">
                <p>
                    To disconnect a specific social media account without deleting your entire SocialPulse
                    account:
                </p>
                <ol>
                    <li>Log in to SocialPulse</li>
                    <li>Go to <strong>Accounts</strong> in the sidebar</li>
                    <li>Find the account you want to disconnect</li>
                    <li>Click the <strong>disconnect</strong> button (trash icon)</li>
                    <li>Confirm the disconnection</li>
                </ol>
                <p>
                    This immediately revokes the OAuth token stored by SocialPulse and removes all
                    associated account data from our database. Your social media account itself is
                    not affected — only our access to it is removed.
                </p>
            </Section>

            <Section title="3. Revoking Access via Meta (Instagram / Facebook)">
                <p>
                    If you connected your Instagram or Facebook account to SocialPulse, you can also
                    revoke access directly from Meta's settings:
                </p>
                <ol>
                    <li>
                        Go to <strong>Facebook Settings</strong> →{" "}
                        <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                            Apps and Websites <ExternalLink className="w-3 h-3" />
                        </a>
                    </li>
                    <li>Find <strong>SocialPulse</strong> in the list of connected apps</li>
                    <li>Click <strong>"Remove"</strong></li>
                    <li>Confirm removal</li>
                </ol>
                <p>
                    When you remove SocialPulse from your Meta apps, Meta sends a data deletion
                    request to our system. We automatically delete all associated Meta tokens and
                    account data within <strong>24 hours</strong> of receiving this request.
                </p>
                <p>
                    You can verify the deletion status using the confirmation code provided by Meta
                    or by contacting us at{" "}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                </p>

                <div className="not-prose bg-muted/50 border border-border rounded-xl p-5 mt-4">
                    <p className="text-sm font-semibold mb-2">Meta Data Deletion Callback URL</p>
                    <p className="text-xs text-muted-foreground mb-3">
                        This endpoint is used by Meta to programmatically notify SocialPulse of
                        data deletion requests when users remove our app from their Meta account.
                    </p>
                    <code className="block bg-background border border-border rounded-lg px-4 py-2 text-sm font-mono break-all">
                        https://socialpulse.app/api/meta/data-deletion
                    </code>
                </div>
            </Section>

            <Section title="4. What Data We Delete">
                <p>
                    Upon a complete account deletion or Meta data deletion request, we remove:
                </p>
                <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <DataCategory
                        title="Account Data"
                        items={["Email address", "Password hash", "Profile name & avatar", "Account preferences"]}
                    />
                    <DataCategory
                        title="Social Connections"
                        items={["OAuth access tokens", "Refresh tokens", "Platform user IDs", "Profile pictures (cached)"]}
                    />
                    <DataCategory
                        title="Content"
                        items={["All scheduled posts", "Published post records", "Draft content", "Uploaded media files"]}
                    />
                    <DataCategory
                        title="Activity Data"
                        items={["Analytics history", "Notification records", "Session logs", "API credentials (Settings)"]}
                    />
                </div>
                <p className="mt-4">
                    <strong>Note:</strong> Anonymized, aggregated statistics that cannot identify you
                    individually may be retained for platform improvement purposes.
                </p>
            </Section>

            <Section title="5. Data Retention After Deletion">
                <div className="not-prose flex items-start gap-3 bg-warning/10 border border-warning/30 rounded-xl p-4 mb-4">
                    <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <p className="text-sm text-warning">
                        We retain minimal data for up to <strong>90 days</strong> in encrypted backups
                        to prevent data loss from accidental deletion. After 90 days, backups containing
                        your data are permanently destroyed.
                    </p>
                </div>
                <p>
                    Legal and compliance records (e.g., billing history, fraud prevention logs) may be
                    retained for up to <strong>7 years</strong> as required by applicable law. These
                    records are kept separate from your account data and in minimized form.
                </p>
            </Section>

            <Section title="6. Request Data Deletion by Email">
                <p>
                    If you are unable to delete your account through the application, or if you want to
                    request deletion of specific data, contact us:
                </p>
                <div className="not-prose bg-muted/50 border border-border rounded-xl p-6 space-y-3">
                    <div>
                        <p className="text-sm font-semibold">Email</p>
                        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline text-sm">{CONTACT_EMAIL}</a>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Subject line</p>
                        <p className="text-sm text-muted-foreground font-mono">Data Deletion Request — [your email address]</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Include</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li>The email address associated with your account</li>
                            <li>Which data you want deleted (account, specific platform, all data)</li>
                            <li>Any relevant platform user IDs if known</li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Response time</p>
                        <p className="text-sm text-muted-foreground">We will acknowledge your request within <strong>72 hours</strong> and complete deletion within <strong>30 days</strong>.</p>
                    </div>
                </div>
            </Section>

            <Section title="7. Your Rights Under Data Protection Laws">
                <p>
                    Depending on your location, you may have additional rights under applicable data
                    protection laws:
                </p>
                <ul>
                    <li><strong>GDPR (EU/EEA):</strong> Right to erasure ("right to be forgotten") under Article 17</li>
                    <li><strong>CCPA (California):</strong> Right to request deletion of personal information</li>
                    <li><strong>UK GDPR:</strong> Right to erasure under UK data protection law</li>
                    <li><strong>LGPD (Brazil):</strong> Right to deletion of unnecessary or excessive data</li>
                </ul>
                <p>
                    We honor deletion requests regardless of your jurisdiction. Contact us at{" "}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to exercise your rights.
                </p>
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

function Card({ icon, title, description, color }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}) {
    return (
        <div className="bg-muted/30 border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2">
                {icon}
                <span className="font-semibold text-sm">{title}</span>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </div>
    );
}

function DataCategory({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="bg-muted/30 border border-border rounded-xl p-4">
            <p className="text-sm font-semibold mb-2">{title}</p>
            <ul className="space-y-1">
                {items.map(item => (
                    <li key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
