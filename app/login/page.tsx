'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const login = useUserStore((state) => state.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      router.push('/lobby')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md border-primary/20 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 flex flex-col items-center pt-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4 shadow-inner">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl text-center font-bold tracking-tight">Brain Ring</CardTitle>
            <CardDescription className="text-center font-medium opacity-80">
              Enter your credentials to access the game arena
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4 px-8">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50 h-12 text-lg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 h-12 text-lg"
                  required
                />
              </div>
              {error && <p className="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1 text-center">{error}</p>}
            </CardContent>
            <CardFooter className="pb-8 px-8 flex-col space-y-4">
              <Button type="submit" className="w-full h-12 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/25 transition-all" disabled={loading}>
                {loading ? 'Logging in...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
