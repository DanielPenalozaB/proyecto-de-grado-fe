import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  DropdownAlign,
  DropdownSide,
  RdxDropdownMenuContentDirective,
  RdxDropdownMenuItemDirective, RdxDropdownMenuTriggerDirective
} from '@radix-ng/primitives/dropdown-menu';
import { EllipsisVertical, LucideAngularModule, LucideIconData } from 'lucide-angular';

export interface DropdownAction<T> {
  label: string;
  icon?: LucideIconData;
  action: (row: T) => void;
  style?: string;
}

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [
    RdxDropdownMenuTriggerDirective,
    RdxDropdownMenuItemDirective,
    RdxDropdownMenuContentDirective,
    LucideAngularModule
  ],
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.css']
})
export class DropdownMenuComponent<T> {
  @Input() actions: DropdownAction<T>[] = [];
  @Input() rowData!: T;
  @Input() side: DropdownSide = DropdownSide.Bottom;
  @Input() align: DropdownAlign = DropdownAlign.Start;
  @Input() sideOffset = 5;
  @Input() alignOffset = 0;
  @Output() actionSelected = new EventEmitter<{ action: string, row: T }>();

  readonly EllipsisVertical = EllipsisVertical;
  readonly DropdownSide = DropdownSide;
  readonly DropdownAlign = DropdownAlign;

  onAction(action: DropdownAction<T>): void {
    this.actionSelected.emit({ action: action.label, row: this.rowData });
    action.action(this.rowData);
  }
}