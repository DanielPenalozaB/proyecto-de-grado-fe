import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonSlotDirective } from './button-slot.component';

describe('ButtonSlotDirective', () => {
  let component: ButtonSlotDirective;
  let fixture: ComponentFixture<ButtonSlotDirective>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonSlotDirective]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonSlotDirective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
