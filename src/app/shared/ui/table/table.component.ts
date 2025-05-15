import { cn } from '@/lib/utils';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DropdownAlign, DropdownSide } from '@radix-ng/primitives/dropdown-menu';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LucideAngularModule } from 'lucide-angular';
import { BadgeComponent } from '../badge/badge.component';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { Pagination, TableAction, TableColumn } from './table.interfaces';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BadgeComponent, DropdownMenuComponent],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent<T extends { id: number | string }> {
  @Input() columns: TableColumn[] = [];
  @Input() data: T[] = [];
  @Input() pagination?: Pagination;
  @Input() actions: TableAction<T>[] = [];
  @Input() selectable = false;
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() rowSelected = new EventEmitter<T[]>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() limitChange = new EventEmitter<number>();
  @Output() actionTriggered = new EventEmitter<{ action: string, row: T }>();

  selectedRows = new Set<T>();

  readonly cn = cn;
  readonly DropdownSide = DropdownSide;
  readonly DropdownAlign = DropdownAlign;

  // Pagination icons
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly ChevronsLeft = ChevronsLeft;
  readonly ChevronsRight = ChevronsRight;

  /**
   * Handles dropdown menu actions
   */
  onDropdownAction(event: { action: string, row: T }): void {
    this.actionTriggered.emit(event);
  }

  toggleRowSelection(row: T): void {
    if (this.selectedRows.has(row)) {
      this.selectedRows.delete(row);
    } else {
      this.selectedRows.add(row);
    }
    this.rowSelected.emit(Array.from(this.selectedRows));
  }

  toggleAllRows(): void {
    if (this.selectedRows.size === this.data.length) {
      this.selectedRows.clear();
    } else {
      this.data.forEach(row => this.selectedRows.add(row));
    }
    this.rowSelected.emit(Array.from(this.selectedRows));
  }

  onAction(event: { action: string, row: T }): void {
    const action = this.actions.find(a => a.label === event.action);

    if (action) {
      action.action(event.row);
      this.actionTriggered.emit(event);
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= (this.pagination?.pageCount || 1)) {
      this.pageChange.emit(page);
    }
  }

  changeLimit(size: number): void {
    this.limitChange.emit(size);
  }

  formatCellValue(row: T, column: TableColumn): string {
    if (column.format) {
      return column.format(row[column.key as keyof T]);
    }

    const value = row[column.key as keyof T];

    switch (column.type) {
      case 'date':
        return new Date(value as unknown as string).toLocaleDateString();
      case 'badge':
        return value as unknown as string;
      default:
        return value as unknown as string;
    }
  }
}