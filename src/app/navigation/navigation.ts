import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { Mitigation } from '../models/mitigation.model';
import { Category } from '../models/category.model';
import { Technique } from '../models/technique.model';
import { Weakness } from '../models/weakness.model';
import { CategoryService } from '../services/category.service';
import { TechniqueService } from '../services/technique.service';
import { WeaknessService } from '../services/weakness.service';
import { MitigationService } from '../services/mitigation.service';
import { catchError, forkJoin, of } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class Navigation implements OnInit {
  public searchTerm: string = '';
  public dropdownVisible = false;
  
  public allSearchItems: any[] = [];
  public filteredItems: any[] = [];
  public allSearchCategories: Category[] = [];
  public allSearchTechniques: Technique[] = [];
  public allSearchWeaknesses: Weakness[] = [];
  public allSearchMitigations: Mitigation[] = [];
  public loadingAllSearchLists: boolean = true;

  constructor (
    private categoryService: CategoryService,
    private techniqueService: TechniqueService,
    private weaknessService: WeaknessService,
    private mitigationService: MitigationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadAllSearchLists();
  }

  loadAllSearchLists() {
    forkJoin({
      categories: this.categoryService.getAllCategories().pipe(catchError(err => {
        console.error("Error occured with categories: ", err);
        return of([]);
      })),
      techniques: this.techniqueService.getAllTechniques().pipe(catchError(err => {
        console.error("Error occured with techniques: ", err);
        return of([]);
      })),
      weaknesses: this.weaknessService.getAllWeaknesses().pipe(catchError(err => {
        console.error("Error occured with weaknesses: ", err);
        return of([]);
      })),
      mitigations: this.mitigationService.getAllMitigations().pipe(catchError(err => {
        console.error("Error occured with mitigations: ", err);
        return of([]);
      }))
    }).subscribe(({ categories, techniques, weaknesses, mitigations}) => {
      this.allSearchCategories = categories ? Object.values(categories) : [];
      this.allSearchTechniques = techniques ? Object.values(techniques) : [];
      this.allSearchWeaknesses = weaknesses ? Object.values(weaknesses) : [];
      this.allSearchMitigations = mitigations ? Object.values(mitigations) : [];

      this.allSearchItems = [...this.allSearchCategories, ...this.allSearchTechniques, ...this.allSearchWeaknesses, ...this.allSearchMitigations];
      this.loadingAllSearchLists = false;
      this.cdr.markForCheck();
    })
  }

  onSearchChange(term: string) {
    this.searchTerm = term;

    if (!term) {
      this.filteredItems = []
      this.dropdownVisible = false;
      return;
    }

    this.filteredItems = this.allSearchItems
      .filter(item => item.name && item.name.toLowerCase().includes(term.toLowerCase()))
      .slice(0, 5);

    this.dropdownVisible = true;
  }

  onFocus() {
    if (this.searchTerm) {
      this.dropdownVisible = true;
    }
  }

  getNameParts(itemName: string): {text: string, highlight: boolean}[] {
    if (!this.searchTerm) return [{ text: itemName, highlight: false}];

    const term = this.searchTerm.toLowerCase();
    const lowerName = itemName.toLowerCase();
    const parts: { text: string, highlight: boolean}[] = [];
    let currentIndex = 0;

    while (currentIndex < itemName.length) {
      const matchIndex = lowerName.indexOf(term, currentIndex);
      if (matchIndex == -1) {
        parts.push({ text: itemName.slice(currentIndex), highlight: false });
        break;
      }

      if (matchIndex > currentIndex) {
        parts.push({ text: itemName.slice(currentIndex, matchIndex), highlight: false });
      }

      parts.push({ text: itemName.slice(matchIndex, matchIndex + term.length), highlight: true });
      currentIndex = matchIndex + term.length;
    }

    return parts;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const searchBar = document.querySelector('.navbar-search');
    if (searchBar && !searchBar.contains(target)) {
      this.dropdownVisible = false;
    } else if (searchBar && searchBar.contains(target)) {
      this.dropdownVisible = true;
    }
  }

  onItemClick(event: MouseEvent) {
    event.stopPropagation();

    setTimeout(() => {
      this.searchTerm = '';
      this.filteredItems = [];
      this.dropdownVisible = false;
    }, 0);
  }

}
