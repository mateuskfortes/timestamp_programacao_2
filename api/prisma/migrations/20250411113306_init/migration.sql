/*
  Warnings:

  - You are about to drop the column `is_dst` on the `Timezone` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Timezone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "utc_offset" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "daylight_saving_offset" TEXT
);
INSERT INTO "new_Timezone" ("daylight_saving_offset", "id", "name", "utc_offset") SELECT "daylight_saving_offset", "id", "name", "utc_offset" FROM "Timezone";
DROP TABLE "Timezone";
ALTER TABLE "new_Timezone" RENAME TO "Timezone";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
