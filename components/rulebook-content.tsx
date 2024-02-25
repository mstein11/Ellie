'use client'
import { ThemeToggle } from '@/components/theme-toggle'
import { use, useEffect } from 'react'
import { CodeBlock } from './ui/codeblock'
import { MemoizedReactMarkdown } from './markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'


async function getContent() {
  const res = await fetch('/api/content').then(res => res.json());
  return res;

}

export function RulebookContent({scrollToId = ''}) {

    useEffect(() => {
        const element = document.querySelector(`[data-line-start="${scrollToId}"]`);
        element?.scrollIntoView({ behavior: 'smooth' });
    });

    const rulebook = use(getContent())

    //const rulebook = getData();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
      {rulebook.map((doc: {content: string, id: string}) => (
        <>
        <div key={doc.id} data-id={doc.id}>
      <MemoizedReactMarkdown key={doc.id}
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p(data) {
              return <p data-line-start={data.node?.position?.start?.line} className="mb-2 last:mb-0">{data.children}</p>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 cursor-default animate-pulse">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
              }

              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {doc.content}
        </MemoizedReactMarkdown>
        <br />
        </div>
        </>))}
      </div>
      <div className="flex items-center justify-between p-4">
        <ThemeToggle />
      </div>
    </div>
  )
}
