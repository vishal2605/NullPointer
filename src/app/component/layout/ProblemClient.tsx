'use client'

import { Play, Send } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/ResizablePanelGroup"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select"
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import Editor from "@monaco-editor/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { Badge } from "../ui/Badge";
import { POST } from "@/app/api/auth/signup/route";
import { METHODS } from "http";



export default function ProblemClient({ problem }: { problem: ProblemDetail }) {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState('');

  useEffect(() => {
    async function fetchDetails(id: number) {
      try {
          const defaultCodeEntry = problem.defaultCode.find(
            (codeEntry: any) => 
              problem.language.find((lang: any) => lang.id === codeEntry.languageId)?.name === language
          );
          if (defaultCodeEntry) {
            setCode(defaultCodeEntry.code);
          }
      } catch (error) {
        console.error("Error fetching problem details:", error);
      }
    }
    fetchDetails(problem.id);
  }, [problem.id, language]);

  // Get available languages from the problem data
  const availableLanguages = problem.language.map(lang => lang.name);

  const difficultyColors = {
    Easy: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    Medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    Hard: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
  };

  const handleSubmit = async () => {
    const data = {
      problemId : problem.id,
      languageId : problem.language.find(lan => lan.name === language)?.id,
      code : code
    }

    const response = await fetch('/api/problem/submit', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
          'Content-Type': 'application/json'
      }
    });
    console.log(response);
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Find and set the default code for the new language
    const defaultCodeEntry = problem.defaultCode.find(
      codeEntry => {
        const lang = problem.language.find(l => l.id === codeEntry.languageId);
        return lang?.name === newLanguage;
      }
    );
    setCode(defaultCodeEntry?.code || "");
  };

  // Get the default code template when language changes
  useEffect(() => {
    const defaultCodeEntry = problem.defaultCode.find(
      codeEntry => {
        const lang = problem.language.find(l => l.id === codeEntry.languageId);
        return lang?.name === language;
      }
    );
    if (defaultCodeEntry && !code) {
      setCode(defaultCodeEntry.code);
    }
  }, [language, problem.defaultCode, problem.language, code]);

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
          <div className="h-full flex flex-col">
            {/* Language Selector */}
            <div className="border-b bg-card px-4 py-2 flex items-center gap-3">
              <span className="text-sm font-medium">Language:</span>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {lang === 'cpp' ? 'C++' : 
                       lang === 'java' ? 'Java' : 
                       lang === 'python' ? 'Python' : lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-auto">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
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
                  <Button variant="secondary" className="gap-2" onClick={handleSubmit}>
                    <Play className="h-4 w-4" />
                    Run Code
                  </Button>
                  <Button className="gap-2">
                    <Send className="h-4 w-4" />
                    Submit
                  </Button>
                </div>

                {/* Test Cases */}
                <Tabs defaultValue="testcases">
                  <TabsList>
                    <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                    <TabsTrigger value="result">Result</TabsTrigger>
                  </TabsList>
                  <TabsContent value="testcases" className="space-y-2 max-h-48 overflow-y-auto">
                    <div className="text-sm text-muted-foreground p-4 text-center">
                      Run your code to see test cases
                    </div>
                  </TabsContent>
                  <TabsContent value="result">
                    <div className="text-sm text-muted-foreground p-4 text-center">
                      Run your code to see the results here
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}