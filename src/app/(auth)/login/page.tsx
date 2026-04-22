'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Heart, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { login } from '../actions'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      formAction={login}
      disabled={pending}
      className="btn-primary w-full flex items-center justify-center gap-2 group mt-6 disabled:opacity-70 disabled:cursor-wait"
    >
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Signing In...</span>
        </>
      ) : (
        <>
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  )
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = React.use(searchParams)
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--background)]">
      {/* Back button */}
      <div className="absolute top-8 left-8 z-20">
        <Link 
          href="/" 
          className="w-10 h-10 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded-full flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-brand)] rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-accent)] rounded-full blur-[120px] opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 rounded-2xl shadow-2xl relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--color-brand)] to-[var(--color-accent)] flex items-center justify-center shadow-lg">
              <Heart className="text-white w-6 h-6" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-[var(--foreground)] opacity-70 text-sm">
              Log in to track your impact and claim your rewards.
            </p>
          </div>

          {params.error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {params.error}
            </div>
          )}

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 opacity-80" htmlFor="email">
                Email Address
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                className="input-base"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5 opacity-80" htmlFor="password">
                Password
              </label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="input-base"
                placeholder="••••••••"
              />
            </div>

            <SubmitButton />
          </form>

          <div className="mt-6 text-center text-sm opacity-70">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[var(--color-brand-light)] font-medium hover:underline">
              Join the movement
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
