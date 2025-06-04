import SimpleEditor from '@/components/simple-editor'

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-slate-400 to-slate-800 dark:from-gray-800 dark:to-gray-900 items-center">
      <h1 className="mt-6 mb-4 text-4xl font-mono font-bold text-center text-gray-700 dark:text-gray-200">
        Pure text, zero fuss—your cookie-free editor
      </h1>
      <div className="dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full mx-4 mb-8">
        <SimpleEditor />
      </div>
    </main>
  )
}

