'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Brain, User, Lock, Loader2, Eye, EyeOff, LogIn } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const login = useUserStore((state) => state.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-[#050505] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-[380px] border-neutral-800/50 shadow-2xl rounded-[2.5rem] overflow-hidden bg-neutral-950/40 backdrop-blur-xl">
          <CardHeader className="pt-10 pb-6">
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black tracking-[0.15em] text-white uppercase font-sans">
                Brain Ring
              </CardTitle>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-0 px-8">
              <div className="space-y-3">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-primary" />
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-neutral-900/30 border-neutral-800/50 focus:border-primary/40 focus:ring-primary/10 h-14 pl-12 text-lg rounded-2xl transition-all placeholder:text-neutral-700 font-sans"
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 transition-colors group-focus-within:text-primary" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-neutral-900/30 border-neutral-800/50 focus:border-primary/40 focus:ring-primary/10 h-14 pl-12 pr-12 text-lg rounded-2xl transition-all placeholder:text-neutral-700 font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs font-bold text-red-500/90 text-center tracking-wide"
                >
                  {error}
                </motion.p>
              )}
            </CardContent>
            <CardFooter className="pt-4 pb-10 px-8">
              <Button 
                type="submit" 
                className="w-full h-14 text-base font-black uppercase tracking-[0.2em] rounded-2xl bg-primary hover:bg-primary/90 text-neutral-950 shadow-primary/10 shadow-lg transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 font-sans gap-3" 
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    Login
                    <LogIn className="h-5 w-5" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
