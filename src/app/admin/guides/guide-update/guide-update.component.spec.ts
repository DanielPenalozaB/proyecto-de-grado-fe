import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideUpdateComponent } from './guide-update.component';

describe('GuideUpdateComponent', () => {
  let component: GuideUpdateComponent;
  let fixture: ComponentFixture<GuideUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuideUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
