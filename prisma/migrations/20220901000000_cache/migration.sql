-- CreateTable
CREATE TABLE "cache_blocks" (
    "hash" BYTEA NOT NULL,
    "height" BIGINT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "cache_blocks_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "cache_tx" (
    "hash" BYTEA NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "cache_tx_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "cache_receipts" (
    "hash" BYTEA NOT NULL,
    "receipt" JSONB NOT NULL,

    CONSTRAINT "cache_receipts_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "cache_logs" (
    "hash" BYTEA NOT NULL,
    "contract" BYTEA NOT NULL,
    "logs" JSONB NOT NULL,

    CONSTRAINT "cache_logs_pkey" PRIMARY KEY ("hash","contract")
);

-- CreateTable
CREATE TABLE "cache_ens" (
    "address" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "cache_ens_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "sync_status" (
    "id" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "downloaded" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sync_status_pkey" PRIMARY KEY ("id")
);

INSERT INTO sync_status ("id", "updatedAt", "downloaded", "processed") VALUES (1, Now(), 0, 0);
INSERT INTO sync_status ("id", "updatedAt", "downloaded", "processed") VALUES (2, Now(), 0, 0);
INSERT INTO sync_status ("id", "updatedAt", "downloaded", "processed") VALUES (3, Now(), 0, 0);
