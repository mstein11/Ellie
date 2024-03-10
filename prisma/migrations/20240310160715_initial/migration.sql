CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "Document" (
    "id" VARCHAR(36) NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" vector(1536),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
