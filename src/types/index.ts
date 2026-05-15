//jwt vem de ConectaAPI
export interface jwtPayload{
    id: number;
    tipo:string;
    rolInterno: string;
    empresa_id: number;
    rol_empresa: string;
}

//contextos de autentificacao
export interface AuthContext{
    usuario_id: number;
    empresa_id: number;
    tipo: string;
    rolInterno: string;
    rolExterno: string;
}

export interface DeviceContext{
    dispositivo_id: number;
    empresa_id: number;
}

//Respostas da API
export interface ApiResponse<T= unknown>{
    success: boolean;
    data?: T;
    error?: string;
    message?: string
}

export interface PaginatedResponse<T>{
    items: T[];
    total: number;
    page: number;
    limit: number;
}

//DTOs

export interface DispositivoResponse{
    id: string;
    nome_modelo: string;
    ativo: boolean;
    created_at: Date;
}

export interface DispositivoCreateResponse extends DispositivoResponse{
    token_dispositivo: string;
}
