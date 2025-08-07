import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TeamAnimal_Response } from '../teamAnimal/team-animal_data';
import { Team } from './team_data';
import { HttpClient } from '@angular/common/http';
import {environment} from '/workspaces/super-azubi-frontend/super-azubi-pets/src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private url: string = environment.backendUrl + '/playerteam';

  private teamState = new BehaviorSubject<Team | null>(null);
  teamState$ = this.teamState.asObservable();

  constructor(private http: HttpClient) {}

  getTeamByID(id: number): Observable<Team> {
    return this.http.get<Team>(environment.backendUrl + '/playerteam/' + id);
  }
  
}
