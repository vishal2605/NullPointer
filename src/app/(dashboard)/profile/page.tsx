"use client"
import { Badge } from "@/app/component/ui/Badge";
import { Button } from "@/app/component/ui/Button";
import { Card } from "@/app/component/ui/Card";
import { CheckCircle2, Clock, Flame, Target, Trophy, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link"; // Import Next.js Link

export default function Profile(){
    const session = useSession();

    const stats = [
        { label: "Total Solved", value: "127", icon: CheckCircle2, color: "text-primary" },
        { label: "Easy Solved", value: "45", icon: Target, color: "text-green-500" },
        { label: "Medium Solved", value: "62", icon: Target, color: "text-yellow-500" },
        { label: "Hard Solved", value: "20", icon: Target, color: "text-destructive" },
        { label: "Current Streak", value: "15 days", icon: Flame, color: "text-orange-500" },
        { label: "Acceptance Rate", value: "67.3%", icon: Trophy, color: "text-primary" },
      ];

      const recentSubmissions = [
        { id: 1, title: "Two Sum", status: "Accepted", time: "2 hours ago", language: "JavaScript", runtime: "68ms" },
        { id: 2, title: "Valid Parentheses", status: "Accepted", time: "5 hours ago", language: "Python", runtime: "32ms" },
        { id: 3, title: "Binary Search", status: "Wrong Answer", time: "1 day ago", language: "Java", runtime: "N/A" },
        { id: 4, title: "Merge Two Lists", status: "Accepted", time: "2 days ago", language: "TypeScript", runtime: "45ms" },
        { id: 5, title: "Reverse Linked List", status: "Accepted", time: "3 days ago", language: "C++", runtime: "12ms" },
      ];

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Card className="p-6 mb-6">
                    <div className="flex justify-between">
                        <div className="flex">
                            <div className='w-30 h-30 rounded-full bg-gray-500 text-white flex text-6xl items-center justify-center'>
                                {session.data?.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="p-2 ml-10">
                                <div className="text-4xl font-bold">
                                    Vishal Lohar
                                </div>
                                <div className="text-md text-gray-700 mt-2">
                                    @{session.data?.user.username}
                                </div>
                                <div>
                                    problem solver | Software developer
                                </div>
                                <div>
                                    Joined from 28th March
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center items-center">
                            <Button>Edit Profile</Button>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-4 text-center hover:shadow-lg transition-shadow">
                        <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                        <div className="text-2xl font-bold mb-1">
                            {stat.value}
                        </div>
                        <div className="">
                            {stat.label}
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="m-4 p-4">
                <div className="text-2xl font-bold p-4">
                    Recent submission
                </div>
                {recentSubmissions.map((submission) => (
                    <Link
                        key={submission.id}
                        href={`/problem/${submission.id}`} // Changed 'to' to 'href'
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-4 flex-1">
                            {submission.status === "Accepted" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <div>
                                <div className="font-medium">{submission.title}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">{submission.language}</Badge>
                                    {submission.runtime !== "N/A" && (
                                        <span>Runtime: {submission.runtime}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {submission.time}
                        </div>
                    </Link>
                ))}
            </Card>
        </div>
    )
}