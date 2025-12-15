'use client';

import { use, useEffect, useState } from 'react';
import ProblemClient from "@/component/layout/ProblemClient";

export default function Problem({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [problem, setProblem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProblem() {
            try {
                const response = await fetch(`/api/problem/${id}`);
                if (!response.ok) throw new Error('Problem not found');

                const data = await response.json();
                setProblem(data);
            } catch (error) {
                console.error('Error fetching problem:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchProblem();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!problem) return <div>Problem not found</div>;

    return (
        <div>
            <ProblemClient problem={problem} />
        </div>
    );
}
