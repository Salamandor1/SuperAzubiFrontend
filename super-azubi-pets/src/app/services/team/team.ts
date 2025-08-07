import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TeamAnimal_Response } from '../teamAnimal/team-animal_data';
import { Team } from './team_data';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private url: string = 'http://localhost:8080/playerteam/';

  private teamState = new BehaviorSubject<Team | null>(null);
  teamState$ = this.teamState.asObservable();

  constructor(private http: HttpClient) {}

  getTeamByID(id: number): Observable<Team> {
    return this.http.get<Team>(this.url + id);
  }
  
}
