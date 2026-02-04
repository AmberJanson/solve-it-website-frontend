import { Injectable } from "@angular/core";
import jsPDF from "jspdf";

@Injectable({
    providedIn: 'root'
})
export class PdfService {

    public allData: any[] = [];
    public pdfItemList: Map<string, string> = new Map();

    public setAllData(data: any[]) {
        this.allData = data;
    }

    public addToPdfItemList(itemKey: string, itemValue: string) {
        this.pdfItemList.set(itemKey, itemValue);
    }

    public removeFromPdfItemList(key: string) {
        this.pdfItemList.delete(key);
    }

    public resetPdfItemList() {
        this.pdfItemList.clear();
    }

    public hasPdfItemList(key: string): boolean {
        return this.pdfItemList.has(key);
    }

    public getPdfItemList(): string[] {
        return Array.from(this.pdfItemList.keys());
    }

    createPdf() {
        const doc = new jsPDF();
        let x = 10;
        let y = 10;
        const pageWidth = doc.internal.pageSize.getWidth() - 20;
        const lineHeight = 8;
        const stepSpacing = 10;
        const pageMargin = 10;
        const pageHeight = doc.internal.pageSize.getHeight();
        const itemList = Array.from(this.pdfItemList);

        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute:'2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        };
        const timestamp = now.toLocaleString(undefined, options);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.text(`Created on: ${timestamp}`, pageMargin, y);
        y += lineHeight + 2;
        
        doc.setFontSize(16);
        itemList.forEach(([key, value], index) => {
            const numberText = `${index + 1}) `;
            const itemText = key;

            doc.setFontSize(16);

            const numberWidth = doc.getTextWidth(numberText);
            const availableWidth = pageWidth - numberWidth;
            const lines: string[] = doc.splitTextToSize(itemText, availableWidth);

            if (y + lines.length * lineHeight > pageHeight - pageMargin) {
                doc.addPage();
                y = pageMargin;
            }

            lines.forEach((line: string, i: number) => {
                if (i === 0) {
                    doc.setFont('helvetica', 'bold');
                    doc.text(numberText, x, y);

                    doc.setFont('helvetica', 'normal');
                    doc.text(line, x + numberWidth, y);
                } else {
                    doc.setFont('helvetica', 'normal');
                    doc.text(line, x + numberWidth, y);
                }

                y += lineHeight;
            });

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(12);

            const valueIndent = x + numberWidth + 5;
            const valueLines: string[] = doc.splitTextToSize(
                value,
                pageWidth - valueIndent
            );

            valueLines.forEach((valueLine: string) => {
                if (y + lineHeight > pageHeight - pageMargin) {
                    doc.addPage();
                    y = pageMargin;
                }

                doc.text(valueLine, valueIndent, y);
                y += lineHeight;
            })

            y += stepSpacing - lineHeight + 10;
        });

        itemList.forEach(([itemPage]) => {
            if (!itemPage.includes(':')) {
                return;
            }

            doc.addPage();
            let yDetail = pageMargin;

            const cleanId = itemPage.split(':')[0].trim();

            const dataItem = this.allData.find(item => item.id === cleanId);

            if (!dataItem) {
                doc.text(`No data found for id: ${cleanId}`, pageMargin, yDetail);
            }

            Object.keys(dataItem).forEach((key) => {
                if (yDetail + lineHeight * 3 > pageHeight - pageMargin) {
                    doc.addPage();
                    yDetail = pageMargin;
                }

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.text(key, pageMargin, yDetail);
                yDetail += 2;
                
                doc.setLineWidth(0.5);
                doc.line(pageMargin, yDetail, pageMargin + pageWidth, yDetail);
                yDetail += lineHeight;

                let value = dataItem[key];
                let isEmpty = false;
                let entity = ''

                if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                    if (dataItem.id.startsWith('M') && key === 'technique') {
                        value = 'There is no technique linked to this mitigation.';
                    } else {
                        if (dataItem.id.startsWith('C')) {
                            entity = 'category';
                        } else if (dataItem.id.startsWith('T')) {
                            entity = 'technique';
                        } else if (dataItem.id.startsWith('W')) {
                            entity = 'weakness';
                        } else if (dataItem.id.startsWith('M')) {
                            entity = 'mitigation';
                        }
                        value = `No ${key} for this ${entity} are known yet.`;
                    }
                    isEmpty = true;
                }

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12);
                
                if (Array.isArray(value)) {
                    value.forEach((item: string) => {
                        const wrappedLines = doc.splitTextToSize(`• ${item}`, pageWidth - 5);
                        wrappedLines.forEach((line: string) => {
                            if (yDetail + lineHeight > pageHeight - pageMargin) {
                                doc.addPage();
                                yDetail = pageMargin;
                            }
                            doc.text(line, pageMargin + 5, yDetail);
                            yDetail += lineHeight;
                        })
                    })
                } else {
                    const wrappedLines = doc.splitTextToSize(String(value), pageWidth);
                    wrappedLines.forEach((line: string, i: number) => {
                        if (yDetail + lineHeight > pageHeight - pageMargin) {
                            doc.addPage();
                            yDetail = pageMargin;
                        }

                        if (isEmpty && i === 0) {
                            const size = 4;
                            doc.setDrawColor(255, 0, 0);
                            doc.triangle(
                                pageMargin, yDetail + size - 3.5,
                                pageMargin + size, yDetail + size - 3.5,
                                pageMargin + size / 2, yDetail - 3.5,
                            );
                            doc.setDrawColor(0, 0, 0);

                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(7);
                            doc.setTextColor(255, 0, 0);
                            doc.text('!', pageMargin + size / 2 - 0.36, yDetail - 3.4 + size*0.8);

                            doc.setFont('helvetica', 'normal');
                            doc.setFontSize(12);
                            doc.setTextColor(0, 0, 0);
                            doc.text(line, pageMargin + 8, yDetail);
                        } else {
                            doc.text(line, pageMargin, yDetail);
                        }

                        yDetail += lineHeight;
                    });
                }
                yDetail += stepSpacing;
            })
        })

        doc.save('Items.pdf')
    }
}