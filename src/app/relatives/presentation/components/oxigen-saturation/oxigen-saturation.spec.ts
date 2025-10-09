import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OxigenSaturation } from './oxigen-saturation';

describe('OxigenSaturation', () => {
  let component: OxigenSaturation;
  let fixture: ComponentFixture<OxigenSaturation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OxigenSaturation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OxigenSaturation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
