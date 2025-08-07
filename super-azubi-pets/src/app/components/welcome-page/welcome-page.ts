import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { GameService } from '../../services/game/game';
import { TeamService } from '../../services/team/team';
import { ShopService } from '../../services/shop/shop';
import { StartService } from '../../services/start/start';

@Component({
  selector: 'app-welcome-page',
  imports: [
    RouterModule,
  ],
  templateUrl: './welcome-page.html',
  styleUrl: './welcome-page.scss'
})
export class WelcomePage {
  constructor(
    private startService: StartService, 
    private router: Router,
  ) {}
  
  startGame() {
    this.startService.startGame().subscribe(() => {
      this.router.navigate(['/shop']);
    });    
  }
}
