import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import * as fc from 'fast-check';

import { Cycle } from '../models/cycle.model';
import { University } from '../models/university.model';
import { WizardFieldValues, WizardState, WizardStepNumber } from '../models/wizard-state.model';
import { UNIVERSITIES } from '../mocks/universities.mock';
import { WizardStateService } from './wizard-state.service';

type ServiceAction = (service: WizardStateService) => void;

const cycles: readonly Cycle[] = ['Bachelor', 'Master', 'Doctorate'];
const stepNumbers: readonly WizardStepNumber[] = [1, 2, 3];

const cycleArb: fc.Arbitrary<Cycle> = fc.constantFrom(...cycles);
const stepArb: fc.Arbitrary<WizardStepNumber> = fc.constantFrom(...stepNumbers);
const universityOptions: readonly (University | null)[] = [...UNIVERSITIES, null];
const universityArb: fc.Arbitrary<University | null> = fc.constantFrom(...universityOptions);

const partialValuesArb: fc.Arbitrary<Partial<WizardFieldValues>> = fc.record(
  {
    cycle: cycleArb,
    university: universityArb,
    faculty: fc.string(),
    domain: fc.string(),
    website: fc.oneof(fc.constant(''), fc.webUrl(), fc.string()),
    reportName: fc.string(),
  },
  { requiredKeys: [] },
);

const actionArb: fc.Arbitrary<ServiceAction> = fc.oneof(
  cycleArb.map(
    (cycle): ServiceAction =>
      (service) =>
        service.setCycle(cycle),
  ),
  partialValuesArb.map(
    (values): ServiceAction =>
      (service) =>
        service.patchStep(values),
  ),
  stepArb.map(
    (step): ServiceAction =>
      (service) =>
        service.goTo(step),
  ),
  fc.constant<ServiceAction>((service) => service.goNext()),
  fc.constant<ServiceAction>((service) => service.goBack()),
  fc.array(fc.string(), { maxLength: 6 }).map(
    (fields): ServiceAction =>
      (service) =>
        service.setValidationError(fields),
  ),
  fc.constant<ServiceAction>((service) => service.clearValidationError()),
  fc.constant<ServiceAction>((service) => service.create()),
  fc.constant<ServiceAction>((service) => service.reset()),
);

function cloneState(state: WizardState): WizardState {
  return structuredClone(state);
}

describe('WizardStateService contract', () => {
  it('exposes state$ as an Observable without a public mutation surface', () => {
    const service = new WizardStateService();

    expect(service.state$).toBeInstanceOf(Observable);
    expect(service.state$ instanceof BehaviorSubject).toBe(false);

    const stream = service.state$ as unknown as { next?: unknown; value?: unknown };
    expect(typeof stream.next).toBe('undefined');
    expect('value' in stream).toBe(false);

    let latest: WizardState | undefined;
    const sub: Subscription = service.state$.subscribe((state) => {
      latest = state;
    });

    const before = latest;
    service.setCycle('Bachelor');
    const after = latest;

    expect(before).not.toBe(after);
    expect(after?.values.cycle).toBe('Bachelor');
    sub.unsubscribe();
  });

  it('instantiates with no HttpClient dependency via new WizardStateService()', () => {
    const service = new WizardStateService();

    expect(service).toBeInstanceOf(WizardStateService);
    expect(service.snapshot.step).toBe(1);
    expect(service.snapshot.values.cycle).toBe('Doctorate');
    expect(service.snapshot.error).toBeNull();
  });

  it('provides the service through TestBed without an HttpClient provider', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(WizardStateService);

    expect(service).toBeInstanceOf(WizardStateService);
    expect(service.snapshot).toEqual(new WizardStateService().snapshot);
  });
});

describe('Feature: project-setup-wizard, Property 14: State emissions are new, non-mutating copies', () => {
  it('emits distinct references and never mutates captured snapshots', () => {
    fc.assert(
      fc.property(fc.array(actionArb, { minLength: 1, maxLength: 40 }), (actions) => {
        const service = new WizardStateService();
        const emissions: WizardState[] = [];
        const sub = service.state$.subscribe((state) => emissions.push(state));

        for (const action of actions) {
          const emissionsBefore = emissions.length;
          const snapshotBefore = service.snapshot;
          const snapshotClone = cloneState(snapshotBefore);

          action(service);

          const snapshotAfter = service.snapshot;
          expect(snapshotBefore).toEqual(snapshotClone);

          if (snapshotAfter !== snapshotBefore) {
            expect(emissions.length).toBe(emissionsBefore + 1);
            expect(emissions[emissions.length - 1]).toBe(snapshotAfter);
          }
        }

        for (let i = 1; i < emissions.length; i += 1) {
          expect(emissions[i]).not.toBe(emissions[i - 1]);
        }

        sub.unsubscribe();
      }),
      { numRuns: 100 },
    );
  });
});
