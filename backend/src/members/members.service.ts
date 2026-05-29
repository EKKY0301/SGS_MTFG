import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { DtotoEntity } from './entities/member.entity';
import { SearchMembersDto } from './dto/search-member.dto';
import { CreateMemberDto, CreateRelatedInlineMemberDto } from './dto/create-member.dto';
import { ReturnInListMembersDto } from './dto/return-in-list-member.dto';
import { CreateRelatedMemberDto } from './dto/create-related-member.dto';
import { PaginationDataDto } from '../shared/dto/pagination-data.dto';
import { GenerateYearPaymentsDto } from './dto/generate-year-payments.dto';
import PDFDocument from 'pdfkit';

function toCreateInput(entity: ReturnType<typeof DtotoEntity>): Prisma.MemberCreateInput {
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(entity)) {
        if (value !== null && value !== undefined) {
            data[key] = value;
        }
    }
    return data as Prisma.MemberCreateInput;
}

const NULLABLE_MEMBER_FIELDS = new Set<string>([
    'memberNumber',
    'status',
    'japaneseName',
    'japaneseSurname',
    'sex',
    'birthDate',
    'documentType',
    'documentNumber',
    'documentExpDate',
    'visaStatus',
    'countryOrigin',
    'ruc',
    'email',
    'phone',
    'bloodType',
    'address',
    'profession',
    'workAddress',
    'workPhone',
    'deathDate',
    'partnerId',
    'adminParentId',
    'biologicalMotherId',
    'biologicalFatherId',
    'dependencyStart',
    'responsible',
    'groupId',
    'joinDate',
]);

@Injectable()
export class MembersService {
    constructor(
        readonly prisma: PrismaService,
        private readonly auditLogs: AuditLogsService,
    ) { }

    async create(createMemberDto: CreateMemberDto, userId: string) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const member = DtotoEntity(createMemberDto);

                if (createMemberDto.partner) {
                    const partnerEntity = DtotoEntity(createMemberDto.partner);
                    partnerEntity.responsible = false;
                    partnerEntity.role = 'partner';
                    const partner = await tx.member.create({ data: toCreateInput(partnerEntity) });
                    member.partnerId = partner.id;
                }

                if (createMemberDto.father) {
                    const fatherEntity = DtotoEntity(createMemberDto.father);
                    fatherEntity.responsible = false;
                    fatherEntity.role = 'father';
                    const father = await tx.member.create({ data: toCreateInput(fatherEntity) });
                    member.biologicalFatherId = father.id;
                }

                if (createMemberDto.mother) {
                    const motherEntity = DtotoEntity(createMemberDto.mother);
                    motherEntity.responsible = false;
                    motherEntity.role = 'mother';
                    const mother = await tx.member.create({ data: toCreateInput(motherEntity) });
                    member.biologicalMotherId = mother.id;
                }
                member.role = 'principal';
                member.responsible = true;

                const created = await tx.member.create({ data: toCreateInput(member) });

                if (createMemberDto.children?.length) {
                    for (const childDto of createMemberDto.children) {
                        const child = DtotoEntity(childDto);
                        child.role = 'child';
                        if (member.partnerId) {
                            if (member.sex === 'M') {
                                child.biologicalFatherId = created.id;
                                child.biologicalMotherId = member.partnerId;
                            } else if (member.sex === 'F') {
                                child.biologicalMotherId = created.id;
                                child.biologicalFatherId = member.partnerId;
                            }
                        }
                        child.responsible = false;
                        child.adminParentId = created.id;
                        await tx.member.create({ data: toCreateInput(child) });
                    }
                }

                return created;
            });

            await this.auditLogs.create({ userId, entity: 'Member', entityId: result.id, action: 'create', newValues: createMemberDto as any });
            return result;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError
                && error.code === 'P2002'
            ) {
                const target = Array.isArray(error.meta?.target)
                    ? error.meta.target.join(', ')
                    : `${error.meta?.target ?? 'unknown field'}`;
                throw new ConflictException(`Unique constraint failed on: ${target}`);
            }
            throw error;
        }
    }

    async generateYearPaymentsForResponsibleMembers(dto: GenerateYearPaymentsDto) {
        const dueDay = dto.dueDay ?? 10;

        const members = await this.prisma.member.findMany({
            where: {
                responsible: true,
                deleted: false,
                groupId: { not: null },
            },
            select: {
                id: true,
            },
        });

        if (!members.length) {
            return {
                year: dto.year,
                amount: dto.amount,
                dueDay,
                membersProcessed: 0,
                paymentGroupsCreated: 0,
                paymentsCreated: 0,
            };
        }

        return await this.prisma.$transaction(async (tx) => {
            let paymentGroupsCreated = 0;
            let paymentsCreated = 0;

            for (const member of members) {
                const existingGroup = await tx.paymentGroup.findUnique({
                    where: {
                        memberId_year: {
                            memberId: member.id,
                            year: dto.year,
                        },
                    },
                    select: { id: true },
                });

                const paymentGroup = existingGroup
                    ? existingGroup
                    : await tx.paymentGroup.create({
                        data: {
                            memberId: member.id,
                            year: dto.year,
                            amount: dto.amount,
                        },
                        select: { id: true },
                    });

                if (!existingGroup) paymentGroupsCreated += 1;

                const monthlyPayments = Array.from({ length: 12 }, (_, index) => {
                    const month = index + 1;
                    return {
                        paymentGroupId: paymentGroup.id,
                        month,
                        dueDate: new Date(dto.year, month - 1, dueDay),
                        amount: dto.amount,
                    };
                });

                const createdPayments = await tx.payment.createMany({
                    data: monthlyPayments,
                    skipDuplicates: true,
                });

                paymentsCreated += createdPayments.count;
            }

            return {
                year: dto.year,
                amount: dto.amount,
                dueDay,
                membersProcessed: members.length,
                paymentGroupsCreated,
                paymentsCreated,
            };
        });
    }

    async findOne(id: string) {
        const member = await this.prisma.member.findUnique({ where: { id }, include: {
            partner: true,
            biologicalFather: true,
            biologicalMother: true,
            adminDependents: true,
        } });
        if (!member) return null;
        return {
            father: member.biologicalFather,
            mother: member.biologicalMother,
            ...member,
        };
    }

    async search(body: SearchMembersDto) {
        const { paginationData, filters } = body;
        const paginationDataValidated = this.validateOrDefault(paginationData);

        const { adminParentId, birthDateFrom, birthDateTo, deceased, hasJapaneseName, nonPrincipalTurning18ThisYear, isSeventyOrMore, role, search, status, documentNumber, groupId } = filters
        const groups = await this.prisma.group.findMany();

        const where: any = {
            deleted: false,
        }

        // Detectar si hay filtros activos (diferentes al default)
        const hasActiveFilters = !!(
            search
            || (role && role.length)
            || (status && status.length)
            || documentNumber
            || adminParentId
            || birthDateFrom
            || birthDateTo
            || deceased !== undefined
            || hasJapaneseName !== undefined
            || nonPrincipalTurning18ThisYear
            || isSeventyOrMore
            || groupId
        );

        // Si no hay filtros activos, mostrar solo responsables principals por defecto
        // Si hay filtros activos, respetar los filtros sin forzar responsible/principal
        if (!hasActiveFilters) {
            where['responsible'] = true;
        }

        if (nonPrincipalTurning18ThisYear || isSeventyOrMore) {
            const currentYear = new Date().getFullYear();
            const ageConditions: any[] = [];

            if (nonPrincipalTurning18ThisYear) {
                ageConditions.push({
                    AND: [
                        { role: { not: 'principal' } },
                        {
                            birthDate: {
                                gte: new Date(currentYear - 18, 0, 1),
                                lte: new Date(currentYear - 18, 11, 31),
                            },
                        },
                    ],
                });
            }

            if (isSeventyOrMore) {
                ageConditions.push({
                    birthDate: {
                        lte: new Date(currentYear - 70, 11, 31),
                    },
                });
            }

            where['AND'] = [{ OR: ageConditions }]

            const result = await this.prisma.member.findMany({
                where,
                skip: (paginationDataValidated.itemsPerPage ?? 10) * ((paginationDataValidated.page ?? 1) - 1),
                take: paginationDataValidated.itemsPerPage,
                orderBy: { birthDate: 'asc' },
            });
            const resultQty = await this.prisma.member.count({ where });
            const returnValue: ReturnInListMembersDto = {
                paginationData: {
                    page: paginationDataValidated.page,
                    itemsPerPage: paginationDataValidated.itemsPerPage,
                    totalItems: resultQty,
                    currentPage: paginationDataValidated.page,
                },
                items: result.map(member => {
                    const groupItem = groups.find(g => g.id === member.groupId);

                    return {
                        id: member.id,
                        name: member.name ?? "",
                        surname: member.surname ?? "",
                        japaneseName: member.japaneseName ?? "",
                        japaneseSurname: member.japaneseSurname ?? "",
                        memberNumber: member.memberNumber ?? 0,
                        birthDate: member.birthDate ? new Date(member.birthDate) : new Date(0),
                        group: groupItem ? {
                            id: groupItem.id,
                            name: groupItem.name,
                        } : null,
                    }
                }),
            }
            return returnValue;

        } else if (!hasActiveFilters) {
            // Solo forzar 'principal' si NO hay filtros activos
            where['role'] = 'principal';
        }

        if (adminParentId) {
            where['adminParentId'] = adminParentId;
        };

        if(groupId) {
            where['groupId'] = groupId;
            // Cuando se filtra por grupo, limitar siempre a socios principales.
            where['role'] = 'principal';
        }

        if (birthDateFrom || birthDateTo) {
            where['birthDate'] = {
                ...(birthDateFrom ? { gte: birthDateFrom } : {}),
                ...(birthDateTo ? { lte: birthDateTo } : {}),
            }
        };

        if (deceased !== undefined) {
            if (deceased) {
                where['deceasedDate'] = {
                    not: null,
                }
            } else {
                where['deceasedDate'] = null;
            }
        };

        if (hasJapaneseName !== undefined) {
            if (hasJapaneseName) {
                where['japaneseName'] = {
                    not: null,
                }
            } else {
                where['japaneseName'] = null;
            }
        }

        if(documentNumber) {
            where['documentNumber'] = {
                contains: documentNumber,
                mode: 'insensitive',
            }
        }

        if (search) {
            where['OR'] = [
                { name: { contains: search, mode: 'insensitive' } },
                { surname: { contains: search, mode: 'insensitive' } },
                { japaneseName: { contains: search, mode: 'insensitive' } },
                { japaneseSurname: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (role && role.length && !groupId) {
            where['role'] = { in: role };
        }

        if (status && status.length) {
            where['status'] = { in: status };
        }

        const list = await this.prisma.member.findMany({
            where,
            skip: (paginationDataValidated.itemsPerPage ?? 10) * ((paginationDataValidated.page ?? 1) - 1),
            take: paginationDataValidated.itemsPerPage,
        });

        const responseQty = await this.prisma.member.count({ where });

        const returnValue: ReturnInListMembersDto = {
            paginationData: {
                page: paginationDataValidated.page,
                itemsPerPage: paginationDataValidated.itemsPerPage,
                totalItems: responseQty,
                currentPage: paginationDataValidated.page,
            },
            items: list.map(member => {
                const groupItem = groups.find(g => g.id === member.groupId);
                return {
                    id: member.id,
                    name: member.name ?? "",
                    surname: member.surname ?? "",
                    japaneseName: member.japaneseName ?? "",
                    japaneseSurname: member.japaneseSurname ?? "",
                    memberNumber: member.memberNumber ?? 0,
                    birthDate: member.birthDate ? new Date(member.birthDate) : new Date(0),
                    group: groupItem ? {
                        id: groupItem.id,
                        name: groupItem.name,
                    } : null,
                }
            }),
        }

        return returnValue;
    }

    async exportSearchAsPdf(body: SearchMembersDto): Promise<{ buffer: Buffer; fileName: string }> {
        const pageSize = 500;
        const allItems: ReturnInListMembersDto['items'] = [];
        let page = 1;
        let totalItems = 0;

        while (true) {
            const pageResult = await this.search({
                paginationData: {
                    page,
                    itemsPerPage: pageSize,
                },
                filters: body.filters ?? {},
            });

            if (page === 1) {
                totalItems = pageResult.paginationData.totalItems ?? 0;
            }

            allItems.push(...pageResult.items);

            if (allItems.length >= totalItems || pageResult.items.length === 0) {
                break;
            }

            page += 1;
        }

        const membersById = new Map(
            (
                await this.prisma.member.findMany({
                    where: { id: { in: allItems.map((item) => item.id) } },
                    select: {
                        id: true,
                        role: true,
                        birthDate: true,
                        documentNumber: true,
                        phone: true,
                        adminParent: {
                            select: {
                                phone: true,
                            },
                        },
                    },
                })
            ).map((member) => [member.id, member]),
        );

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        const pdfDone = new Promise<Buffer>((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        doc.fontSize(18).text('Lista de socios (busqueda actual)', { align: 'center' });
        doc.moveDown(0.4);
        doc.fontSize(10).text(`Fecha de exportacion: ${new Date().toLocaleString('es-PY')}`);
        doc.text(`Resultados en esta exportacion: ${allItems.length}`);
        doc.moveDown(0.8);

        const filtersSummary = Object.entries(body.filters ?? {})
            .filter(([, value]) => {
                if (Array.isArray(value)) return value.length > 0;
                return value !== undefined && value !== null && `${value}` !== '';
            })
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join(' | ');

        doc.fontSize(10).text(`Filtros: ${filtersSummary || 'Sin filtros'}`);
        doc.moveDown(0.8);

        const tableColumns = [
            { key: 'fullName', title: 'Nombre completo', x: 40, width: 150 },
            { key: 'documentNumber', title: 'N° documento', x: 190, width: 85 },
            { key: 'birthDate', title: 'Fecha de nacimiento', x: 275, width: 70 },
            { key: 'phone', title: 'Tel.', x: 345, width: 80 },
            { key: 'adminParentPhone', title: 'Tel. del responsable', x: 425, width: 130 },
        ] as const;

        const drawHeader = () => {
            const headerY = doc.y;
            doc.font('Helvetica-Bold').fontSize(8);

            let headerHeight = 0;
            for (const column of tableColumns) {
                const textHeight = doc.heightOfString(column.title, { width: column.width });
                headerHeight = Math.max(headerHeight, textHeight);
                doc.text(column.title, column.x, headerY, { width: column.width });
            }

            doc.y = headerY + headerHeight + 4;
            doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#cccccc').stroke();
            doc.moveDown(0.4);
            doc.font('Helvetica').fontSize(8);
        };

        const ensureSpaceForRow = (rowHeight: number) => {
            const pageBottom = doc.page.height - doc.page.margins.bottom;
            if (doc.y + rowHeight + 8 > pageBottom) {
                doc.addPage();
                drawHeader();
            }
        };

        drawHeader();

        for (const item of allItems) {
            const member = membersById.get(item.id);
            const birthDate = member?.birthDate ?? item.birthDate;
            const rowData = {
                fullName: `${item.name ?? ''} ${item.surname ?? ''}`.trim() || '-',
                documentNumber: member?.documentNumber ?? '-',
                birthDate: birthDate instanceof Date ? birthDate.toISOString().split('T')[0] : '-',
                phone: member?.phone ?? '-',
                adminParentPhone: member?.role === 'principal'
                    ? '-'
                    : member?.adminParent?.phone ?? '-',
            };

            const rowHeight = Math.max(
                ...tableColumns.map((column) =>
                    doc.heightOfString(rowData[column.key], { width: column.width }),
                ),
            );

            ensureSpaceForRow(rowHeight);

            const rowY = doc.y;
            doc.font('Helvetica').fontSize(8);
            for (const column of tableColumns) {
                doc.text(rowData[column.key], column.x, rowY, { width: column.width });
            }

            doc.y = rowY + rowHeight + 4;
        }

        doc.moveDown(0.8);
        doc.fontSize(10).font('Helvetica-Bold').text(`Total exportado: ${allItems.length}`);

        doc.end();

        const buffer = await pdfDone;
        const fileName = `socios_busqueda_${new Date().toISOString().slice(0, 10)}.pdf`;

        return { buffer, fileName };
    }

    async update(id: string, updateMemberDto: Partial<CreateMemberDto>, userId: string) {
        const member = await this.prisma.member.findUnique({ where: { id } });
        if (!member) return null;

        const updateData = toCreateInput(DtotoEntity(updateMemberDto)) as Prisma.MemberUpdateInput;
        for (const [key, value] of Object.entries(updateMemberDto)) {
            if (value === null && NULLABLE_MEMBER_FIELDS.has(key)) {
                (updateData as Record<string, unknown>)[key] = null;
            }
        }

        const updated = await this.prisma.member.update({
            where: { id },
            data: updateData,
        });
        await this.auditLogs.create({ userId, entity: 'Member', entityId: id, action: 'update', oldValues: member as any, newValues: updateMemberDto as any });
        return updated;
    }

    async addChildren(children: CreateRelatedInlineMemberDto[], parentId: string, userId: string) {
        if (!children || !children.length) return;
        const parent = await this.prisma.member.findUnique({ where: { id: parentId } });
        if (!parent) return;
        for (const childDto of children) {
            const child = DtotoEntity(childDto);
            child.role = 'child';
            if (!parent.partnerId) {
                if (parent.sex === 'M') {
                    child.biologicalFatherId = parent.id;
                    child.biologicalMotherId = parent.partnerId;
                } else if (parent.sex === 'F') {
                    child.biologicalMotherId = parent.id;
                    child.biologicalFatherId = parent.partnerId;
                }
            }
            child.responsible = false;
            child.adminParentId = parentId;
            const created = await this.prisma.member.create({ data: toCreateInput(child) });
            await this.auditLogs.create({ userId, entity: 'Member', entityId: created.id, action: 'create', newValues: childDto as any });
        }
    }

    async createRelated(createRelatedMemberDto: CreateRelatedMemberDto, parentId: string, userId: string) {
        const principal = await this.prisma.member.findUnique({ where: { id: parentId } });
        if (!principal) return;
        const member = DtotoEntity(createRelatedMemberDto);
        member.responsible = false;
        member.adminParentId = principal.id;
        switch (createRelatedMemberDto.relation) {
            case 'partner':
                member.role = 'partner';
                const createdPartner = await this.prisma.member.create({ data: toCreateInput(member) });
                await this.prisma.member.update({
                    where: { id: principal.id },
                    data: { partnerId: createdPartner.id },
                });
                break;
            case 'dependent-father':
                if (principal.biologicalFatherId) {
                    throw new Error('Principal member already has a biological father');
                }
                member.role = 'father';
                const createdFather = await this.prisma.member.create({ data: toCreateInput(member) });
                await this.prisma.member.update({
                    where: { id: principal.id },
                    data: { biologicalFatherId: createdFather.id },
                });
                break;
            case 'dependent-mother':
                if (principal.biologicalMotherId) {
                    throw new Error('Principal member already has a biological mother');
                }
                member.role = 'mother';
                const createdMother = await this.prisma.member.create({ data: toCreateInput(member) });
                await this.prisma.member.update({
                    where: { id: principal.id },
                    data: { biologicalMotherId: createdMother.id },
                });
                break;
        }

        const result = await this.prisma.member.findUnique({ where: { id: parentId } });
        await this.auditLogs.create({ userId, entity: 'Member', entityId: parentId, action: 'create-related', newValues: createRelatedMemberDto as any });
        return result;
    }

    async deseaced(id: string, deathDate: string, userId: string) {
        const member = await this.prisma.member.findUnique({ where: { id } });
        if (!member) return null;
        if (member.deathDate) {
            throw new Error('Member is already marked as deceased');
        }
        const updated = await this.prisma.member.update({
            where: { id },
            data: {
                deathDate: deathDate,
                status: 'deceased',
            }
        });
        await this.auditLogs.create({ userId, entity: 'Member', entityId: id, action: 'deceased', oldValues: { status: member.status }, newValues: { deathDate, status: 'deceased' } });
        return updated;
    }

    async delete(id: string, userId: string) {
        const member = await this.prisma.member.findUnique({ where: { id } });
        if (!member) return null;
        const deleted = await this.prisma.member.delete({ where: { id } });
        await this.auditLogs.create({ userId, entity: 'Member', entityId: id, action: 'delete', oldValues: member as any });
        return deleted;
    }


    validateOrDefault(data: PaginationDataDto): PaginationDataDto {
        return {
            page: data.page ?? 1,
            itemsPerPage: data.itemsPerPage ?? 10,
            currentPage: data.currentPage ?? 1,
            orderBy: data.orderBy ?? 'surname',
            order: data.order ?? 'asc',
        }
    }
}
