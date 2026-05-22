/*
  Warnings:

  - You are about to drop the column `ativo` on the `dispositivos` table. All the data in the column will be lost.
  - You are about to drop the column `ativo` on the `sensores` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
DROP INDEX [dispositivos_ativo_idx] ON [dbo].[dispositivos];

-- DropIndex
DROP INDEX [sensores_ativo_idx] ON [dbo].[sensores];

-- AlterTable
ALTER TABLE [dbo].[dispositivos] DROP COLUMN [ativo];
ALTER TABLE [dbo].[dispositivos] ADD [em_uso] BIT NOT NULL CONSTRAINT [dispositivos_em_uso_df] DEFAULT 1;

-- AlterTable
ALTER TABLE [dbo].[sensores] DROP COLUMN [ativo];
ALTER TABLE [dbo].[sensores] ADD [em_uso] BIT NOT NULL CONSTRAINT [sensores_em_uso_df] DEFAULT 1;

-- CreateIndex
CREATE NONCLUSTERED INDEX [dispositivos_em_uso_idx] ON [dbo].[dispositivos]([em_uso]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [sensores_em_uso_idx] ON [dbo].[sensores]([em_uso]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
