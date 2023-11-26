/*
  Warnings:

  - Added the required column `password` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "password" VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE "temp" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "status" VARCHAR(100) NOT NULL,

    CONSTRAINT "temp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "temp_id_user_key" ON "temp"("id_user");
