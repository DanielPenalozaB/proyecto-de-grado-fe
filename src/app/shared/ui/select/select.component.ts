import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  DropdownAlign,
  DropdownSide,
  RdxDropdownMenuContentDirective,
  RdxDropdownMenuItemDirective,
  RdxDropdownMenuTriggerDirective
} from '@radix-ng/primitives/dropdown-menu';
import { Check, ChevronDown, LucideAngularModule } from 'lucide-angular';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [
    CommonModule,
    RdxDropdownMenuTriggerDirective,
    RdxDropdownMenuItemDirective,
    RdxDropdownMenuContentDirective,
    LucideAngularModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative" #selectContainer>
      <button
        #triggerButton
        type="button"
        [rdxDropdownMenuTrigger]="selectMenu"
        [side]="side"
        [sideOffset]="sideOffset"
        [align]="align"
        [alignOffset]="alignOffset"
        [disabled]="disabled"
        [class]="buttonClasses"
        [attr.aria-expanded]="false"
        [attr.aria-haspopup]="'listbox'"
        [attr.aria-labelledby]="labelId"
        (click)="syncDropdownWidth()"
      >
        <span class="block truncate text-left">
          @if (selectedOption) {
            {{ selectedOption.label }}
          } @else {
            <span class="text-gray-500">{{ placeholder }}</span>
          }
        </span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <lucide-angular [img]="ChevronDown" class="h-4 w-4 text-gray-400" />
        </span>
      </button>

      <ng-template #selectMenu>
        <div
          #dropdownContent
          class="z-50 max-h-60 overflow-y-auto overflow-x-hidden rounded-md border bg-white shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          [style.width.px]="dropdownWidth"
          [style.min-width.px]="dropdownWidth"
          rdxDropdownMenuContent
          role="listbox"
        >
          @if (options.length === 0) {
            <div class="px-3 py-2 text-sm text-gray-500">No options available</div>
          } @else {
            @for (option of options; track option.value) {
              <button
                type="button"
                class="group relative flex w-full cursor-pointer items-center rounded px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent outline-none focus:bg-gray-100"
                [class.bg-gray-100]="isSelected(option)"
                [disabled]="option.disabled"
                rdxDropdownMenuItem
                (click)="selectOption(option)"
                role="option"
                [attr.aria-selected]="isSelected(option)"
              >
                <span class="block truncate">{{ option.label }}</span>
                @if (isSelected(option)) {
                  <span class="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                    <lucide-angular [img]="Check" class="h-4 w-4" />
                  </span>
                }
              </button>
            }
          }
        </div>
      </ng-template>
    </div>

    @if (error && showError) {
      <p class="mt-1 text-sm text-red-600">{{ error }}</p>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SelectComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select an option';
  @Input() disabled = false;
  @Input() error: string | null = null;
  @Input() showError = true;
  @Input() labelId?: string;
  @Input() side: DropdownSide = DropdownSide.Bottom;
  @Input() align: DropdownAlign = DropdownAlign.Start;
  @Input() sideOffset = 4;
  @Input() alignOffset = 0;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'default' | 'outline' = 'outline';

  @Output() selectionChange = new EventEmitter<SelectOption | null>();

  @ViewChild('triggerButton', { static: false }) triggerButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('dropdownContent', { static: false }) dropdownContent!: ElementRef<HTMLDivElement>;
  @ViewChild('selectContainer', { static: false }) selectContainer!: ElementRef<HTMLDivElement>;

  selectedOption: SelectOption | null = null;
  dropdownWidth: number = 0;
  private value: any = null;

  // Icons
  readonly ChevronDown = ChevronDown;
  readonly Check = Check;

  // Dropdown enums
  readonly DropdownSide = DropdownSide;
  readonly DropdownAlign = DropdownAlign;

  // Control Value Accessor
  private onChange = (value: any) => { };
  private onTouched = () => { };

  @HostListener('window:resize')
  onWindowResize() {
    this.syncDropdownWidth();
  }

  get buttonClasses(): string {
    const baseClasses = 'relative w-full cursor-pointer rounded-md border bg-white py-2 pl-3 pr-10 text-left shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500';

    const sizeClasses = {
      sm: 'text-sm py-1.5',
      md: 'text-sm py-2',
      lg: 'text-base py-2.5'
    };

    const variantClasses = {
      default: 'border-gray-300',
      outline: 'border-gray-300'
    };

    const errorClasses = this.error && this.showError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '';

    return `${baseClasses} ${sizeClasses[this.size]} ${variantClasses[this.variant]} ${errorClasses}`;
  }

  ngOnInit(): void {
    // Find initial selection if value is set
    if (this.value !== null && this.options.length > 0) {
      this.selectedOption = this.options.find(option => option.value === this.value) || null;
    }
  }

  ngAfterViewInit(): void {
    // Set initial dropdown width
    this.syncDropdownWidth();
  }

  ngOnDestroy(): void {
    // Clean up if needed
  }

  syncDropdownWidth(): void {
    if (this.triggerButton?.nativeElement) {
      const width = this.triggerButton.nativeElement.offsetWidth;
      this.dropdownWidth = width;

      setTimeout(() => {
        const currentWidth = this.triggerButton.nativeElement.offsetWidth;
        if (currentWidth !== this.dropdownWidth) {
          this.dropdownWidth = currentWidth;
        }
      }, 10);
    }
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;

    this.selectedOption = option;
    this.value = option.value;
    this.onChange(this.value);
    this.onTouched();
    this.selectionChange.emit(option);
  }

  isSelected(option: SelectOption): boolean {
    return this.selectedOption?.value === option.value;
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value;
    this.selectedOption = this.options.find(option => option.value === value) || null;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}