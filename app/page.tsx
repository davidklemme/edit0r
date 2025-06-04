import SimpleEditor from '@/components/simple-editor'

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-slate-400 to-slate-800 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
      <h1
        className="text-2xl font-mono font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent p-4"
      >
        Pure text, zero fuss—your cookie-free editor
      </h1>
      <div className="dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full m-[10%]">
        
        <SimpleEditor />
      </div>
    </main>
  )
}

