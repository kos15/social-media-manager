import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import React from "react";

interface ConnectAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    platform: { name: string; icon: React.ElementType; color: string } | null;
}

export function ConnectAccountModal({ isOpen, onClose, onSuccess, platform }: ConnectAccountModalProps) {
    const [step, setStep] = useState<"init" | "connecting" | "success">("init");

    // Reset state when modal opens with a new platform
    useEffect(() => {
        if (isOpen) {
            setStep("init");
        }
    }, [isOpen, platform?.name]);

    if (!isOpen || !platform) return null;
    const PlatformIcon = platform.icon;

    const handleConnect = () => {
        setStep("connecting");
        // Simulate OAuth redirect and callback delay
        setTimeout(() => {
            setStep("success");
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-surface rounded-xl border border-border w-full max-w-md shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">Connect {platform.name}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors"
                        disabled={step === "connecting"}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center text-center space-y-6">
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent border border-border shadow-sm flex items-center justify-center text-white text-xl font-bold">
                            S
                        </div>
                        <div className="flex space-x-1 items-center bg-surface-elevated rounded-full px-3 py-1">
                            <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse delay-75" />
                            <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse delay-150" />
                        </div>
                        <div className={`w - 16 h - 16 rounded - 2xl bg - surface - elevated border border - border shadow - sm flex items - center justify - center ${platform.color} `}>
                            <PlatformIcon className="w-8 h-8" />
                        </div>
                    </div>

                    {step === "init" && (
                        <div className="space-y-4">
                            <p className="text-sm text-text-secondary">
                                You are about to securely connect your {platform.name} account to SocialPulse. We only request the permissions necessary to publish posts and read analytics.
                            </p>
                            <button
                                onClick={handleConnect}
                                className="w-full py-3 px-4 rounded-lg font-medium bg-primary hover:bg-primary-hover text-white transition-colors"
                            >
                                Continue to {platform.name}
                            </button>
                        </div>
                    )}

                    {step === "connecting" && (
                        <div className="space-y-4 flex flex-col items-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm font-medium">Waiting for authorization...</p>
                            <p className="text-xs text-text-secondary">Please complete the flow in the popup window.</p>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="space-y-4 flex flex-col items-center">
                            <CheckCircle2 className="w-12 h-12 text-success" />
                            <p className="text-lg font-medium">Successfully Connected!</p>
                            <p className="text-sm text-text-secondary">Your {platform.name} account is now ready to use.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
