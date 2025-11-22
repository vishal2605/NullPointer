
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select"
import { useEffect,useState } from "react";
import { Button } from "../ui/Button";
import Editor from "@monaco-editor/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { Play, Send } from "lucide-react"

export default function ProblemCode({ problem }: { problem: ProblemDetail }){
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
  

    return(
        <div className="h-[calc(100vh-100px)] flex flex-col">
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
            <div className="flex-1 min-h-0 ">
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

                Test Cases
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
    )
}