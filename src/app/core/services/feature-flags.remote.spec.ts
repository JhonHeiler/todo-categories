import { TestBed } from '@angular/core/testing';
import { FeatureFlagsService } from './feature-flags.service';
import { RemoteConfig } from '@angular/fire/remote-config';

describe('FeatureFlagsService with RemoteConfig provided', () => {
  it('initializes and returns fallback when AngularFire getValue is unavailable', async () => {
    TestBed.configureTestingModule({ providers: [
      FeatureFlagsService,
      { provide: RemoteConfig, useValue: {} as any },
    ]});
    const svc = TestBed.inject(FeatureFlagsService);
    await new Promise<void>(res => svc.ready$.subscribe(r => { if (r) res(); }));
    // In unit tests, AngularFire getValue may not work outside injection context, so service should return fallback
    expect(svc.bool('feature_bulk_complete', true)).toBeTrue();
  });
});
