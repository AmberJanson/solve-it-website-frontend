import { Component, OnInit } from '@angular/core';
import { SharedPathService } from '../services/shared-path.service';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {

  constructor(
    private sharedPathService: SharedPathService
  ) { }

  ngOnInit(): void {
    this.sharedPathService.resetList();
  }

}
