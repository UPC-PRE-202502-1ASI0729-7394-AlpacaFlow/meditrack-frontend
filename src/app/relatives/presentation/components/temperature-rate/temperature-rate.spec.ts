import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemperatureRate } from './temperature-rate';

describe('TemperatureRate', () => {
  let component: TemperatureRate;
  let fixture: ComponentFixture<TemperatureRate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemperatureRate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemperatureRate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
