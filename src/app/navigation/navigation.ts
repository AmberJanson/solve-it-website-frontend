import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { Mitigation } from '../models/mitigation.model';
import { Category } from '../models/category.model';
import { Technique } from '../models/technique.model';
import { Weakness } from '../models/weakness.model';
import { CategoryService } from '../services/category.service';
import { TechniqueService } from '../services/technique.service';
import { WeaknessService } from '../services/weakness.service';
import { MitigationService } from '../services/mitigation.service';
import { catchError, filter, forkJoin, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SharedPathService } from '../services/shared-path.service';

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

  public menuOpen = false;
  
  public allSearchItems: any[] = [];
  public filteredItems: any[] = [];
  public allSearchCategories: Category[] = [];
  public allSearchTechniques: Technique[] = [];
  public allSearchWeaknesses: Weakness[] = [];
  public allSearchMitigations: Mitigation[] = [];
  public loadingAllSearchLists: boolean = true;

  private lastUrlIndex = 0;
  private historyStack: string[] = [];

  constructor (
    private categoryService: CategoryService,
    private techniqueService: TechniqueService,
    private weaknessService: WeaknessService,
    private mitigationService: MitigationService,
    private sharedPathService: SharedPathService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { 
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
        .subscribe((event: NavigationStart) => {
          if (this.sharedPathService.getList().length == 0) {
            this.historyStack = [];
            this.lastUrlIndex = 0;
          }
          if (event.navigationTrigger === 'popstate') {
            const lastIndex = this.historyStack.indexOf(event.url);
            if (lastIndex < this.lastUrlIndex) {
              this.historyStack.slice(0, -1);
              this.sharedPathService.removeLastItem();
            }
            this.lastUrlIndex = lastIndex;
          } else if (event.navigationTrigger === 'imperative') {
            this.historyStack.push(event.url);
            this.lastUrlIndex = this.historyStack.length - 1;
          }
        })
  }

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

  public resetPath() {
    this.sharedPathService.resetList();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const searchBar = document.querySelector('.navbar-search');
    const navbar = document.querySelector('.navbar')
    if (searchBar && !searchBar.contains(target)) {
      this.dropdownVisible = false;
    } else if (searchBar && searchBar.contains(target)) {
      this.dropdownVisible = true;
    }

    if (navbar && !navbar.contains(target)) {
      this.menuOpen = false;
    }
  }

  onItemClick(item: any, event: MouseEvent) {
    event.stopPropagation();

    this.searchTerm = '';
    this.filteredItems = [];
    this.dropdownVisible = false;

    const route =
      item.id.startsWith('C') ? '/categories/' + item.id :
      item.id.startsWith('T') ? '/techniques/' + item.id :
      item.id.startsWith('W') ? '/weaknesses/' + item.id :
      item.id.startsWith('M') ? '/mitigations/' + item.id :
      '/other/' + item.id;

      this.router.navigate([route]);

      if (route != this.router.url) {
        this.resetPath();
      }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}
