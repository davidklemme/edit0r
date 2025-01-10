import SimpleEditor from '@/components/simple-editor'

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-slate-400 to-slate-800 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
      <p className="text-xl font-mono font-thin  
        text-start bg-gradient-to-r text-slate-800 bg-clip-text text-transparent p-4"
        >No frills, cookie free, tracking free <span className='font-bold'>text editor</span></p>
      <div className="dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full m-[10%]">
        
        <SimpleEditor />
      </div>
    </main>
  )
}

