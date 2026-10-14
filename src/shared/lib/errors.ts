/** Errores de dominio: expresan reglas de negocio violadas, no fallas técnicas. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string) {
    super(`${entity} no encontrado`);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor() {
    super("No autorizado");
    this.name = "UnauthorizedError";
  }
}
