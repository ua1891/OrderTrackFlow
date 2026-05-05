-- CreateTable: ShopifyOrder
-- This table tracks orders coming from Shopify webhooks
-- and manages the WhatsApp confirmation flow state machine.

CREATE TABLE "ShopifyOrder" (
    "id"                 TEXT NOT NULL,
    "shopifyOrderId"     TEXT NOT NULL,
    "orderNumber"        TEXT NOT NULL,
    "customerName"       TEXT NOT NULL,
    "customerPhone"      TEXT NOT NULL,
    "customerEmail"      TEXT,
    "confirmationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "whatsappSentAt"     TIMESTAMP(3),
    "reminderSentAt"     TIMESTAMP(3),
    "vendorNotifiedAt"   TIMESTAMP(3),
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopifyOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique constraint on shopifyOrderId (no duplicate orders)
CREATE UNIQUE INDEX "ShopifyOrder_shopifyOrderId_key" ON "ShopifyOrder"("shopifyOrderId");
