import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Mitigation } from '../../models/mitigation.model';
import { ActivatedRoute } from '@angular/router';
import { MitigationService } from '../../services/mitigation.service';

@Component({
  selector: 'app-mitigation-detail',
  imports: [],
  templateUrl: './mitigation-detail.html',
  styleUrl: './mitigation-detail.scss'
})
export class MitigationDetail implements OnInit {

  public mitigation: Mitigation | null = null;
  public mitigationId?: string;
  public loadingMitigation: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private mitigationService: MitigationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('mitigationId');
    if (!id) return;

    this.mitigationId = id;

    this.mitigationService.getMitigationById(id)
      .subscribe({next: (mitigation) => {
        this.mitigation = mitigation;
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
