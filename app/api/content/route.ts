import { DocumentRepository } from '@/lib/dal/DocumentRepository'

export const fetchCache = 'force-no-store'

export async function GET() {
  console.log('GET /api/content')

  const content = await DocumentRepository.getInstance().getAllDocuments()


  const formatedDocs = content.map(doc => {
    return {
      ...doc,
      content: (doc.metadata as any).originalText ?? doc.content
    }
  })

  return Response.json(formatedDocs, {
    headers: { 'Cache-Control': 'public, max-age=3600, immutable' }
  })
}
