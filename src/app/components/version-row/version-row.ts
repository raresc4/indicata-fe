import { Component, computed, input, output } from '@angular/core';

import { IndicatorVersion, VersionOrigin } from '../../models/indicator-version.model';

interface OriginPresentation {
  readonly label: string;
  readonly chip: string;
}

const ORIGIN_PRESENTATION: Record<VersionOrigin, OriginPresentation> = {
  generated: {
    label: 'Generated',
    chip: 'bg-surface-container-high text-on-surface-variant',
  },
  edited: {
    label: 'Edited',
    chip: 'bg-primary-container text-on-primary-container',
  },
  unified: {
    label: 'Unified',
    chip: 'bg-secondary-container text-on-secondary-container',
  },
};

@Component({
  selector: 'app-version-row',
  host: {
    class: 'block',
  },
  templateUrl: './version-row.html',
})
export class VersionRow {
  readonly version = input.required<IndicatorVersion>();
  readonly selected = input<boolean>(false);
  readonly active = input<boolean>(false);
  readonly pickLabel = input<string>('');

  readonly select = output<number>();
  readonly load = output<string>();

  protected readonly originPresentation = computed<OriginPresentation>(
    () => ORIGIN_PRESENTATION[this.version().origin],
  );

  protected readonly formattedTimestamp = computed<string>(() =>
    formatTimestamp(this.version().createdAt),
  );

  protected readonly selectLabel = computed<string>(() => {
    const version = this.version();
    const action = this.selected() ? 'Deselect' : 'Select';
    return `${action} version ${version.versionNumber} for comparison`;
  });

  protected readonly loadLabel = computed<string>(() => {
    const version = this.version();
    return this.active()
      ? `Currently viewing version ${version.versionNumber}`
      : `Load version ${version.versionNumber} into the editor`;
  });

  protected readonly loadButtonClasses = computed<string>(() =>
    this.active()
      ? 'border-primary bg-primary text-on-primary hover:bg-primary/90'
      : 'border-outline-variant text-on-surface hover:border-primary hover:text-primary',
  );

  protected emitSelect(): void {
    this.select.emit(this.version().versionNumber);
  }

  protected emitLoad(): void {
    this.load.emit(this.version().id);
  }
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
