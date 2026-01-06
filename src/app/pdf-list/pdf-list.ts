import { Component, OnInit } from '@angular/core';
import { PdfService } from '../services/create-pdf.service';
import { SharedPathService } from '../services/shared-path.service';

@Component({
  selector: 'app-pdf-list',
  imports: [],
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
}
