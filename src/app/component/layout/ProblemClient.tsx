'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/ResizablePanelGroup"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { Badge } from "../ui/Badge";
import ProblemCode from "./ProblemCode";
import Submission from "../ui/Submission";
import { useSession } from "next-auth/react";



export default function ProblemClient({ problem }: { problem: ProblemDetail }) {

  const session = useSession();
  const difficultyColors = {
    Easy: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    Medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    Hard: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
  };
  return (
    <div className="flex h-screen">
      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-64px)]">
        {/* Left Panel - Problem Description */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full overflow-y-auto p-6">
            <div className="space-y-6 max-w-3xl">
              {/* Title and Metadata */}
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-black">
                  {problem.title}
                </h1>
                <div className="flex items-center gap-4">
                  <Badge className={difficultyColors[problem.difficulty as keyof typeof difficultyColors]}>
                    {problem.difficulty}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Acceptance: {problem.acceptance}%
                  </span>
                </div>
              </div>

              {/* Related Topics */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Related Topics</h3>
                <div className="flex flex-wrap gap-1">
                  {problem.related_topics.map(topic => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Description</h2>
                <div className="text-foreground/80 whitespace-pre-line leading-relaxed">
                  {problem.description}
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Code Editor */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <Tabs defaultValue="code">
            <TabsList>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <div className="w-screen"></div>
            </TabsList>
            <TabsContent value="code">
              <ProblemCode problem={problem}/>
            </TabsContent>
            <TabsContent value="submissions">
              <Submission problemId={problem.id} userId={session.data?.user.id}/>
            </TabsContent>
          </Tabs>
          
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}