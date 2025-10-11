// app/problems/page.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/app/component/ui/Table';
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from '@/app/component/ui/Tabs';
  import { CheckCircle2, Circle } from 'lucide-react';
  import Link from 'next/link';
  
  /* ------------------------------------------------------------------ */
  /* 1.  Fetch once on the server                                       */
  /* ------------------------------------------------------------------ */
  async function getProblems(): Promise<Problem[]> {
    const base =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
    const res = await fetch(`${base}/api/problems`, { next: { revalidate: 60 } });
    console.log('res',res);
    if (!res.ok) {
      console.error('[getProblems] HTTP error', res.status);
      return [];
    }
  
    const json = await res.json(); // ← { problems: [ … ] }
  
    // ✅ unwrap the array
    if (!Array.isArray(json?.problems)) {
      console.error('[getProblems] json.problems is not an array', json);
      return [];
    }
  
    return json.problems as Problem[];
  }
  
  /* ------------------------------------------------------------------ */
  /* 2.  Difficulty badge colours                                       */
  /* ------------------------------------------------------------------ */
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return '';
    }
  };
  
  /* ------------------------------------------------------------------ */
  /* 3.  Re-usable table (still server-rendered)                        */
  /* ------------------------------------------------------------------ */
  function ProblemTable({ list }: { list: Problem[] }) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Acceptance</TableHead>
            </TableRow>
          </TableHeader>
  
          <TableBody>
            {list.map((p) => (
              <TableRow key={p.id} className="hover:bg-gray-50">
                <TableCell>
                  {p.solved ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </TableCell>
  
                <TableCell className="font-medium">
                  <Link href={`/problem/${p.id}`} className="hover:text-primary">
                    {p.id}. {p.title}
                  </Link>
                </TableCell>
  
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(
                      p.difficulty
                    )}`}
                  >
                    {p.difficulty}
                  </span>
                </TableCell>
  
                <TableCell>
                  <div className="flex gap-1.5 flex-wrap">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </TableCell>
  
                <TableCell className="text-right text-muted-foreground">
                  {p.acceptance}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  /* ------------------------------------------------------------------ */
  /* 4.  Page component (async Server Component)                        */
  /* ------------------------------------------------------------------ */
  export default async function ProblemsPage() {
    const problems = await getProblems(); // server-only
  
    const byDiff = (d: string) => problems.filter((p) => p.difficulty === d);
  
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-4">
          <h1 className="text-4xl font-bold mb-2">Problem Set</h1>
          <p className="text-muted-foreground">
            Solve coding challenges and improve your problem-solving skills
          </p>
        </div>
  
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Problems</TabsTrigger>
            <TabsTrigger value="easy">Easy</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="hard">Hard</TabsTrigger>
          </TabsList>
  
          <TabsContent value="all" className="mt-6">
            <ProblemTable list={problems} />
          </TabsContent>
  
          <TabsContent value="easy" className="mt-6">
            <ProblemTable list={byDiff('Easy')} />
          </TabsContent>
  
          <TabsContent value="medium" className="mt-6">
            <ProblemTable list={byDiff('Medium')} />
          </TabsContent>
  
          <TabsContent value="hard" className="mt-6">
            <ProblemTable list={byDiff('Hard')} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }