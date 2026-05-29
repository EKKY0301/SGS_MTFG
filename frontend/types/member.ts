import { toDateOnlyApiValue } from "@/utils/functions";
import { CreateMemberDto, CreateRelatedInlineMemberDto } from "./create-dtos/create-member";

export type Member = {
    id?: string | null; // UUID creado por backend

    // Roles
    role?: string | null; // principal, child, spouse, father, mother, etc.
    memberNumber?: number | null;
    status?: string | null; // active, inactive, moroso, deceased

    // Información Personal (español)
    name: string;
    surname: string;

    // Datos japoneses
    japaneseName?: string | null;
    japaneseSurname?: string | null;

    sex?: string | null; // M: Masculino, F: Femenino
    birthDate?: string | null;

    // Documento de identidad
    documentType?: string | null;
    documentNumber?: string | null;
    documentExpDate?: string | null;

    // Estado migratorio
    visaStatus?: string | null;
    countryOrigin?: string | null;

    ruc?: string | null;
    email?: string | null;
    phone?: string | null;
    profession?: string | null;
    bloodType?: string | null;

    address?: string | null;
    workAddress?: string | null;
    workPhone?: string | null;

    // Fallecimiento
    deathDate?: string | null;

    // Relación de pareja (cambia si se independiza)
    partnerId?: string | null;
    partner?: Member | null;
    children?: Member[];

    // Relación administrativa (cambia si se independiza)
    adminParentId?: string | null;
    adminParent?: Member | null;
    adminDependents?: Member[];

    // Relación biológica (NO cambia nunca)
    motherId?: string | null;
    mother?: Member | null;
    biologicalChildrenFromMother?: Member[];

    fatherId?: string | null;
    father?: Member | null;
    biologicalChildrenFromFather?: Member[];

    // Dependencia familiar
    dependencyStart?: string | null;
    responsible?: boolean | null;

    // Grupo asignado
    groupId?: string | null;

    deleted?: boolean;
    joinDate?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export function createDtoToEntity (dto: CreateMemberDto): Member {
    const { father, mother, children} = dto;
    return {
        japaneseName: dto.japaneseName ?? null,
        japaneseSurname: dto.japaneseSurname ?? null,
        name: dto.name,
        surname: dto.surname,
        memberNumber: dto.memberNumber ?? null,
        status: dto.status ?? null,
        address: dto.address ?? null,
        birthDate: toDateOnlyApiValue(dto.birthDate) ?? null,
        bloodType: dto.bloodType ?? null,
        countryOrigin: dto.countryOrigin ?? null,
        documentExpDate: toDateOnlyApiValue(dto.documentExpDate) ?? null,
        documentNumber: dto.documentNumber ?? null,
        documentType: dto.documentType ?? null,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        profession: dto.profession ?? null,
        ruc: dto.ruc ?? null,
        sex: dto.sex ?? null,
        visaStatus: dto.visaStatus ?? null,
        role: "role", // El rol se asignará en el backend según las relaciones
        partner: dto.partner ? relatedInlineDtoToEntity(dto.partner) : null,
        father: father ? relatedInlineDtoToEntity(father) : null,
        mother: mother ? relatedInlineDtoToEntity(mother) : null,
        children: children ? children.map(relatedInlineDtoToEntity) : [],
    }
}

function relatedInlineDtoToEntity(dto: CreateRelatedInlineMemberDto): Member {
    return {
        name: dto.name,
        surname: dto.surname,
        japaneseName: dto.japaneseName,
        japaneseSurname: dto.japaneseSurname,
        memberNumber: null,
        status: "active",
        sex: dto.sex ?? null,
        birthDate: toDateOnlyApiValue(dto.birthDate) ?? null,
        documentType: "CI",
        documentNumber: dto.documentNumber ?? null,
        documentExpDate: toDateOnlyApiValue(dto.documentExpDate) ?? null,
        visaStatus: dto.visaStatus ?? null,
        countryOrigin: dto.countryOrigin ?? null,
        ruc: dto.ruc ?? null,
        email: dto.email ?? "dummy@gmail.com",
        phone: dto.phone ?? null,
        bloodType: dto.bloodType ?? null,
        address: dto.address ?? null,
        profession: dto.profession ?? null,
        workAddress: dto.workAddress ?? null,
        workPhone: dto.workPhone ?? null,
    }
}