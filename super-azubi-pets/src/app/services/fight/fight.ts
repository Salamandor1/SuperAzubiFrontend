import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fight_response_data } from './fight_response_data';
import {environment} from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class Fight {

  private url: string = environment.backendUrl + '/fight';

  constructor(private http: HttpClient) {}

  startFight(id:number): Observable<Fight_response_data>{
    return this.http.get<Fight_response_data>(`${this.url}/${id}`);
  }
  
}
