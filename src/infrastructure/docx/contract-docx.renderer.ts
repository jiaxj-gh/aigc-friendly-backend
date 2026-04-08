import { Injectable } from '@nestjs/common';
import type { ContractDetailView } from '@modules/power-system/contract/contract.types';
import {
  DOMParser,
  type Element as XmlElement,
  type Node as XmlNode,
  XMLSerializer,
} from '@xmldom/xmldom';
import Docxtemplater from 'docxtemplater';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import PizZip from 'pizzip';
import placeholderMappingByTemplate from './templates/contracts/placeholder_mapping_by_template.json';

type TemplateKey = 'fixed_price' | 'proportion_sharing' | 'price_difference';

type PlaceholderMap = Record<string, string>;

type LegacyContractDetail = {
  readonly basic_info: {
    readonly contract_id: number;
    readonly contract_current_status: string;
    readonly created_at: string | null;
    readonly updated_at: string | null;
    readonly created_by: string | null;
    readonly updated_by: string | null;
    readonly is_active: boolean;
  };
  readonly contract_content: {
    readonly work_order_number: string | null;
    readonly confirmation_method: string;
    readonly party_a_contract_no: string;
    readonly party_b_contract_no: string;
    readonly submission_time: string | null;
    readonly confirmation_time: string | null;
    readonly contract_sign_date: string | null;
    readonly party_a_sign_date: string;
    readonly party_b_sign_date: string;
    readonly order_time: string | null;
    readonly sign_location: string;
    readonly additional_terms: string | null;
    readonly dispute_resolution_method: string;
    readonly filing_method: string;
    readonly filing_party: string;
    readonly party_b_termination_before30: number | null;
    readonly party_b_termination_other: number | null;
    readonly party_b_termination_active: number | null;
    readonly party_a_termination_before30: number | null;
    readonly party_a_termination_in30: number | null;
    readonly party_a_termination_active: number | null;
    readonly original_copies: number;
    readonly duplicate_copies: number;
    readonly party_a_id: number;
    readonly party_a_custom: boolean;
    readonly party_a_custom_company: string | null;
    readonly party_a_custom_credit_code: string | null;
    readonly party_a_custom_legal_person: string | null;
    readonly party_a_custom_address: string | null;
    readonly party_a_custom_bank: string | null;
    readonly party_a_custom_bank_account: string | null;
    readonly party_a_custom_contact_person: string | null;
    readonly party_a_custom_contact_phone: string | null;
    readonly party_b_id: number;
    readonly party_a: {
      readonly party_a_id: number;
      readonly company_name: string | null;
      readonly credit_code: string | null;
      readonly company_address: string | null;
      readonly legal_person: string | null;
      readonly depository_bank: string | null;
      readonly bank_account_no: string | null;
      readonly contact_email: string | null;
      readonly contact_person: string | null;
      readonly contact_phone: string | null;
      readonly power_supply_info: ReadonlyArray<{
        readonly ps_id: number;
        readonly power_supply_address: string;
        readonly power_supply_number: string;
      }>;
      readonly is_active: boolean;
      readonly created_at: string | null;
      readonly updated_at: string | null;
      readonly created_by: string | null;
      readonly updated_by: string | null;
    } | null;
    readonly party_b: {
      readonly party_b_id: number;
      readonly config_name: string;
      readonly company_name: string;
      readonly credit_code: string;
      readonly company_address: string;
      readonly legal_person: string;
      readonly contact_person: string;
      readonly contact_phone: string;
      readonly contact_email: string;
      readonly depository_bank: string;
      readonly bank_account_no: string;
      readonly hot_line: string;
      readonly is_active: boolean;
      readonly is_default: boolean;
      readonly created_at: string | null;
      readonly updated_at: string | null;
      readonly created_by: string | null;
      readonly updated_by: string | null;
    } | null;
    readonly quotation_info: {
      readonly quote_type_id: number | null;
      readonly quote_type: string | null;
      readonly trade_start_time: string | null;
      readonly trade_end_time: string | null;
      readonly total_electricity: number | null;
      readonly monthly_electricity: Record<string, number>;
      readonly green_elec_allow: boolean | null;
      readonly green_elec_price: number | null;
      readonly electricity_deviation: number | null;
      readonly positive_deviation_ratio: number | null;
      readonly positive_deviation_price: number | null;
      readonly negative_deviation_ratio: number | null;
      readonly negative_deviation_price: number | null;
      readonly standard_curve_method: boolean | null;
      readonly curve_modify_days: number | null;
      readonly curve_deviation: number | null;
      readonly curve_positive_ratio: number | null;
      readonly curve_positive_price: number | null;
      readonly curve_negative_ratio: number | null;
      readonly curve_negative_price: number | null;
      readonly quote_details: Record<string, boolean | number | null>;
    };
  };
};

type PlaceholderData = Record<string, string>;

const TEMPLATE_FILES: Record<TemplateKey, string> = {
  fixed_price: 'template_fixed_price.docx',
  proportion_sharing: 'template_proportion_sharing.docx',
  price_difference: 'template_price_difference.docx',
};

const SPACE_LENGTH_CONFIG = {
  date_time: 4,
  phone: 5,
  email: 7,
  address: 8,
  name_company: 5,
  account_bank: 7,
  number_code: 2,
  default: 2,
} as const;

@Injectable()
export class ContractDocxRenderer {
  async render(detail: ContractDetailView): Promise<Buffer> {
    const templateKey = this.resolveTemplateKey(detail);
    const templatePath = this.resolveTemplatePath(TEMPLATE_FILES[templateKey]);
    const templateBuffer = await readFile(templatePath);
    const zip = new PizZip(templateBuffer);
    const legacyDetail = this.toLegacyDetail(detail);
    const placeholderData = this.buildPlaceholderData(legacyDetail, templateKey);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: (part) => this.buildEmptyReplacement(`{${part.value}}`),
    });

    doc.render(placeholderData);

    this.fillMonthlyElectricityTable(
      doc.getZip(),
      legacyDetail.contract_content.quotation_info.monthly_electricity,
    );

    return doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
  }

  private resolveTemplateKey(detail: ContractDetailView): TemplateKey {
    switch (detail.contractContent.quotationInfo.quoteTypeId) {
      case 1:
        return 'fixed_price';
      case 2:
        return 'proportion_sharing';
      case 3:
        return 'price_difference';
      default:
        return 'fixed_price';
    }
  }

  private resolveTemplatePath(fileName: string): string {
    const candidatePaths = [
      path.resolve(process.cwd(), 'src/infrastructure/docx/templates/contracts', fileName),
      path.resolve(process.cwd(), 'dist/infrastructure/docx/templates/contracts', fileName),
    ];

    const matched = candidatePaths.find((candidate) => existsSync(candidate));
    if (!matched) {
      throw new Error(`合同模板文件不存在: ${fileName}`);
    }

    return matched;
  }

  private toLegacyDetail(detail: ContractDetailView): LegacyContractDetail {
    return {
      basic_info: {
        contract_id: detail.basicInfo.contractId,
        contract_current_status: detail.basicInfo.contractCurrentStatus,
        created_at: this.toIsoString(detail.basicInfo.createdAt),
        updated_at: this.toIsoString(detail.basicInfo.updatedAt),
        created_by: detail.basicInfo.createdBy,
        updated_by: detail.basicInfo.updatedBy,
        is_active: detail.basicInfo.isActive,
      },
      contract_content: {
        work_order_number: detail.contractContent.workOrderNumber,
        confirmation_method: detail.contractContent.confirmationMethod,
        party_a_contract_no: detail.contractContent.partyAContractNo,
        party_b_contract_no: detail.contractContent.partyBContractNo,
        submission_time: this.toIsoString(detail.contractContent.submissionTime),
        confirmation_time: this.toIsoString(detail.contractContent.confirmationTime),
        contract_sign_date: detail.contractContent.contractSignDate,
        party_a_sign_date: detail.contractContent.partyASignDate,
        party_b_sign_date: detail.contractContent.partyBSignDate,
        order_time: this.toIsoString(detail.contractContent.orderTime),
        sign_location: detail.contractContent.signLocation,
        additional_terms: detail.contractContent.additionalTerms,
        dispute_resolution_method: detail.contractContent.disputeResolutionMethod,
        filing_method: detail.contractContent.filingMethod,
        filing_party: detail.contractContent.filingParty,
        party_b_termination_before30: detail.contractContent.partyBTerminationBefore30,
        party_b_termination_other: detail.contractContent.partyBTerminationOther,
        party_b_termination_active: detail.contractContent.partyBTerminationActive,
        party_a_termination_before30: detail.contractContent.partyATerminationBefore30,
        party_a_termination_in30: detail.contractContent.partyATerminationIn30,
        party_a_termination_active: detail.contractContent.partyATerminationActive,
        original_copies: detail.contractContent.originalCopies,
        duplicate_copies: detail.contractContent.duplicateCopies,
        party_a_id: detail.contractContent.partyAId,
        party_a_custom: detail.contractContent.partyACustom,
        party_a_custom_company: detail.contractContent.partyACustomCompany,
        party_a_custom_credit_code: detail.contractContent.partyACustomCreditCode,
        party_a_custom_legal_person: detail.contractContent.partyACustomLegalPerson,
        party_a_custom_address: detail.contractContent.partyACustomAddress,
        party_a_custom_bank: detail.contractContent.partyACustomBank,
        party_a_custom_bank_account: detail.contractContent.partyACustomBankAccount,
        party_a_custom_contact_person: detail.contractContent.partyACustomContactPerson,
        party_a_custom_contact_phone: detail.contractContent.partyACustomContactPhone,
        party_b_id: detail.contractContent.partyBId,
        party_a: this.toLegacyPartyA(detail),
        party_b: this.toLegacyPartyB(detail),
        quotation_info: this.toLegacyQuotationInfo(detail),
      },
    };
  }

  private toLegacyPartyA(
    detail: ContractDetailView,
  ): LegacyContractDetail['contract_content']['party_a'] {
    if (!detail.contractContent.partyA) {
      return null;
    }

    return {
      party_a_id: detail.contractContent.partyA.partyAId,
      company_name: detail.contractContent.partyA.companyName,
      credit_code: detail.contractContent.partyA.creditCode,
      company_address: detail.contractContent.partyA.companyAddress,
      legal_person: detail.contractContent.partyA.legalPerson,
      depository_bank: detail.contractContent.partyA.depositoryBank,
      bank_account_no: detail.contractContent.partyA.bankAccountNo,
      contact_email: detail.contractContent.partyA.contactEmail,
      contact_person: detail.contractContent.partyA.contactPerson,
      contact_phone: detail.contractContent.partyA.contactPhone,
      power_supply_info: detail.contractContent.partyA.powerSupplyInfo.map((item) => ({
        ps_id: item.psId,
        power_supply_address: item.powerSupplyAddress,
        power_supply_number: item.powerSupplyNumber,
      })),
      is_active: detail.contractContent.partyA.isActive,
      created_at: this.toIsoString(detail.contractContent.partyA.createdAt),
      updated_at: this.toIsoString(detail.contractContent.partyA.updatedAt),
      created_by: detail.contractContent.partyA.createdBy,
      updated_by: detail.contractContent.partyA.updatedBy,
    };
  }

  private toLegacyPartyB(
    detail: ContractDetailView,
  ): LegacyContractDetail['contract_content']['party_b'] {
    if (!detail.contractContent.partyB) {
      return null;
    }

    return {
      party_b_id: detail.contractContent.partyB.partyBId,
      config_name: detail.contractContent.partyB.configName,
      company_name: detail.contractContent.partyB.companyName,
      credit_code: detail.contractContent.partyB.creditCode,
      company_address: detail.contractContent.partyB.companyAddress,
      legal_person: detail.contractContent.partyB.legalPerson,
      contact_person: detail.contractContent.partyB.contactPerson,
      contact_phone: detail.contractContent.partyB.contactPhone,
      contact_email: detail.contractContent.partyB.contactEmail,
      depository_bank: detail.contractContent.partyB.depositoryBank,
      bank_account_no: detail.contractContent.partyB.bankAccountNo,
      hot_line: detail.contractContent.partyB.hotLine,
      is_active: detail.contractContent.partyB.isActive,
      is_default: detail.contractContent.partyB.isDefault,
      created_at: this.toIsoString(detail.contractContent.partyB.createdAt),
      updated_at: this.toIsoString(detail.contractContent.partyB.updatedAt),
      created_by: detail.contractContent.partyB.createdBy,
      updated_by: detail.contractContent.partyB.updatedBy,
    };
  }

  private toLegacyQuotationInfo(
    detail: ContractDetailView,
  ): LegacyContractDetail['contract_content']['quotation_info'] {
    return {
      quote_type_id: detail.contractContent.quotationInfo.quoteTypeId,
      quote_type: detail.contractContent.quotationInfo.quoteType,
      trade_start_time: detail.contractContent.quotationInfo.tradeStartTime,
      trade_end_time: detail.contractContent.quotationInfo.tradeEndTime,
      total_electricity: detail.contractContent.quotationInfo.totalElectricity,
      monthly_electricity: detail.contractContent.quotationInfo.monthlyElectricity,
      green_elec_allow: detail.contractContent.quotationInfo.greenElecAllow,
      green_elec_price: detail.contractContent.quotationInfo.greenElecPrice,
      electricity_deviation: detail.contractContent.quotationInfo.electricityDeviation,
      positive_deviation_ratio: detail.contractContent.quotationInfo.positiveDeviationRatio,
      positive_deviation_price: detail.contractContent.quotationInfo.positiveDeviationPrice,
      negative_deviation_ratio: detail.contractContent.quotationInfo.negativeDeviationRatio,
      negative_deviation_price: detail.contractContent.quotationInfo.negativeDeviationPrice,
      standard_curve_method: detail.contractContent.quotationInfo.standardCurveMethod,
      curve_modify_days: detail.contractContent.quotationInfo.curveModifyDays,
      curve_deviation: detail.contractContent.quotationInfo.curveDeviation,
      curve_positive_ratio: detail.contractContent.quotationInfo.curvePositiveRatio,
      curve_positive_price: detail.contractContent.quotationInfo.curvePositivePrice,
      curve_negative_ratio: detail.contractContent.quotationInfo.curveNegativeRatio,
      curve_negative_price: detail.contractContent.quotationInfo.curveNegativePrice,
      quote_details: detail.contractContent.quotationInfo.quoteDetails,
    };
  }

  private buildPlaceholderData(
    detail: LegacyContractDetail,
    templateKey: TemplateKey,
  ): PlaceholderData {
    const placeholderMap = placeholderMappingByTemplate[templateKey] as PlaceholderMap;
    const data: PlaceholderData = {};

    for (const [placeholder, legacyPath] of Object.entries(placeholderMap)) {
      const rawValue = this.getNestedValue(detail, legacyPath);
      data[this.stripPlaceholderBraces(placeholder)] = this.formatValue(rawValue, legacyPath);
    }

    return {
      ...data,
      ...this.buildSpecialPlaceholderData(detail),
    };
  }

  private buildSpecialPlaceholderData(detail: LegacyContractDetail): PlaceholderData {
    const quotationInfo = detail.contract_content.quotation_info;
    const quoteDetails = quotationInfo.quote_details;
    const powerSupplyInfo = detail.contract_content.party_a?.power_supply_info ?? [];

    const result: PlaceholderData = {
      party_a_power_supply_addresses: powerSupplyInfo
        .map((item) => item.power_supply_address)
        .filter((item) => item.length > 0)
        .join('、'),
      party_a_power_supply_numbers: powerSupplyInfo
        .map((item) => item.power_supply_number)
        .filter((item) => item.length > 0)
        .join('、'),
      party_b_hot_line: detail.contract_content.party_b?.hot_line ?? '',
      order_time: detail.contract_content.order_time
        ? this.formatValue(detail.contract_content.order_time, 'contract_content.order_time')
        : ' ',
      contract_sign_date: detail.contract_content.contract_sign_date
        ? this.formatValue(
            detail.contract_content.contract_sign_date,
            'contract_content.contract_sign_date',
          )
        : ' ',
      quotation_info_standard_curve_method: quotationInfo.standard_curve_method ? '执行' : '不执行',
      long_term_trans_direction: this.resolveDirectionText(
        quoteDetails.pd_long_term_trans_direction,
      ),
      monthly_bid_direction: this.resolveDirectionText(quoteDetails.pd_monthly_bid_direction),
      agent_direction: this.resolveDirectionText(quoteDetails.pd_agent_direction),
      intra_month_direction: this.resolveDirectionText(quoteDetails.pd_intra_month_direction),
      agent_avg_price: this.formatDirectionalValue(quoteDetails.pd_agent_avg_price),
      monthly_bid_clear_price: this.formatDirectionalValue(quoteDetails.pd_monthly_bid_clear_price),
      intra_month_avg_price: this.formatDirectionalValue(quoteDetails.pd_intra_month_avg_price),
      long_term_trans_avg_price: this.formatDirectionalValue(
        quoteDetails.pd_long_term_trans_avg_price,
      ),
      dist_ref_price: this.formatValue(
        quoteDetails.ps_dist_ref_price,
        'contract_content.quotation_info.quote_details.ps_dist_ref_price',
      ),
      prop_sharing_ratio: this.formatValue(
        quoteDetails.ps_prop_sharing_ratio,
        'contract_content.quotation_info.quote_details.ps_prop_sharing_ratio',
      ),
      quotation_info_quote_details_green_electricity_price: this.formatValue(
        quotationInfo.green_elec_price,
        'contract_content.quotation_info.green_elec_price',
      ),
      work_order_number: detail.contract_content.work_order_number ?? '',
    };

    return result;
  }

  private resolveDirectionText(value: boolean | number | null | undefined): string {
    if (value === null || value === undefined) {
      return ' ';
    }
    return value ? '上浮' : '下浮';
  }

  private formatDirectionalValue(value: boolean | number | null | undefined): string {
    if (typeof value !== 'number') {
      return ' ';
    }

    return this.formatNumeric(value);
  }

  private fillMonthlyElectricityTable(
    zip: PizZip,
    monthlyElectricity: Record<string, number>,
  ): void {
    const xml = zip.file('word/document.xml')?.asText();
    if (!xml) {
      return;
    }

    const parser = new DOMParser();
    const documentNode = parser.parseFromString(xml, 'application/xml');
    const tables = Array.from(documentNode.getElementsByTagName('w:tbl'));
    const targetTable = tables.find((table) => this.isMonthlyElectricityTable(table));

    if (!targetTable) {
      return;
    }

    const rows = Array.from(targetTable.getElementsByTagName('w:tr'));
    if (rows.length < 2) {
      return;
    }

    const directRows = Array.from(targetTable.childNodes).filter(
      (node): node is XmlNode => node.nodeType === 1 && node.nodeName === 'w:tr',
    );
    const headerRow = directRows[0];
    const templateRow = directRows[1];
    if (!headerRow || !templateRow) {
      return;
    }

    for (let index = directRows.length - 1; index >= 1; index -= 1) {
      targetTable.removeChild(directRows[index]);
    }

    const entries = Object.entries(monthlyElectricity);
    if (entries.length === 0) {
      const emptyRow = templateRow.cloneNode(true);
      targetTable.appendChild(emptyRow);
      this.fillMonthlyElectricityRow(emptyRow, '', '');
    } else {
      for (const [yearMonth, electricity] of entries) {
        const row = templateRow.cloneNode(true);
        targetTable.appendChild(row);
        this.fillMonthlyElectricityRow(
          row,
          this.formatMonthLabel(yearMonth),
          this.formatNumeric(electricity),
        );
      }
    }

    const serializer = new XMLSerializer();
    zip.file('word/document.xml', serializer.serializeToString(documentNode));
  }

  private isMonthlyElectricityTable(table: XmlElement): boolean {
    const rows = Array.from(table.getElementsByTagName('w:tr'));
    if (rows.length === 0) {
      return false;
    }

    const headerTexts = this.getCellTexts(rows[0]);
    return (
      headerTexts.some((text) => text.includes('时间')) &&
      headerTexts.some((text) => text.includes('分月计划'))
    );
  }

  private fillMonthlyElectricityRow(row: XmlNode, month: string, electricity: string): void {
    const cells = Array.from((row as XmlElement).getElementsByTagName('w:tc'));
    if (cells.length < 2) {
      return;
    }

    this.replaceCellText(cells[0], month);
    this.replaceCellText(cells[1], electricity);
  }

  private getCellTexts(row: XmlElement): string[] {
    return Array.from(row.getElementsByTagName('w:tc')).map((cell) =>
      Array.from(cell.getElementsByTagName('w:t'))
        .map((node) => node.textContent ?? '')
        .join(''),
    );
  }

  private replaceCellText(cell: XmlElement, value: string): void {
    const textNodes = Array.from(cell.getElementsByTagName('w:t'));
    if (textNodes.length === 0) {
      return;
    }

    textNodes[0].textContent = value;
    for (let index = 1; index < textNodes.length; index += 1) {
      textNodes[index].textContent = '';
    }
  }

  private formatMonthLabel(yearMonth: string): string {
    const [, month] = yearMonth.split('-');
    if (!month) {
      return `${yearMonth}月`;
    }

    return `${Number(month)}月`;
  }

  private getNestedValue(data: unknown, legacyPath: string): unknown {
    return legacyPath.split('.').reduce<unknown>((current, key) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return null;
    }, data);
  }

  private formatValue(value: unknown, legacyPath: string): string {
    if (value === null || value === undefined) {
      return this.buildEmptyReplacement(`{${this.stripLegacyPathToPlaceholder(legacyPath)}}`);
    }

    if (this.isDateLikePath(legacyPath)) {
      return this.formatDateValue(value);
    }

    if (this.isNumericLikePath(legacyPath)) {
      if (typeof value === 'number') {
        return this.formatNumeric(value);
      }

      if (typeof value === 'string') {
        return value;
      }

      return '';
    }

    if (typeof value === 'boolean') {
      return value ? '是' : '否';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'bigint') {
      return String(value);
    }

    return '';
  }

  private isDateLikePath(legacyPath: string): boolean {
    return legacyPath.includes('date') || legacyPath.includes('time');
  }

  private isNumericLikePath(legacyPath: string): boolean {
    return (
      legacyPath.includes('price') ||
      legacyPath.includes('ratio') ||
      legacyPath.includes('electricity')
    );
  }

  private formatDateValue(value: unknown): string {
    if (typeof value !== 'string') {
      if (typeof value === 'number' || typeof value === 'bigint') {
        return String(value);
      }
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      return `${year}年${month}月${day}日`;
    }

    if (value.includes('T')) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}年${month}月${day}日 ${hours}:${minutes}`;
      }
    }

    return value;
  }

  private formatNumeric(value: number): string {
    const fixed = value.toFixed(10);
    return fixed.includes('.') ? fixed.replace(/0+$/u, '').replace(/\.$/u, '') : fixed;
  }

  private buildEmptyReplacement(placeholder: string): string {
    const spaceLength = this.getSpaceLength(placeholder);
    return `${' '.repeat(spaceLength)}\\${' '.repeat(spaceLength)}`;
  }

  private getSpaceLength(placeholder: string): number {
    const lower = placeholder.toLowerCase();
    const mappings: ReadonlyArray<readonly [ReadonlyArray<string>, number]> = [
      [['date', 'time'], SPACE_LENGTH_CONFIG.date_time],
      [['phone', 'contact_phone', 'hot_line'], SPACE_LENGTH_CONFIG.phone],
      [['email'], SPACE_LENGTH_CONFIG.email],
      [['address'], SPACE_LENGTH_CONFIG.address],
      [['name', 'company'], SPACE_LENGTH_CONFIG.name_company],
      [['account', 'bank'], SPACE_LENGTH_CONFIG.account_bank],
      [['number', 'no', 'code'], SPACE_LENGTH_CONFIG.number_code],
    ];

    for (const [keywords, length] of mappings) {
      if (keywords.some((keyword) => lower.includes(keyword))) {
        return length;
      }
    }

    return SPACE_LENGTH_CONFIG.default;
  }

  private stripPlaceholderBraces(placeholder: string): string {
    return placeholder.replace(/^\{|\}$/gu, '');
  }

  private stripLegacyPathToPlaceholder(legacyPath: string): string {
    return legacyPath.replace(/\./gu, '_');
  }

  private toIsoString(value: Date | null): string | null {
    return value ? value.toISOString() : null;
  }
}
