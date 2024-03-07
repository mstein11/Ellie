import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'What is a Dexterity Saving Throw?',
    message: `What is a Dexterity Saving Throw?`
  },
  {
    heading: 'What are the monster stats for a Goblin?',
    message: 'What are the monster stats for a Goblin?'
  },
  {
    heading: 'Under what legal license is this content available?',
    message: `Under what legal license is this content available?`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to ElminsterGPT - AI Chatbot!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          This is a chatbot built around the  
          <ExternalLink href="https://dnd.wizards.com/">Dungeons and Dragons</ExternalLink> &nbsp;
          <ExternalLink href="https://github.com/BTMorton/dnd-5e-srd">
          SRD Content.
          </ExternalLink>
          .
        </p>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
