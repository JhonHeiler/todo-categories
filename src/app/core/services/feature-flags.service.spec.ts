import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { FeatureFlagsService } from './feature-flags.service';

describe('FeatureFlagsService', () => {
  it('ready$ becomes true and bool returns default when placeholders present', (done) => {
    TestBed.configureTestingModule({ providers: [FeatureFlagsService] });
    const svc = TestBed.inject(FeatureFlagsService);
    svc.ready$.pipe(take(1)).subscribe(v => {
      expect(v).toBeTrue();
      expect(svc.bool('feature_bulk_complete', false)).toBeFalse();
      expect(svc.bool('feature_bulk_complete', true)).toBeTrue();
      done();
    });
  });
});
