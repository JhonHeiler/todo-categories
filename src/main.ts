import { bootstrapApplication } from '@angular/platform-browser';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { IonicStorageModule } from '@ionic/storage-angular';
import { SeedService } from './app/core/services/seed.service';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideRemoteConfig, getRemoteConfig } from '@angular/fire/remote-config';
import { fetchAndActivate } from 'firebase/remote-config';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(IonicStorageModule.forRoot()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideRemoteConfig(() => {
      const rc = getRemoteConfig();
      // Ensure fast updates during development/testing
      rc.settings.minimumFetchIntervalMillis = 0;
      // Try to warm up config on startup; ignore failures
      try { fetchAndActivate(rc).catch(() => void 0); } catch {}
      return rc;
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (seed: SeedService) => () => seed.runOnce(),
      deps: [SeedService],
      multi: true
    }
  ],
});
