import SimpleEditor from '@/components/simple-editor'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-400 to-slate-800 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full m-[10%]">
        <SimpleEditor />
      </div>
    </main>
  )
}

