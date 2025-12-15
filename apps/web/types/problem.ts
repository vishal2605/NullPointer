interface Problem {
    id: number;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    tags: string[];
    solved: boolean;
    acceptance: string;
  }
  interface ProblemDetail {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    acceptance: number;
    companies: string[];
    language: Array<{
      id: number;
      name: string;
    }>;
    defaultCode: Array<{
      id: number;
      code: string;
      fullCode: string;
      languageId: number;
      problemId: number;
    }>;
    related_topics: string[];
  }

  interface Submission {
    id: number;
    status: string;
    language: string;
    passedCount: number;
    submittedTime: string;
    totalTime: number;
  }
