import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Mitigation } from '../../models/mitigation.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MitigationService } from '../../services/mitigation.service';
import { Technique } from '../../models/technique.model';
import { TechniqueService } from '../../services/technique.service';
import { SharedPathService } from '../../services/shared-path.service';
import { PdfService } from '../../services/create-pdf.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mitigation-detail',
  imports: [RouterLink, FormsModule],
  templateUrl: './mitigation-detail.html',
  styleUrl: './mitigation-detail.scss'
})
export class MitigationDetail implements OnInit {

  public pathList: string[] = [];
  public isChecked = false;

  public mitigation: Mitigation | null = null;
  public mitigationId?: string;
  public technique: Technique | null = null;
  public loadingMitigation: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private mitigationService: MitigationService,
    private techniqueService: TechniqueService,
    private sharedPathService: SharedPathService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('mitigationId');
      if (!id) return;

      this.mitigationId = id;
      this.loadMitigation(id);
    })

    this.isChecked = this.pdfService.hasPdfItemList(this.mitigation?.id + ": " + this.mitigation?.name);

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
        this.isChecked = this.pdfService.hasPdfItemList(this.mitigation.id + ": " + this.mitigation.name);
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

  onClickPath(path: string, index: number): void {
    const toHome = 
      !path.startsWith('C1') &&
      !path.startsWith('T1') &&
      !path.startsWith('W1') &&
      !path.startsWith('M1') &&
      !/^Techniques$/.test(path) &&
      !/^Weaknesses$/.test(path) &&
      !/^Mitigations$/.test(path);
    
      if (toHome) {
        this.sharedPathService.setSelectedView(path);
      }

      this.resetListPartialy(index);
  }
  
  onCheckboxChange(checked: boolean) {
    if (checked) {
      this.pdfService.addToPdfItemList(this.mitigation?.id + ": " + this.mitigation?.name);

    } else {
      this.pdfService.removeFromPdfItemList(this.mitigation?.id + ": " + this.mitigation?.name);
    }
  }

  scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  }
}
