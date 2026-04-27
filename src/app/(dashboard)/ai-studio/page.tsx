"use client";

import { useState } from "react";
import { Sparkles, Wand2, Copy, CheckCircle2, MessageSquare, Hash, RefreshCcw } from "lucide-react";

export default function AIStudioPage() {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState("");
    const [activeTab, setActiveTab] = useState<"caption" | "hashtag" | "repurpose">("caption");
    const [copied, setCopied] = useState(false);
    const [mobileTab, setMobileTab] = useState<"input" | "output">("input");

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);

        try {
            // Mock API call
            const res = await fetch("/api/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, type: activeTab })
            });
            const data = await res.json();
            setResult(data.content);
        } catch (error) {
            console.error(error);
            setResult("Error generating content. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-4 flex flex-col md:h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">AI Studio</h1>
                {/* Mobile tab switcher */}
                <div className="flex md:hidden bg-surface border border-border rounded-lg p-1">
                    <button
                        onClick={() => setMobileTab("input")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mobileTab === "input" ? "bg-primary text-white" : "text-text-secondary hover:text-foreground"}`}
                    >
                        Input
                    </button>
                    <button
                        onClick={() => setMobileTab("output")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${mobileTab === "output" ? "bg-primary text-white" : "text-text-secondary hover:text-foreground"}`}
                    >
                        Result
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row border border-border rounded-xl overflow-hidden bg-surface-elevated shadow-sm md:flex-1 md:min-h-0">
                {/* Left Panel - Input */}
                <div className={`md:w-1/2 md:border-r border-border p-4 md:p-6 flex flex-col ${mobileTab === "input" ? "block" : "hidden"} md:block`}>
                    <div className="flex bg-surface p-1 rounded-lg border border-border mb-6">
                        {[
                            { id: "caption", label: "Caption Writer", icon: MessageSquare },
                            { id: "hashtag", label: "Hashtags", icon: Hash },
                            { id: "repurpose", label: "Repurpose", icon: RefreshCcw }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as "caption" | "hashtag" | "repurpose")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-sm font-medium ${activeTab === tab.id
                                    ? "bg-surface-elevated text-foreground shadow-sm border border-border"
                                    : "text-text-secondary hover:text-foreground hover:bg-surface-elevated/50"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                What do you want to write about?
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                                placeholder="E.g., Write a LinkedIn post about the future of AI in software development..."
                                className="w-full h-40 bg-surface border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:border-primary resize-none custom-scrollbar"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-text-secondary">Tone of Voice</label>
                            <div className="flex flex-wrap gap-2">
                                {['Professional', 'Casual', 'Humorous', 'Inspiring', 'Educational'].map(tone => (
                                    <button key={tone} className="px-4 py-2 rounded-full border border-border text-sm bg-surface hover:bg-surface-elevated transition-colors">
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border mt-auto">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt}
                            className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5" />
                                    Generate Magic
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Panel - Output */}
                <div className={`md:w-1/2 bg-surface p-4 md:p-6 flex flex-col ${mobileTab === "output" ? "block min-h-[400px]" : "hidden"} md:block`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Generated Result
                        </h3>
                        {result && (
                            <button
                                onClick={handleCopy}
                                className="text-text-secondary hover:text-foreground flex items-center gap-1 text-sm bg-surface-elevated px-3 py-1.5 rounded-md border border-border transition-colors"
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 bg-surface-elevated border border-border rounded-xl p-6 overflow-y-auto custom-scrollbar">
                        {result ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                                {result}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50 space-y-4">
                                <Wand2 className="w-12 h-12" />
                                <p>Your generated content will appear here</p>
                            </div>
                        )}
                    </div>

                    {result && (
                        <div className="pt-4 flex justify-end">
                            <button className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
                                <RefreshCcw className="w-4 h-4" /> Try another variation
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
