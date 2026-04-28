import type { Metadata } from "next";
import Link from "next/link";
import { Shield, FileText, Trash2, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms & Conditions — SocialPulse",
    description: "Legal documents including Privacy Policy, Terms of Service, and Data Deletion Instructions for SocialPulse.",
};

const LAST_UPDATED = "April 29, 2026";

const docs = [
    {
        icon: Shield,
        title: "Privacy Policy",
        description:
            "How SocialPulse collects, uses, and protects your personal data — including data received through Meta, Twitter/X, LinkedIn, and YouTube integrations. Covers data retention, security practices, and your rights under GDPR and CCPA.",
        href: "/privacy-policy",
        tags: ["GDPR", "CCPA", "Data Security", "Meta"],
    },
    {
        icon: FileText,
        title: "Terms of Service",
        description:
            "The rules governing your use of SocialPulse — covering acceptable use, social media platform compliance (Meta Platform Policy, Twitter/X ToS, LinkedIn Agreement), content responsibility, AI-generated content, and limitation of liability.",
        href: "/terms-of-service",
        tags: ["Meta Policy", "User Content", "AI Content", "Liability"],
    },
    {
        icon: Trash2,
        title: "Data Deletion Instructions",
        description:
            "Step-by-step instructions to delete your account, disconnect social media platforms, or revoke SocialPulse access from Meta. Includes the Meta data deletion callback URL required for Instagram and Facebook app review.",
        href: "/data-deletion",
        tags: ["Account Deletion", "Meta Callback", "GDPR Erasure", "Right to be Forgotten"],
    },
];

export default function TermsHubPage() {
    return (
        <div className="space-y-12">
            {/* Hero */}
            <div className="text-center space-y-4 py-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-zinc-800 text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
                    <Clock className="w-3 h-3" />
                    Last updated: {LAST_UPDATED}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Terms &amp; Conditions
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                    SocialPulse is committed to transparency. Below are all legal documents governing
                    your use of our platform and how we handle your data.
                </p>
            </div>

            {/* Doc cards */}
            <div className="space-y-4">
                {docs.map((doc) => (
                    <Link
                        key={doc.href}
                        href={doc.href}
                        className="group flex flex-col md:flex-row md:items-start gap-5 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 hover:border-gray-400 dark:hover:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all duration-200"
                    >
                        {/* Icon */}
                        <div className="shrink-0 w-12 h-12 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center">
                            <doc.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
                                    {doc.title}
                                </h2>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-all group-hover:translate-x-1" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                                {doc.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {doc.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Meta app review callout */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/40 p-6 md:p-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Meta App Review — Required URLs</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    The following URLs are required when submitting SocialPulse for Meta (Instagram / Facebook) app review:
                </p>
                <div className="space-y-3">
                    {[
                        { label: "Privacy Policy URL", url: "https://socialpulse.app/privacy-policy" },
                        { label: "Terms of Service URL", url: "https://socialpulse.app/terms-of-service" },
                        { label: "Data Deletion Instructions URL", url: "https://socialpulse.app/data-deletion" },
                        { label: "Data Deletion Callback URL", url: "https://socialpulse.app/api/meta/data-deletion" },
                    ].map(item => (
                        <div key={item.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-56 shrink-0">{item.label}</span>
                            <code className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded px-2.5 py-1 break-all">
                                {item.url}
                            </code>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact */}
            <div className="text-center text-sm text-gray-400 dark:text-gray-500 pb-4">
                Questions about these documents?{" "}
                <a href="mailto:legal@socialpulse.app" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white underline transition-colors">
                    legal@socialpulse.app
                </a>
            </div>
        </div>
    );
}
