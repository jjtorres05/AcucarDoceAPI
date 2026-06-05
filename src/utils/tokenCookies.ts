import { Cookie } from "@azure/functions";

export function setTokenCookie(token: string): Cookie {
    return {
        name: "auth_token",
        value: token,
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        path: "/",
        maxAge: 60*60*24
    };
}

export function clearToken(): Cookie{
    return {
        name: "auth_token",
        value: "",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        path: "/",
        maxAge: 0,
    };
}

