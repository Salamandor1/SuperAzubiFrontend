import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fight_response_data } from './fight_response_data';

@Injectable({
  providedIn: 'root'
})
export class Fight {

  private url: string = 'http://localhost:8080/fight';

  constructor(private http: HttpClient) {}

  startFight(id:number): Observable<Fight_response_data>{
    return this.http.get<Fight_response_data>(`${this.url}/${id}`);
  }
  
}
