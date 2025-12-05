import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Weakness } from '../../models/weakness.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WeaknessService } from '../../services/weakness.service';
import { Mitigation } from '../../models/mitigation.model';
import { MitigationService } from '../../services/mitigation.service';

@Component({
  selector: 'app-weakness-detail',
  imports: [RouterLink],
  templateUrl: './weakness-detail.html',
  styleUrl: './weakness-detail.scss'
})
export class WeaknessDetail implements OnInit{
  
  public weakness: Weakness | null = null;
  public weaknessId?: string;
  public mitigations: Mitigation[] = [];
  public loadingWeakness: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private weaknessService: WeaknessService,
    private mitigationService: MitigationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('weaknessId');
      if (!id) return;

      this.weaknessId = id;
      this.loadWeakness(id);
    })
  }

  loadWeakness(id: string) {
    this.loadingWeakness = true;
    this.mitigations = [];

    this.weaknessService.getWeaknessById(id)
      .subscribe({next: (weakness) => {
        this.weakness = weakness;

        if (weakness.mitigations.length >= 1) {
          for (const mitigationId of weakness.mitigations) {
            this.mitigationService.getMitigationById(mitigationId)
              .subscribe({next: (mitigation) => {
                this.mitigations.push(mitigation);
                this.loadingWeakness = false;
                this.cdr.markForCheck();
              }, error: err => {
                console.error("Error occurred: ", err)
                this.loadingWeakness = false;
                this.cdr.markForCheck();
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
}
