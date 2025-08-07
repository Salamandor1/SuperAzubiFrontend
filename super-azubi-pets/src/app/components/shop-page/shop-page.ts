import { Component, NgZone, numberAttribute, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { GameService } from '../../services/game/game';
import { CommonModule } from '@angular/common'; 
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { Fight } from '../../services/fight/fight';
import { ShopService } from '../../services/shop/shop';
import { Game } from '../../services/game/game_data';
import { ShopAnimal, TeamAnimal } from '../../services/shop/shop_data';
import { log } from 'console';
import { ParsedEvent } from '@angular/compiler';
import { parse } from 'path';

@Component({
  selector: 'app-shop-page',
  imports: [
    RouterModule,
    CommonModule,
  ],
  templateUrl: './shop-page.html',
  styleUrl: './shop-page.scss'
})

export class ShopPage implements OnInit{

  showTierPopup: boolean = false;
  showHelpPopup: boolean = false;
  popupTimeout: any;
  gameState$: Observable<Game | null>;
  gold$: Observable<number | 0>;
  teamAnimals: (TeamAnimal | null) [] = [null, null, null, null, null];
  shopAnimals: (ShopAnimal | null) [] = [null, null, null, null, null];
  sellFor: string = "Sell";


  constructor(
    private gameService: GameService, 
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fightService: Fight,
    private shopService: ShopService,
    private zone: NgZone,
  ) {
    this.gameState$ = this.gameService.gameState$;
    this.gold$ = this.shopService.gold$;
  }

  ngOnInit(): void {


    this.gameState$.subscribe(gameState => {
      this.TierPopup(gameState?.rounds);
    });

    if (typeof window !== 'undefined' && localStorage) {
      // loads game
      const savedGameID = localStorage.getItem("gameID");
      if(savedGameID) {
        this.gameService.loadGameByID(+savedGameID)
      }
      this.gameState$ = this.gameService.gameState$;

      // loads or resets gold
      const savedGold = localStorage.getItem("gold");
      if(savedGold) {
        this.shopService.setGold(JSON.parse(savedGold));
      } else {
        this.shopService.setGold(10);
      }
      this.gold$ = this.shopService.gold$;   

      // load team animals from localStorage otherwise from backend
      const savedTeamAnimals = localStorage.getItem("teamAnimals");
      console.log("local team:", savedTeamAnimals)
      if(savedTeamAnimals) {
        this.zone.run(() => {
          const parsed = JSON.parse(savedTeamAnimals);
          const rehydrated = parsed.map((a: any) => a ? this.shopService.rehydrateTeamAnimal(a) : null);
          this.shopService.setTeamAnimals(rehydrated);
          this.teamAnimals = [...this.shopService.getTeamAnimals()];
          this.cdr.detectChanges();
        });
      } else { // if local storage is empty
        this.shopService.refreshTeamAnimals().subscribe(() => {
          this.teamAnimals = [...this.shopService.getTeamAnimals()];
          this.cdr.detectChanges();
        })
      }

      // load shop animals and reroll non frozen
      const savedShopAnimals = localStorage.getItem("shopAnimals");
      if(savedShopAnimals) {
        this.zone.run(() => {
          console.log("parsed shopanimals:", JSON.parse(savedShopAnimals));
          this.shopService.setShopAnimals(JSON.parse(savedShopAnimals));
          this.shopAnimals = [...this.shopService.getShopAnimals()];
          this.cdr.detectChanges();
        });
      }
      if(localStorage.getItem("doReroll")) {
        this.shopService.rerollShopAnimals(5).subscribe(() => {
          this.shopAnimals = [...this.shopService.getShopAnimals()];
          this.cdr.detectChanges();
        })
      } else {
        localStorage.setItem("doReroll", true.toString());
      }
    }
    this.cdr.detectChanges();
  }


  // Displays a popup when the round is 3, 5, 7, 9, or 11
  // This is used to inform the user about the tier of animals available in the shop
  TierPopup(round: number | undefined): number {
    if (round === undefined) return 0;
    if (round === 3 || round === 5 || round === 7 || round === 9 || round === 11) {
      this.showTierPopup = true;
    }
    return round;
  }

  help(){
    this.showHelpPopup = true;
  }

  closeHelp() {
    this.showHelpPopup = false;
  }

  // Closes the popup when the user clicks on it
  closePopup() {
    this.showTierPopup = false;
  }

  saveState(): void {
    localStorage.setItem("teamAnimals", JSON.stringify(this.teamAnimals));
    localStorage.setItem("shopAnimals", JSON.stringify(this.shopAnimals));
    localStorage.setItem("gold", JSON.stringify(this.shopService.getGold()));
    this.cdr.detectChanges();
  }

  deleteSavedTeamAnimals() {
    localStorage.removeItem("teamAnimals");
    this.cdr.detectChanges();
  }

  dragstartHandler(event: DragEvent, index: number, source: 'team' | 'shop'): void {
    event.dataTransfer?.setData('source', source);
    event.dataTransfer?.setData('index', index.toString());
    if(this.teamAnimals[index] && source === 'team') {
      const value: number = this.teamAnimals[index].getLevel();
      this.sellFor = "Sell for +" + value + "💰";
    }
  }

  dragoverHandler(event: DragEvent): void {
    event.preventDefault();
  }

  dropHandler(event: DragEvent, targetIndex: number, target: 'team' | 'shop' | 'sell'): void {
    event.preventDefault();

    const source = event.dataTransfer?.getData('source') as 'team' | 'shop';
    const sourceIndex = Number(event.dataTransfer?.getData('index'));

    if (source === 'team' && target === 'team') {
      this.dropHandlerTeamToTeam(sourceIndex, targetIndex);
    }

    if (source === 'team' && target === 'sell') {
      this.dropHandlerTeamToSell(sourceIndex);
    }

    if (source === 'shop' && target === 'team') {
      this.dropHandlerShopToTeam(sourceIndex, targetIndex);
    }
    this.sellFor = "Sell";
    this.cdr.detectChanges();
    return;
  }

  dropHandlerTeamToTeam(sourceIndex: number, targetIndex: number): void {

    const sourceAnimal = this.teamAnimals[sourceIndex];
    const targetAnimal = this.teamAnimals[targetIndex];

    if (!sourceAnimal) return;

    if(sourceAnimal === targetAnimal) {
      return;
    }

    if (!targetAnimal) {
      this.teamAnimals[targetIndex] = sourceAnimal;
      this.teamAnimals[sourceIndex] = null;
      this.saveState()
      return;
    }

    if (sourceAnimal.getName() === targetAnimal.getName() && targetAnimal.getLevel() < 20 && sourceAnimal.getLevel() < 20) {
      const i = sourceAnimal.getLevel();
      for(let j = i; j > 0; j--) {
        targetAnimal.levelUp();
      }
      this.teamAnimals[targetIndex] = targetAnimal;
      this.teamAnimals[sourceIndex] = null;
      this.saveState()
      return;
    }

    this.teamAnimals[targetIndex] = sourceAnimal;
    this.teamAnimals[sourceIndex] = targetAnimal;
    this.saveState()
  }

  dropHandlerTeamToSell(sourceIndex: number): void {
    const sourceAnimal = this.teamAnimals[sourceIndex];
    if(!sourceAnimal) {
      return;
    }
    const i: number = sourceAnimal.getLevel();
    this.shopService.setGold(this.shopService.getGold() + i);
    this.teamAnimals[sourceIndex] = null;
    this.saveState()
  }

  dropHandlerShopToTeam(sourceIndex: number, targetIndex: number) {
    if (this.shopService.getGold() < 3) {
      return;
    }

    const sourceAnimal = this.shopAnimals[sourceIndex];
    const targetAnimal = this.teamAnimals[targetIndex];

    if(!sourceAnimal) {
      return;
    }

    this.unfreeze(sourceIndex);

    if(!targetAnimal) {
      this.teamAnimals[targetIndex] = this.shopService.convertToTeamAnimal(sourceAnimal);
      this.shopAnimals[sourceIndex] = null;
      this.shopService.setGold(this.shopService.getGold() - 3);
      this.saveState()
      return;
    }

    if(sourceAnimal.name === targetAnimal.getName()) {
      if(targetAnimal.levelUp()) {
        this.teamAnimals[targetIndex] = targetAnimal;
        this.shopAnimals[sourceIndex] = null;
        this.shopService.setGold(this.shopService.getGold() - 3);
        this.saveState()
      }
    }    
  }

  reroll() {
    if(this.shopService.getGold() < 1) {
      return;
    }
    this.shopService.setGold(this.shopService.getGold() - 1);
    this.shopService.rerollShopAnimals(5).subscribe(() => {
      this.shopAnimals = this.shopService.getShopAnimals();
      this.saveState();
    });
    this.cdr.detectChanges();
  }

  toggleIsFrozen(i: number, event: MouseEvent): void {
    if(this.shopAnimals[i] === null) {
      return;
    }
    event.preventDefault();
    this.shopAnimals[i].isFrozen = !this.shopAnimals[i].isFrozen;
    this.saveState();
    this.cdr.detectChanges();
  }

  unfreeze(i: number) {
    if(this.shopAnimals[i] === null) {
      return;
    }
    this.shopAnimals[i].isFrozen = false;
    this.saveState();
    this.cdr.detectChanges();
  }

  saveTeam() : Observable<void> {
    this.shopService.setTeamAnimals([...this.teamAnimals]);
    return this.gameService.saveTeam()!.pipe(
      map(() => {})
    );
  }

  saveTeamAndStartFight() {
    this.saveTeam().pipe(
      tap(() => {
        this.saveState();
        localStorage.removeItem("teamAnimals");
        localStorage.removeItem("gold");
        this.shopService.setGold(10);
      }),
      switchMap(() => this.fightService.startFight(this.gameService.getGameID())),
      tap(fightResult => { 
        this.gameService.loadGameByID(this.gameService.getGameID());   
        localStorage.setItem("Log", fightResult.log);     
      }),
    ).subscribe({
      next: () => {
        this.cdr.detectChanges();
        this.router.navigate(['log'])        
      },
      error: (err) => {

      }
    });
  }

  doesLogExist(): boolean {
    if (typeof window !== 'undefined' && localStorage) {
      return !!localStorage.getItem("Log");
    }
    return false;
  }

  goToLog() {
    this.saveState();
    localStorage.removeItem("doReroll");
    this.router.navigate(['log']);
  }

  get currentGold() : number {
    return this.shopService.getGold();
  }

  public getMaxTier(round: number | undefined): number {
  if (round === undefined) return 0;
  if (round < 3) return 1;
  if (round < 5) return 2;
  if (round < 7) return 3;
  if (round < 9) return 4;
  if (round < 11) return 5;
  return 6;
}

  getMaximumGold() {
    this.shopService.setGold(200);
  }

  getSkillDescription(skill: string) : string {
    return this.shopService.getSkillDescription(skill);
  }
}

