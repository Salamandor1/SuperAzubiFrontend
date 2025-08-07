import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { animal_response, animal_response_list } from './base-animal_data';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private url: string = environment.backendUrl + '/animals';

  private animalState = new BehaviorSubject<animal_response | null>(null);
  animalState$ = this.animalState.asObservable();

  constructor(private http: HttpClient) {}

  getRandomAnimals(round: number, count: number): Observable<animal_response_list> {
    return this.http.get<animal_response_list>(environment.backendUrl + '/animals' + '/random/' + round + "/" + count);
  }

  getAnimalByID(name: string): Observable<animal_response> { 
    return this.http.get<animal_response>(environment.backendUrl + '/animals' + '/' + name);
  }
  
}
