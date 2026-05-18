import { HttpRequest } from "@azure/functions";
import { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors";

export async function parseAndValidate<T>(
    request: HttpRequest,
    schema: ZodSchema<T>
): Promise<T>{
    let body: unknown;
    try {
        body = await request.json();
    } catch{
        throw new ValidationError("Body json invalido")
    }
    const result = schema.safeParse(body);
    if(!result.success){
        const messages = result.error.errors.map((e)=> `${e.path.join(".")}: ${e.message}`).join("; ");
        throw new ValidationError(messages);
    }
    return result.data;
}