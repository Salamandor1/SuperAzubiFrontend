import { Injectable} from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import {Game} from './game_data'
import { TeamAnimal } from '../shop/shop_data';
import { Team } from '../team/team_data';
import { TeamService } from '../team/team';
import { TeamAnimalService } from '../teamAnimal/team-animal';
import { TeamAnimal_Response } from '../teamAnimal/team-animal_data';
import { ShopService } from '../shop/shop';
import {environment} from '/workspaces/super-azubi-frontend/super-azubi-pets/src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private url: string = environment.backendUrl + '/game';

  private gameState = new BehaviorSubject<Game | null>(null);
  gameState$ = this.gameState.asObservable();

  constructor(
    private http: HttpClient,
    private teamService: TeamService,
    private teamAnimalService: TeamAnimalService,
    private shopService: ShopService,
  ) {
  }

  init() : void { 
    if (typeof window !== 'undefined' && localStorage) {
      const savedGame = localStorage.getItem('gameState');
      if (savedGame) {
        this.gameState.next(JSON.parse(savedGame));
      }
      this.gameState$.subscribe(game => {
      localStorage.setItem("gameState", JSON.stringify(game));
      });
    }
  }

  startGame() : Observable<Game> {
    this.gameState.next(null);
    const body = { hearts: 8 };

    return this.http.post<Game>(this.url, body).pipe(
      tap(response => {
        this.gameState.next(response);
        this.setGame(response);
      })
    );
  }

  getCurrentGame() {
    return this.gameState.value;
  }

  getGameID() : number{
    const game = this.gameState.getValue();
    return game ? game.gameID : 0;
  }

  fetchGameById(id: number) {
    return this.http.get<Game>(`http://localhost:8080/game/${id}`);
  }

  saveTeam() {
    const teamAnimals: (TeamAnimal | null)[] = this.shopService.getTeamAnimals();

    console.log("Saved Team:", teamAnimals);

    if(!teamAnimals) {
      return of();
    }

    const savedGameID = localStorage.getItem("gameID");
    if(!savedGameID) {
      return;
    }
    const gameID: number = Number(savedGameID);
    
    const teamDTO: any = {};

    for (let i = 0; i < 5; i++) {
      const animal = teamAnimals[i];
      teamDTO[`slot${i}`] = animal
        ? {
            baseAnimalName: animal.getName(),
            health: animal.getHealth(),
            attack: animal.getAttack(),
            level: animal.getLevel(),
          }
        : null; 
    }

    const body = { teamDTO };

    return this.http.put(`${this.url}/${gameID}`, body);
  }

  setGame(game: Game) {
    this.gameState.next(game);
  }

  loadGameByID(id: number) : void {
    this.fetchGameById(id).subscribe(game => {
      this.setGame(game);
    })
  }


}
