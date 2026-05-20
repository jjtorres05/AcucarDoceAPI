import {z} from "zod";

export const criarSensorSchema = z.object({
    dispositivo_id: z.string().min(1,"dispositivo_id é obirgatorio"),
    nome_modelo: z.string().min(1,"nome modelo obrigatorio").max(255, "nome_modelo deve ter no maximo 255 caracteres"),
    tipo_sensor: z.string().min (1,"tipo de sensor obrigatorio").max(100,"tipo_sensor deve ter no maximo 100 caracteres"),
    unidade: z.string().min (1,"unidade do sensor obrigatorio").max(50,"unidade deve ter no maximo 50 caracteres"),
});

export const atualizarSensorSchema = z.object({
    nome_modelo: z.string().min(1,"nome modelo obrigatorio").max(255, "nome_modelo deve ter no maximo 255 caracteres").optional(),
    tipo_sensor: z.string().min (1,"tipo de sensor obrigatorio").max(100,"tipo_sensor deve ter no maximo 100 caracteres").optional(),
    unidade: z.string().min (1,"unidade do sensor obrigatorio").max(50,"unidade deve ter no maximo 50 caracteres").optional(),
    ativo: z.boolean().optional(),
});
export type criarSensorInput = z.infer<typeof criarSensorSchema>;
export type atualizarSensorInput = z.infer<typeof atualizarSensorSchema>;