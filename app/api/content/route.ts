import { PrismaClient } from '@prisma/client'

export const fetchCache = 'force-no-store'

export async function GET() {
  console.log('GET /api/content')

  const prisma = new PrismaClient()

  const content = await prisma.document
    .findMany()
    .then(docs =>
      docs.sort(
        (docA: any, docB: any) =>
          docA.metadata.loc.lines.from - docB.metadata.loc.lines.from
      )
    )
  return Response.json(content, {
    headers: { 'Cache-Control': 'public, max-age=3600, immutable' }
  })
}
