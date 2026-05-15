BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[dispositivos] (
    [id] INT NOT NULL IDENTITY(1,1),
    [empresa_id] INT NOT NULL,
    [nome_modelo] VARCHAR(255) NOT NULL,
    [token_dispositivo_hash] VARCHAR(255) NOT NULL,
    [ativo] BIT NOT NULL CONSTRAINT [dispositivos_ativo_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [dispositivos_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [dispositivos_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[sensores] (
    [id] INT NOT NULL IDENTITY(1,1),
    [dispositivo_id] INT NOT NULL,
    [nome_modelo] VARCHAR(255) NOT NULL,
    [tipo_sensor] VARCHAR(100) NOT NULL,
    [unidade] VARCHAR(50) NOT NULL,
    [ativo] BIT NOT NULL CONSTRAINT [sensores_ativo_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [sensores_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [sensores_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[atuadores] (
    [id] INT NOT NULL IDENTITY(1,1),
    [dispositivo_id] INT NOT NULL,
    [nome_modelo] VARCHAR(255) NOT NULL,
    [tipo] VARCHAR(100) NOT NULL,
    [ativo] BIT NOT NULL CONSTRAINT [atuadores_ativo_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [atuadores_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [atuadores_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[alertas] (
    [id] INT NOT NULL IDENTITY(1,1),
    [dispositivo_id] INT NOT NULL,
    [sensor_id] INT NOT NULL,
    [tipo] VARCHAR(100) NOT NULL,
    [mensagem] VARCHAR(500) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [alertas_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [alertas_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[logs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [tabela] VARCHAR(100) NOT NULL,
    [operacao] VARCHAR(50) NOT NULL,
    [descricao] TEXT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [logs_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [dispositivo_nome] VARCHAR(255),
    [dispositivo_id] INT,
    [empresa_id] INT NOT NULL,
    CONSTRAINT [logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [dispositivos_empresa_id_idx] ON [dbo].[dispositivos]([empresa_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [dispositivos_ativo_idx] ON [dbo].[dispositivos]([ativo]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [sensores_dispositivo_id_idx] ON [dbo].[sensores]([dispositivo_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [sensores_ativo_idx] ON [dbo].[sensores]([ativo]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [atuadores_dispositivo_id_idx] ON [dbo].[atuadores]([dispositivo_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [atuadores_ativo_idx] ON [dbo].[atuadores]([ativo]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [alertas_dispositivo_id_idx] ON [dbo].[alertas]([dispositivo_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [alertas_sensor_id_idx] ON [dbo].[alertas]([sensor_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [logs_empresa_id_idx] ON [dbo].[logs]([empresa_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [logs_dispositivo_id_idx] ON [dbo].[logs]([dispositivo_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [logs_created_at_idx] ON [dbo].[logs]([created_at]);

-- AddForeignKey
ALTER TABLE [dbo].[sensores] ADD CONSTRAINT [sensores_dispositivo_id_fkey] FOREIGN KEY ([dispositivo_id]) REFERENCES [dbo].[dispositivos]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[atuadores] ADD CONSTRAINT [atuadores_dispositivo_id_fkey] FOREIGN KEY ([dispositivo_id]) REFERENCES [dbo].[dispositivos]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[alertas] ADD CONSTRAINT [alertas_dispositivo_id_fkey] FOREIGN KEY ([dispositivo_id]) REFERENCES [dbo].[dispositivos]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[alertas] ADD CONSTRAINT [alertas_sensor_id_fkey] FOREIGN KEY ([sensor_id]) REFERENCES [dbo].[sensores]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[logs] ADD CONSTRAINT [logs_dispositivo_id_fkey] FOREIGN KEY ([dispositivo_id]) REFERENCES [dbo].[dispositivos]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
