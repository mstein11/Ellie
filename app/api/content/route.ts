import { DocumentRepository } from '@/lib/dal/DocumentRepository'
import { PrismaClient } from '@prisma/client'

export const fetchCache = 'force-no-store'

export async function GET() {
  console.log('GET /api/content')

  const prisma = new PrismaClient()

  const content = DocumentRepository.getInstance().getAllDocuments();
  
  return Response.json(content, {
    headers: { 'Cache-Control': 'public, max-age=3600, immutable' }
  })
}
