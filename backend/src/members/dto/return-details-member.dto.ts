import { Member } from "../entities/member.entity";

export class ReturnDetailsMemberDto extends Member {
    partner!: Member | null;
    children!: Member[];
    biologicalFather!: Member | null;
    biologicalMother!: Member | null;
}
