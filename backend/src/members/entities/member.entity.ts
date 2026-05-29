export class Member {
	id?: string;
	role?: string;
	memberNumber?: number | null;
	status?: string | null;
	name?: string;
	surname?: string;
	japaneseName?: string | null;
	japaneseSurname?: string | null;
	sex?: string | null;
	birthDate?: Date | null;
	documentType?: string | null;
	documentNumber?: string | null;
	documentExpDate?: Date | null;
	visaStatus?: string | null;
	countryOrigin?: string | null;
	ruc?: string | null;
	email?: string | null;
	phone?: string | null;
	bloodType?: string | null;
	address?: string | null;
	profession?: string | null;
	workAddress?: string | null;
	workPhone?: string | null;
	deathDate?: Date | null;
	partnerId?: string | null;
	adminParentId?: string | null;
	biologicalMotherId?: string | null;
	biologicalFatherId?: string | null;
	dependencyStart?: Date | null;
	responsible?: boolean | null;
	groupId?: string | null;
	deleted?: boolean;
	joinDate?: Date | null;
	createdAt?: Date;
	updatedAt?: Date;
}

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/;

function parseDateOnlyValue(value: unknown): Date | null {
    if (!value) return null;

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) return null;

    const match = trimmedValue.match(DATE_ONLY_PATTERN);
    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    }

    const parsedDate = new Date(trimmedValue);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export const DtotoEntity = (dto: any): Member => {
    const entity: Member = {
        id: dto.id,
        role: dto.role,
        memberNumber: dto.memberNumber,
        status: dto.status,
        name: dto.name,
        surname: dto.surname,
        japaneseName: dto.japaneseName,
        japaneseSurname: dto.japaneseSurname,
        address: dto.address,
        profession: dto.profession,
        workAddress: dto.workAddress,
        workPhone: dto.workPhone,
        adminParentId: dto.adminParentId,
        biologicalMotherId: dto.biologicalMotherId,
        biologicalFatherId: dto.biologicalFatherId,
        birthDate: parseDateOnlyValue(dto.birthDate),
        documentExpDate: parseDateOnlyValue(dto.documentExpDate),
        visaStatus: dto.visaStatus,
        countryOrigin: dto.countryOrigin,
        ruc: dto.ruc,
        email: dto.email,
        phone: dto.phone,
        bloodType: dto.bloodType,
        sex: dto.sex,
        deathDate: parseDateOnlyValue(dto.deathDate),
        partnerId: dto.partnerId,
        dependencyStart: parseDateOnlyValue(dto.dependencyStart),
        responsible: dto.responsible,
        groupId: dto.groupId,
        deleted: dto.deleted,
        joinDate: parseDateOnlyValue(dto.joinDate),
        createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
        updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
        documentNumber: dto.documentNumber,
        documentType: dto.documentType,
    }
    return entity;
}