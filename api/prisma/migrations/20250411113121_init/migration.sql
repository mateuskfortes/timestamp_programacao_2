-- CreateTable
CREATE TABLE "Timezone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "utc_offset" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "daylight_saving_offset" TEXT,
    "is_dst" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Date" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Administrator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TimeDiff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searched_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Timestamp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searched_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Administrator_email_key" ON "Administrator"("email");
