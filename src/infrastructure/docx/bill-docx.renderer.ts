import { Injectable } from '@nestjs/common';
import type { BillDocxPayload } from '@modules/power-system/bill/bill.types';
import {
  type Document as XmlDocument,
  type Element as XmlElement,
  type Node as XmlNode,
  DOMParser,
  XMLSerializer,
} from '@xmldom/xmldom';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import PizZip from 'pizzip';

@Injectable()
export class BillDocxRenderer {
  async render(payload: BillDocxPayload): Promise<Buffer> {
    const templatePath = this.resolveTemplatePath();
    const templateBuffer = await readFile(templatePath);
    const zip = new PizZip(templateBuffer);
    const xml = zip.file('word/document.xml')?.asText();

    if (!xml) {
      throw new Error('报价单模板缺少 word/document.xml');
    }

    const parser = new DOMParser();
    const documentNode = parser.parseFromString(
      this.replaceSimplePlaceholders(xml, payload),
      'application/xml',
    );

    this.fillQuotaTable(documentNode, payload);

    const serializer = new XMLSerializer();
    zip.file('word/document.xml', serializer.serializeToString(documentNode));

    return zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
  }

  private resolveTemplatePath(): string {
    const fileName = 'template_bill.docx';
    const candidates = [
      path.resolve(process.cwd(), 'src/infrastructure/docx/templates/bills', fileName),
      path.resolve(process.cwd(), 'dist/infrastructure/docx/templates/bills', fileName),
    ];

    const matched = candidates.find((candidate) => existsSync(candidate));
    if (!matched) {
      throw new Error(`报价单模板文件不存在: ${fileName}`);
    }

    return matched;
  }

  private replaceSimplePlaceholders(xml: string, payload: BillDocxPayload): string {
    return xml
      .replaceAll('{party_a_company_name}', this.escapeXml(payload.partyAName))
      .replaceAll('{current_date}', this.escapeXml(this.formatCurrentDate()));
  }

  private fillQuotaTable(documentNode: XmlDocument, payload: BillDocxPayload): void {
    const tables = Array.from(documentNode.getElementsByTagName('w:tbl'));
    const targetTable = tables[0];
    if (!targetTable) {
      return;
    }

    const directRows = Array.from(targetTable.childNodes).filter(
      (node): node is XmlNode => node.nodeType === 1 && node.nodeName === 'w:tr',
    );
    const templateRow = directRows[1];
    if (!templateRow) {
      return;
    }

    for (let index = directRows.length - 1; index >= 1; index -= 1) {
      targetTable.removeChild(directRows[index]);
    }

    const items =
      payload.quotaInfo.length > 0 ? payload.quotaInfo : [{ quotaPrice: '', quotaType: '' }];

    items.forEach((item, index) => {
      const row = templateRow.cloneNode(true);
      targetTable.appendChild(row);
      this.fillQuotaRow(row, {
        sequenceNo: String(index + 1),
        quotaPrice: item.quotaPrice,
        quotaType: item.quotaType,
      });
    });
  }

  private fillQuotaRow(
    row: XmlNode,
    values: {
      readonly sequenceNo: string;
      readonly quotaPrice: string;
      readonly quotaType: string;
    },
  ): void {
    const cells = Array.from((row as XmlElement).getElementsByTagName('w:tc'));
    if (cells.length < 3) {
      return;
    }

    this.replaceCellText(cells[0], values.sequenceNo);
    this.replaceCellText(cells[1], values.quotaPrice);
    this.replaceCellText(cells[2], values.quotaType);
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

  private formatCurrentDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  }

  private escapeXml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  }
}
