import { z } from "zod";

export const criarAlertaSchema = z.object({
    dispositivo_id: z.string().min(1, "dispositivo_id é obrigatorio"),
    sensor_id: z.string().min(1, "sensor_id é obrigatorio"),
    tipo: z.string().min(1, "tipo do alerta obrigatorio").max(100, "tipo deve ter no maximo 100 caracteres"),
    mensagem: z.string().min(1, "mensagem obrigatoria").max(500, "mensagem deve ter no maximo 500 caracteres"),
});

export type CriarAlertaInput = z.infer<typeof criarAlertaSchema>;