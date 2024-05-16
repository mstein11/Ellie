import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma'
import { loadSourceV2 } from '@/lib/vectorstore/dataloader'
import { Prisma, PrismaClient, Document } from '@prisma/client'
import { OpenAIEmbeddings } from '@langchain/openai'
const prisma = new PrismaClient()
async function main() {
  const vectorStore = PrismaVectorStore.withModel<Document>(prisma).create(
    new OpenAIEmbeddings(),
    {
      prisma: Prisma,
      tableName: 'Document',
      vectorColumnName: 'embedding',
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn
      }
    }
  )

  //const source = await loadSource()
  const source = await loadSourceV2()

  await vectorStore.addModels(
    await prisma.$transaction(
      source.map((doc) =>
        prisma.document.create({
          data: {
            content: doc.pageContent,
            metadata: doc.metadata,
            id: doc.metadata.id,
          }
        })
      )
    )
  )
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
