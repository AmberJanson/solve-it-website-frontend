import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Mitigation } from '../models/mitigation.model';
import { MitigationService } from '../services/mitigation.service';

@Component({
  selector: 'app-mitigations',
  imports: [RouterLink],
  templateUrl: './mitigations.html',
  styleUrl: './mitigations.scss'
})
export class Mitigations implements OnInit {
  
  public mitigationList: Mitigation[] =[];
  public loadingMitigations: boolean = true;

  constructor(
    private mitigationService: MitigationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadMitigations();
  }

  loadMitigations() {
    this.mitigationList = [];

    this.mitigationService.getAllMitigations()
      .subscribe({next: (mitigations) => {
        this.mitigationList = Object.values(mitigations);
        this.loadingMitigations = false;
        this.cdr.markForCheck();
      }, error: err => {
        console.error("Error: ", err)
        this.loadingMitigations = false;
        this.cdr.markForCheck();
      }
    });
  }
}
