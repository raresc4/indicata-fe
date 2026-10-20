import { Component, computed, DestroyRef, forwardRef, inject, input, signal } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { University } from '../../models/university.model';
import { UNIVERSITIES } from '../../mocks/universities.mock';
import { filterUniversities } from '../../services/wizard-validators';

@Component({
  selector: 'app-university-typeahead',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
  templateUrl: './university-typeahead.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UniversityTypeahead),
      multi: true,
    },
  ],
})
export class UniversityTypeahead implements ControlValueAccessor {
  private readonly destroyRef = inject(DestroyRef);

  readonly options = input<readonly University[]>(UNIVERSITIES);
  readonly invalid = input<boolean>(false);
  readonly errorId = input<string | null>(null);

  protected readonly describedBy = computed<string | null>(() =>
    this.invalid() ? this.errorId() : null,
  );

  protected readonly queryControl = new FormControl<string>('', { nonNullable: true });
  protected readonly selected = signal<University | null>(null);
  protected readonly query = signal<string>('');

  protected readonly filtered = computed<readonly University[]>(() =>
    filterUniversities(this.options(), this.query()),
  );

  protected readonly hasResults = computed<boolean>(() => this.filtered().length > 0);

  private onChange: (value: University | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.queryControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.query.set(value);
      if (this.selected() !== null && value !== this.displayWith(this.selected())) {
        this.selected.set(null);
        this.onChange(null);
      }
    });
  }

  protected displayWith(value: University | null): string {
    return value === null ? '' : value.name;
  }

  protected onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const university = event.option.value as University;
    this.selected.set(university);
    this.query.set(university.name);
    this.onChange(university);
    this.onTouched();
  }

  protected onBlur(): void {
    this.onTouched();
  }

  writeValue(value: University | null): void {
    this.selected.set(value);
    this.query.set(this.displayWith(value));
    this.queryControl.setValue(this.displayWith(value), { emitEvent: false });
  }

  registerOnChange(fn: (value: University | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.queryControl.disable({ emitEvent: false });
    } else {
      this.queryControl.enable({ emitEvent: false });
    }
  }
}
