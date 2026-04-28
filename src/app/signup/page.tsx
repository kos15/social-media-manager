"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="w-full max-w-md px-8 py-10 rounded-2xl bg-[#141414] border border-[#2a2a2a] shadow-2xl text-center">
                    <CheckCircle className="w-14 h-14 text-[#aaa] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                    <p className="text-[#888] mb-6">
                        We&apos;ve sent a confirmation link to{" "}
                        <span className="text-white font-medium">{email}</span>.
                        Click it to activate your account.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block px-6 py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-[#e5e5e5] transition"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            <div className="w-full max-w-md px-8 py-10 rounded-2xl bg-[#141414] border border-[#2a2a2a] shadow-2xl">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">SocialPulse</span>
                </div>

                <h1 className="text-2xl font-bold text-white text-center mb-1">Create account</h1>
                <p className="text-[#888] text-center text-sm mb-8">Start managing your social media</p>

                <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#aaa] mb-1.5">Email</label>
                        <input
                            id="signup-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-2.5 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] text-white placeholder-[#555] focus:outline-none focus:ring-1 focus:ring-[#555] focus:border-[#555] transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#aaa] mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] text-white placeholder-[#555] focus:outline-none focus:ring-1 focus:ring-[#555] focus:border-[#555] transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#aaa] transition"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#aaa] mb-1.5">Confirm Password</label>
                        <input
                            id="signup-confirm-password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat your password"
                            className="w-full px-4 py-2.5 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] text-white placeholder-[#555] focus:outline-none focus:ring-1 focus:ring-[#555] focus:border-[#555] transition"
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    <button
                        id="signup-btn"
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-[#e5e5e5] transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        {loading ? "Creating account…" : "Create account"}
                    </button>
                </form>

                <p className="text-center text-[#666] text-sm mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-white hover:text-[#ccc] font-medium transition">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
