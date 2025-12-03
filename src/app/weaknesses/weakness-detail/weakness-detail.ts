import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Weakness } from '../../models/weakness.model';
import { ActivatedRoute } from '@angular/router';
import { WeaknessService } from '../../services/weakness.service';

@Component({
  selector: 'app-weakness-detail',
  imports: [],
  templateUrl: './weakness-detail.html',
  styleUrl: './weakness-detail.scss'
})
export class WeaknessDetail implements OnInit{
  
  public weakness: Weakness | null = null;
  public weaknessId?: string;
  public loadingWeakness: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private weaknessService: WeaknessService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('weaknessId');
    if (!id) return;

    this.weaknessId = id;

    this.weaknessService.getWeaknessById(id)
        .subscribe({next: (weakness) => {
          this.weakness = weakness;
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
