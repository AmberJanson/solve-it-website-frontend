import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TechniqueService } from '../../services/technique.service';
import { Technique } from '../../models/technique.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-technique-detail',
  imports: [CommonModule],
  templateUrl: './technique-detail.html',
  styleUrls: ['./technique-detail.scss'],
})
export class TechniqueDetail  implements OnInit{

  public technique: Technique | null = null;
  public techniqueId?: string;
  public loadingTechnique: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private techniqueService: TechniqueService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('techniqueId');
    if (!id) return;

    this.techniqueId = id;

    this.techniqueService.getTechniquesById(id)
      .subscribe({next: (technique) => {
          this.technique = technique;
          this.loadingTechnique = false;
          this.cdr.markForCheck();
      }, error: err => {
          console.error("Error occurred: ", err)
          this.technique = null;
          this.loadingTechnique = false;
          this.cdr.markForCheck();
      }
    });
  }
}
