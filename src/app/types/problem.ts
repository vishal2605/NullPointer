interface Problem {
    id: number;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    tags: string[];
    solved: boolean;
    acceptance: string;
  }
interface ProblemDetail{
    id:number;
    title:string,
    difficulty: "Easy" | "Medium" | "Hard";
    solved: boolean;
    acceptance: string;
    description : string;
    companies:string[];
    related_topics:string[];
}