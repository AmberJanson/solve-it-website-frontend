import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { CategoryView } from '../models/category-view.model';
import { CategoryViewService } from '../services/category-view.service';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';
import { Technique } from '../models/technique.model';
import { TechniqueService } from '../services/technique.service';
import { SharedPathService } from '../services/shared-path.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  public categoryViewList: CategoryView[] = [];
  public loadingCategoryViews: boolean = true;
  public selectedView: CategoryView | null = null;
  public allCategories: Category[] = [];
  public categoryList: any[] = [];
  public loadingCategories: boolean = true;
  public techniqueList: Technique[] = [];
  public techniqueMap: Record<string, Technique> = {};
  public loadingTechniques: boolean = true;
  public showMissing = false;

  constructor(
    private categoryViewService: CategoryViewService,
    private categoryService: CategoryService,
    private techniqueService: TechniqueService,
    private sharedPathService: SharedPathService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.sharedPathService.resetList();
    this.loadCategoryViews();
    this.loadCategories();
    this.loadTechniques();
  }

  private loadCategoryViews() {
    this.categoryViewService.getAllCategoryViews()
      .subscribe({next: (categoryViews) => {
        this.categoryViewList = Object.values(categoryViews);
        this.categoryViewList.sort((a, b) => a.id.localeCompare(b.id))
        this.loadingCategoryViews = false;
        this.cdr.markForCheck();
      }, error: err => {
        console.error("Error occurred: ", err)
        this.loadingCategoryViews = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadCategories() {
    this.categoryService.getAllCategories()
      .subscribe({next: (categories) => {
        this.allCategories = Object.values(categories);
        this.loadingCategories = false;
        this.cdr.markForCheck();
      }, error: err => {
        console.error("Error occurred: ", err)
        this.loadingCategories = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadTechniques() {
    this.techniqueService.getAllTechniques()
      .subscribe({next: (techniques) => {
        this.techniqueList = Object.values(techniques);

        this.techniqueList.forEach(technique => {
          this.techniqueMap[technique.id] = technique;
        })

        this.loadingTechniques = false;
        this.cdr.markForCheck();
      }, error: err => {
        console.error("Error occurred: ", err)
        this.loadingTechniques = false;
        this.cdr.markForCheck();
      }
    });
  }

  public getCategoriesByView(viewId: string) {
    const selectedView = this.categoryViewList.find(view => view.id == viewId);

    if (!selectedView) {
      this.categoryList = [];
      this.selectedView = null;
      return;
    }

    this.selectedView = selectedView;

    const categories = this.allCategories.filter(category => selectedView.categories.includes(category.id));

    this.categoryList = categories.map(category => ({
      ...category,
      techniqueDetailed: category.techniques
        .map(id => this.techniqueMap[id])
        .filter(technique => !!technique)
    }))

    this.categoryList.sort((a, b) => a.id.localeCompare(b.id))

    this.cdr.markForCheck();
  }

  public getAllTechniquesInSelectedView(): Technique[] {
    if (!this.selectedView || !this.categoryList.length) {
      return [];
    }

    const techniqueSet = new Map<string, Technique>();

    this.categoryList.forEach(category => {
      if (category.techniqueDetailed && category.techniqueDetailed.length) {
        category.techniqueDetailed.forEach((technique: Technique) => {
          techniqueSet.set(technique.id, technique);

          technique.subtechniques?.forEach(sub => {
            const fullSubtechnique = this.techniqueMap[sub];
            if (fullSubtechnique) {
              techniqueSet.set(fullSubtechnique.id, fullSubtechnique);
            }
          });
        });
      }
    });

    return Array.from(techniqueSet.values());
  }

  public get isMoreTechniquesThanInView(): boolean {
    const allTechniquesInView = this.getAllTechniquesInSelectedView();
    return allTechniquesInView.length < this.techniqueList.length;
  }

  public get missingTechniques(): Technique[] {
    const allTechniquesInView = this.getAllTechniquesInSelectedView();
    const techniquesInViewIds = new Set(allTechniquesInView.map(technique => technique.id));

    return this.techniqueList.filter(technique => !techniquesInViewIds.has(technique.id)).sort((a, b) => a.id.localeCompare(b.id));
  }

  public toggleMissing() {
    this.showMissing = !this.showMissing;
  }

  public addViewPathToService() {
    this.sharedPathService.addItem(`${this.selectedView?.name}`)
  }

  public addViewAndCategoryPathToService(category: Category) {
    this.sharedPathService.addItem(`${this.selectedView?.name}`)
    this.sharedPathService.addItem(`${category.id}: ${category.name}`)
  }

  @ViewChild('scrollContainer', {static: false }) scrollContainer!: ElementRef;
  private scrollInitialized = false;
  ngAfterViewChecked() {
    if (!this.scrollInitialized && this.scrollContainer) {
      const element = this.scrollContainer.nativeElement;

      const scrollSpeed = 3;

      element.addEventListener('wheel', (event: WheelEvent) => {
        const vertical = Math.abs(event.deltaY);
        const horizontal = Math.abs(event.deltaX);

        if (vertical > horizontal) {
          event.preventDefault();
          element.scrollLeft += event.deltaY * scrollSpeed;
        }
      });
      this.scrollInitialized = true;
    }
  }
}
