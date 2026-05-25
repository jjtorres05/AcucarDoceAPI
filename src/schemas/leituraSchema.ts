import {z} from "zod";

export const criarLeituraSchema = z.object({
    token_dispostivo: z.string().min(1,"token_dispositivo é obrigatorio"),// é tipo senha do dispositivo
    sensor_id: z.string().min(1,"sensor_id é obrigatorio"),
    valor: z.number({message:"valor deve ser um numero"}),
    unidade: z.string().min(1,"unidade é obrigatorio").max(50,"unidade dever ter no maximo 50 caracteres"),
});
export type CriarLeituraInput = z.infer<typeof criarLeituraSchema>;