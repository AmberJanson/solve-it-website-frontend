import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TechniqueService } from '../../services/technique.service';
import { Technique } from '../../models/technique.model';
import { WeaknessService } from '../../services/weakness.service';
import { Weakness } from '../../models/weakness.model';

@Component({
  selector: 'app-technique-detail',
  imports: [RouterLink],
  templateUrl: './technique-detail.html',
  styleUrls: ['./technique-detail.scss'],
})
export class TechniqueDetail  implements OnInit{

  public technique: Technique | null = null;
  public subtechniques: Technique[] = [];
  public weaknesses: Weakness[] = [];
  public techniqueId?: string;
  public loadingTechnique: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private techniqueService: TechniqueService,
    private weaknessService: WeaknessService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('techniqueId');
      if (!id) return;

      this.techniqueId = id;
      this.loadTechnique(id);
    })
  }

  loadTechnique(id: string) {
    this.loadingTechnique = true;
    this.subtechniques = [];
    this.weaknesses = [];

    this.techniqueService.getTechniquesById(id)
      .subscribe({next: (technique) => {
          this.technique = technique;

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
}
