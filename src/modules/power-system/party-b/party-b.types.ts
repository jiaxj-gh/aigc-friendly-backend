export interface PartyBListFilters {
  readonly configName?: string;
  readonly companyName?: string;
  readonly isDefault?: boolean;
}

export interface PartyBView {
  readonly partyBId: number;
  readonly configName: string;
  readonly companyName: string;
  readonly creditCode: string;
  readonly companyAddress: string;
  readonly legalPerson: string;
  readonly contactPerson: string;
  readonly contactPhone: string;
  readonly contactEmail: string;
  readonly depositoryBank: string;
  readonly bankAccountNo: string;
  readonly hotLine: string;
  readonly isDefault: boolean;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string | null;
  readonly updatedBy: string | null;
}
