import { TestBed } from '@angular/core/testing';
import { FeatureFlagsService } from './feature-flags.service';

describe('FeatureFlagsService without RemoteConfig', () => {
  it('does not call Remote Config and returns defaults', (done) => {
    TestBed.configureTestingModule({ providers: [FeatureFlagsService] });
    const svc = TestBed.inject(FeatureFlagsService);
    svc.ready$.subscribe(v => {
      if (v) {
        expect(svc.bool('feature_bulk_complete', false)).toBeFalse();
        done();
      }
    });
  });
});
