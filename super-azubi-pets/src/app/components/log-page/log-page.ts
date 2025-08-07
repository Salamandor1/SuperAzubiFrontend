import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { GameService } from '../../services/game/game';
import { Observable } from 'rxjs';
import { Game } from '../../services/game/game_data';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Log } from '../../services/log/log';

@Component({
  selector: 'app-log-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './log-page.html',
  styleUrl: './log-page.scss',
})
export class LogPage implements OnInit{
  
  logText: string = ''; // The full log text to be displayed
  visibleText: string = ''; // The text that is currently visible to the user
  gameState$!: Observable<Game | null>;
  didWin: boolean | null = null;
  isSkipping = false;

  @ViewChild('logContainer') logContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private logService: Log,
    private gameService: GameService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ){
    this.gameState$ = this.gameService.gameState$;
  }

  /**
   * Initializes the log page component.
   * Loads the game state and log text from local storage.
   * Displays the log text character by character with a delay.
   */
  async ngOnInit(): Promise<void> {
    if (typeof window !== 'undefined' && localStorage) {
      // loads game
      const savedGameID = localStorage.getItem("gameID");
      if(savedGameID) {
        this.gameService.loadGameByID(+savedGameID)
      }
    }
    this.gameService.gameState$.subscribe(game => {
      if (game) {
        this.setDidWin(game);
      }
    }); 
    const savedLog = localStorage.getItem("Log");
    if(savedLog) {
      this.logText = savedLog;
    }

    await this.showText();
  }

  continue(): void {
    if(this.didWin === null) {
      this.router.navigate(['shop'])
    } else {
      this.end();
    }
  }

  end(): void {
    if(this.didWin === true) {
      this.router.navigate(['/end'], { queryParams: { outcome: 'won' } });
    } else if(this.didWin === false) {
      this.router.navigate(['/end'], { queryParams: { outcome: 'lost' } });
    } else {
      this.router.navigate(['/shop']);
    }
  }

  setDidWin(game: Game) : void {
    if(!game) {return;} 
    if (game.wins >= 10) {
      this.didWin = true;      
    } else if (game.hearts <= 0) {
      this.didWin = false;      
    } else {
      this.didWin = null;      
    }
  }

  /**
   * Displays the log text character by character with a delay.
   * If the user clicks "Skip", it will display the full text immediately.
   */
  async showText(){
    
    this.visibleText = '';
    this.isSkipping = false;

    // build the visible text character by character
    for (let i = 0; i < this.logText.length; i++) {
      const char = this.logText[i];
      this.visibleText += char;
      this.cdr.detectChanges();

      // Check if the user has clicked "Skip"
      if (this.isSkipping) {
        this.visibleText = this.logText;
        break;
      }

      if (char === '\n') {
        // long break after a newline character
        await this.delay(400);
      } else {
        // Short break between characters
        await this.delay(10);
      }
      this.scrollToBottom();

    }
    // Ensure the final text is fully displayed
    this.cdr.detectChanges();
  }

  /**
   * 
   * @param ms Delay in milliseconds
   * @returns timeout
   */
  delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
  } 

  /**
   * Sets the flag to skip the text display.
   * This will cause the full text to be displayed immediately.
   */
  skipText() {
    this.isSkipping = true;
  }

  scrollToBottom() {
    setTimeout(() => {
      const el = this.logContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }
}
