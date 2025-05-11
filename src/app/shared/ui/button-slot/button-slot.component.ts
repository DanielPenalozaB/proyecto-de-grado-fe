import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appButtonSlot]',
  standalone: true
})
export class ButtonSlotDirective implements OnInit {
  @Input() buttonSlot = false;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    if (this.buttonSlot) {
      // This directive will transfer all attributes and listeners from
      // the host element to its first child element
      const element = this.el.nativeElement;
      const firstChild = element.firstElementChild;

      if (firstChild) {
        // Copy attributes
        for (const attr of element.attributes) {
          if (attr.name !== 'buttonSlot') {
            this.renderer.setAttribute(firstChild, attr.name, attr.value);
          }
        }

        // Replace the original element with its first child
        const parent = element.parentNode;
        if (parent) {
          // Clone the children to maintain their event listeners
          while (firstChild.firstChild) {
            this.renderer.appendChild(element, firstChild.firstChild);
          }
          parent.replaceChild(firstChild, element);
        }
      }
    }
  }
}