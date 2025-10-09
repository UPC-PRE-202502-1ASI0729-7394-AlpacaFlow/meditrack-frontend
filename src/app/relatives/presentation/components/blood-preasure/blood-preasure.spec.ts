import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloodPreasure } from './blood-preasure';

describe('BloodPreasure', () => {
  let component: BloodPreasure;
  let fixture: ComponentFixture<BloodPreasure>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloodPreasure]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloodPreasure);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
