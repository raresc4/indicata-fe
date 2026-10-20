import { TestBed } from '@angular/core/testing';
import { PasswordStrengthService } from './password-strength.service';

describe('PasswordStrengthService', () => {
  let service: PasswordStrengthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordStrengthService);
  });

  it('should return an empty label and zero score for an empty password', () => {
    const result = service.evaluate('');
    expect(result.score).toBe(0);
    expect(result.label).toBe('');
  });

  it('should score a trivial password as weak', () => {
    const result = service.evaluate('password');
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.label.length).toBeGreaterThan(0);
  });

  it('should score a complex passphrase as strong', () => {
    const result = service.evaluate('7hunder-Oak!Marble_92z');
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.label).toBe(result.score === 4 ? 'Strong' : 'Good');
  });
});
