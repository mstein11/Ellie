import { OpenAIEmbeddings } from '@langchain/openai'
import { VectorStore } from '@langchain/core/vectorstores'
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma'
import {
  Prisma,
  Document as DocumentEntity,
  PrismaClient
} from '@prisma/client'

export interface VectoreStoreRepositoryDeps {
  prisma?: PrismaClient
}

export class VectoreStoreRepository {
  private loadedVectoreStore: VectorStore

  constructor({
    prisma = new PrismaClient()
  }: VectoreStoreRepositoryDeps = {}) {
    this.loadedVectoreStore = PrismaVectorStore.withModel<DocumentEntity>(
      prisma
    ).create(new OpenAIEmbeddings(), {
      prisma: Prisma,
      tableName: 'Document',
      vectorColumnName: 'embedding',
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn
      }
    })
  }

  async getRetriever(k: number = 5) {
    return this.loadedVectoreStore.asRetriever(k)
  }
}
