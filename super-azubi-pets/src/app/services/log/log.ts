import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {environment} from '/workspaces/super-azubi-frontend/super-azubi-pets/src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Log {

  private url: string = environment.backendUrl + '/logs';;

  constructor(private http: HttpClient) {}

  getLog(teamID: number, npcID: number){
    return this.http.get(`${this.url}/${teamID}/${npcID}`);
  }
  
}
