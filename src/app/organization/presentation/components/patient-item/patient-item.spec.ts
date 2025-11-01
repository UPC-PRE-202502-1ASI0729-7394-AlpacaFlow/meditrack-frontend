import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientItem } from './patient-item';

describe('PatientItemComponent', () => {
  let component: PatientItem;
  let fixture: ComponentFixture<PatientItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
