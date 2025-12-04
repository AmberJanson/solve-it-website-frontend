import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Mitigation } from '../../models/mitigation.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MitigationService } from '../../services/mitigation.service';
import { Technique } from '../../models/technique.model';
import { TechniqueService } from '../../services/technique.service';

@Component({
  selector: 'app-mitigation-detail',
  imports: [RouterLink],
  templateUrl: './mitigation-detail.html',
  styleUrl: './mitigation-detail.scss'
})
export class MitigationDetail implements OnInit {

  public mitigation: Mitigation | null = null;
  public mitigationId?: string;
  public technique: Technique | null = null;
  public loadingMitigation: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private mitigationService: MitigationService,
    private techniqueService: TechniqueService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('mitigationId');
      if (!id) return;

      this.mitigationId = id;
      this.loadMitigation(id);
    })
  }

  loadMitigation(id: string) {
    this.loadingMitigation = true;
    this.technique = null;

    this.mitigationService.getMitigationById(id)
      .subscribe({next: (mitigation) => {
        this.mitigation = mitigation;

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
}
