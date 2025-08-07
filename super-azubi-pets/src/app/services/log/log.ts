import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Log {

  private url: string = 'http://localhost:8080/logs';

  constructor(private http: HttpClient) {}

  getLog(teamID: number, npcID: number){
    return this.http.get(`${this.url}/${teamID}/${npcID}`);
  }
  
}
