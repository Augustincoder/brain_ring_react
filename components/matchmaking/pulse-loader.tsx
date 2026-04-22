'use client'

import { motion } from 'framer-motion'
import { UserSearch } from 'lucide-react'

export function PulseLoader() {
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {/* Orqa fon animatsiyalari (Puls) */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-orange-500/30"
          initial={{ opacity: 0.8, scale: 0.8 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeOut",
          }}
        />
      ))}
      
      {/* Markaziy ikonka */}
      <div className="relative z-10 flex items-center justify-center w-20 h-20 bg-[#0A0A0A] border border-white/10 rounded-full shadow-[0_0_30px_rgba(249,115,22,0.15)]">
        <UserSearch className="w-8 h-8 text-orange-500 animate-pulse" />
      </div>
    </div>
  )
}