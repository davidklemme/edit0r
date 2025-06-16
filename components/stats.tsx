export default function TextStats({ content }: { content: string }) {

    const chars = content?.length || 0
    const words = content?.split(/\s+/)?.filter(Boolean).length || 0
    const lines = content?.split('\n')?.filter(Boolean).length || 0
    //approximation as the exact result will vary based on model - rough is enough
    //https://stackoverflow.com/questions/76216113/how-can-i-count-tokens-before-making-api-call
    const tokens = chars * 0.21787944117144232159552377016146

    return <div className="flex justify-start text-slate-500 align-middle gap-4">
        <p>Characters: {chars.toFixed(0)}</p>
        <p>Words: {words.toFixed(0)}</p>
        <p>Lines: {lines.toFixed(0)}</p>
        <p>Tokens: {tokens.toFixed(0)}</p>
    </div>
}