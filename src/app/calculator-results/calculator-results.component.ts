import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

interface WaterResults {
  litersPerYear: number;
  savingsPerYear: number;
  co2Reduction: number;
}

@Component({
  selector: 'app-calculator-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calculator-results.component.html',
  styleUrls: ['./calculator-results.component.css']
})
export class CalculatorResultsComponent {
  @Input() results!: WaterResults;
}