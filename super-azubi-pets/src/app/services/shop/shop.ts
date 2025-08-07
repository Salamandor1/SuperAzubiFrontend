import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, catchError, distinctUntilChanged, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { TeamAnimal, ShopAnimal } from './shop_data';
import { AnimalService } from '../baseAnimal/base-animal';
import { GameService } from '../game/game';
import { TeamService } from '../team/team';
import { TeamAnimalService } from '../teamAnimal/team-animal';
import { TeamAnimal_Response } from '../teamAnimal/team-animal_data';
import { Game } from '../game/game_data';
import { mapOneOrManyArgs } from 'rxjs/internal/util/mapOneOrManyArgs';
import { B } from '@angular/cdk/keycodes';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private gameService?: GameService;

  private gold = new BehaviorSubject<number>(10);
  gold$ = this.gold.asObservable();

  private teamAnimals: (TeamAnimal | null) [] = [];
  private shopAnimals: (ShopAnimal | null) [] = [];

  constructor(
    private animalService: AnimalService,
    private injector: Injector,
    private teamService: TeamService,
    private teamAnimalService: TeamAnimalService,
  ) {
  }

  init() {
    this.shopAnimals = [null, null, null, null, null]; // necessary for resetting isFreze
    this.gold$.pipe(distinctUntilChanged()).subscribe(gold => {
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.setItem("gold", JSON.stringify(gold));
      }
    });
  }

  private get _gameService(): GameService {
    if(!this.gameService) {
      this.gameService = this.injector.get(GameService);
    }
    return this.gameService;
  }

  setGold(gold: number) {
    this.gold.next(gold);
  }

  getGold(): number {
    return this.gold.value;
  }

  setTeamAnimals(teamAnimals: (TeamAnimal | null)[]) {
    this.teamAnimals =  teamAnimals;
  }

  getTeamAnimals() : (TeamAnimal | null)[] {
    return this.teamAnimals;
  }

  setShopAnimals(shopAnimals: ShopAnimal[]) {
    this.shopAnimals = shopAnimals;
  }

  getShopAnimals() : (ShopAnimal | null) [] {
    return this.shopAnimals;
  }

  rerollShopAnimals(count: number): Observable<void> {
    const game : Game = this._gameService.getCurrentGame()!;
    return this.animalService.getRandomAnimals(game.rounds, count).pipe(
      tap((response) => {
        const animalsArray = Array.isArray(response) ? response : (response?.baseanimals ?? []);
        animalsArray.forEach((animal: any, index: number) => {
          if (this.shopAnimals[index] == null || !this.shopAnimals[index].isFrozen) {
            this.shopAnimals[index] = { ...animal };
          }
        });
      }),
      map(() => {}) 
    );
  }

  refreshTeamAnimals(): Observable<void> {
    const game: Game = this._gameService.getCurrentGame()!;

    return this.teamService.getTeamByID(game.teamID).pipe(
      switchMap(team => this.teamAnimalService.getAll(team)),
      switchMap(teamAnimals => { // TeamAnimal[]
        const updatedTeamAnimals = teamAnimals.map(teamAnimal => {
          if (!teamAnimal) {
            return of(null);
          }
          const name = teamAnimal.getName();

          return this.animalService.getAnimalByID(name).pipe(
            map(baseAnimal => {
              if (!baseAnimal) return null;
              return new TeamAnimal(
                baseAnimal.name,
                baseAnimal.emoji,
                teamAnimal.getHealth(),
                teamAnimal.getAttack(),
                baseAnimal.tier,
                teamAnimal.getLevel(),
                baseAnimal.skill
              );
            }),
            catchError(err => {
              console.error("BaseAnimal konnte nicht geladen werden:", err);
              return of(null);
            })
          );
        });

        return forkJoin(updatedTeamAnimals);
      }),
      tap(teamAnimals => {
        this.setTeamAnimals(teamAnimals);
      }),
      map(() => {})
    );
  }

  convertToTeamAnimal(shopAnimal : ShopAnimal) : TeamAnimal {
    return new TeamAnimal(shopAnimal.name, shopAnimal.emoji, shopAnimal.health, shopAnimal.attack, shopAnimal.tier, 1, shopAnimal.skill);
  }

  rehydrateTeamAnimal(a: any) : TeamAnimal | null {
    if(a === null) {
      return null;
    }
    return new TeamAnimal(a.name, a.emoji, a.health, a.attack, a.tier, a.level, a.skill);
  }

  private skillDescriptions: { [key: string]: string } = {
    "[NONE]": "None: Keine Fähigkeit.",
    "[LEHRLING]": "Lehrling: beim Tod levelt das Tier und erhöht Werte seine Werte.",
    "[BLOCK]": "Block: reduziert eingehenden Schaden.",
    "[MUT]": "Mut: erhöht zu Kampfbeginn den Angriff aller Teammitglieder.",
    "[BESCHÜTZER]": "Bschützer: beim Tod erhöht das Tier das Leben aller verbleibenden Teammitlieder.",
    "[RAGE]": "Rage: erhöht nach jedem Treffer eigenen Angriff.",
    "[RACHE]": "Rache: wenn das Tier angegriffen wird, verletzt es einen zufälligen Gegner.",
    "[SCHILD]": "Schild: blockiert eingehenden Schaden 1-3 mal komplett.",
    "[VERSTECKEN]": "Verstecken: anulliert nach Angriff einmalig Schaden.",
    "[DORNEN]": "Dornen: reflektiert Schaden anteilig zurück zum Gegner.",
    "[STICH]": "Stich: fügt allen Gegnern zu Beginn des Kampfes Schaden zu.",
    "[TRAMPEL]": "Trampel: fügt anteilig dem nächsten Gegner ebenfalls Schaden zu.",
    "[NERVTÖTER]": "Nervtöter: deaktiviert die Fähigkeit eines Gegners.",
    "[MEMBRAN]": "Membran: hält etwas zusätzlichen Schaden aus.",
    "[CHARM]": "Charm: leitet den Angriff mit halber Stärke auf ein Tier des Gegners weiter.",
    "[VORRAT]": "Vorrat: falls das Tier nach einem Angriff noch lebt, heilt es sich selbst.",
    "[FÜTTERN]": "Füttern: erhöht bei Tod das Leben eines anderen Teammitgliedes permanent.",
    "[UNTOT]": "Untot: wird einmal mit 50% ❤️ und 🗡️ wiederbelebt."
  }

  getSkillDescription(skill: string): string {
    return this.skillDescriptions[skill] || "Error loading description.";
  }

}
