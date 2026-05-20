import z from "zod";

export const criarAtuadorSchema = z.object({
    dispositivo_id: z.string().min(1,"dispositivo_id é obirgatorio"),
    nome_modelo: z.string().min(1,"nome modelo obrigatorio").max(255, "nome_modelo deve ter no maximo 255 caracteres"),
    tipo: z.string().min (1,"tipo de sensor obrigatorio").max(100,"tipo_sensor deve ter no maximo 100 caracteres"),
});

export const atualizarAtuadorSchema = z.object({
    nome_modelo: z.string().min(1,"nome modelo obrigatorio").max(255, "nome_modelo deve ter no maximo 255 caracteres").optional(),
    tipo: z.string().min (1,"tipo de sensor obrigatorio").max(100,"tipo_sensor deve ter no maximo 100 caracteres").optional(),
    ativo: z.boolean().optional(),
});

export type CriarAtuadorInput= z.infer<typeof criarAtuadorSchema>;
export type AtualizarAtuadorInput= z.infer<typeof atualizarAtuadorSchema>;