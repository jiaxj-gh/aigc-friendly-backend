export interface PartyAListFilters {
  readonly companyName?: string;
  readonly creditCode?: string;
}

export interface PowerSupplyView {
  readonly psId: number;
  readonly partyAId: number;
  readonly powerSupplyAddress: string;
  readonly powerSupplyNumber: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string | null;
  readonly updatedBy: string | null;
}

export interface PartyAView {
  readonly partyAId: number;
  readonly companyName: string;
  readonly creditCode: string | null;
  readonly companyAddress: string | null;
  readonly legalPerson: string | null;
  readonly depositoryBank: string | null;
  readonly bankAccountNo: string | null;
  readonly contactEmail: string | null;
  readonly contactPerson: string | null;
  readonly contactPhone: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string | null;
  readonly updatedBy: string | null;
  readonly powerSupplyInfo: PowerSupplyView[];
}
