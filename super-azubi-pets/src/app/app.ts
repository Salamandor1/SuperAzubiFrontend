import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {EndingPage} from "./components/ending-page/ending-page";
import { WelcomePage } from './components/welcome-page/welcome-page';
import { TempPage } from './components/temp-page/temp-page';
import { ShopPage } from './components/shop-page/shop-page';
import { LogPage } from './components/log-page/log-page';
import { ConfirmPage } from './components/confirm-page/confirm-page';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    WelcomePage,
    TempPage,
    ShopPage,
    EndingPage,
    LogPage,
    ConfirmPage,
  ],

  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('super-azubi-pets');
}
