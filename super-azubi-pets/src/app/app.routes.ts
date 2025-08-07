import { Routes } from '@angular/router';
import { WelcomePage } from './components/welcome-page/welcome-page';
import { TempPage } from './components/temp-page/temp-page';
import { ShopPage } from './components/shop-page/shop-page';
import { EndingPage } from './components/ending-page/ending-page';
import { LogPage } from './components/log-page/log-page';
import { ConfirmPage } from './components/confirm-page/confirm-page';
import { Fight } from './services/fight/fight';


export const routes: Routes = [
    { path: '', component: WelcomePage },
    { path: 'temp', component: TempPage},
    { path: 'shop', component: ShopPage},
    { path: 'end', component: EndingPage},
    //{ path: 'log/:playerID/:npcID', component: LogPage},
    { path: 'log', component: LogPage},
    { path: 'confirm', component: ConfirmPage},
];
