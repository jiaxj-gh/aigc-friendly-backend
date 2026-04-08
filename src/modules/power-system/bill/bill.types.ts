export interface BillQuotaItem {
  readonly quotaPrice: string;
  readonly quotaType: string;
}

export interface BillDocxPayload {
  readonly partyAName: string;
  readonly quotaInfo: ReadonlyArray<BillQuotaItem>;
}
