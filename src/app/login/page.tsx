"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            <div className="w-full max-w-md px-8 py-10 rounded-2xl bg-[#141414] border border-[#2a2a2a] shadow-2xl">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                        <LogIn className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">SocialPulse</span>
                </div>

                <h1 className="text-2xl font-bold text-white text-center mb-1">Welcome back</h1>
                <p className="text-[#888] text-center text-sm mb-8">Sign in to your account</p>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#aaa] mb-1.5">Email</label>
                        <input
                            id="email"
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
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
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

                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    <button
                        id="login-btn"
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-[#e5e5e5] transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                        {loading ? "Signing in…" : "Sign in"}
                    </button>
                </form>

                <p className="text-center text-[#666] text-sm mt-6">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-white hover:text-[#ccc] font-medium transition">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
