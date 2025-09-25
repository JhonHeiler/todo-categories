import { Injectable, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RemoteConfig, fetchAndActivate, getValue } from '@angular/fire/remote-config';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private ready = new BehaviorSubject<boolean>(false);
  readonly ready$ = this.ready.asObservable();
  constructor(@Optional() private rc: RemoteConfig | null) {
    if (this.rc) {
      try {
        fetchAndActivate(this.rc).finally(() => this.ready.next(true));
      } catch {
        this.ready.next(true);
      }
    } else {
      // No Remote Config provided (e.g., tests or Firebase disabled)
      this.ready.next(true);
    }
  }

  getBoolean(key: string, fallback = false): boolean {
    if (!this.rc) return fallback;
    try {
      return getValue(this.rc, key).asBoolean();
    } catch {
      return fallback;
    }
  }

  // Backward-compatible alias
  bool(key: string, def = false) { return this.getBoolean(key, def); }
}
