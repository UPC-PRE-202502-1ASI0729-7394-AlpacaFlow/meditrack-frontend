import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HearRate } from './hear-rate';

describe('HearRate', () => {
  let component: HearRate;
  let fixture: ComponentFixture<HearRate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HearRate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HearRate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
