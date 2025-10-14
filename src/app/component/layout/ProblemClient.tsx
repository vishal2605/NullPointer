'use client'

import { Badge, Play, Send } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/ResizablePanelGroup"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select"
import { useState } from "react";
import { Button } from "../ui/Button";
import Editor from "@monaco-editor/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";

export default function ProblemClient({problem}:{problem:ProblemDetail}){

    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState(`function twoSum(nums, target) {
    // Write your solution here
    
  }`);
  
    const languageTemplates: Record<string, string> = {
      javascript: `function twoSum(nums, target) {
    // Write your solution here
    
  }`,
      python: `def two_sum(nums, target):
      # Write your solution here
      pass`,
      java: `class Solution {
      public int[] twoSum(int[] nums, int target) {
          // Write your solution here
          
      }
  }`,
      cpp: `class Solution {
  public:
      vector<int> twoSum(vector<int>& nums, int target) {
          // Write your solution here
          
      }
  };`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Write your solution here
    
  }`
    };
    const difficultyColors = {
        Easy: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
        Medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
        Hard: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
      };
  
    const handleLanguageChange = (newLanguage: string) => {
      setLanguage(newLanguage);
      setCode(languageTemplates[newLanguage] || "");
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
                <div className="flex items-center gap-3">
                    {/* {problem.difficulty} */}
                  <span className="text-sm text-muted-foreground">
                    Acceptance: {problem.acceptance}
                  </span>
                </div>
                <div className="flex gap-2">
                  {problem.related_topics.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Description</h2>
                <p className="text-foreground/80 whitespace-pre-line">{problem.description}</p>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Code Editor */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="h-full flex flex-col">
            {/* Language Selector */}
            <div className="border-b bg-card px-4 py-2 flex items-center gap-3">
              <span className="text-sm font-medium">Language:</span>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Editor */}
            <div className="h-[500px] overflow-auto">
              <Editor
                height="500px"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Bottom Section - Test Cases and Actions */}
            <div className="border-t bg-card">
              <div className="p-4 space-y-4">
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button  variant="secondary" className="gap-2">
                    <Play className="h-4 w-4" />
                    Run Code
                  </Button>
                  <Button className="gap-2">
                    <Send className="h-4 w-4" />
                    Submit
                  </Button>
                </div>

                {/* Test Cases
                <Tabs defaultValue="testcases">
                  <TabsList>
                    <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                    <TabsTrigger value="result">Result</TabsTrigger>
                  </TabsList>
                  <TabsContent value="testcases" className="space-y-2 max-h-48 overflow-y-auto">
                    {testResults.map((test, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1 text-sm">
                            <p><strong>Input:</strong> {test.input}</p>
                            <p><strong>Expected:</strong> {test.expected}</p>
                          </div>
                          {test.status && (
                            <div className="flex items-center">
                              {test.status === "pass" ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : test.status === "fail" ? (
                                <X className="h-5 w-5 text-red-600" />
                              ) : null}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </TabsContent>
                  <TabsContent value="result">
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground">
                        Run your code to see the results here
                      </p>
                    </Card>
                  </TabsContent>
                </Tabs> */}
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
        </div>
    )
}