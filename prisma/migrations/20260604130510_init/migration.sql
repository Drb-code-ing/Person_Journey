-- CreateTable
CREATE TABLE "destination" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "scope" VARCHAR(20) NOT NULL DEFAULT 'international',
    "country" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100),
    "region" VARCHAR(50),
    "description" TEXT NOT NULL,
    "bestTime" VARCHAR(100) NOT NULL,
    "bestSeason" VARCHAR(10),
    "visa" VARCHAR(200) NOT NULL,
    "transport" TEXT,
    "images" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "scope" VARCHAR(20) NOT NULL DEFAULT 'international',
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "origin" VARCHAR(100) NOT NULL,
    "transit_id" UUID,
    "destination_id" UUID NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "days" INTEGER NOT NULL,
    "transport_type" VARCHAR(30) NOT NULL DEFAULT 'flight',
    "image_url" TEXT NOT NULL,
    "video_url" TEXT,
    "gallery_urls" TEXT NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_account" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "avatar" TEXT,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "last_login_time" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_time" TIMESTAMPTZ,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "route_id" UUID,
    "guest_name" VARCHAR(100) NOT NULL,
    "guest_email" VARCHAR(255) NOT NULL,
    "guest_phone" VARCHAR(20),
    "origin" VARCHAR(100),
    "destination_id" UUID,
    "travelDate" VARCHAR(20),
    "adults" INTEGER NOT NULL DEFAULT 2,
    "children" INTEGER NOT NULL DEFAULT 0,
    "total_price" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'submitted',
    "form_data" TEXT NOT NULL DEFAULT '{}',
    "price_snapshot" TEXT NOT NULL DEFAULT '{}',
    "client_token" VARCHAR(64),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "phone" VARCHAR(20),
    "avatar_file_id" UUID,
    "nickname" VARCHAR(50),
    "gender" SMALLINT NOT NULL DEFAULT 0,
    "birthday" DATE,
    "extra_config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_level" (
    "id" UUID NOT NULL,
    "level_code" VARCHAR(20) NOT NULL,
    "level_name" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(10) NOT NULL,
    "min_spend" BIGINT NOT NULL DEFAULT 0,
    "benefits" TEXT NOT NULL,
    "discount_rate" DECIMAL(3,2) NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "extra_config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "member_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_member" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "total_spend" BIGINT NOT NULL DEFAULT 0,
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "level_up_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_time" TIMESTAMPTZ,
    "extra_config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_order" (
    "id" UUID NOT NULL,
    "order_no" VARCHAR(32) NOT NULL,
    "user_id" UUID,
    "route_id" UUID,
    "scope" VARCHAR(20) NOT NULL DEFAULT 'international',
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "guest_name" VARCHAR(100) NOT NULL,
    "guest_phone" VARCHAR(20),
    "guest_email" VARCHAR(255),
    "origin" VARCHAR(100),
    "destination_name" VARCHAR(200),
    "destination_id" UUID,
    "transit_id" UUID,
    "route_name" VARCHAR(200),
    "transport_type" VARCHAR(30),
    "travel_date" DATE,
    "end_date" DATE,
    "days" INTEGER,
    "adults" INTEGER NOT NULL DEFAULT 2,
    "children" INTEGER NOT NULL DEFAULT 0,
    "base_price" BIGINT NOT NULL DEFAULT 0,
    "add_ons_total" BIGINT NOT NULL DEFAULT 0,
    "discount_amount" BIGINT NOT NULL DEFAULT 0,
    "total_price" BIGINT NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'CNY',
    "trip_config_snapshot" JSONB,
    "preferences_snapshot" JSONB,
    "add_ons_snapshot" JSONB,
    "price_snapshot" JSONB NOT NULL DEFAULT '{}',
    "client_token" VARCHAR(64),
    "notes" TEXT,
    "cancelled_reason" VARCHAR(500),
    "paid_time" TIMESTAMPTZ,
    "confirmed_time" TIMESTAMPTZ,
    "completed_time" TIMESTAMPTZ,
    "cancelled_time" TIMESTAMPTZ,
    "created_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" TIMESTAMPTZ NOT NULL,
    "deleted_time" TIMESTAMPTZ,

    CONSTRAINT "travel_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_history" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_no" VARCHAR(32) NOT NULL,
    "scope" VARCHAR(20) NOT NULL,
    "origin" VARCHAR(100),
    "destination_name" VARCHAR(200),
    "transport_type" VARCHAR(30),
    "travel_date" DATE,
    "end_date" DATE,
    "days" INTEGER,
    "adults" INTEGER,
    "children" INTEGER,
    "total_price" BIGINT,
    "cover_image_url" VARCHAR(500),
    "rating" SMALLINT,
    "review_text" TEXT,
    "review_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "review_time" TIMESTAMPTZ,
    "diary_title" VARCHAR(200),
    "diary_content" TEXT,
    "diary_images" JSONB NOT NULL DEFAULT '[]',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "extra_config" JSONB NOT NULL DEFAULT '{}',
    "archived_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "travel_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dimension_space" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "space_name" VARCHAR(100) NOT NULL DEFAULT '我的次元空间',
    "theme" VARCHAR(30) NOT NULL DEFAULT 'nebula',
    "cover_url" VARCHAR(500),
    "bio" VARCHAR(500),
    "visit_count" INTEGER NOT NULL DEFAULT 0,
    "avatar_frame" VARCHAR(50),
    "bg_music_url" VARCHAR(500),
    "particle_style" VARCHAR(30) NOT NULL DEFAULT 'aurora',
    "custom_css" TEXT,
    "showcase_items" JSONB NOT NULL DEFAULT '[]',
    "extra_config" JSONB NOT NULL DEFAULT '{}',
    "created_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "dimension_space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_file" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "original_name" VARCHAR(255) NOT NULL,
    "stored_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(1000) NOT NULL,
    "file_url" VARCHAR(1000) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_type" VARCHAR(30) NOT NULL,
    "storage_type" VARCHAR(20) NOT NULL DEFAULT 'local',
    "status" SMALLINT NOT NULL DEFAULT 1,
    "extra_config" JSONB NOT NULL DEFAULT '{}',
    "created_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_time" TIMESTAMPTZ,

    CONSTRAINT "sys_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_dict" (
    "id" UUID NOT NULL,
    "dict_type" VARCHAR(50) NOT NULL,
    "dict_code" VARCHAR(50) NOT NULL,
    "dict_label" VARCHAR(200) NOT NULL,
    "dict_value" VARCHAR(500) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "extra_config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sys_dict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_config" (
    "id" UUID NOT NULL,
    "config_key" VARCHAR(100) NOT NULL,
    "config_value" TEXT NOT NULL,
    "config_type" VARCHAR(20) NOT NULL DEFAULT 'string',
    "description" VARCHAR(500),
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sys_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_log" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "module" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "target_type" VARCHAR(50),
    "target_id" VARCHAR(100),
    "description" TEXT,
    "request_method" VARCHAR(10),
    "request_url" VARCHAR(500),
    "request_body" JSONB,
    "response_status" INTEGER,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "duration_ms" INTEGER,
    "created_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sys_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "destination_slug_key" ON "destination"("slug");

-- CreateIndex
CREATE INDEX "destination_country_idx" ON "destination"("country");

-- CreateIndex
CREATE INDEX "destination_scope_idx" ON "destination"("scope");

-- CreateIndex
CREATE INDEX "destination_scope_region_idx" ON "destination"("scope", "region");

-- CreateIndex
CREATE UNIQUE INDEX "route_slug_key" ON "route"("slug");

-- CreateIndex
CREATE INDEX "route_destination_id_idx" ON "route"("destination_id");

-- CreateIndex
CREATE INDEX "route_origin_idx" ON "route"("origin");

-- CreateIndex
CREATE INDEX "route_price_idx" ON "route"("price");

-- CreateIndex
CREATE INDEX "route_scope_idx" ON "route"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_email_key" ON "user_account"("email");

-- CreateIndex
CREATE INDEX "user_account_email_idx" ON "user_account"("email");

-- CreateIndex
CREATE INDEX "user_account_status_idx" ON "user_account"("status");

-- CreateIndex
CREATE INDEX "user_account_created_at_idx" ON "user_account"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "booking_client_token_key" ON "booking"("client_token");

-- CreateIndex
CREATE INDEX "booking_user_id_idx" ON "booking"("user_id");

-- CreateIndex
CREATE INDEX "booking_route_id_idx" ON "booking"("route_id");

-- CreateIndex
CREATE INDEX "booking_status_idx" ON "booking"("status");

-- CreateIndex
CREATE INDEX "booking_guest_email_idx" ON "booking"("guest_email");

-- CreateIndex
CREATE INDEX "booking_client_token_idx" ON "booking"("client_token");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_user_id_key" ON "user_profile"("user_id");

-- CreateIndex
CREATE INDEX "user_profile_user_id_idx" ON "user_profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_level_level_code_key" ON "member_level"("level_code");

-- CreateIndex
CREATE INDEX "member_level_sort_order_idx" ON "member_level"("sort_order");

-- CreateIndex
CREATE INDEX "member_level_min_spend_idx" ON "member_level"("min_spend");

-- CreateIndex
CREATE UNIQUE INDEX "user_member_user_id_key" ON "user_member"("user_id");

-- CreateIndex
CREATE INDEX "user_member_user_id_idx" ON "user_member"("user_id");

-- CreateIndex
CREATE INDEX "user_member_level_id_idx" ON "user_member"("level_id");

-- CreateIndex
CREATE INDEX "user_member_total_spend_idx" ON "user_member"("total_spend" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "travel_order_order_no_key" ON "travel_order"("order_no");

-- CreateIndex
CREATE UNIQUE INDEX "travel_order_client_token_key" ON "travel_order"("client_token");

-- CreateIndex
CREATE INDEX "travel_order_user_id_idx" ON "travel_order"("user_id");

-- CreateIndex
CREATE INDEX "travel_order_order_no_idx" ON "travel_order"("order_no");

-- CreateIndex
CREATE INDEX "travel_order_status_idx" ON "travel_order"("status");

-- CreateIndex
CREATE INDEX "travel_order_scope_idx" ON "travel_order"("scope");

-- CreateIndex
CREATE INDEX "travel_order_travel_date_idx" ON "travel_order"("travel_date");

-- CreateIndex
CREATE INDEX "travel_order_created_time_idx" ON "travel_order"("created_time" DESC);

-- CreateIndex
CREATE INDEX "travel_order_user_id_status_idx" ON "travel_order"("user_id", "status");

-- CreateIndex
CREATE INDEX "travel_order_guest_email_idx" ON "travel_order"("guest_email");

-- CreateIndex
CREATE UNIQUE INDEX "travel_history_order_id_key" ON "travel_history"("order_id");

-- CreateIndex
CREATE INDEX "travel_history_user_id_idx" ON "travel_history"("user_id");

-- CreateIndex
CREATE INDEX "travel_history_order_id_idx" ON "travel_history"("order_id");

-- CreateIndex
CREATE INDEX "travel_history_archived_time_idx" ON "travel_history"("archived_time" DESC);

-- CreateIndex
CREATE INDEX "travel_history_rating_idx" ON "travel_history"("rating");

-- CreateIndex
CREATE INDEX "travel_history_user_id_archived_time_idx" ON "travel_history"("user_id", "archived_time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "dimension_space_user_id_key" ON "dimension_space"("user_id");

-- CreateIndex
CREATE INDEX "dimension_space_user_id_idx" ON "dimension_space"("user_id");

-- CreateIndex
CREATE INDEX "dimension_space_theme_idx" ON "dimension_space"("theme");

-- CreateIndex
CREATE INDEX "sys_file_user_id_idx" ON "sys_file"("user_id");

-- CreateIndex
CREATE INDEX "sys_file_file_type_idx" ON "sys_file"("file_type");

-- CreateIndex
CREATE INDEX "sys_file_status_idx" ON "sys_file"("status");

-- CreateIndex
CREATE INDEX "sys_file_created_time_idx" ON "sys_file"("created_time" DESC);

-- CreateIndex
CREATE INDEX "sys_dict_dict_type_idx" ON "sys_dict"("dict_type");

-- CreateIndex
CREATE INDEX "sys_dict_dict_type_is_active_sort_order_idx" ON "sys_dict"("dict_type", "is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "sys_dict_dict_type_dict_code_key" ON "sys_dict"("dict_type", "dict_code");

-- CreateIndex
CREATE UNIQUE INDEX "sys_config_config_key_key" ON "sys_config"("config_key");

-- CreateIndex
CREATE INDEX "sys_config_config_key_idx" ON "sys_config"("config_key");

-- CreateIndex
CREATE INDEX "sys_log_user_id_idx" ON "sys_log"("user_id");

-- CreateIndex
CREATE INDEX "sys_log_module_idx" ON "sys_log"("module");

-- CreateIndex
CREATE INDEX "sys_log_action_idx" ON "sys_log"("action");

-- CreateIndex
CREATE INDEX "sys_log_created_time_idx" ON "sys_log"("created_time" DESC);

-- CreateIndex
CREATE INDEX "sys_log_user_id_module_created_time_idx" ON "sys_log"("user_id", "module", "created_time" DESC);

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_transit_id_fkey" FOREIGN KEY ("transit_id") REFERENCES "destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_member" ADD CONSTRAINT "user_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_member" ADD CONSTRAINT "user_member_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "member_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_order" ADD CONSTRAINT "travel_order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_order" ADD CONSTRAINT "travel_order_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_history" ADD CONSTRAINT "travel_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "travel_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_history" ADD CONSTRAINT "travel_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dimension_space" ADD CONSTRAINT "dimension_space_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sys_file" ADD CONSTRAINT "sys_file_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sys_log" ADD CONSTRAINT "sys_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
