import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Technique } from '../models/technique.model';
import { TechniqueService } from '../services/technique.service';

@Component({
  selector: 'app-techniques',
  imports: [RouterLink],
  templateUrl: './techniques.html',
  styleUrl: './techniques.scss',
})
export class Techniques implements OnInit{

  public techniqueList: Technique[] = [];
  public loadingTechniques: boolean = true;

  constructor(
    private techniqueService: TechniqueService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadTechniques();
  }

  loadTechniques() {
    this.techniqueList = [];

    this.techniqueService.getAllTechniques()
      .subscribe({next: (techniques) => {
        this.techniqueList = Object.values(techniques);
        this.loadingTechniques = false;
        this.cdr.markForCheck();
      }, error: err => {
        console.error("Error occurred: ", err);
        this.loadingTechniques = false;
        this.cdr.markForCheck();
      }
    });
  }
}
