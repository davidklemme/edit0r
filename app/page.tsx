import SimpleEditor from '@/components/simple-editor'

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-800 items-start">

      <div className="dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full mx-4 mb-8 h-full">
        <SimpleEditor />
      </div>
    </main>
  )
}

