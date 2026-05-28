export function getConectaApiUrl(): string {
    const url = process.env.CONECTA_API_URL;
    if (!url) {
        throw new Error("CONECTA_API_URL nao esta definido");
    }
    return url;
}