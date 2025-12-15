"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { userSignInSchema } from "@/lib/schema";

export default function Login() {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const message = searchParams.get('message');
        if (message) {
            setSuccessMessage(message);
            // Clear the URL parameter
            const url = new URL(window.location.href);
            url.searchParams.delete('message');
            window.history.replaceState({}, '', url.toString());
        }
    }, [searchParams]);

    // Redirect to dashboard immediately if authenticated
    useEffect(() => {
        if (status === "authenticated" && session) {
            // push to dashboard
            router.push("/dashboard");
        }
    }, [status, session, router]);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const validateField = userSignInSchema.safeParse({
          username: username,
          password: password
        });
        if(!validateField.success){
          const errorMsg = validateField.error.issues.map(issue => issue.message).join(',');
          setError(errorMsg);
          setLoading(false);
          return;
        }
        try {
            const result = await signIn("credentials", {
                username: username,
                password: password,
                redirect: false, // Important: handle redirect manually
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/dashboard");
            }
        } catch (error) {
            setError("An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.refresh(); // Refresh to update the session state
    };

    // Show a loading state while session is being checked or when redirecting
    if (status === "loading" || status === "authenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-xl font-medium mb-2">Redirecting…</h2>
                    <p className="text-sm text-gray-600">If you are not redirected, <Link href="/dashboard" className="text-red-600">click here</Link>.</p>
                </div>
            </div>
        );
    }

    // If no session, show login form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to Null Pointer
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {successMessage && (
                        <div className="text-green-600 text-sm text-center bg-green-50 py-2 rounded">
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 py-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-red-600 hover:text-red-500">
                                Register
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
