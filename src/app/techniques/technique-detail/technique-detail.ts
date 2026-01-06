import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TechniqueService } from '../../services/technique.service';
import { Technique } from '../../models/technique.model';
import { WeaknessService } from '../../services/weakness.service';
import { Weakness } from '../../models/weakness.model';
import { SharedPathService } from '../../services/shared-path.service';
import { FormsModule } from '@angular/forms';
import { PdfService } from '../../services/create-pdf.service';

@Component({
  selector: 'app-technique-detail',
  imports: [RouterLink, FormsModule],
  templateUrl: './technique-detail.html',
  styleUrls: ['./technique-detail.scss'],
})
export class TechniqueDetail  implements OnInit{

  public pathList: string[] = [];
  public isChecked = false;

  public technique: Technique | null = null;
  public subtechniques: Technique[] = [];
  public weaknesses: Weakness[] = [];
  public techniqueId?: string;
  public loadingTechnique: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private techniqueService: TechniqueService,
    private weaknessService: WeaknessService,
    private sharedPathService: SharedPathService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('techniqueId');
      if (!id) return;

      this.techniqueId = id;
      this.loadTechnique(id);
    });

    this.isChecked = this.pdfService.hasPdfItemList(this.technique?.id + ": " + this.technique?.name);

    this.sharedPathService.list$.subscribe(list => {
      this.pathList = list;
    });
  }

  loadTechnique(id: string) {
    this.loadingTechnique = true;
    this.subtechniques = [];
    this.weaknesses = [];

    this.techniqueService.getTechniquesById(id)
      .subscribe({next: (technique) => {
          this.technique = technique;
          this.isChecked = this.pdfService.hasPdfItemList(this.technique.id + ": " + this.technique.name);
          this.addTechniquePathToService();

          if (technique.subtechniques.length >= 1) {
            for (const subtechniqueId of technique.subtechniques) {
              this.techniqueService.getTechniquesById(subtechniqueId)
                .subscribe({next: (subtechnique) => {
                  this.subtechniques.push(subtechnique);
                  this.loadingTechnique = false;
                  this.cdr.markForCheck();
                }, error: err => {
                  console.error("Error occurred: ", err);
                  this.loadingTechnique = false;
                  this.cdr.markForCheck();
                }
              });
            }
          }

          if (technique.weaknesses.length >= 1) {
            for (const weaknessId of technique.weaknesses) {
              this.weaknessService.getWeaknessById(weaknessId)
                .subscribe({next: (weakness) => {
                  this.weaknesses.push(weakness);
                  this.loadingTechnique = false;
                  this.cdr.markForCheck();
                }, error: err => {
                  console.error("Error occurred: ", err);
                  this.loadingTechnique = false;
                  this.cdr.markForCheck();
                }
              })
            }
          }

          this.loadingTechnique = false;
          this.cdr.markForCheck();
      }, error: err => {
          console.error("Error occurred: ", err);
          this.technique = null;
          this.loadingTechnique = false;
          this.cdr.markForCheck();
      }
    });
  }

  public addTechniquePathToService() {
    this.sharedPathService.setNextItem(`${this.techniqueId}: ${this.technique?.name}`);

    const lastItem = this.sharedPathService.getLastItem();

    if (lastItem != `${this.techniqueId}: ${this.technique?.name}`) {
      this.sharedPathService.addItem(`${this.techniqueId}: ${this.technique?.name}`)
    }
  }

  public resetListPartialy(index: number) {
    let list = this.sharedPathService.getList();

    while ((list.length - 1) >= index) {
      this.sharedPathService.removeLastItem();
      list = this.sharedPathService.getList();
    }
  }

  onCheckboxChange(checked: boolean) {
    if (checked) {
      this.pdfService.addToPdfItemList(this.technique?.id + ": " + this.technique?.name);

    } else {
      this.pdfService.removeFromPdfItemList(this.technique?.id + ": " + this.technique?.name);
    }
  }
}
