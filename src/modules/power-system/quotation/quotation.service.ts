import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FixedPriceDetailsEntity } from './fixed-price-details.entity';
import { PriceDifferenceDetailsEntity } from './price-difference-details.entity';
import { QuotationEntity } from './quotation.entity';
import { ProportionSharingDetailsEntity } from './proportion-sharing-details.entity';
import type { QuotationListFilters } from './quotation.types';

export type QuotationTransactionManager = EntityManager;

export interface CreateQuotationParams {
  readonly contractId: number;
  readonly quoteTypeId: number;
  readonly greenElecAllow: boolean;
  readonly greenElecPrice: number | null;
  readonly tradeStartTime: string;
  readonly tradeEndTime: string;
  readonly totalElectricity: number;
  readonly monthlyElectricity: Record<string, number>;
  readonly electricityDeviation: number | null;
  readonly positiveDeviationRatio: number | null;
  readonly positiveDeviationPrice: number | null;
  readonly negativeDeviationRatio: number | null;
  readonly negativeDeviationPrice: number | null;
  readonly standardCurveMethod: boolean;
  readonly curveModifyDays: number | null;
  readonly curveDeviation: number | null;
  readonly curvePositiveRatio: number | null;
  readonly curvePositivePrice: number | null;
  readonly curveNegativeRatio: number | null;
  readonly curveNegativePrice: number | null;
  readonly createdBy: string;
}

export interface CreateFixedPriceDetailsParams {
  readonly quotationId: number;
  readonly fixedPriceRatio: number;
  readonly marketTransactionPrice: number | null;
  readonly priceLimit: number | null;
  readonly createdBy: string;
}

export interface CreateProportionSharingDetailsParams {
  readonly quotationId: number;
  readonly psPropSharingRatio: number;
  readonly psDistRefPrice: number | null;
  readonly psLongTermTransRatio: number | null;
  readonly psPartyAPropBelowLongTerm: number | null;
  readonly psPartyBPropBelowLongTerm: number | null;
  readonly psPartyAPropAboveLongTerm: number | null;
  readonly psPartyBPropAboveLongTerm: number | null;
  readonly psMonthlyBidRatio: number | null;
  readonly psPartyAPropBelowMonthlyBid: number | null;
  readonly psPartyBPropBelowMonthlyBid: number | null;
  readonly psPartyAPropAboveMonthlyBid: number | null;
  readonly psPartyBPropAboveMonthlyBid: number | null;
  readonly psAgentProcRatio: number | null;
  readonly psPartyAPropBelowAgentProc: number | null;
  readonly psPartyBPropBelowAgentProc: number | null;
  readonly psPartyAPropAboveAgentProc: number | null;
  readonly psPartyBPropAboveAgentProc: number | null;
  readonly psIntraMonthRatio: number | null;
  readonly psPartyAPropBelowIntraMonth: number | null;
  readonly psPartyBPropBelowIntraMonth: number | null;
  readonly psPartyAPropAboveIntraMonth: number | null;
  readonly psPartyBPropAboveIntraMonth: number | null;
  readonly psLongTermTransLimit: number | null;
  readonly psMonthlyBidLimit: number | null;
  readonly psAgentProcLimit: number | null;
  readonly psIntraMonthLimit: number | null;
  readonly createdBy: string;
}

export interface CreatePriceDifferenceDetailsParams {
  readonly quotationId: number;
  readonly pdPriceDiffFlucRatio: number;
  readonly pdLongTermTransRatio: number | null;
  readonly pdLongTermTransAvgPrice: number | null;
  readonly pdLongTermTransDirection: boolean;
  readonly pdMonthlyBidRatio: number | null;
  readonly pdMonthlyBidClearPrice: number | null;
  readonly pdMonthlyBidDirection: boolean;
  readonly pdAgentProcRatio: number | null;
  readonly pdAgentAvgPrice: number | null;
  readonly pdAgentDirection: boolean;
  readonly pdIntraMonthRatio: number | null;
  readonly pdIntraMonthAvgPrice: number | null;
  readonly pdIntraMonthDirection: boolean;
  readonly pdLongTermTransLimit: number | null;
  readonly pdMonthlyBidLimit: number | null;
  readonly pdAgentProcLimit: number | null;
  readonly pdIntraMonthLimit: number | null;
  readonly createdBy: string;
}

export interface UpdateQuotationParams {
  readonly quoteTypeId?: number;
  readonly greenElecAllow?: boolean;
  readonly greenElecPrice?: number | null;
  readonly tradeStartTime?: string;
  readonly tradeEndTime?: string;
  readonly totalElectricity?: number;
  readonly monthlyElectricity?: Record<string, number>;
  readonly electricityDeviation?: number | null;
  readonly positiveDeviationRatio?: number | null;
  readonly positiveDeviationPrice?: number | null;
  readonly negativeDeviationRatio?: number | null;
  readonly negativeDeviationPrice?: number | null;
  readonly standardCurveMethod?: boolean;
  readonly curveModifyDays?: number | null;
  readonly curveDeviation?: number | null;
  readonly curvePositiveRatio?: number | null;
  readonly curvePositivePrice?: number | null;
  readonly curveNegativeRatio?: number | null;
  readonly curveNegativePrice?: number | null;
  readonly updatedBy: string;
}

export interface UpdateFixedPriceDetailsParams {
  readonly fixedPriceRatio?: number;
  readonly marketTransactionPrice?: number | null;
  readonly priceLimit?: number | null;
  readonly updatedBy: string;
}

export interface UpdateProportionSharingDetailsParams {
  readonly psPropSharingRatio?: number;
  readonly psDistRefPrice?: number | null;
  readonly psLongTermTransRatio?: number | null;
  readonly psPartyAPropBelowLongTerm?: number | null;
  readonly psPartyBPropBelowLongTerm?: number | null;
  readonly psPartyAPropAboveLongTerm?: number | null;
  readonly psPartyBPropAboveLongTerm?: number | null;
  readonly psMonthlyBidRatio?: number | null;
  readonly psPartyAPropBelowMonthlyBid?: number | null;
  readonly psPartyBPropBelowMonthlyBid?: number | null;
  readonly psPartyAPropAboveMonthlyBid?: number | null;
  readonly psPartyBPropAboveMonthlyBid?: number | null;
  readonly psAgentProcRatio?: number | null;
  readonly psPartyAPropBelowAgentProc?: number | null;
  readonly psPartyBPropBelowAgentProc?: number | null;
  readonly psPartyAPropAboveAgentProc?: number | null;
  readonly psPartyBPropAboveAgentProc?: number | null;
  readonly psIntraMonthRatio?: number | null;
  readonly psPartyAPropBelowIntraMonth?: number | null;
  readonly psPartyBPropBelowIntraMonth?: number | null;
  readonly psPartyAPropAboveIntraMonth?: number | null;
  readonly psPartyBPropAboveIntraMonth?: number | null;
  readonly psLongTermTransLimit?: number | null;
  readonly psMonthlyBidLimit?: number | null;
  readonly psAgentProcLimit?: number | null;
  readonly psIntraMonthLimit?: number | null;
  readonly updatedBy: string;
}

export interface UpdatePriceDifferenceDetailsParams {
  readonly pdPriceDiffFlucRatio?: number;
  readonly pdLongTermTransRatio?: number | null;
  readonly pdLongTermTransAvgPrice?: number | null;
  readonly pdLongTermTransDirection?: boolean;
  readonly pdMonthlyBidRatio?: number | null;
  readonly pdMonthlyBidClearPrice?: number | null;
  readonly pdMonthlyBidDirection?: boolean;
  readonly pdAgentProcRatio?: number | null;
  readonly pdAgentAvgPrice?: number | null;
  readonly pdAgentDirection?: boolean;
  readonly pdIntraMonthRatio?: number | null;
  readonly pdIntraMonthAvgPrice?: number | null;
  readonly pdIntraMonthDirection?: boolean;
  readonly pdLongTermTransLimit?: number | null;
  readonly pdMonthlyBidLimit?: number | null;
  readonly pdAgentProcLimit?: number | null;
  readonly pdIntraMonthLimit?: number | null;
  readonly updatedBy: string;
}

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(QuotationEntity)
    private readonly quotationRepository: Repository<QuotationEntity>,
    @InjectRepository(FixedPriceDetailsEntity)
    private readonly fixedPriceDetailsRepository: Repository<FixedPriceDetailsEntity>,
    @InjectRepository(ProportionSharingDetailsEntity)
    private readonly proportionSharingDetailsRepository: Repository<ProportionSharingDetailsEntity>,
    @InjectRepository(PriceDifferenceDetailsEntity)
    private readonly priceDifferenceDetailsRepository: Repository<PriceDifferenceDetailsEntity>,
  ) {}

  async findQuotationByContractAndType(
    filters: QuotationListFilters,
  ): Promise<QuotationEntity | null> {
    return await this.getQuotationRepository()
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.fixedPriceDetails', 'fixedPriceDetails')
      .leftJoinAndSelect('quotation.proportionSharingDetails', 'proportionSharingDetails')
      .leftJoinAndSelect('quotation.priceDifferenceDetails', 'priceDifferenceDetails')
      .where('quotation.contractId = :contractId', { contractId: filters.contractId })
      .andWhere('quotation.quoteTypeId = :quoteTypeId', { quoteTypeId: filters.quoteTypeId })
      .getOne();
  }

  async findQuotationByContractId(
    contractId: number,
    manager?: QuotationTransactionManager,
  ): Promise<QuotationEntity | null> {
    return await this.getQuotationRepository(manager)
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.fixedPriceDetails', 'fixedPriceDetails')
      .leftJoinAndSelect('quotation.proportionSharingDetails', 'proportionSharingDetails')
      .leftJoinAndSelect('quotation.priceDifferenceDetails', 'priceDifferenceDetails')
      .where('quotation.contractId = :contractId', { contractId })
      .orderBy('quotation.id', 'ASC')
      .getOne();
  }

  async createQuotation(
    params: CreateQuotationParams,
    manager?: QuotationTransactionManager,
  ): Promise<QuotationEntity> {
    const repository = this.getQuotationRepository(manager);
    const entity = repository.create({
      contractId: params.contractId,
      quoteTypeId: params.quoteTypeId,
      greenElecAllow: params.greenElecAllow,
      greenElecPrice: params.greenElecPrice,
      tradeStartTime: params.tradeStartTime,
      tradeEndTime: params.tradeEndTime,
      totalElectricity: params.totalElectricity,
      monthlyElectricity: params.monthlyElectricity,
      electricityDeviation: params.electricityDeviation,
      positiveDeviationRatio: params.positiveDeviationRatio,
      positiveDeviationPrice: params.positiveDeviationPrice,
      negativeDeviationRatio: params.negativeDeviationRatio,
      negativeDeviationPrice: params.negativeDeviationPrice,
      standardCurveMethod: params.standardCurveMethod,
      curveModifyDays: params.curveModifyDays,
      curveDeviation: params.curveDeviation,
      curvePositiveRatio: params.curvePositiveRatio,
      curvePositivePrice: params.curvePositivePrice,
      curveNegativeRatio: params.curveNegativeRatio,
      curveNegativePrice: params.curveNegativePrice,
      createdBy: params.createdBy,
      updatedBy: params.createdBy,
    });

    return await repository.save(entity);
  }

  async createFixedPriceDetails(
    params: CreateFixedPriceDetailsParams,
    manager?: QuotationTransactionManager,
  ): Promise<FixedPriceDetailsEntity> {
    const repository = this.getFixedPriceDetailsRepository(manager);
    return await repository.save(
      repository.create({
        quotationId: params.quotationId,
        fixedPriceRatio: params.fixedPriceRatio,
        marketTransactionPrice: params.marketTransactionPrice,
        priceLimit: params.priceLimit,
        createdBy: params.createdBy,
        updatedBy: params.createdBy,
      }),
    );
  }

  async createProportionSharingDetails(
    params: CreateProportionSharingDetailsParams,
    manager?: QuotationTransactionManager,
  ): Promise<ProportionSharingDetailsEntity> {
    const repository = this.getProportionSharingDetailsRepository(manager);
    return await repository.save(
      repository.create({
        quotationId: params.quotationId,
        psPropSharingRatio: params.psPropSharingRatio,
        psDistRefPrice: params.psDistRefPrice,
        psLongTermTransRatio: params.psLongTermTransRatio,
        psPartyAPropBelowLongTerm: params.psPartyAPropBelowLongTerm,
        psPartyBPropBelowLongTerm: params.psPartyBPropBelowLongTerm,
        psPartyAPropAboveLongTerm: params.psPartyAPropAboveLongTerm,
        psPartyBPropAboveLongTerm: params.psPartyBPropAboveLongTerm,
        psMonthlyBidRatio: params.psMonthlyBidRatio,
        psPartyAPropBelowMonthlyBid: params.psPartyAPropBelowMonthlyBid,
        psPartyBPropBelowMonthlyBid: params.psPartyBPropBelowMonthlyBid,
        psPartyAPropAboveMonthlyBid: params.psPartyAPropAboveMonthlyBid,
        psPartyBPropAboveMonthlyBid: params.psPartyBPropAboveMonthlyBid,
        psAgentProcRatio: params.psAgentProcRatio,
        psPartyAPropBelowAgentProc: params.psPartyAPropBelowAgentProc,
        psPartyBPropBelowAgentProc: params.psPartyBPropBelowAgentProc,
        psPartyAPropAboveAgentProc: params.psPartyAPropAboveAgentProc,
        psPartyBPropAboveAgentProc: params.psPartyBPropAboveAgentProc,
        psIntraMonthRatio: params.psIntraMonthRatio,
        psPartyAPropBelowIntraMonth: params.psPartyAPropBelowIntraMonth,
        psPartyBPropBelowIntraMonth: params.psPartyBPropBelowIntraMonth,
        psPartyAPropAboveIntraMonth: params.psPartyAPropAboveIntraMonth,
        psPartyBPropAboveIntraMonth: params.psPartyBPropAboveIntraMonth,
        psLongTermTransLimit: params.psLongTermTransLimit,
        psMonthlyBidLimit: params.psMonthlyBidLimit,
        psAgentProcLimit: params.psAgentProcLimit,
        psIntraMonthLimit: params.psIntraMonthLimit,
        createdBy: params.createdBy,
        updatedBy: params.createdBy,
      }),
    );
  }

  async createPriceDifferenceDetails(
    params: CreatePriceDifferenceDetailsParams,
    manager?: QuotationTransactionManager,
  ): Promise<PriceDifferenceDetailsEntity> {
    const repository = this.getPriceDifferenceDetailsRepository(manager);
    return await repository.save(
      repository.create({
        quotationId: params.quotationId,
        pdPriceDiffFlucRatio: params.pdPriceDiffFlucRatio,
        pdLongTermTransRatio: params.pdLongTermTransRatio,
        pdLongTermTransAvgPrice: params.pdLongTermTransAvgPrice,
        pdLongTermTransDirection: params.pdLongTermTransDirection,
        pdMonthlyBidRatio: params.pdMonthlyBidRatio,
        pdMonthlyBidClearPrice: params.pdMonthlyBidClearPrice,
        pdMonthlyBidDirection: params.pdMonthlyBidDirection,
        pdAgentProcRatio: params.pdAgentProcRatio,
        pdAgentAvgPrice: params.pdAgentAvgPrice,
        pdAgentDirection: params.pdAgentDirection,
        pdIntraMonthRatio: params.pdIntraMonthRatio,
        pdIntraMonthAvgPrice: params.pdIntraMonthAvgPrice,
        pdIntraMonthDirection: params.pdIntraMonthDirection,
        pdLongTermTransLimit: params.pdLongTermTransLimit,
        pdMonthlyBidLimit: params.pdMonthlyBidLimit,
        pdAgentProcLimit: params.pdAgentProcLimit,
        pdIntraMonthLimit: params.pdIntraMonthLimit,
        createdBy: params.createdBy,
        updatedBy: params.createdBy,
      }),
    );
  }

  async updateQuotation(
    quotation: QuotationEntity,
    params: UpdateQuotationParams,
    manager?: QuotationTransactionManager,
  ): Promise<QuotationEntity> {
    if (typeof params.quoteTypeId !== 'undefined') {
      quotation.quoteTypeId = params.quoteTypeId;
    }
    if (typeof params.greenElecAllow !== 'undefined') {
      quotation.greenElecAllow = params.greenElecAllow;
    }
    if (typeof params.greenElecPrice !== 'undefined') {
      quotation.greenElecPrice = params.greenElecPrice;
    }
    if (typeof params.tradeStartTime !== 'undefined') {
      quotation.tradeStartTime = params.tradeStartTime;
    }
    if (typeof params.tradeEndTime !== 'undefined') {
      quotation.tradeEndTime = params.tradeEndTime;
    }
    if (typeof params.totalElectricity !== 'undefined') {
      quotation.totalElectricity = params.totalElectricity;
    }
    if (typeof params.monthlyElectricity !== 'undefined') {
      quotation.monthlyElectricity = params.monthlyElectricity;
    }
    if (typeof params.electricityDeviation !== 'undefined') {
      quotation.electricityDeviation = params.electricityDeviation;
    }
    if (typeof params.positiveDeviationRatio !== 'undefined') {
      quotation.positiveDeviationRatio = params.positiveDeviationRatio;
    }
    if (typeof params.positiveDeviationPrice !== 'undefined') {
      quotation.positiveDeviationPrice = params.positiveDeviationPrice;
    }
    if (typeof params.negativeDeviationRatio !== 'undefined') {
      quotation.negativeDeviationRatio = params.negativeDeviationRatio;
    }
    if (typeof params.negativeDeviationPrice !== 'undefined') {
      quotation.negativeDeviationPrice = params.negativeDeviationPrice;
    }
    if (typeof params.standardCurveMethod !== 'undefined') {
      quotation.standardCurveMethod = params.standardCurveMethod;
    }
    if (typeof params.curveModifyDays !== 'undefined') {
      quotation.curveModifyDays = params.curveModifyDays;
    }
    if (typeof params.curveDeviation !== 'undefined') {
      quotation.curveDeviation = params.curveDeviation;
    }
    if (typeof params.curvePositiveRatio !== 'undefined') {
      quotation.curvePositiveRatio = params.curvePositiveRatio;
    }
    if (typeof params.curvePositivePrice !== 'undefined') {
      quotation.curvePositivePrice = params.curvePositivePrice;
    }
    if (typeof params.curveNegativeRatio !== 'undefined') {
      quotation.curveNegativeRatio = params.curveNegativeRatio;
    }
    if (typeof params.curveNegativePrice !== 'undefined') {
      quotation.curveNegativePrice = params.curveNegativePrice;
    }

    quotation.updatedAt = new Date();
    quotation.updatedBy = params.updatedBy;

    return await this.getQuotationRepository(manager).save(quotation);
  }

  async removeDetailsForQuoteType(
    quotationId: number,
    quoteTypeId: number,
    manager?: QuotationTransactionManager,
  ): Promise<void> {
    if (quoteTypeId === 1) {
      await this.getFixedPriceDetailsRepository(manager)
        .createQueryBuilder()
        .delete()
        .where('quotation_id = :quotationId', { quotationId })
        .execute();
      return;
    }
    if (quoteTypeId === 2) {
      await this.getProportionSharingDetailsRepository(manager)
        .createQueryBuilder()
        .delete()
        .where('quotation_id = :quotationId', { quotationId })
        .execute();
      return;
    }
    if (quoteTypeId === 3) {
      await this.getPriceDifferenceDetailsRepository(manager)
        .createQueryBuilder()
        .delete()
        .where('quotation_id = :quotationId', { quotationId })
        .execute();
    }
  }

  async upsertFixedPriceDetails(
    quotationId: number,
    params: UpdateFixedPriceDetailsParams,
    manager?: QuotationTransactionManager,
  ): Promise<FixedPriceDetailsEntity> {
    const repository = this.getFixedPriceDetailsRepository(manager);
    const entity =
      (await repository.findOne({
        where: { quotationId },
      })) ??
      repository.create({
        quotationId,
        fixedPriceRatio: 100,
        createdBy: params.updatedBy,
        updatedBy: params.updatedBy,
      });

    if (typeof params.fixedPriceRatio !== 'undefined') {
      entity.fixedPriceRatio = params.fixedPriceRatio;
    }
    if (typeof params.marketTransactionPrice !== 'undefined') {
      entity.marketTransactionPrice = params.marketTransactionPrice;
    }
    if (typeof params.priceLimit !== 'undefined') {
      entity.priceLimit = params.priceLimit;
    }

    entity.updatedAt = new Date();
    entity.updatedBy = params.updatedBy;
    if (!entity.createdBy) {
      entity.createdBy = params.updatedBy;
    }

    return await repository.save(entity);
  }

  async upsertProportionSharingDetails(
    quotationId: number,
    params: UpdateProportionSharingDetailsParams,
    manager?: QuotationTransactionManager,
  ): Promise<ProportionSharingDetailsEntity> {
    const repository = this.getProportionSharingDetailsRepository(manager);
    const entity =
      (await repository.findOne({
        where: { quotationId },
      })) ??
      repository.create({
        quotationId,
        psPropSharingRatio: 100,
        createdBy: params.updatedBy,
        updatedBy: params.updatedBy,
      });

    if (typeof params.psPropSharingRatio !== 'undefined') {
      entity.psPropSharingRatio = params.psPropSharingRatio;
    }
    if (typeof params.psDistRefPrice !== 'undefined') {
      entity.psDistRefPrice = params.psDistRefPrice;
    }
    if (typeof params.psLongTermTransRatio !== 'undefined') {
      entity.psLongTermTransRatio = params.psLongTermTransRatio;
    }
    if (typeof params.psPartyAPropBelowLongTerm !== 'undefined') {
      entity.psPartyAPropBelowLongTerm = params.psPartyAPropBelowLongTerm;
    }
    if (typeof params.psPartyBPropBelowLongTerm !== 'undefined') {
      entity.psPartyBPropBelowLongTerm = params.psPartyBPropBelowLongTerm;
    }
    if (typeof params.psPartyAPropAboveLongTerm !== 'undefined') {
      entity.psPartyAPropAboveLongTerm = params.psPartyAPropAboveLongTerm;
    }
    if (typeof params.psPartyBPropAboveLongTerm !== 'undefined') {
      entity.psPartyBPropAboveLongTerm = params.psPartyBPropAboveLongTerm;
    }
    if (typeof params.psMonthlyBidRatio !== 'undefined') {
      entity.psMonthlyBidRatio = params.psMonthlyBidRatio;
    }
    if (typeof params.psPartyAPropBelowMonthlyBid !== 'undefined') {
      entity.psPartyAPropBelowMonthlyBid = params.psPartyAPropBelowMonthlyBid;
    }
    if (typeof params.psPartyBPropBelowMonthlyBid !== 'undefined') {
      entity.psPartyBPropBelowMonthlyBid = params.psPartyBPropBelowMonthlyBid;
    }
    if (typeof params.psPartyAPropAboveMonthlyBid !== 'undefined') {
      entity.psPartyAPropAboveMonthlyBid = params.psPartyAPropAboveMonthlyBid;
    }
    if (typeof params.psPartyBPropAboveMonthlyBid !== 'undefined') {
      entity.psPartyBPropAboveMonthlyBid = params.psPartyBPropAboveMonthlyBid;
    }
    if (typeof params.psAgentProcRatio !== 'undefined') {
      entity.psAgentProcRatio = params.psAgentProcRatio;
    }
    if (typeof params.psPartyAPropBelowAgentProc !== 'undefined') {
      entity.psPartyAPropBelowAgentProc = params.psPartyAPropBelowAgentProc;
    }
    if (typeof params.psPartyBPropBelowAgentProc !== 'undefined') {
      entity.psPartyBPropBelowAgentProc = params.psPartyBPropBelowAgentProc;
    }
    if (typeof params.psPartyAPropAboveAgentProc !== 'undefined') {
      entity.psPartyAPropAboveAgentProc = params.psPartyAPropAboveAgentProc;
    }
    if (typeof params.psPartyBPropAboveAgentProc !== 'undefined') {
      entity.psPartyBPropAboveAgentProc = params.psPartyBPropAboveAgentProc;
    }
    if (typeof params.psIntraMonthRatio !== 'undefined') {
      entity.psIntraMonthRatio = params.psIntraMonthRatio;
    }
    if (typeof params.psPartyAPropBelowIntraMonth !== 'undefined') {
      entity.psPartyAPropBelowIntraMonth = params.psPartyAPropBelowIntraMonth;
    }
    if (typeof params.psPartyBPropBelowIntraMonth !== 'undefined') {
      entity.psPartyBPropBelowIntraMonth = params.psPartyBPropBelowIntraMonth;
    }
    if (typeof params.psPartyAPropAboveIntraMonth !== 'undefined') {
      entity.psPartyAPropAboveIntraMonth = params.psPartyAPropAboveIntraMonth;
    }
    if (typeof params.psPartyBPropAboveIntraMonth !== 'undefined') {
      entity.psPartyBPropAboveIntraMonth = params.psPartyBPropAboveIntraMonth;
    }
    if (typeof params.psLongTermTransLimit !== 'undefined') {
      entity.psLongTermTransLimit = params.psLongTermTransLimit;
    }
    if (typeof params.psMonthlyBidLimit !== 'undefined') {
      entity.psMonthlyBidLimit = params.psMonthlyBidLimit;
    }
    if (typeof params.psAgentProcLimit !== 'undefined') {
      entity.psAgentProcLimit = params.psAgentProcLimit;
    }
    if (typeof params.psIntraMonthLimit !== 'undefined') {
      entity.psIntraMonthLimit = params.psIntraMonthLimit;
    }

    entity.updatedAt = new Date();
    entity.updatedBy = params.updatedBy;
    if (!entity.createdBy) {
      entity.createdBy = params.updatedBy;
    }

    return await repository.save(entity);
  }

  async upsertPriceDifferenceDetails(
    quotationId: number,
    params: UpdatePriceDifferenceDetailsParams,
    manager?: QuotationTransactionManager,
  ): Promise<PriceDifferenceDetailsEntity> {
    const repository = this.getPriceDifferenceDetailsRepository(manager);
    const entity =
      (await repository.findOne({
        where: { quotationId },
      })) ??
      repository.create({
        quotationId,
        pdPriceDiffFlucRatio: 100,
        pdLongTermTransDirection: true,
        pdMonthlyBidDirection: true,
        pdAgentDirection: true,
        pdIntraMonthDirection: true,
        createdBy: params.updatedBy,
        updatedBy: params.updatedBy,
      });

    if (typeof params.pdPriceDiffFlucRatio !== 'undefined') {
      entity.pdPriceDiffFlucRatio = params.pdPriceDiffFlucRatio;
    }
    if (typeof params.pdLongTermTransRatio !== 'undefined') {
      entity.pdLongTermTransRatio = params.pdLongTermTransRatio;
    }
    if (typeof params.pdLongTermTransAvgPrice !== 'undefined') {
      entity.pdLongTermTransAvgPrice = params.pdLongTermTransAvgPrice;
    }
    if (typeof params.pdLongTermTransDirection !== 'undefined') {
      entity.pdLongTermTransDirection = params.pdLongTermTransDirection;
    }
    if (typeof params.pdMonthlyBidRatio !== 'undefined') {
      entity.pdMonthlyBidRatio = params.pdMonthlyBidRatio;
    }
    if (typeof params.pdMonthlyBidClearPrice !== 'undefined') {
      entity.pdMonthlyBidClearPrice = params.pdMonthlyBidClearPrice;
    }
    if (typeof params.pdMonthlyBidDirection !== 'undefined') {
      entity.pdMonthlyBidDirection = params.pdMonthlyBidDirection;
    }
    if (typeof params.pdAgentProcRatio !== 'undefined') {
      entity.pdAgentProcRatio = params.pdAgentProcRatio;
    }
    if (typeof params.pdAgentAvgPrice !== 'undefined') {
      entity.pdAgentAvgPrice = params.pdAgentAvgPrice;
    }
    if (typeof params.pdAgentDirection !== 'undefined') {
      entity.pdAgentDirection = params.pdAgentDirection;
    }
    if (typeof params.pdIntraMonthRatio !== 'undefined') {
      entity.pdIntraMonthRatio = params.pdIntraMonthRatio;
    }
    if (typeof params.pdIntraMonthAvgPrice !== 'undefined') {
      entity.pdIntraMonthAvgPrice = params.pdIntraMonthAvgPrice;
    }
    if (typeof params.pdIntraMonthDirection !== 'undefined') {
      entity.pdIntraMonthDirection = params.pdIntraMonthDirection;
    }
    if (typeof params.pdLongTermTransLimit !== 'undefined') {
      entity.pdLongTermTransLimit = params.pdLongTermTransLimit;
    }
    if (typeof params.pdMonthlyBidLimit !== 'undefined') {
      entity.pdMonthlyBidLimit = params.pdMonthlyBidLimit;
    }
    if (typeof params.pdAgentProcLimit !== 'undefined') {
      entity.pdAgentProcLimit = params.pdAgentProcLimit;
    }
    if (typeof params.pdIntraMonthLimit !== 'undefined') {
      entity.pdIntraMonthLimit = params.pdIntraMonthLimit;
    }

    entity.updatedAt = new Date();
    entity.updatedBy = params.updatedBy;
    if (!entity.createdBy) {
      entity.createdBy = params.updatedBy;
    }

    return await repository.save(entity);
  }

  // 保留显式 repository getter，方便后续同子域写接口复用。
  getQuotationRepository(manager?: QuotationTransactionManager): Repository<QuotationEntity> {
    return manager ? manager.getRepository(QuotationEntity) : this.quotationRepository;
  }

  getFixedPriceDetailsRepository(
    manager?: QuotationTransactionManager,
  ): Repository<FixedPriceDetailsEntity> {
    return manager
      ? manager.getRepository(FixedPriceDetailsEntity)
      : this.fixedPriceDetailsRepository;
  }

  getProportionSharingDetailsRepository(
    manager?: QuotationTransactionManager,
  ): Repository<ProportionSharingDetailsEntity> {
    return manager
      ? manager.getRepository(ProportionSharingDetailsEntity)
      : this.proportionSharingDetailsRepository;
  }

  getPriceDifferenceDetailsRepository(
    manager?: QuotationTransactionManager,
  ): Repository<PriceDifferenceDetailsEntity> {
    return manager
      ? manager.getRepository(PriceDifferenceDetailsEntity)
      : this.priceDifferenceDetailsRepository;
  }
}
