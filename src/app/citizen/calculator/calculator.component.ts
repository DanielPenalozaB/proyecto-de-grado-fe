import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CircleHelp, LucideAngularModule } from 'lucide-angular';
import { CalculatorResultsComponent } from '../calculator-results/calculator-results.component';

interface CollectionMethod {
  id: string;
  name: string;
  efficiency: number;
}

type RainfallData = Record<string, number>;

interface WaterResults {
  litersPerYear: number;
  savingsPerYear: number;
  co2Reduction: number;
}

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalculatorResultsComponent,
    LucideAngularModule,
    MatTooltipModule
  ],
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  readonly CircleHelp = CircleHelp;

  // Simulated collection methods
  readonly COLLECTION_METHODS: CollectionMethod[] = [
    { id: "roof", name: "Recolección de Techo", efficiency: 0.8 },
    { id: "surface", name: "Captación de Superficie", efficiency: 0.6 },
    { id: "fog", name: "Atrapanieblas", efficiency: 0.4 },
  ];

  // Simulated rainfall data by region (mm per year)
  readonly RAINFALL_DATA: RainfallData = {
    norte: 50,
    centro: 500,
    sur: 2000,
  };

  location = "centro";
  method: string = this.COLLECTION_METHODS[0].id;
  area = 100; // m²
  efficiency = 80; // %
  results: WaterResults = {
    litersPerYear: 0,
    savingsPerYear: 0,
    co2Reduction: 0,
  };

  constructor() {
    this.calculateResults();
  }

  // Calculate water collection potential
  calculateResults(): void {
    const selectedMethod = this.COLLECTION_METHODS.find(m => m.id === this.method) || this.COLLECTION_METHODS[0];
    const rainfall = this.RAINFALL_DATA[this.location];
    const methodEfficiency = selectedMethod.efficiency;
    const userEfficiency = this.efficiency / 100;

    // Formula: Area (m²) × Rainfall (mm/year) × Efficiency = Liters per year
    const litersPerYear = this.area * rainfall * methodEfficiency * userEfficiency;

    // Approximate savings (assuming water costs $0.002 per liter)
    const savingsPerYear = litersPerYear * 0.002;

    // Approximate CO2 reduction (0.5kg CO2 per 1000L of water)
    const co2Reduction = (litersPerYear / 1000) * 0.5;

    this.results = {
      litersPerYear: Math.round(litersPerYear),
      savingsPerYear: Math.round(savingsPerYear),
      co2Reduction: Number.parseFloat(co2Reduction.toFixed(2)),
    };
  }

  // Simulate adding points when calculating
  calculateAndEarnPoints(): void {
    // This would connect to a backend to update user points
    console.log("Calculation completed: +10 points");
    // Show a toast or notification here
    this.calculateResults();
  }
}