-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed system roles (permissions attached via prisma seed)
INSERT INTO "roles" ("name", "description", "is_system", "updated_at") VALUES
  ('SUPER', 'Full system access', true, CURRENT_TIMESTAMP),
  ('ADMIN', 'Institute administration', true, CURRENT_TIMESTAMP),
  ('USER', 'Standard user access', true, CURRENT_TIMESTAMP);

-- Add nullable role_id, backfill from enum, then enforce NOT NULL
ALTER TABLE "user" ADD COLUMN "role_id" INTEGER;

UPDATE "user" u
SET "role_id" = r."id"
FROM "roles" r
WHERE r."name" = u."role"::text;

UPDATE "user"
SET "role_id" = (SELECT "id" FROM "roles" WHERE "name" = 'USER')
WHERE "role_id" IS NULL;

ALTER TABLE "user" ALTER COLUMN "role_id" SET NOT NULL;

CREATE INDEX "idx_user_role_id" ON "user"("role_id");

ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "user" DROP COLUMN "role";

DROP TYPE "UserRole";
