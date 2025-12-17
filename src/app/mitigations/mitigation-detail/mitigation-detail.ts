import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Mitigation } from '../../models/mitigation.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MitigationService } from '../../services/mitigation.service';
import { Technique } from '../../models/technique.model';
import { TechniqueService } from '../../services/technique.service';
import { SharedPathService } from '../../services/shared-path.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-mitigation-detail',
  imports: [RouterLink],
  templateUrl: './mitigation-detail.html',
  styleUrl: './mitigation-detail.scss'
})
export class MitigationDetail implements OnInit {

  public pathList: string[] = [];

  public mitigation: Mitigation | null = null;
  public mitigationId?: string;
  public technique: Technique | null = null;
  public loadingMitigation: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private mitigationService: MitigationService,
    private techniqueService: TechniqueService,
    private sharedPathService: SharedPathService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('mitigationId');
      if (!id) return;

      this.mitigationId = id;
      this.loadMitigation(id);
    })

    this.sharedPathService.list$.subscribe(list => {
      this.pathList = list;
    });
  }

  loadMitigation(id: string) {
    this.loadingMitigation = true;
    this.technique = null;

    this.mitigationService.getMitigationById(id)
      .subscribe({next: (mitigation) => {
        this.mitigation = mitigation;
        this.addMitigationPathToService();

        if (mitigation.technique != null) {
          this.techniqueService.getTechniquesById(mitigation.technique)
            .subscribe({next: (technique) => {
              this.technique = technique;
              this.loadingMitigation = false;
              this.cdr.markForCheck();
            }, error: err => {
              console.error("Error occurred: ", err)
              this.loadingMitigation = false;
              this.cdr.markForCheck();
            }
          });
        }

        this.loadingMitigation = false;
        this.cdr.markForCheck();
      }, error: err => {
        console.error("Error occurred: ", err);
        this.mitigation = null;
        this.loadingMitigation = false;
        this.cdr.markForCheck();
      }
    });
  }

  public addMitigationPathToService() {
    this.sharedPathService.setNextItem(`${this.mitigationId}: ${this.mitigation?.name}`);

    const lastItem = this.sharedPathService.getLastItem();

    if (lastItem != `${this.mitigationId}: ${this.mitigation?.name}`) {
      this.sharedPathService.addItem(`${this.mitigationId}: ${this.mitigation?.name}`)
    }
  }

  public resetListPartialy(index: number) {
    let list = this.sharedPathService.getList();

    while ((list.length - 1) >= index) {
      this.sharedPathService.removeLastItem();
      list = this.sharedPathService.getList();
    }
  }

  generatePDF() {
    const doc = new jsPDF();
    let x = 10;
    let y = 10;
    const pageWidth = doc.internal.pageSize.getWidth() - 20;
    const lineHeight = 8;
    const stepSpacing = 10;
    const pageMargin = 10;
    const pageHeight = doc.internal.pageSize.getHeight();
    
    this.pathList.forEach((page, index) => {
      const numberText = `${index + 1}) `;
      const pageText = page;

      const numberWidth = doc.getTextWidth(numberText);
      const availableWidth = pageWidth - numberWidth;
      const lines: string[] = doc.splitTextToSize(pageText, availableWidth);

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

      y += stepSpacing - lineHeight;
    });

    doc.save('Path.pdf')
  }
}
