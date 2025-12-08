import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Technique } from '../models/technique.model';
import { TechniqueService } from '../services/technique.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-techniques',
  imports: [RouterLink, FormsModule],
  templateUrl: './techniques.html',
  styleUrl: './techniques.scss',
})
export class Techniques implements OnInit{

  private allTechniques: Technique[] = [];
  public techniqueList: Technique[] = [];
  public loadingTechniques: boolean = true;
  public selectedSort = 'idAsc';
  public selectedFilters: { [key: string]: any } = {
    description: '',
    synonyms: '',
    details: '',
    subtechniques: '',
    examples: '',
    weaknesses: '',
    CASE_output_classes: '',
    references: ''
  };

  constructor(
    private techniqueService: TechniqueService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadTechniques();
  }

  private loadTechniques() {
    this.techniqueList = [];

    this.techniqueService.getAllTechniques()
      .subscribe({next: (techniques) => {
        this.allTechniques = Object.values(techniques);
        this.techniqueList = [...this.allTechniques];
        this.loadingTechniques = false;
        this.applyFiltersAndSort();
        this.cdr.markForCheck();
      }, error: err => {
        console.error("Error occurred: ", err);
        this.loadingTechniques = false;
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

  applyFiltersAndSort() {
    this.techniqueList = this.allTechniques.filter(technique => {
      for (let key of ['description', 'synonyms', 'details', 'examples', 'references', 'CASE_output_classes']) {
        const filterValue = this.selectedFilters[key] as keyof typeof this.selectedFilters;
        if (filterValue == 'present' && !this.isPresent((technique as any)[key])) return false;
        if (filterValue == 'absent' && this.isPresent((technique as any)[key])) return false;
      }

      if (this.selectedFilters['weaknesses'] && !this.matchesRange(technique.weaknesses, this.selectedFilters['weaknesses'])) return false;
      if (this.selectedFilters['subtechniques'] && !this.matchesRange(technique.subtechniques, this.selectedFilters['subtechniques'])) return false;

      return true;
    });

    this.sortList();
  }

  sortList() {
    switch (this.selectedSort) {
      case 'idAsc':
        this.techniqueList.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case 'idDesc':
        this.techniqueList.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'nameAsc':
        this.techniqueList.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        this.techniqueList.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
  }
}
