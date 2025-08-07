import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Observable, of } from 'rxjs';
import { TeamAnimal_Response } from './team-animal_data';
import { HttpClient } from '@angular/common/http';
import { Team } from '../team/team_data';
import { TeamAnimal } from '../shop/shop_data';
import {environment} from '/workspaces/super-azubi-frontend/super-azubi-pets/src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamAnimalService {
  private url: string = environment.backendUrl + '/teamanimal/';;

  private teamAnimalState = new BehaviorSubject<TeamAnimal_Response | null>(null);
  teamAnimalState$ = this.teamAnimalState.asObservable();

  constructor(private http: HttpClient) {}
  
  getTeamAnimalByID(id: number): Observable<TeamAnimal_Response> {
    return this.http.get<TeamAnimal_Response>(this.url + id);
  }

  getAll(team: Team) : Observable<(TeamAnimal | null)[]> {
    const teamAnimalIDs = [team.slot0ID, team.slot1ID, team.slot2ID, team.slot3ID, team.slot4ID];

    const requests = teamAnimalIDs.map(id => {
    if (id === null || id === undefined) {
      return of(null);
    } else {
      return this.getTeamAnimalByID(id).pipe(
        map(response => new TeamAnimal(response.baseAnimalName, response.emoji, response.health, response.attack, response.tier, response.level, response.skill))
      );
    }
    });
    return forkJoin(requests);
  }
}
