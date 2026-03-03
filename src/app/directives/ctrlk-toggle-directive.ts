import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appCtrlKToggle]',
  standalone: true,
})
export class CtrlKToggleDirective {
  @Input() isOpen: boolean = false;
  @Input() setIsOpen!: (isOpen: boolean) => void;

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'k' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.setIsOpen(!this.isOpen);
    }
  }
}
