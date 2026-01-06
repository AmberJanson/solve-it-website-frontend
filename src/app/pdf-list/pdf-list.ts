import { Component, OnInit } from '@angular/core';
import { PdfService } from '../services/create-pdf.service';
import { SharedPathService } from '../services/shared-path.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pdf-list',
  imports: [RouterLink],
  templateUrl: './pdf-list.html',
  styleUrl: './pdf-list.scss',
})
export class PdfList implements OnInit {

  public pdfItemList: string[] = [];

  constructor (
    private sharedPathService: SharedPathService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.sharedPathService.resetList();

    this.pdfItemList = this.pdfService.getPdfItemList();
  }

  public removeItem(item: string) {
    this.pdfService.removeFromPdfItemList(item);
    this.pdfItemList = this.pdfService.getPdfItemList();
  }

  public removeAllFromList() {
    this.pdfService.resetPdfItemList();
    this.pdfItemList = [];
  }

  generatePDF() {
    this.pdfService.createPdf();
  }
}
