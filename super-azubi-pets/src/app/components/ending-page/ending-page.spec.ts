import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndingPage } from './ending-page';

describe('EndingPage', () => {
  let component: EndingPage;
  let fixture: ComponentFixture<EndingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndingPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
