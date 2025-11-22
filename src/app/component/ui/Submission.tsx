import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./Table";

// Regular utility functions (no hooks)
const getStatusColor = (status: string): string => {
  if (!status) return "text-gray-600";
  
  const statusUpper = status.toUpperCase();
  if (statusUpper === "PASSED" || statusUpper === "ACCEPTED") return "text-green-600";
  if (statusUpper === "WRONG_ANSWER") return "text-red-600";
  if (statusUpper === "TIME_LIMIT_EXCEEDED" || statusUpper === "MEMORY_LIMIT_EXCEEDED") return "text-yellow-600";
  if (["COMPILATION_ERROR", "RUNTIME_ERROR", "FAILED"].includes(statusUpper)) return "text-orange-600";
  if (["IN_QUEUE", "PROCESSING", "PENDING"].includes(statusUpper)) return "text-blue-600";
  
  return "text-gray-600";
};

const formatLeetCodeTime = (timestamp: string): string => {
  if (!timestamp) return "N/A";
  
  const submittedTime = new Date(timestamp);
  const now = Date.now();
  const diffInMs = now - submittedTime.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  // For older submissions, show actual date
  return submittedTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: submittedTime.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
};

const formatRuntime = (runtime: number): string => {
  if (runtime === undefined || runtime === null) return "N/A";
  return `${runtime} ms`;
};

const formatPassedCount = (passedCount: number, totalCases: number = 4): string => {
  return `${passedCount}/${totalCases}`;
};

// Memoized submission row component
const SubmissionRow = memo(({ submission }: { submission: Submission }) => (
  <TableRow className="hover:bg-gray-50">
    <TableCell className={`font-medium ${getStatusColor(submission.status)}`}>
      {submission.status.replace(/_/g, ' ')}
    </TableCell>
    <TableCell className="font-mono text-sm">
      {submission.language}
    </TableCell>
    <TableCell className="font-mono text-sm">
      {formatRuntime(submission.totalTime)}
    </TableCell>
    <TableCell className="text-muted-foreground">
      {formatPassedCount(submission.passedCount)}
    </TableCell>
    <TableCell className="text-muted-foreground text-sm">
      {formatLeetCodeTime(submission.submittedTime)}
    </TableCell>
  </TableRow>
));

SubmissionRow.displayName = 'SubmissionRow';

export default function Submission({ problemId, userId }: { problemId: number, userId: string | undefined }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sort submissions by timestamp (newest first) - memoized
  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => 
      new Date(b.submittedTime).getTime() - new Date(a.submittedTime).getTime()
    );
  }, [submissions]);

  // Fetch submissions with useCallback to prevent unnecessary re-renders
  const fetchSubmissions = useCallback(async () => {
    if (!problemId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/problem/submission/${problemId}${userId ? `?userId=${userId}` : ''}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch submissions: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Directly access the submissions array from response
      const submissionsData = data.submissions || [];
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [problemId, userId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Memoize table body content to prevent unnecessary re-renders
  const tableBodyContent = useMemo(() => {
    if (sortedSubmissions.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
            No submissions yet
          </TableCell>
        </TableRow>
      );
    }

    return sortedSubmissions.map((submission) => (
      <SubmissionRow key={submission.id} submission={submission} />
    ));
  }, [sortedSubmissions]);

  // Loading state
  if (loading) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="animate-pulse">Loading submissions...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="border rounded-lg p-8 text-center text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Runtime</TableHead>
            <TableHead>Test Cases</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableBodyContent}
        </TableBody>
      </Table>
    </div>
  );
}