import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { JsonUploader } from './JsonUploader';
import { brainRingSchema } from '@/lib/validation/brainRingSchema';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3, Plus, Search, Filter, Eye, EyeOff, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { QuestionDialog } from './QuestionDialog';
import { AdminQuestion } from '@/types/game';

export function QuestionsTab() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null);
  
  // UI States
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());
  const [mobilePreReveals, setMobilePreReveals] = useState<Set<string>>(new Set());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/questions?limit=100');
      if (res.data.success) {
        setQuestions(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load questions", error);
      toast.error("Savollarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const toggleAnswerReveal = (id: string) => {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Mobile logic: Tap 1 shows icon, Tap 2 reveals
      if (!mobilePreReveals.has(id) && !revealedAnswers.has(id)) {
        setMobilePreReveals(new Set(mobilePreReveals).add(id));
        // Reset pre-reveal after 3s if not confirmed
        setTimeout(() => {
          setMobilePreReveals(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, 3000);
        return;
      }
    }

    const newRevealed = new Set(revealedAnswers);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
      // If it was revealed, remove from pre-reveals
      const newPre = new Set(mobilePreReveals);
      newPre.delete(id);
      setMobilePreReveals(newPre);
    }
    setRevealedAnswers(newRevealed);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham bu savolni o'chirib tashlamoqchimisiz?")) return;
    try {
      const res = await api.delete(`/api/admin/questions/${id}`);
      if (res.data.success) {
        toast.success("Savol o'chirildi");
        setQuestions(questions.filter(q => q._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete question", error);
      toast.error("O'chirishda xatolik yuz berdi");
    }
  };

  const handleEdit = (question: AdminQuestion) => {
    setEditingQuestion(question);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingQuestion(null);
    setIsDialogOpen(true);
  };

  const filteredQuestions = useMemo(() => {
    setCurrentPage(1); // Reset to first page on search
    return questions.filter(q => 
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.correctAnswer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [questions, searchQuery]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = useMemo(() => {
    return filteredQuestions.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredQuestions, currentPage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight text-white">Savollar</h2>
        <Button 
          onClick={handleAdd}
          size="icon"
          className="bg-primary hover:bg-primary/90 text-neutral-950 h-10 w-10 rounded-xl shadow-lg shadow-primary/25 border-none transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-2 bg-neutral-900/50 p-1 rounded-xl border border-neutral-800 shadow-inner">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input 
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 pl-10 h-9 text-sm text-neutral-200 placeholder:text-neutral-600"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:bg-neutral-800/50">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Table */}
          <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950/50 backdrop-blur-sm shadow-2xl">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-900/80 border-b border-neutral-800">
                  <TableRow className="border-neutral-800 hover:bg-transparent">
                    <TableHead className="text-neutral-500 font-black text-[10px] uppercase tracking-[0.2em] py-5 px-3 sm:pl-8">Savol</TableHead>
                    <TableHead className="text-neutral-500 font-black text-[10px] uppercase tracking-[0.2em] w-24 sm:w-48 text-center px-2">Javob</TableHead>
                    <TableHead className="text-neutral-500 font-black text-[10px] uppercase tracking-[0.2em] text-right w-24 sm:w-32 pr-3 sm:pr-8">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-neutral-800">
                        <TableCell className="px-3 sm:pl-8"><Skeleton className="h-4 w-full bg-neutral-800" /></TableCell>
                        <TableCell className="px-2"><Skeleton className="h-4 w-12 sm:w-24 bg-neutral-800 mx-auto" /></TableCell>
                        <TableCell align="right" className="pr-3 sm:pr-8"><Skeleton className="h-8 w-12 sm:w-16 bg-neutral-800 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedQuestions.length === 0 ? (
                    <TableRow className="border-neutral-800 hover:bg-transparent">
                      <TableCell colSpan={3} className="h-48 text-center text-neutral-600 font-medium italic">
                        Hech qanday savol topilmadi.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {paginatedQuestions.map((q) => {
                        const isExpanded = expandedRows.has(q._id);
                        const isRevealed = revealedAnswers.has(q._id);
                        const isPreReveal = mobilePreReveals.has(q._id);

                        return (
                          <motion.tr
                            key={q._id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="border-b border-neutral-800 hover:bg-neutral-900/40 group transition-all duration-300"
                          >
                            <TableCell className="py-3 sm:py-5 px-3 sm:pl-8 align-top max-w-[500px]">
                              <div 
                                className="flex flex-col gap-2 cursor-pointer select-none group/qtext"
                                onClick={() => toggleRowExpansion(q._id)}
                              >
                                <div className="flex items-start gap-3">
                                  <span className={cn(
                                    "text-neutral-50 transition-all duration-300 leading-relaxed",
                                    isExpanded ? "whitespace-pre-wrap text-white text-base font-medium" : "line-clamp-1 text-sm text-neutral-400"
                                  )}>
                                    {q.questionText}
                                  </span>
                                  {q.questionText.length > 40 && !isExpanded && (
                                    <div className="bg-neutral-900/50 p-1.5 rounded-lg transition-colors lg:opacity-0 lg:group-hover/qtext:opacity-100 opacity-100 mr-8 border border-neutral-800">
                                      <ChevronRight className="h-3 w-3 text-primary/70" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="text-center align-top py-3 sm:py-5 px-2">
                              <div 
                                className="relative group/answer inline-block min-w-[100px] sm:min-w-[140px] px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80 cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/40 hover:bg-neutral-900 shadow-lg"
                                onClick={() => toggleAnswerReveal(q._id)}
                              >
                                <span className={cn(
                                  "text-sm font-black transition-all duration-500 block tabular-nums tracking-tight",
                                  !isRevealed && "blur-lg select-none opacity-20 grayscale scale-90",
                                  isRevealed && "text-emerald-400 blur-0 opacity-100 scale-100"
                                )}>
                                  {q.correctAnswer}
                                </span>
                                
                                {/* Overlay Icon */}
                                <div className={cn(
                                  "absolute inset-0 flex items-center justify-center bg-neutral-950/40 backdrop-blur-[1px] transition-all duration-300",
                                  isRevealed ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/answer:opacity-100",
                                  isPreReveal && "opacity-100"
                                )}>
                                  {isPreReveal ? (
                                    <Eye className="h-4 w-4 text-primary animate-pulse" />
                                  ) : (
                                    <Search className="h-4 w-4 text-neutral-500" />
                                  )}
                                </div>
                                
                                {isRevealed && (
                                  <div className="absolute top-0 right-1 translate-y-[-50%] group-hover/answer:translate-y-[20%] transition-transform opacity-20 group-hover/answer:opacity-100">
                                    <EyeOff className="h-3 w-3 text-neutral-600" />
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-right align-top py-3 sm:py-5 pr-3 sm:pr-8">
                              <div className="flex items-center justify-end gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-all lg:translate-x-2 lg:group-hover:translate-x-0 opacity-100 translate-x-0">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-10 w-10 text-neutral-500 hover:text-blue-400 hover:bg-blue-950/20 rounded-2xl transition-all"
                                  onClick={() => handleEdit(q)}
                                >
                                  <Edit3 className="h-5 w-5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-10 w-10 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-2xl transition-all"
                                  onClick={() => handleDelete(q._id)}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 bg-neutral-900/30 border-t border-neutral-800">
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Sahifa {currentPage} / {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg border border-neutral-800 disabled:opacity-30"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg border border-neutral-800 disabled:opacity-30"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 p-5 rounded-2xl border border-neutral-800 shadow-xl border-t-primary/20">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Yuklash
            </h3>
            <JsonUploader mode="brain-ring" schema={brainRingSchema} onSuccess={fetchQuestions} />
          </div>

          <div className="bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800 relative overflow-hidden group/stats">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover/stats:bg-primary/10 transition-colors" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-4">Statistika</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/50">
                <span className="text-sm text-neutral-400 font-medium">Jami savollar</span>
                <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{questions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuestionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchQuestions}
        question={editingQuestion}
      />
    </div>
  );
}

