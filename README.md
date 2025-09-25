# todo-categories (Ionic + Angular + Cordova)

Aplicación To-Do con categorías, almacenamiento local y feature flag con Firebase Remote Config (parámetro booleano: feature_bulk_complete).

## 1) Descripción
- CRUD de tareas y categorías con filtro por categoría.
- Persistencia local (IndexedDB vía `@ionic/storage-angular`).
- Flag remota `feature_bulk_complete` que muestra el botón “Completar visibles”.
- Semilla en el primer arranque: 3 categorías (Trabajo, Hogar, Estudio) y 4 tareas (2 completas).

## 2) Stack & arquitectura
- Stack: Angular 20, Ionic 8 (standalone), Cordova, RxJS 7.8, AngularFire (`@angular/fire` app + remote-config).
- Persistencia: `@ionic/storage-angular` (IndexedDB) envuelta por `StorageService`.
- Arquitectura (servicios):
  - `TaskService`, `CategoryService`: estado en memoria con `BehaviorSubject`, persistencia transparente.
  - `FeatureFlagsService`: lectura de Remote Config con fallback seguro cuando no hay Firebase.
  - `SeedService`: `APP_INITIALIZER` para sembrar datos una vez.
- Páginas standalone (OnPush): `TasksPage`, `CategoriesPage`; routing con `provideRouter` y lazy `loadComponent`.

## 3) Cómo correr
Requisitos: Node 20+, npm, (opcional) Ionic CLI.

```bash
npm ci
npm start
# Abrir http://localhost:4200
```

Opcional (Ionic):
```bash
npm run ionic:serve
```

WSL (Windows):
```bash
sudo apt update && sudo apt install -y openjdk-17-jdk
npm ci
npm start
# Si no abre en localhost, usar http://wsl.localhost:4200
```

## 4) Firebase (Remote Config)
1) Crea una Web App en Firebase Console → Configuración del proyecto → General → Tus apps y copia el `firebaseConfig`.
2) Pega el objeto en `src/environments/environment.ts` y `environment.prod.ts` (clave `firebase`).
3) En Remote Config crea el parámetro booleano `feature_bulk_complete` y Publica.

Notas:
- En desarrollo se usa `minimumFetchIntervalMillis = 0` para ver cambios al instante (solo demo).
- Si Firebase no está configurado, el servicio retorna fallbacks y la app funciona sin llamadas remotas.

## 5) Android (solo CLI)
Requisitos: JDK 17, Android SDK (cmdline-tools, build-tools), Ionic/Cordova.

Instalar/aceptar SDK (una vez):
```bash
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

Añadir plataforma (si no existe):
```bash
npx ionic cordova platform add android
```

Debug APK:
```bash
npx ionic cordova build android --debug
# platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

Release APK sin firmar:
```bash
npx ionic cordova build android --release
# platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

Firmado (zipalign → sign → verify):
```bash
keytool -genkeypair -v -keystore ~/.keystores/todo-categories.jks -alias todo-categories -keyalg RSA -keysize 2048 -validity 3650
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk app-release-aligned.apk
apksigner sign --ks ~/.keystores/todo-categories.jks --out app-release-signed.apk app-release-aligned.apk
apksigner verify app-release-signed.apk
```

WSL recomendación: usar el SDK en Windows y ejecutar Cordova desde PowerShell para evitar problemas de USB/emulador. Si usas WSL, monta el SDK (ruta /mnt/c/...) y crea `platforms/android/local.properties` con `sdk.dir`.

## 6) iOS (GitHub Actions)
Requiere macOS runner. Secretos sugeridos: `APPLE_CERTIFICATE_P12`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_TEAM_ID`, `APPLE_BUNDLE_ID`, `APPLE_APPLEID`, `APPLE_APP_PASSWORD`.

Workflow mínimo (`.github/workflows/ios.yml`):
```yaml
name: ios-build
on: [workflow_dispatch]
jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci && npm run build
      - run: npm i -g ionic cordova-res cordova@12
      - run: ionic cordova platform add ios
      - name: Build iOS (release)
        run: ionic cordova build ios --release
      # Export/firmado requieren certificados y exportOptions.plist
```

## 7) Rendimiento
- Standalone + `ChangeDetectionStrategy.OnPush`.
- `trackBy` en listas, flujos RxJS para evitar trabajo extra.
- Preload de rutas; sin pipes pesadas en plantilla.
- `minimumFetchIntervalMillis = 0` solo en desarrollo/demo.

## 8) Tests & cobertura
Headless vía Puppeteer (Chrome No Sandbox). Umbral global ≥ 60%.
```bash
npm run test:ci
```

## 9) Capturas / video
- Sugeridas: lista inicial (seed), filtro por categoría, botón “Completar visibles” activo.
- Puedes colocar imágenes en `docs/` o `src/assets/` y enlazarlas aquí.

## 10) Respuestas a las 3 preguntas
1) ¿Cómo evitas llamadas a Firebase cuando no hay credenciales reales?
   - El servicio inyecta `RemoteConfig` de forma opcional y tiene fallbacks. Si no hay RC, `ready$` emite y los getters devuelven valores por defecto.
2) ¿Qué decisiones tomaste para rendimiento?
   - Standalone + OnPush, `trackBy`, listas reactivas, seeding en `APP_INITIALIZER`, y mínima lógica en plantillas. RC con fetch interval 0 solo para facilitar la demo.
3) ¿Qué harías a continuación para producción?
   - Subir `minimumFetchIntervalMillis` (por ejemplo 3600000), agregar e2e, analítica/observabilidad, manejo de errores más fino y virtual scroll si la lista crece mucho.

---

Scripts útiles:
```bash
npm start              # serve
npm run build          # build web (www/)
npm run test:ci        # tests headless + cobertura
npm run ionic:serve    # opcional
npm run ionic:build    # opcional
```
