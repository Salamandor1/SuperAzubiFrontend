import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ending-page',
  imports: [RouterModule],
  templateUrl: './ending-page.html',
  styleUrl: './ending-page.scss'
})
export class EndingPage implements OnInit{
  outcome: 'won' | 'lost' | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const outcome = params['outcome'];
      if (outcome === 'won' || outcome === 'lost') {
        this.outcome = outcome;
      } else {
        this.outcome = null;
      }
    });
  }
}
