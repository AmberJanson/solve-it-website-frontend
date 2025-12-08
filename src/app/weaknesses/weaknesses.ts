import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Weakness } from '../models/weakness.model';
import { WeaknessService } from '../services/weakness.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-weaknesses',
  imports: [RouterLink, FormsModule],
  templateUrl: './weaknesses.html',
  styleUrl: './weaknesses.scss'
})
export class Weaknesses implements OnInit{

  private allWeaknesses: Weakness[] = [];
  public weaknessList: Weakness[] = [];
  public loadingWeaknesses: boolean = true;
  public selectedSort = 'idAsc';
  public selectedFilters: { [key: string]: any } = {
    details: '',
    risks: {
      "INCOMP": '',
      "INAC-EX": '',
      "INAC-AS": '',
      "INAC-ALT": '',
      "INAC-COR": '',
      "MISINT": ''
    },
    mitigations: '',
    references: ''
  };
  public riskTypes = [
    'INCOMP',
    'INAC-EX',
    'INAC-AS',
    'INAC-ALT',
    'INAC-COR',
    'MISINT'
  ]

  constructor(
    private weaknessService: WeaknessService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadWeaknesses();
  }

  loadWeaknesses() {
    this.weaknessList = [];

    this.weaknessService.getAllWeaknesses()
      .subscribe({next: (weaknesses) => {
        this.allWeaknesses = Object.values(weaknesses);
        this.weaknessList = [...this.allWeaknesses];
        this.loadingWeaknesses = false;
        this.applyFiltersAndSort();
        this.cdr.markForCheck();
      }, error: err => {
        console.error("Error occurred: ", err);
        this.loadingWeaknesses = false;
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

  private matchesRange(value: any[], range: string): boolean {
    if (!Array.isArray(value)) return false;
    const len = value.length;
    switch (range) {
      case '0': return len == 0;
      case '1-2': return len >= 1 && len <= 2;
      case '3-4': return len >= 3 && len <= 4;
      case '5+': return len >= 5;
      default: return true;
    }
  }

  private hasRisk(weakness: any, risk: string): boolean {
    if (!Array.isArray(weakness.risks)) return false;
    return weakness.risks.includes(risk);
  }

  applyFiltersAndSort() {
    this.weaknessList = this.allWeaknesses.filter(weakness => {
      for (let key of ['details', 'references']) {
        const filterValue = this.selectedFilters[key] as keyof typeof this.selectedFilters;
        if (filterValue == 'present' && !this.isPresent((weakness as any)[key])) return false;
        if (filterValue == 'absent' && this.isPresent((weakness as any)[key])) return false;
      }

      const riskFilters = this.selectedFilters['risks'];
      if (riskFilters) {
        for (const riskType of Object.keys(riskFilters)) {
          const riskFilterValue = riskFilters[riskType];

          if (riskFilterValue == 'present' && !this.hasRisk(weakness, riskType)) return false;
          if (riskFilterValue == 'absent' && this.hasRisk(weakness, riskType)) return false;
        }
      }


      if (this.selectedFilters['mitigations'] && !this.matchesRange(weakness.mitigations, this.selectedFilters['mitigations'])) return false;

      return true;
    });

    this.sortList();
  }

  sortList() {
    switch (this.selectedSort) {
      case 'idAsc':
        this.weaknessList.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case 'idDesc':
        this.weaknessList.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'nameAsc':
        this.weaknessList.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        this.weaknessList.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
  }
}
