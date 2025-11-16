export default function TextStats({ content }: { content: string }) {

    const chars = content?.length || 0
    const words = content?.split(/\s+/)?.filter(Boolean).length || 0
    const lines = content?.split('\n')?.filter(Boolean).length || 0
    //approximation as the exact result will vary based on model - rough is enough
    //https://stackoverflow.com/questions/76216113/how-can-i-count-tokens-before-making-api-call
    const tokens = chars * 0.21787944117144232159552377016146

    return (
        <div className="grid grid-cols-2 sm:flex sm:justify-start text-gray-700 dark:text-gray-300 gap-3 sm:gap-4 text-sm p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium sm:mr-1">Characters:</span> 
                <span>{chars.toFixed(0)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium sm:mr-1">Words:</span> 
                <span>{words.toFixed(0)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium sm:mr-1">Lines:</span> 
                <span>{lines.toFixed(0)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium sm:mr-1">Tokens:</span> 
                <span>{tokens.toFixed(0)}</span>
            </div>
        </div>
    )
}