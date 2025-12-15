// app/problems/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/component/ui/Table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/component/ui/Tabs';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/* 1. Problem Table Component                                         */
/* ------------------------------------------------------------------ */
function ProblemTable({ list }: { list: Problem[] }) {
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
          {list.map((p,index) => (
            <TableRow key={`${p.id}-${index}`} className="hover:bg-gray-50">
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
/* 2. Loading Spinner Component                                       */
/* ------------------------------------------------------------------ */
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading more problems...</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Main Page Component with Infinite Scroll                        */
/* ------------------------------------------------------------------ */
export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)

  // Fetch problems function
  const fetchProblems = useCallback(async (pageNum: number, difficulty: string, reset: boolean = false) => {
    if (loading) return;
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        difficulty: difficulty === 'all' ? 'all' : difficulty
      })

      const res = await fetch(`/api/problems?${params}`)
      if (!res.ok) throw new Error('Failed to fetch problems')
      
      const data = await res.json()
      
      if (reset) {
        setProblems(data.problems)
      } else {
        setProblems(prev => [...prev, ...data.problems])
      }
      
      setHasMore(data.hasMore)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching problems:', error)
    } finally {
      setLoading(false)
    }
  }, [loading])

  // Initial load and tab change
  useEffect(() => {
    setProblems([])
    setPage(1)
    setHasMore(true)
    fetchProblems(1, activeTab, true)
  }, [activeTab])

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return
      
      // Check if we're near the bottom of the page
      const scrollTop = document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      
      // Load more when 100px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        fetchProblems(page + 1, activeTab, false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, page, activeTab, fetchProblems])

  // Filter problems by difficulty for tabs
  const filteredProblems = problems.filter(problem => {
    if (activeTab === 'all') return true
    return problem.difficulty.toLowerCase() === activeTab.toLowerCase()
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-4">
        <h1 className="text-4xl font-bold mb-2">Problem Set</h1>
        <p className="text-muted-foreground">
          Solve coding challenges and improve your problem-solving skills
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Problems</TabsTrigger>
          <TabsTrigger value="easy">Easy</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
          <TabsTrigger value="hard">Hard</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ProblemTable list={filteredProblems} />
          {loading && <LoadingSpinner />}
          {!hasMore && problems.length > 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No more problems to load
            </div>
          )}
        </TabsContent>

        <TabsContent value="easy" className="mt-6">
          <ProblemTable list={filteredProblems} />
          {loading && <LoadingSpinner />}
          {!hasMore && problems.length > 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No more easy problems to load
            </div>
          )}
        </TabsContent>

        <TabsContent value="medium" className="mt-6">
          <ProblemTable list={filteredProblems} />
          {loading && <LoadingSpinner />}
          {!hasMore && problems.length > 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No more medium problems to load
            </div>
          )}
        </TabsContent>

        <TabsContent value="hard" className="mt-6">
          <ProblemTable list={filteredProblems} />
          {loading && <LoadingSpinner />}
          {!hasMore && problems.length > 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No more hard problems to load
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
