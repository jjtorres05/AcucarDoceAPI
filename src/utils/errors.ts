import { th } from "zod/v4/locales";

export class AppError extends Error{
    constructor(
        public readonly statusCode: number,
        message: string){
            super(message); this.name= "AppError";
        }
}

export class UnauthorizedError extends AppError{
    constructor(message= "Unauthorizes"){
        super(401,message); this.name= "UnauthorizedError";
    }
}

export class ForbiddenError extends AppError{
    constructor(message = "Forbidden"){
        super(403, message);
        this.name= "ForbiddenError";
    }
}

export class ValidationError extends AppError {
    constructor(message = "Conflict"){
        super(409, message);
        this.name= "ValidationError";
    }
}

export class ConflictError extends AppError {
    constructor(message= "Conflict"){
        super(409,message);
        this.name="ConflictError";
    }
}

