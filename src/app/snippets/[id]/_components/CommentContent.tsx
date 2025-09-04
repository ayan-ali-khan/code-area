"use client";

interface CodeBlockProps {
    code: string;
    language: string;
}

const CodeBlock = ({code, language}: CodeBlockProps) => {
    

    return (
        <div>

        </div>
    )
}



function CommentContent({content}: {content: string}) {
    //regex
    const parts = content.split(/(```[\w-]*\n[\s\S]*?\n```)/g);

    return (
    <div className='max-w-none text-white'>
        {parts.map((part, index) => {
            if(part.startsWith("```")) {
                
                const match = part.match(/```([\w-]*)\n([\s\S]*?)\n```/);

                if(match){
                    const [,language, code] = match
                    return <CodeBlock language={language} code={code} key={index} />
                }
            }
            return part.split("\n").map((line, lineIndex) => (
                <p key={lineIndex} className='mb-4 text-gray-300 last:mb-0'>{line}</p>
            ))
        })}
    </div>
    )
}

export default CommentContent