import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Technique } from '../models/technique.model';
import { TechniqueService } from '../services/technique.service';
import { FormsModule } from '@angular/forms';
import { CategoryView } from '../models/category-view.model';
import { Category } from '../models/category.model';
import { CategoryViewService } from '../services/category-view.service';
import { CategoryService } from '../services/category.service';
import { catchError, forkJoin, of } from 'rxjs';
import { SharedPathService } from '../services/shared-path.service';

@Component({
  selector: 'app-techniques',
  imports: [RouterLink, FormsModule],
  templateUrl: './techniques.html',
  styleUrl: './techniques.scss',
})
export class Techniques implements OnInit{

  public filtersOpen = false;

  public pathList: string[] = [];

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

  public techniqueMap: { [techniqueId: string]: {view: CategoryView, categories: Category[]}[] } = {};

  constructor(
    private techniqueService: TechniqueService,
    private categoryViewService: CategoryViewService,
    private categoryService: CategoryService,
    private sharedPathService: SharedPathService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.sharedPathService.resetList();
    this.sharedPathService.addItem('Techniques');
    
    this.loadAllData();

    this.sharedPathService.list$.subscribe(list => {
      this.pathList = list;
    });
  }

  private loadAllData() {
    this.loadingTechniques = true;

    forkJoin({
      techniques: this.techniqueService.getAllTechniques().pipe(
        catchError(err => {
          console.error("Error occurred: ", err);
          return of([]);
        })
      ),
      views: this.categoryViewService.getAllCategoryViews().pipe(
        catchError(err => {
          console.error("Error occurred: ", err);
          return of([]);
        })
      ),
      categories: this.categoryService.getAllCategories().pipe(
        catchError(err => {
          console.error("Error occurred: ", err);
          return of([]);
        })
      )
    }).subscribe({
      next: ({ techniques, views, categories }) => {
        this.allTechniques = Object.values(techniques);
        this.techniqueList = [...this.allTechniques];

        const viewsArray = Object.values(views);
        const categoriesArray = Object.values(categories);

        const viewMap: { [id: string]: CategoryView } = {};
        viewsArray.forEach(view => viewMap[view.id] = view);

        const categoryMap: { [id: string]: Category } = {};
        categoriesArray.forEach(category => categoryMap[category.id] = category);

        const flatMap: { [techniqueId: string]: { view: CategoryView, category: Category}[] } = {};
        viewsArray.forEach(view => {
          view.categories.forEach(categoryId => {
            const category = categoryMap[categoryId];
            if (category) {
              category.techniques.forEach((techniqueId: string) => {
                if (!flatMap[techniqueId]) flatMap[techniqueId] = []; 
                flatMap[techniqueId].push({ view, category });
              });
            }
          });
        });

        this.techniqueMap = {};
        Object.entries(flatMap).forEach(([techniqueId, viewCategories]) => {
          const temp: { [viewId: string]: Category[] } = {};
          viewCategories.forEach(viewCategory => {
            if (!temp[viewCategory.view.id]) temp[viewCategory.view.id] = [];
            temp[viewCategory.view.id].push(viewCategory.category);
          });
          this.techniqueMap[techniqueId] = Object.entries(temp).map(([viewId, categories]) => ({
            view: viewCategories.find(viewCategory => viewCategory.view.id == viewId)!.view,
            categories
          }));
        });

        this.loadingTechniques = false;
        this.applyFiltersAndSort();
        this.cdr.markForCheck();
      }, error: err => {
        console.error("Error occurred: ", err);
        this.loadingTechniques = false;
        this.cdr.markForCheck();
      }
    })
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

  toggleFilters() {
    this.filtersOpen = !this.filtersOpen;
  }

  resetFilters() {
    Object.keys(this.selectedFilters).forEach(key => this.selectedFilters[key] = '');
    this.applyFiltersAndSort();
  }
}
