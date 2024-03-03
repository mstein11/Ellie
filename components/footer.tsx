import React from 'react'

import { cn } from '@/lib/utils'
import { ExternalLink } from '@/components/external-link'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      Open source RAG powered AI chatbot based on {' '}
      <ExternalLink href="https://dnd.wizards.com/">Dungeon and Dragons</ExternalLink> and its{' '}
      <ExternalLink href="https://dnd.wizards.com/resources/systems-reference-document">
        SRD content
      </ExternalLink>
      .
    </p>
  )
}
