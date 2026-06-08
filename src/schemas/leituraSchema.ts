import {z} from "zod";

export const criarLeituraSchema = z.object({
    token_dispostivo: z.string().min(1,"token_dispositivo é obrigatorio"),// é tipo senha do dispositivo
    sensor_id: z.string().min(1,"sensor_id é obrigatorio"),
    valor: z.number({message:"valor deve ser um numero"}),
    timestamp: z.string().min(1,"timestamp é obrigatorio").refine(
        (val) => !isNaN(Date.parse(val)),
        {message: "timestamp deve ser uma data valida"}
    ),
});
export type CriarLeituraInput = z.infer<typeof criarLeituraSchema>;