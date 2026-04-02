export default function TextStats({ content }: { content: string }) {
    const chars = content?.length || 0
    const words = content?.split(/\s+/)?.filter(Boolean).length || 0
    const lines = content?.split('\n')?.length || 0
    // Rough approximation — actual count varies by model and content
    const tokens = Math.round(chars * 0.2179)

    return (
        <div className="grid grid-cols-2 sm:flex sm:justify-start text-muted-foreground gap-3 sm:gap-4 text-sm p-3 bg-muted rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium sm:mr-1">Characters:</span>
                <span>{chars}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium sm:mr-1">Words:</span>
                <span>{words}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium sm:mr-1">Lines:</span>
                <span>{lines}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center" title="Approximate — varies by model, language, and content type">
                <span className="font-medium sm:mr-1">Tokens:</span>
                <span>~{tokens}</span>
            </div>
        </div>
    )
}
