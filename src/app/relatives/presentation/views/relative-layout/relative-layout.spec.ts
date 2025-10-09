import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelativeLayout } from './relative-layout';

describe('RelativeLayout', () => {
  let component: RelativeLayout;
  let fixture: ComponentFixture<RelativeLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelativeLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelativeLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
