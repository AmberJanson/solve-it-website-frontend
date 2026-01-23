import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Weakness } from '../../models/weakness.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WeaknessService } from '../../services/weakness.service';
import { Mitigation } from '../../models/mitigation.model';
import { MitigationService } from '../../services/mitigation.service';
import { SharedPathService } from '../../services/shared-path.service';
import { FormsModule } from '@angular/forms';
import { PdfService } from '../../services/create-pdf.service';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';

@Component({
  selector: 'app-weakness-detail',
  imports: [RouterLink, FormsModule, MatTooltipModule],
  templateUrl: './weakness-detail.html',
  styleUrl: './weakness-detail.scss'
})
export class WeaknessDetail implements OnInit{

  public pathList: string[] = [];
  public isChecked = false;

  public positionOption: TooltipPosition = 'right';
  
  public weakness: Weakness | null = null;
  public weaknessId?: string;
  public mitigations: Mitigation[] = [];
  public loadingWeakness: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private weaknessService: WeaknessService,
    private mitigationService: MitigationService,
    private sharedPathService: SharedPathService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('weaknessId');
      if (!id) return;

      this.weaknessId = id;
      this.loadWeakness(id);
    })

    this.isChecked = this.pdfService.hasPdfItemList(this.weakness?.id + ": " + this.weakness?.name);

    this.sharedPathService.list$.subscribe(list => {
      this.pathList = list;
    });
  }

  loadWeakness(id: string) {
    this.loadingWeakness = true;
    this.mitigations = [];

    this.weaknessService.getWeaknessById(id)
      .subscribe({next: (weakness) => {
        this.weakness = weakness;
        this.isChecked = this.pdfService.hasPdfItemList(this.weakness.id + ": " + this.weakness.name);
        this.addWeaknessPathToService();

        let completed = 0;

        if (weakness.mitigations.length >= 1) {
          for (const mitigationId of weakness.mitigations) {
            this.mitigationService.getMitigationById(mitigationId)
              .subscribe({next: (mitigation) => {
                this.mitigations.push(mitigation);
                completed++
                if (completed === weakness.mitigations.length) {
                  this.mitigations.sort((a, b) => a.id.localeCompare(b.id));
                  this.loadingWeakness = false;
                  this.cdr.markForCheck();
                }
              }, error: err => {
                console.error("Error occurred: ", err)
                completed++
                if (completed === weakness.mitigations.length) {
                  this.mitigations.sort((a, b) => a.id.localeCompare(b.id));
                  this.loadingWeakness = false;
                  this.cdr.markForCheck();
                }
              }
            })
          }
        }

        this.loadingWeakness = false;
        this.cdr.markForCheck();
      }, error: err => {
        console.error("Error occurred: ", err);
        this.weakness = null;
        this.loadingWeakness = false;
        this.cdr.markForCheck();
      }
    });
  }

  public addWeaknessPathToService() {
    this.sharedPathService.setNextItem(`${this.weaknessId}: ${this.weakness?.name}`);

    const lastItem = this.sharedPathService.getLastItem();

    if (lastItem != `${this.weaknessId}: ${this.weakness?.name}`) {
      this.sharedPathService.addItem(`${this.weaknessId}: ${this.weakness?.name}`)
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
      this.pdfService.addToPdfItemList(this.weakness?.id + ": " + this.weakness?.name);

    } else {
      this.pdfService.removeFromPdfItemList(this.weakness?.id + ": " + this.weakness?.name);
    }
  }
}
