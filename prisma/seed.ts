import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma'
import { loadSourceV2 } from '@/lib/vectorstore/dataloader'
import { Prisma, PrismaClient, Document } from '@prisma/client'
import { OpenAIEmbeddings } from '@langchain/openai'
const prisma = new PrismaClient()
async function main() {

  console.log('Starting seed...')
  console.log('env', process.env.NODE_ENV)
  console.log('db', process.env.POSTGRES_HOST)

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
    await prisma.$transaction(async trx => {
      await trx.document.deleteMany()

      return await Promise.all(
        source.map(doc =>
          trx.document.create({
            data: {
              content: doc.pageContent,
              metadata: doc.metadata,
              id: doc.metadata.id
            }
          })
        )
      )
    }, {
      timeout: 1000 * 60 * 5
    })
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
