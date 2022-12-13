-- CreateTable
CREATE TABLE "cache_votings" (
    "hash" BYTEA NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "cache_votings_pkey" PRIMARY KEY ("hash")
);
