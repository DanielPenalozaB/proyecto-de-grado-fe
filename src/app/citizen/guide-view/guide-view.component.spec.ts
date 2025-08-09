import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideViewComponent } from './guide-view.component';

describe('GuideViewComponent', () => {
  let component: GuideViewComponent;
  let fixture: ComponentFixture<GuideViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuideViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
