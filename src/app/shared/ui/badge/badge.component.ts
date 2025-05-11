import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
      [ngClass]="{
        'bg-green-100 text-green-800': type === 'active',
        'bg-red-100 text-red-800': type === 'inactive',
        'bg-blue-100 text-blue-800': type === 'admin',
        'bg-purple-100 text-purple-800': type === 'moderator',
        'bg-gray-100 text-gray-800': !['active', 'inactive', 'admin', 'moderator'].includes(type)
      }"
    >
      {{ text }}
    </span>
  `,
  styles: []
})
export class BadgeComponent {
  @Input() type = 'active';
  @Input() text = '';
}