import { Injectable, TemplateRef } from '@angular/core';
import { RdxDialogService } from '@radix-ng/primitives/dialog';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private closeSubject = new Subject<void>();

  // Expose as observable for components to subscribe to
  onClose$ = this.closeSubject.asObservable();

  constructor(private rdxDialogService: RdxDialogService) { }

  open(content: TemplateRef<unknown>): void {
    this.rdxDialogService.open({
      content,
      backdropClass: [
        'data-[state=open]:animate-in',
        'data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0',
        'data-[state=open]:fade-in-0',
        'fixed',
        'inset-0',
        'z-50',
        'bg-black/80'
      ]
    });
  }

  close(): void {
    this.closeSubject.next();
  }
}