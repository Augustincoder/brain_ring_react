'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminQuestion } from '@/types/game'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, X, Save, Check } from 'lucide-react'

interface QuestionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  question?: AdminQuestion | null
}

export function QuestionDialog({ isOpen, onClose, onSuccess, question }: QuestionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    questionText: '',
    correctAnswer: '',
    explanation: '',
    category: 'General',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  })

  useEffect(() => {
    if (question) {
      setFormData({
        questionText: question.questionText || '',
        correctAnswer: question.correctAnswer || '',
        explanation: question.explanation || '',
        category: question.category || 'General',
        difficulty: question.difficulty || 'medium',
      })
    } else {
      setFormData({
        questionText: '',
        correctAnswer: '',
        explanation: '',
        category: 'General',
        difficulty: 'medium',
      })
    }
  }, [question, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.questionText || !formData.correctAnswer) {
      toast.error('Savol matni va javobi shart!')
      return
    }

    try {
      setLoading(true)
      if (question) {
        // Edit mode - use _id or id defensively
        const questionId = question._id || (question as any).id
        
        if (!questionId) {
          throw new Error('Savol ID si topilmadi. Sahifani qaytadan yuklang.')
        }

        await api.patch(`/api/admin/questions/${questionId}`, formData)
        toast.success('Savol muvaffaqiyatli tahrirlandi')
      } else {
        // Create mode
        await api.post('/api/admin/questions', formData)
        toast.success('Savol muvaffaqiyatli qo\'shildi')
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Question save failed:', error)
      const message = error.response?.data?.message || error.message || 'Saqlashda xatolik yuz berdi'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        aria-describedby={undefined}
        className="sm:max-w-[500px] bg-neutral-950 border-neutral-800 text-white p-6 shadow-2xl"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black">{question ? 'Savolni tahrirlash' : 'Yangi savol'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="text" className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Savol matni</Label>
              <Textarea
                id="text"
                placeholder="..."
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                className="bg-neutral-900 border-neutral-800 text-white min-h-[100px]"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="answer" className="text-[10px] uppercase font-black tracking-widest text-neutral-500">To'g'ri javob</Label>
              <Input
                id="answer"
                placeholder="..."
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="bg-neutral-900 border-neutral-800 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Kategoriya</Label>
                <Input
                  id="category"
                  placeholder="..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-neutral-900 border-neutral-800 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="difficulty" className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Qiyinchilik</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(val: any) => setFormData({ ...formData, difficulty: val })}
                >
                  <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                    <SelectItem value="easy">Oson</SelectItem>
                    <SelectItem value="medium">O'rtacha</SelectItem>
                    <SelectItem value="hard">Qiyin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="explanation" className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Izoh</Label>
              <Textarea
                id="explanation"
                placeholder="..."
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="bg-neutral-900 border-neutral-800 text-white min-h-[60px]"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="h-10 w-10 text-neutral-500 hover:text-white hover:bg-neutral-800/50 rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-neutral-950 h-10 w-10 rounded-xl shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
