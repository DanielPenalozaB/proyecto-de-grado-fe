import { Component, Input } from '@angular/core';
import { LucideAngularModule, UserRoundPlus } from 'lucide-angular';
import { ButtonComponent } from '../../ui/button/button.component';

@Component({
  selector: 'app-content-layout',
  imports: [LucideAngularModule, ButtonComponent],
  templateUrl: './content-layout.component.html',
  styleUrl: './content-layout.component.css'
})
export class ContentLayoutComponent {
  readonly UserRoundPlus = UserRoundPlus;

  @Input() title = '';
  @Input() description: string | undefined;
}