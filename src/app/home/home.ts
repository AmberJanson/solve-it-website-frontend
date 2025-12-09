import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { CategoryView } from '../models/category-view.model';
import { CategoryViewService } from '../services/category-view.service';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';

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
  public categoryList: Category[] = [];
  public loadingCategories: boolean = true;

  constructor(
    private categoryViewService: CategoryViewService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCategoryViews();
  }

  private loadCategoryViews() {
    this.categoryViewService.getAllCategoryViews()
      .subscribe({next: (categoryViews) => {
        this.categoryViewList = Object.values(categoryViews);
        this.loadingCategoryViews = false;
        this.cdr.markForCheck();
      }, error: err => {
        console.error("Error occurred: ", err)
        this.loadingCategoryViews = false;
        this.cdr.markForCheck();
      }
    });
  }

  public getCategoriesByView(viewId: string) {
    this.categoryList = [];

    this.selectedView = this.categoryViewList.find(view => view.id == viewId) ?? null;

    if (this.selectedView) {
      for (const categoryId of this.selectedView.categories) {
        this.categoryService.getCategoryById(categoryId)
          .subscribe({next: (category) => {
            this.categoryList.push(category);
            this.cdr.markForCheck();
          }, error: err => {
            console.error("Error occurred: ", err);
            this.loadingCategories = false;
            this.cdr.markForCheck();
          }
        });
      }
      this.loadingCategories = false;
    } else {
      this.loadingCategories = false;
    }
  }
}
