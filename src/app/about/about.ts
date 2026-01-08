import { Component, OnInit } from '@angular/core';
import { SharedPathService } from '../services/shared-path.service';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {

  public findingDataList: string[] = [
    "• The search bar can be used to search for specific names of techniques, weaknesses, and mitigations.",
    "• On the homepage, you can select a specific view in which the various techniques are divided into categories. From there, you can click through to a category or technique.",
    "• The techniques, weaknesses, and mitigations all have a collectionpage listing all the different entries. The buttons to get there are in the navigation bar. At a collectionpage, you can sort or filter by specific information.",
    "• On the various detailpages for categories, techniques, weaknesses, and mitigations, you can click through to the next components."
  ]

  public createPdfList: string[] = [
    "1) Find the data for in the PDF-file by going to a detailpage.",
    "2) Click on the checkbox next to “Item on pdf list:”, which can be found at the top of the detailpage.",
    "3) Add more data using steps 1 and 2 or proceed to the next step.",
    "4) Go to the “PDF Maker”-page. The button to get there is in the navigation bar.",
    "5) When you are on the “PDF Maker”-page, make the final adjustments to the selected items.",
    "6) Click on the “Download PDF of selected data” button to download the PDF-file."
  ]

  constructor(
    private sharedPathService: SharedPathService
  ) { }

  ngOnInit(): void {
    this.sharedPathService.resetList();
  }

}
