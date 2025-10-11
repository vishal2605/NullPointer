interface Problem {
    id: number;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    tags: string[];
    solved: boolean;
    acceptance: string;
  }