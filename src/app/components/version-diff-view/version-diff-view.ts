import { Component, input } from '@angular/core';

import { VersionDiff } from '../../services/indicator-api.service';

@Component({
  selector: 'app-version-diff-view',
  host: {
    class: 'block',
  },
  templateUrl: './version-diff-view.html',
})
export class VersionDiffView {
  readonly diff = input.required<VersionDiff>();
}
