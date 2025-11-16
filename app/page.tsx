import SimpleEditor from '@/components/simple-editor'

// This page uses React Server Components (RSC)
// SimpleEditor is marked with 'use client', so Next.js automatically:
// 1. Code-splits it into a separate bundle
// 2. Only loads it client-side
// 3. Server-renders the shell (this component)

export default function Home() {
  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-800">
      <SimpleEditor />
    </main>
  )
}

