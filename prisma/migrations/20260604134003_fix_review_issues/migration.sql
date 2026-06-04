-- DropIndex
DROP INDEX "booking_client_token_idx";

-- DropIndex
DROP INDEX "sys_config_config_key_idx";

-- DropIndex
DROP INDEX "travel_order_order_no_idx";

-- CreateIndex
CREATE INDEX "booking_destination_id_idx" ON "booking"("destination_id");

-- CreateIndex
CREATE INDEX "booking_created_at_idx" ON "booking"("created_at");

-- CreateIndex
CREATE INDEX "route_transit_id_idx" ON "route"("transit_id");
