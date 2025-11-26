import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select"
import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/Button";
import Editor from "@monaco-editor/react";
import { Play, Send } from "lucide-react"
import Testcase from "../ui/Testcase";

export default function ProblemCode({ problem }: { problem: ProblemDetail }) {
    const [language, setLanguage] = useState("cpp");
    const [code, setCode] = useState<string>('');
    const [testcases, setTestcases] = useState<string[]>([]);
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [submissionId, setSubmissionId] = useState<number | null>(null);
    const [pollingState, setPollingState] = useState<'idle' | 'polling' | 'completed'>('idle');

    const pollData = useRef({
        count: 0,
        startTime: Date.now(),
        maxPolls: 15,
        maxDuration: 30000
    });

    // Get available languages from the problem data - MOVED UP
    const availableLanguages = problem?.language?.map(lang => lang.name) || ['cpp', 'java', 'python'];

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
        if (problem?.id) {
            fetchDetails(problem.id);
        }
    }, [problem?.id, language]);

    // Polling function
    const startPolling = async (submissionId: number) => {
        setSubmissionId(submissionId);
        setPollingState('polling');
        pollData.current = {
            count: 0,
            startTime: Date.now(),
            maxPolls: 15,
            maxDuration: 30000
        };

        const poll = async () => {
            if (pollData.current.count >= pollData.current.maxPolls) {
                console.log('Max poll attempts reached');
                setPollingState('completed');
                return;
            }

            if (Date.now() - pollData.current.startTime > pollData.current.maxDuration) {
                console.log('Max polling duration reached');
                setPollingState('completed');
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/api/problem/check?submissionId=${submissionId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Polling response:', data); // Debug log

                pollData.current.count++;

                if (data.state === 'PENDING') {
                    // Continue polling
                    setTimeout(poll, 1000);
                } else {
                    // Final result received
                    setTestcases(data.testcases || []);
                    setPollingState('completed');
                    setIsSubmit(false);
                }
            } catch (error) {
                console.error('Polling error:', error);
                // Retry on error with exponential backoff
                const backoffDelay = Math.min(1000 * Math.pow(2, pollData.current.count), 5000);
                setTimeout(poll, backoffDelay);
            }
        };

        // Start polling
        poll();
    };

    // Stop polling when component unmounts
    useEffect(() => {
        return () => {
            setPollingState('completed');
        };
    }, []);

    const handleSubmit = async () => {
        const languageObj = problem?.language?.find(lan => lan.name === language);
        if (!languageObj?.id) {
            console.error('Language not found');
            return;
        }

        const data = {
            problemId: problem.id,
            languageId: languageObj.id,
            code: code
        }

        try {
            const response = await fetch('/api/problem/submit', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Submission response:', result); // Debug log
                if (result.submissionId) {
                    setIsSubmit(true);
                    startPolling(result.submissionId);
                }
            } else {
                console.error('Submission failed:', response.statusText);
            }
        } catch (error) {
            console.error('Submission error:', error);
        }
    }

    const handleRunCode = async () => {
        const languageObj = problem?.language?.find(lan => lan.name === language);
        if (!languageObj?.id) {
            console.error('Language not found');
            return;
        }

        const data = {
            problemId: problem.id,
            languageId: languageObj.id,
            code: code
        }

        try {
            const response = await fetch('/api/problem/run', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.submissionId) {
                    setIsSubmit(true);
                    startPolling(result.submissionId);
                }
            }
        } catch (error) {
            console.error('Run code error:', error);
        }
    }

    const handleLanguageChange = (newLanguage: string) => {
        setLanguage(newLanguage);
        // Find and set the default code for the new language
        const defaultCodeEntry = problem?.defaultCode?.find(
            codeEntry => {
                const lang = problem.language.find(l => l.id === codeEntry.languageId);
                return lang?.name === newLanguage;
            }
        );
        setCode(defaultCodeEntry?.code || "");
    };

    // Get the default code template when language changes
    useEffect(() => {
        const defaultCodeEntry = problem?.defaultCode?.find(
            codeEntry => {
                const lang = problem?.language?.find(l => l.id === codeEntry.languageId);
                return lang?.name === language;
            }
        );
        if (defaultCodeEntry && !code) {
            setCode(defaultCodeEntry.code);
        }
    }, [language, problem?.defaultCode, problem?.language, code]);

    return (
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

                {/* Polling Status Indicator */}
                {pollingState === 'polling' && (
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-600">Checking submission...</span>
                    </div>
                )}
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
                        readOnly: pollingState === 'polling'
                    }}
                />
            </div>

            {/* Bottom Section - Test Cases and Actions */}
            <div className="border-t bg-card">
                <div className="p-4 space-y-4">
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            className="gap-2"
                            onClick={handleRunCode}
                            disabled={pollingState === 'polling'}
                        >
                            <Play className="h-4 w-4" />
                            {pollingState === 'polling' ? 'Running...' : 'Run Code'}
                        </Button>
                        <Button
                            className="gap-2"
                            onClick={handleSubmit}
                            disabled={pollingState === 'polling'}
                        >
                            <Send className="h-4 w-4" />
                            {pollingState === 'polling' ? 'Submitting...' : 'Submit'}
                        </Button>
                    </div>

                    {/* Test Cases Display */}
                    {pollingState === 'polling' && testcases.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p>Running your code...</p>
                        </div>
                    )}

                    {(testcases.length > 0 || pollingState === 'idle') && (
                        <Testcase testcases={testcases} />
                    )}
                </div>
            </div>
        </div>
    )
}