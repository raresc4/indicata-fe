import { Component, input, model } from '@angular/core';
import { SegmentOption } from '../../models/segment-option.model';

@Component({
  selector: 'app-segmented-control',
  templateUrl: './segmented-control.html',
})
export class SegmentedControl<T> {
  readonly options = input.required<readonly SegmentOption<T>[]>();
  readonly value = model.required<T>();

  protected isSelected(option: SegmentOption<T>): boolean {
    return option.value === this.value();
  }

  protected tabIndexFor(option: SegmentOption<T>): 0 | -1 {
    return this.isSelected(option) ? 0 : -1;
  }

  protected select(option: SegmentOption<T>): void {
    this.value.set(option.value);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const options = this.options();
    const count = options.length;
    if (count === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        event.preventDefault();
        this.value.set(options[(index + 1) % count].value);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        event.preventDefault();
        this.value.set(options[(index - 1 + count) % count].value);
        break;
      }
      case 'Enter':
      case ' ':
      case 'Spacebar': {
        event.preventDefault();
        this.value.set(options[index].value);
        break;
      }
      default:
        break;
    }
  }
}
