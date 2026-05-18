import {z} from "zod";

export const criarDispositivoSchema = z.object({
    nome_modelo: z.string().min(1,"nome modelo obrigatorio").max(255, "nome_modelo dever ter no maximo 255 caracteres"),
});

export const atualizarDispositivoSchema = z.object({
    nome_modelo: z.string().min(1, "nome modelo nao pode ser vazio").max(255, "nome_modelo deve ter no maximo 255 caracteres").optional(),
    ativo: z.boolean().optional(),
});
export type CriarDispositivoInput = z.infer<typeof criarDispositivoSchema>;
export type AtualizarDispositivoInput = z.infer<typeof atualizarDispositivoSchema>;