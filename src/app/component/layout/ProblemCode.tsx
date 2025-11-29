// components/ProblemCode.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select"
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "../ui/Button";
import Editor from "@monaco-editor/react";
import { Play, Send, RotateCcw } from "lucide-react"
import Testcase from "../ui/Testcase";
import { useProblem } from "@/app/context/ProblemContext";
import { useAtom } from 'jotai';
import { languageStateAtom } from "@/app/store/atoms/languageStateAtom";
import { useSession } from "next-auth/react";


export default function ProblemCode({ problem }: { problem: ProblemDetail }) {
    const [language, setLanguage] = useAtom(languageStateAtom);
    const [testcases, setTestcases] = useState<string[]>([]);
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [submissionId, setSubmissionId] = useState<number | null>(null);
    const [pollingState, setPollingState] = useState<'idle' | 'polling' | 'completed'>('idle');
    const session = useSession()
    
    const { setCodeForProblem, getCodeForProblem, clearProblemCode } = useProblem();
    
    // Get code from context or use default - using useCallback to avoid recreating on every render
    const getInitialCode = useCallback(() => {
        return getCodeForProblem(problem.id, language, '');
    }, [problem.id, language, getCodeForProblem]);

    const [code, setCode] = useState<string>(getInitialCode);

    const pollData = useRef({
        count: 0,
        startTime: Date.now(),
        maxPolls: 15,
        maxDuration: 30000
    });

    const availableLanguages = problem?.language?.map(lang => lang.name) || ['cpp', 'java', 'python'];

    // Update code in context whenever it changes (with debouncing)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (code !== undefined && code !== null && code !== '') {
                setCodeForProblem(problem.id, language, code);
            }
        }, 500); // Debounce to avoid too many localStorage writes

        return () => clearTimeout(timeoutId);
    }, [code, problem.id, language, setCodeForProblem]);

    // Reset code when problem changes
    useEffect(() => {
        const savedCode = getCodeForProblem(problem.id, language);
        
        if (savedCode) {
            // Use saved code if it exists
            setCode(savedCode);
        } else {
            // Otherwise, set default code for this language
            const defaultCodeEntry = problem?.defaultCode?.find(
                codeEntry => {
                    const lang = problem.language.find(l => l.id === codeEntry.languageId);
                    return lang?.name === language;
                }
            );
            if (defaultCodeEntry?.code) {
                setCode(defaultCodeEntry.code);
                setCodeForProblem(problem.id, language, defaultCodeEntry.code);
            }
        }
    }, [problem.id, problem.defaultCode, problem.language, language, getCodeForProblem, setCodeForProblem]);

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
                const response = await fetch(`/api/problem/check?submissionId=${submissionId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Polling response:', data);

                pollData.current.count++;

                if (data.state === 'PENDING') {
                    setTimeout(poll, 1000);
                } else {
                    const ordered = Object.keys(data.testcases)
                    .sort((a, b) => Number(a.replace("tc", "")) - Number(b.replace("tc", "")))
                    .map(key => data.testcases[key]);
                    setTestcases(ordered || []);
                    setPollingState('completed');
                    setIsSubmit(false);
                }
            } catch (error) {
                console.error('Polling error:', error);
                const backoffDelay = Math.min(1000 * Math.pow(2, pollData.current.count), 5000);
                setTimeout(poll, backoffDelay);
            }
        };

        poll();
    };

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
                console.log('Submission response:', result);
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

    const handleLanguageChange = (newLanguage: string) => {
        // Get saved code for the new language, or default code if none exists
        const savedCode = getCodeForProblem(problem.id, newLanguage);
        if (savedCode) {
            setCode(savedCode);
        } else {
            const defaultCodeEntry = problem?.defaultCode?.find(
                codeEntry => {
                    const lang = problem.language.find(l => l.id === codeEntry.languageId);
                    return lang?.name === newLanguage;
                }
            );
            setCode(defaultCodeEntry?.code || "");
        }
        setLanguage(newLanguage);
    };

    const handleResetCode = () => {
        const defaultCodeEntry = problem?.defaultCode?.find(
            codeEntry => {
                const lang = problem.language.find(l => l.id === codeEntry.languageId);
                return lang?.name === language;
            }
        );
        if (defaultCodeEntry?.code) {
            setCode(defaultCodeEntry.code);
        }
    };

    const handleClearSavedCode = () => {
        clearProblemCode(problem.id, language);
        handleResetCode();
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            {/* Language Selector and Controls */}
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

                {/* Reset Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetCode}
                    className="gap-2"
                >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                </Button>

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
                            className="gap-2"
                            onClick={handleSubmit}
                            disabled={session.status=== 'unauthenticated' || pollingState === 'polling'}
                        >
                            <Send className="h-4 w-4" />
                            {pollingState === 'polling' ? 'Submitting...' : 'Submit'}
                        </Button>
                        
                    </div>
                    {session.status ==='unauthenticated' && <div className="text-red-500">
                        Please log in to submit
                            </div>}
                    {/* Storage Info */}
                    <div className="text-xs text-gray-500 flex justify-between items-center">
                        <span>Your code is automatically saved</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearSavedCode}
                            className="h-6 text-xs"
                        >
                            Clear saved code
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