import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';

import { WizardStateService } from '../../services/wizard-state.service';

@Component({
  selector: 'app-wizard-success-view',
  imports: [AsyncPipe],
  templateUrl: './wizard-success-view.html',
})
export class WizardSuccessView {
  private readonly state = inject(WizardStateService);
  protected readonly reportName$ = this.state.state$.pipe(map((state) => state.values.reportName));

  protected openDocumentManager(): void {}

  protected startAnother(): void {
    this.state.reset();
  }
}
