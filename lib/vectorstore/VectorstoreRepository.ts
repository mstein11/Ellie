import { OpenAIEmbeddings } from '@langchain/openai'
import { VectorStore } from '@langchain/core/vectorstores'
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma'
import {
  Prisma,
  Document as DocumentEntity,
  PrismaClient
} from '@prisma/client'

import prisma from '@/lib/dal/prisma'

export interface VectoreStoreRepositoryDeps {
  prismaClient?: PrismaClient
}

export class VectoreStoreRepository {
  private loadedVectoreStore: VectorStore

  constructor({
    prismaClient = prisma
  }: VectoreStoreRepositoryDeps = {}) {
    this.loadedVectoreStore = PrismaVectorStore.withModel<DocumentEntity>(
      prismaClient
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

  getDocumentFromDb = async (id: string) => {
    return await prisma.document.findUnique({
      where: {
        id
      }
    })
  }

  getRetriever(k: number = 5) {
    //return this.loadedVectoreStore.asRetriever(k,undefined, undefined, undefined, undefined, true)
    return this.loadedVectoreStore.asRetriever(k)
  }
}
