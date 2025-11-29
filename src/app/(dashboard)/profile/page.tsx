"use client";
import { Badge } from "@/app/component/ui/Badge";
import { Button } from "@/app/component/ui/Button";
import { Card } from "@/app/component/ui/Card";
import { CheckCircle2, Clock, Flame, Target, Trophy, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Profile() {
    const { data: session } = useSession();

    const [stats, setStats] = useState<any>(null);
    const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const statsRes = await fetch("/api/profile");
                const statsData = await statsRes.json();

                const recentRes = await fetch("/api/problem/submission/recent");
                const recentData = await recentRes.json();

                setStats(statsData);
                setRecentSubmissions(recentData.submissions || []);
            } catch (err) {
                console.error("Failed to load profile data", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const formatLeetCodeTime = (timestamp: string): string => {
        if (!timestamp) return "N/A";
        
        const submittedTime = new Date(timestamp);
        const now = Date.now();
        const diffInMs = now - submittedTime.getTime();
        const diffInSeconds = Math.floor(diffInMs / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
      
        if (diffInSeconds < 60) return "just now";
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        
        // For older submissions, show actual date
        return submittedTime.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: submittedTime.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
      };

    if (loading || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    const statCards = [
        { label: "Total Solved", value: stats?.totalCount, icon: CheckCircle2, color: "text-primary" },
        { label: "Easy Solved", value: stats?.easyCount, icon: Target, color: "text-green-500" },
        { label: "Medium Solved", value: stats?.mediumCount, icon: Target, color: "text-yellow-500" },
        { label: "Hard Solved", value: stats?.hardCount, icon: Target, color: "text-destructive" },
        { label: "Current Streak", value: `${stats?.streak} days`, icon: Flame, color: "text-orange-500" },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Card className="p-6 mb-6">
                    <div className="flex justify-between">
                        <div className="flex">
                            <div className="w-30 h-30 rounded-full bg-gray-500 text-white flex text-6xl items-center justify-center">
                                {session.user.username.charAt(0).toUpperCase()}
                            </div>

                            <div className="p-2 ml-10">
                                <div className="text-4xl font-bold">
                                    {session.user.username}
                                </div>

                                <div className="text-md text-gray-700 mt-2">
                                    @{session.user.username}
                                </div>

                                <div>Problem solver | Software developer</div>
                            </div>
                        </div>

                        <div className="flex justify-center items-center">
                            <Button>Edit Profile</Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-4 mb-6 px-4">
                {statCards.map((stat, index) => (
                    <Card key={index} className="p-4 text-center hover:shadow-lg transition-shadow">
                        <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div>{stat.label}</div>
                    </Card>
                ))}
            </div>

            {/* Recent Submissions */}
            <Card className="m-4 p-4">
                <div className="text-2xl font-bold p-4">Recent Submissions</div>

                {recentSubmissions?.length === 0 && (
                    <div className="text-center text-gray-500 p-4">
                        No recent submissions
                    </div>
                )}

                {recentSubmissions?.map((submission) => (
                    <Link
                        key={submission.id}
                        href={`/problem/${submission.problem.id}`}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-4 flex-1">
                            {submission.status === "PASSED" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                            )}

                            <div>
                                <div className="font-medium">{submission.problem.title}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                        {submission.language.name}
                                    </Badge>

                                    {submission.runtime && submission.runtime !== "N/A" && (
                                        <span>Runtime: {submission.runtime}ms</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatLeetCodeTime(submission.submittedTime).toLocaleString()}
                        </div>
                    </Link>
                ))}
            </Card>
        </div>
    );
}
