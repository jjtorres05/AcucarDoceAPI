// JWT - Claims que vienen de ConectaAPI
export interface JwtPayload {
  id: number;            // usuario_id
  empresa_id: number;    // empresa a la que pertenece
}

// Contextos de autenticación
export interface AuthContext {
    usuario_id: number;
    empresa_id: number;
}

export interface DeviceContext {
    dispositivo_id: number;
    empresa_id: number;
}

// respostas da API
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}


// DTOs de Dispositivo
export interface DispositivoResponse {
    id: string;
    nome_modelo: string;
    ativo: boolean;
    created_at: Date;
}

export interface DispositivoCreateResponse extends DispositivoResponse {
    token_dispositivo: string;
}

//Log
export interface LogDescricao {
    acao: string;
    entidade: string;
    registroId: number;
    executadoPor: number;
    dados?: Record<string, unknown>;
    alteracoes?: Record<string, { antes: unknown; depois: unknown }>;
}

//Dto de sensor
export interface SensorResponse {
    id: string;
    dispositivo_id: string;
    nome_modelo: string;
    tipo_sensor: string;
    unidade: string;
    ativo: boolean;
    created_at: Date;
}

//Dto de atuador
export interface AtuadorResponse {
    id: string;
    dispositivo_id: string;
    nome_modelo: string;
    tipo: string;
    ativo: boolean;
    created_at: Date;
}

//Dto de alerta
export interface AlertaResponse {
    id: string;
    dispositivo_id: string;
    sensor_id: string;
    tipo: string;
    mensagem: string;
    created_at: Date;
}

//Dto log
export interface LogResponse {
    id: string;
    tabela: string;
    operacao: string;
    descricao: string;
    dispositivo_id: string | null;
    dispositivo_nome: string | null;
    empresa_id: number;
    created_at: Date;
}
