import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { JsonUploader } from './JsonUploader';
import { brainRingSchema } from '@/lib/validation/brainRingSchema';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  _id: string;
  text: string;
  category: string;
  difficulty: number;
}

export function QuestionsTab() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/questions');
      if (res.data.success) {
        setQuestions(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load questions", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await api.delete(`/api/admin/questions/${id}`);
      if (res.data.success) {
        toast.success("Question deleted successfully");
        setQuestions(questions.filter(q => q._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete question", error);
      toast.error("Failed to delete question");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Question Management</h2>
        <p className="text-neutral-400">Bulk upload or manage existing questions in the database.</p>
      </div>

      <JsonUploader mode="brain-ring" schema={brainRingSchema} onSuccess={fetchQuestions} />

      <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-neutral-900 border-b border-neutral-800 hover:bg-neutral-900">
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableHead className="text-neutral-400">Question</TableHead>
                <TableHead className="text-neutral-400 w-32">Category</TableHead>
                <TableHead className="text-neutral-400 text-center w-24">Difficulty</TableHead>
                <TableHead className="text-neutral-400 text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-neutral-800 hover:bg-neutral-900/50">
                    <TableCell><Skeleton className="h-4 w-full bg-neutral-800" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-neutral-800" /></TableCell>
                    <TableCell align="center"><Skeleton className="h-6 w-12 bg-neutral-800 mx-auto" /></TableCell>
                    <TableCell align="right"><Skeleton className="h-8 w-8 bg-neutral-800 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : questions.length === 0 ? (
                <TableRow className="border-neutral-800 focus:bg-transparent hover:bg-transparent">
                  <TableCell colSpan={4} className="h-32 text-center text-neutral-500">
                    No questions found. Upload some to get started.
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((q) => (
                  <TableRow key={q._id} className="border-neutral-800 hover:bg-neutral-900/50">
                    <TableCell className="font-medium text-neutral-200 min-w-[400px] py-4" title={q.text}>
                      <div className="line-clamp-2 leading-relaxed">
                        {q.text}
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-400">{q.category || 'General'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-neutral-900 border-neutral-700 text-neutral-300">
                        {q.difficulty || 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-950/30" onClick={() => handleDelete(q._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
