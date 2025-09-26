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

console.log('[APP] bootstrap start');
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(IonicStorageModule.forRoot()),
    provideFirebaseApp(() => {
      try {
        const app = initializeApp(environment.firebase);
        console.log('[APP] Firebase inicializado');
        return app;
      } catch (e) {
        console.error('[APP] Error inicializando Firebase', e);
        throw e;
      }
    }),
    provideRemoteConfig(() => {
      const rc = getRemoteConfig();
      rc.settings.minimumFetchIntervalMillis = 0;
      fetchAndActivate(rc).then(() => {
        console.log('[APP] Remote Config activado');
      }).catch(err => console.warn('[APP] Remote Config fetch error', err));
      return rc;
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (seed: SeedService) => () => seed.runOnce().then(() => console.log('[APP] Seed completado')).catch(e => console.error('[APP] Seed error', e)),
      deps: [SeedService],
      multi: true
    }
  ],
}).then(() => console.log('[APP] bootstrap success'))
  .catch(err => console.error('[APP] bootstrap failed', err));
