/**
 * DTOs para crear y actualizar miembros
 * Espejo del contrato del backend (backend/src/members/dto/)
 */

/**
 * DTO para crear miembros relacionados inline (padre, madre, pareja, hijos)
 */
export type CreateRelatedInlineMemberDto = {
	// Roles
	role?: string;
	memberNumber?: number;
	status?: string;

	// Datos personales (español)
	name: string;
	surname: string;

	// Datos japoneses
	japaneseName?: string;
	japaneseSurname?: string;

	// Documento de identidad
	sex?: string;
	birthDate?: string; // ISO 8601 date string
	documentType?: string;
	documentNumber?: string;
	documentExpDate?: string; // ISO 8601 date string

	// Estado migratorio
	visaStatus?: string;
	countryOrigin?: string;

	// Datos personales
	ruc?: string;
	email?: string;
	phone?: string;
	bloodType?: string;
	address?: string;

	// Datos laborales
	profession?: string;
	workAddress?: string;
	workPhone?: string;

	// Fallecimiento (opcional)
	deathDate?: string; // ISO 8601 date string

	// Relaciones
	partnerId?: string;
	adminParentId?: string;
	biologicalMotherId?: string;
	biologicalFatherId?: string;

	// Datos de dependencia familiar
	dependencyStart?: string; // ISO 8601 date string
	responsible?: boolean;

	// Grupo asignado
	groupId?: string;
	joinDate?: string; // ISO 8601 date string
	deleted?: boolean;
};

/**
 * DTO para crear un nuevo miembro
 */
export type CreateMemberDto = {
	// Roles (REQUERIDO)
	role: string;

	// Datos personales (REQUERIDOS)
	name: string;
	surname: string;

	// Datos personales opcionales
	memberNumber?: number;
	status?: string;

	// Datos japoneses
	japaneseName?: string;
	japaneseSurname?: string;

	// Documento de identidad
	sex?: string;
	birthDate?: string; // ISO 8601 date string
	documentType?: string;
	documentNumber?: string;
	documentExpDate?: string; // ISO 8601 date string

	// Estado migratorio
	visaStatus?: string;
	countryOrigin?: string;

	// Datos personales
	ruc?: string;
	email?: string;
	phone?: string;
	bloodType?: string;
	address?: string;

	// Datos laborales
	profession?: string;
	workAddress?: string;
	workPhone?: string;

	// Fallecimiento (opcional)
	deathDate?: string; // ISO 8601 date string

	// Relaciones por ID
	partnerId?: string;
	adminParentId?: string;
	biologicalMotherId?: string;
	biologicalFatherId?: string;

	// Relaciones inline (para crear miembros en la misma request)
	partner?: CreateRelatedInlineMemberDto | null;
	father?: CreateRelatedInlineMemberDto | null;
	mother?: CreateRelatedInlineMemberDto | null;
	children?: CreateRelatedInlineMemberDto[];

	// Datos de dependencia familiar
	dependencyStart?: string; // ISO 8601 date string
	responsible?: boolean;

	// Grupo asignado
	groupId?: string;
	joinDate?: string; // ISO 8601 date string
	deleted?: boolean;
};

/**
 * DTO para actualizar un miembro existente
 * Todos los campos son opcionales
 */
export type UpdateMemberDto = Partial<CreateMemberDto>;
