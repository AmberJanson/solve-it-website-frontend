import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Weakness } from '../models/weakness.model';
import { WeaknessService } from '../services/weakness.service';

@Component({
  selector: 'app-weaknesses',
  imports: [RouterLink],
  templateUrl: './weaknesses.html',
  styleUrl: './weaknesses.scss'
})
export class Weaknesses implements OnInit{

  public weaknessList: Weakness[] = [];
  public loadingWeaknesses: boolean = true;

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
        this.weaknessList = Object.values(weaknesses);
        this.loadingWeaknesses = false;
        this.cdr.markForCheck();
      }, error: err => {
        console.error("Error occurred: ", err);
        this.loadingWeaknesses = false;
        this.cdr.markForCheck();
      }
    });
  }
}
