import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { FeatureFlagsService } from './feature-flags.service';

// Increase branch/function coverage by exercising ready$ and bool() paths

describe('FeatureFlagsService more branches', () => {
  it('emits ready$ true without remote config and returns defaults', (done) => {
    TestBed.configureTestingModule({ providers: [FeatureFlagsService] });
    const svc = TestBed.inject(FeatureFlagsService);
    svc.ready$.pipe(take(1)).subscribe((v: boolean) => {
      expect(v).toBeTrue();
      expect(svc.bool('x', true)).toBeTrue();
      expect(svc.bool('x', false)).toBeFalse();
      done();
    });
  });

  it('returns defaults on bool when not ready or without remote', () => {
    TestBed.configureTestingModule({ providers: [FeatureFlagsService] });
    const svc = TestBed.inject(FeatureFlagsService);
    expect(svc.bool('some', false)).toBeFalse();
    expect(svc.bool('some', true)).toBeTrue();
  });
  it('returns fallback values consistently', () => {
    TestBed.configureTestingModule({ providers: [FeatureFlagsService] });
    const svc = TestBed.inject(FeatureFlagsService);
    expect(svc.bool('some', false)).toBeFalse();
    expect(svc.bool('some', true)).toBeTrue();
  });
});
