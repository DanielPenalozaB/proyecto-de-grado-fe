import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideCreateComponent } from './guide-create.component';

describe('GuideCreateComponent', () => {
  let component: GuideCreateComponent;
  let fixture: ComponentFixture<GuideCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuideCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
