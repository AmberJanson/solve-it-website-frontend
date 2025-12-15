import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Weakness } from '../../models/weakness.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WeaknessService } from '../../services/weakness.service';
import { Mitigation } from '../../models/mitigation.model';
import { MitigationService } from '../../services/mitigation.service';
import { SharedPathService } from '../../services/shared-path.service';

@Component({
  selector: 'app-weakness-detail',
  imports: [RouterLink],
  templateUrl: './weakness-detail.html',
  styleUrl: './weakness-detail.scss'
})
export class WeaknessDetail implements OnInit{

  public pathList: string[] = [];
  
  public weakness: Weakness | null = null;
  public weaknessId?: string;
  public mitigations: Mitigation[] = [];
  public loadingWeakness: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private weaknessService: WeaknessService,
    private mitigationService: MitigationService,
    private sharedPathService: SharedPathService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('weaknessId');
      if (!id) return;

      this.weaknessId = id;
      this.loadWeakness(id);
    })

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
        this.addWeaknessPathToService();

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
}
