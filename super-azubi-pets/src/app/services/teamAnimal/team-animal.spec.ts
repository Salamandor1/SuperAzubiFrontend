import { TestBed } from '@angular/core/testing';

import { TeamAnimalService } from './team-animal';

describe('TeamAnimal', () => {
  let service: TeamAnimalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamAnimalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
