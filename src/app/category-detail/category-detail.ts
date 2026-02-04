import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Category } from '../models/category.model';
import { Technique } from '../models/technique.model';
import { CategoryService } from '../services/category.service';
import { TechniqueService } from '../services/technique.service';
import { SharedPathService } from '../services/shared-path.service';

@Component({
  selector: 'app-category-detail',
  imports: [RouterLink],
  templateUrl: './category-detail.html',
  styleUrl: './category-detail.scss'
})
export class CategoryDetail implements OnInit{

  public pathList: string[] = [];

  public tocOpen = false;

  public category: Category | null = null;
  public categoryId?: string;
  public techniques: Technique[] = [];
  public loadingCategory: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private categoryService: CategoryService,
    private techniqueService: TechniqueService,
    private sharedPathService: SharedPathService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('categoryId');
      if (!id) return;

      this.categoryId = id;
      this.loadCategory(id);
    });

    this.sharedPathService.list$.subscribe(list => {
      this.pathList = list;
    });
  }

  public loadCategory(id: string) {
    this.loadingCategory = true;
    this.techniques = [];

    this.categoryService.getCategoryById(id)
      .subscribe ({next: (category) => {
        this.category = category;
        this.addCategoryPathToService();

        if (category.techniques.length >= 1) {
          for (const techniqueId of category.techniques) {
            this.techniqueService.getTechniquesById(techniqueId)
              .subscribe({next: (technique) => {
                this.techniques[category.techniques.indexOf(techniqueId)] = technique;
                this.loadingCategory = false;
                this.cdr.markForCheck();
              }, error: err => {
                console.error("Error occurred: ", err);
                this.loadingCategory = false;
                this.cdr.markForCheck();
              }
            });
          }
        }

        this.loadingCategory = false;
        this.cdr.markForCheck();
      }, error: err => {
          console.error("Error occurred: ", err);
          this.category = null;
          this.loadingCategory = false;
          this.cdr.markForCheck();
      }
    })
  }

  public onClickPath(path: string, index: number): void {
    const toHome = 
      !path.startsWith('C1') &&
      !path.startsWith('T1') &&
      !path.startsWith('W1') &&
      !path.startsWith('M1') &&
      !/^Techniques$/.test(path) &&
      !/^Weaknesses$/.test(path) &&
      !/^Mitigations$/.test(path);
    
      if (toHome) {
        this.sharedPathService.setSelectedView(path);
      }
  }

  public addCategoryPathToService() {
    this.sharedPathService.setNextItem(`${this.categoryId}: ${this.category?.name}`);
    
    const lastItem = this.sharedPathService.getLastItem();

    if (lastItem != `${this.categoryId}: ${this.category?.name}`) {
      this.sharedPathService.addItem(`${this.categoryId}: ${this.category?.name}`)
    }
  }

  public scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  }

  public toggleToc() {
    this.tocOpen = !this.tocOpen;
  }
}
