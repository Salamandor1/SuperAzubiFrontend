import { Injectable } from '@angular/core';
import { GameService } from '../game/game';
import { Game } from '../game/game_data';
import { Team } from '../team/team_data';
import { TeamAnimal } from '../shop/shop_data';
import { TeamService } from '../team/team';
import { TeamAnimalService } from '../teamAnimal/team-animal';
import { map, Observable, switchMap, tap } from 'rxjs';
import { ShopService } from '../shop/shop';

@Injectable({
  providedIn: 'root'
})
export class StartService {

  game: Game | null = null;
  team: Team | null = null;
  teamAnimals: (TeamAnimal | null) [] = [null, null, null, null, null];

  constructor(
    private gameService: GameService,
    private teamService: TeamService,
    private teamAnimalService: TeamAnimalService,
    private shopService: ShopService,
  ) {

  }
  
  startGame() : Observable<void> {
    localStorage.clear()
    localStorage.setItem("doReroll", true.toString());
    return this.gameService.startGame()
      .pipe(
        switchMap(game => {
          console.log("Game:", game);
          this.game = game;
          localStorage.setItem("gameID", game.gameID.toString());
          return this.teamService.getTeamByID(game.teamID);
        }),
        switchMap(team => {
          this.team = team;
          return this.teamAnimalService.getAll(team);
        }),
        tap(teamAnimals => {
          this.teamAnimals = teamAnimals;
          this.shopService.setTeamAnimals(teamAnimals);
          this.gameService.init();
          this.shopService.init();
        }),
        map(() => void 0)
      );
  }
}
