import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, LucideIconData, UserRoundPlus } from 'lucide-angular';
import { ButtonComponent } from '../../ui/button/button.component';

export interface ContentAction {
  label: string;
  icon?: LucideIconData;
  action: () => void;
  style?: string;
}

@Component({
  selector: 'app-content-layout',
  standalone: true,
  imports: [LucideAngularModule, ButtonComponent, CommonModule],
  templateUrl: './content-layout.component.html',
  styleUrls: ['./content-layout.component.css']
})
export class ContentLayoutComponent {
  readonly UserRoundPlus = UserRoundPlus;

  @Input() title = '';
  @Input() description: string | undefined;
  @Input() actions: ContentAction[] = [];
  @Output() actionTriggered = new EventEmitter<string>();
}