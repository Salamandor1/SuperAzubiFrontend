import { TestBed } from '@angular/core/testing';

import { BaseAnimal } from './base-animal';

describe('BaseAnimal', () => {
  let service: BaseAnimal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseAnimal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
