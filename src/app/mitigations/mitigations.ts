import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Mitigation } from '../models/mitigation.model';
import { MitigationService } from '../services/mitigation.service';
import { FormsModule } from '@angular/forms';
import { SharedPathService } from '../services/shared-path.service';

@Component({
  selector: 'app-mitigations',
  imports: [RouterLink, FormsModule],
  templateUrl: './mitigations.html',
  styleUrl: './mitigations.scss'
})
export class Mitigations implements OnInit {

  public filtersOpen = false;

  public pathList: string[] = [];
  
  public allMitigations: Mitigation[] = [];
  public mitigationList: Mitigation[] = [];
  public loadingMitigations: boolean = true;
  public selectedSort = 'idAsc';
  public selectedFilters: { [key: string]: any } = {
    technique: '',
    references: ''
  }

  constructor(
    private mitigationService: MitigationService,
    private sharedPathService: SharedPathService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.sharedPathService.resetList();
    this.sharedPathService.addItem('Mitigations');

    this.loadMitigations();

    this.sharedPathService.list$.subscribe(list => {
      this.pathList = list;
    });
  }

  loadMitigations() {
    this.mitigationList = [];

    this.mitigationService.getAllMitigations()
      .subscribe({next: (mitigations) => {
        this.allMitigations = Object.values(mitigations);
        this.mitigationList = [...this.allMitigations];
        this.loadingMitigations = false;
        this.applyFiltersAndSort();
        this.cdr.markForCheck();
      }, error: err => {
        console.error("Error: ", err)
        this.loadingMitigations = false;
        this.cdr.markForCheck();
      }
    });
  }

  private isPresent(value: any): boolean {
    if (value == null || value == undefined) return false;
    if (typeof value == 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  applyFiltersAndSort() {
    this.mitigationList = this.allMitigations.filter(mitigation => {
      for (let key of ['technique', 'references']) {
        const filterValue = this.selectedFilters[key] as keyof typeof this.selectedFilters;
        if (key == 'technique') {
          if (filterValue == 'linked' && !this.isPresent((mitigation as any)[key])) return false;
          if (filterValue == 'not linked' && this.isPresent((mitigation as any)[key])) return false;
        } else if (key == 'references') {
          if (filterValue == 'present' && !this.isPresent((mitigation as any)[key])) return false;
          if (filterValue == 'absent' && this.isPresent((mitigation as any)[key])) return false;
        }
     }

      return true;
    });

    this.sortList();
  }

  sortList() {
    switch (this.selectedSort) {
      case 'idAsc':
        this.mitigationList.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case 'idDesc':
        this.mitigationList.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'nameAsc':
        this.mitigationList.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        this.mitigationList.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
  }

  toggleFilters() {
    this.filtersOpen = !this.filtersOpen;
  }
}
