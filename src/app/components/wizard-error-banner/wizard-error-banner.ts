import { Component, ElementRef, inject, input } from '@angular/core';

@Component({
  selector: 'app-wizard-error-banner',
  templateUrl: './wizard-error-banner.html',
})
export class WizardErrorBanner {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly invalidFields = input.required<readonly string[]>();

  focus(): void {
    this.host.nativeElement.focus();
  }
}
