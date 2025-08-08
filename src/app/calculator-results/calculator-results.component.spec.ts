import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorResultsComponent } from './calculator-results.component';

describe('CalculatorResultsComponent', () => {
  let component: CalculatorResultsComponent;
  let fixture: ComponentFixture<CalculatorResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculatorResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculatorResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
