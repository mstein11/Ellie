import { PrismaClient } from '@prisma/client'
import prismaInstance from '@/lib/dal/prisma' 

export class DocumentRepository {
  private prismaClient: PrismaClient

  constructor({ prisma = prismaInstance }: { prisma?: PrismaClient } = {}) {
    this.prismaClient = prisma
  }

  static getInstance() {
    return new DocumentRepository()
  }

  async getAllDocuments() {
    return await this.prismaClient.document
      .findMany()
      .then(docs =>
        docs.sort(
          (docA: any, docB: any) =>
            docA.metadata.loc.lines.from - docB.metadata.loc.lines.from
        )
      )
  }
}
