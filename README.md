# todo-categories (Ionic + Angular + Cordova)

App de To-Do con categorías, almacenamiento local (IndexedDB via @ionic/storage-angular) y feature flag con Firebase Remote Config (parámetro booleano: feature_bulk_complete).

## Características
- CRUD de tareas y categorías; asignación y filtro por categoría.
- Almacenamiento local (IndexedDB) usando @ionic/storage-angular.
- Flag remoto con Firebase Remote Config para mostrar el botón “Completar visibles”.
- Rendimiento: ChangeDetectionStrategy.OnPush, trackBy, listas reactivas.
- Tests unitarios para servicios y un componente.

## Scripts
- npm start: ejecutar en dev
- npm run build: compilar web
- npm test: correr unit tests (Karma/Jasmine)
- npm run test:ci: ejecutar tests en headless (WSL/CI)

## Configuración Firebase Remote Config
1) Edita `src/environments/environment.ts` y `src/environments/environment.prod.ts` con tus credenciales de Firebase Web App (Consola Firebase → Configuración del proyecto → General → Tus apps)
2) En Firebase Remote Config crea el parámetro booleano `feature_bulk_complete` (valor por defecto: false). Publica los cambios. La app hace fetch con `minimumFetchIntervalMillis = 0`.

## Compilar Android solo con CLI
1) Requisitos
- Java JDK 17 o 21
- Android SDK (sdkmanager y build-tools)
- Node.js, npm, Ionic CLI y Cordova

2) Configura sdk.dir en `local.properties` dentro de `android/` (Cordova lo generará en `platforms/android`, pero puedes crearlo en la raíz del SDK):

```
sdk.dir=/home/tuusuario/Android/Sdk
```

3) Instala paquetes del SDK

```
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

4) Añade plataforma Android (Cordova)

```
ionic cordova platform add android
```

5) Build Debug (CLI únicamente, sin Android Studio)

```
ionic cordova build android --debug
```

Salida: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

6) Build Release sin firmar

```
ionic cordova build android --release
```

Salida: `platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk`

7) Firma con apksigner
- Genera/usa un keystore:

```
keytool -genkeypair -v -keystore my-release-key.keystore -alias todo -keyalg RSA -keysize 2048 -validity 10000
```

- Firma y alinea:

```
apksigner sign --ks my-release-key.keystore --out app-release-signed.apk platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
zipalign -v 4 app-release-signed.apk app-release-aligned.apk
apksigner verify app-release-aligned.apk
```

## Obtener IPA vía GitHub Actions (macOS runner)
1) Crea secretos del repositorio:
- APPLE_CERTIFICATE_P12 (base64 del .p12)
- APPLE_CERTIFICATE_PASSWORD
- APPLE_TEAM_ID
- APPLE_BUNDLE_ID (por ej. com.tuorg.todo)
- APPLE_APPLEID (correo de Apple ID)
- APPLE_APP_PASSWORD (App Specific Password)

2) Workflow ejemplo `.github/workflows/ios.yml`:

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
      - run: npm ci
      - run: npm run build
      - run: npm i -g ionic cordova-res cordova@12
      - run: ionic cordova platform add ios
      - name: Import cert
        run: |
          CERT=cert.p12
          echo "$APPLE_CERTIFICATE_P12" | base64 --decode > $CERT
          security create-keychain -p "" build.keychain
          security default-keychain -s build.keychain
          security unlock-keychain -p "" build.keychain
          security import $CERT -k build.keychain -P "$APPLE_CERTIFICATE_PASSWORD" -T /usr/bin/codesign
          security set-key-partition-list -S apple-tool:,apple: -s -k "" build.keychain
        env:
          APPLE_CERTIFICATE_P12: ${{ secrets.APPLE_CERTIFICATE_P12 }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
      - name: Build iOS
        run: ionic cordova build ios --release
      - name: Archive
        run: |
          cd platforms/ios
          xcodebuild -workspace *.xcworkspace -scheme "App" -configuration Release -sdk iphoneos -archivePath build/app.xcarchive archive DEVELOPMENT_TEAM=$APPLE_TEAM_ID PRODUCT_BUNDLE_IDENTIFIER=$APPLE_BUNDLE_ID
          xcodebuild -exportArchive -archivePath build/app.xcarchive -exportOptionsPlist ../../exportOptions.plist -exportPath build
        env:
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          APPLE_BUNDLE_ID: ${{ secrets.APPLE_BUNDLE_ID }}
      - uses: actions/upload-artifact@v4
        with:
          name: ios-ipa
          path: platforms/ios/build/*.ipa
```

Nota: `exportOptions.plist` debe existir y especificar método (ad-hoc, app-store, etc.). Para publicación en App Store usa Transporter o fastlane.

## WSL en Windows: ejecutar la app
1) Instala dependencias en WSL

```
sudo apt update
sudo apt install -y openjdk-17-jdk
npm ci
```

2) Ejecuta en navegador

# todo-categories (Ionic + Angular + Cordova)

App de To-Do con categorías, almacenamiento local (IndexedDB via @ionic/storage-angular), feature flag opcional con Firebase Remote Config, y build Android por CLI.

## Características
- CRUD de tareas y categorías; asignación y filtro por categoría.
- Almacenamiento local (IndexedDB) usando @ionic/storage-angular.
- Flag remoto (opcional) con Firebase Remote Config para mostrar el botón “Completar visibles”.
- Rendimiento: ChangeDetectionStrategy.OnPush, trackBy, listas reactivas.
- Seed inicial (1ª vez): 3 categorías (Trabajo, Hogar, Estudio) y 4 tareas (2 completas).
- Tests unitarios y configuración para WSL/CI con Puppeteer (headless, no-sandbox).

## Scripts
- npm start: ejecutar en dev (ng serve)
- npm run build: compilar web (genera www/)
- npm test: correr unit tests (Karma/Jasmine)
- npm run test:ci: ejecutar tests en headless (WSL/CI)
- ionic:serve / ionic:build: atajos para Ionic CLI si lo usas.

## Firebase (opcional)
- La app funciona sin credenciales: si `environment.firebase` contiene placeholders (TU_API_KEY, TU_PROYECTO, …), NO se inicializa Firebase y NO se hacen llamadas remotas. El botón “Completar visibles” dependerá de la flag y puede no mostrarse.
1) Para habilitar la flag remota, edita `src/environments/environment.ts` y `src/environments/environment.prod.ts` con tus credenciales de Firebase Web App (Consola Firebase → Configuración del proyecto → General → Tus apps). Pega el objeto de configuración completo en `firebase`.
2) En Firebase Remote Config crea el parámetro booleano `feature_bulk_complete` (valor por defecto: false) y publica. La app hace fetch con `minimumFetchIntervalMillis = 0`.

## WSL en Windows: serve, tests y build
1) Instala dependencias en WSL

```
sudo apt update
sudo apt install -y openjdk-17-jdk
npm ci
```

2) Ejecuta en navegador

```
npm start
```

Abre http://localhost:4200 en tu navegador de Windows (Edge/Chrome). Si `localhost` no carga, usa `http://wsl.localhost:4200`.

3) Ejecutar tests (headless)

```
npm run test:ci
```

4) Build web (genera carpeta www/)

```
npm run build
```

5) Android desde WSL
Recomendado usar Android SDK en Windows y correr `ionic cordova build android` desde PowerShell/Windows para evitar problemas de USB y emuladores. Si insistes en WSL, monta el SDK por ruta /mnt/c/Users/... y configura sdk.dir.

## Windows: compilar APK solo con CLI (sin Android Studio)
1) Requisitos
- Java JDK 17
- Android SDK (cmdline-tools en %ANDROID_SDK_ROOT%)
- Node.js, npm, Ionic CLI y Cordova

2) Acepta licencias e instala paquetes

```
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

3) Añade plataforma Android (Cordova)

```
ionic cordova platform add android
```

4) Asegura local.properties con la ruta del SDK (PowerShell)

```
echo sdk.dir=%ANDROID_SDK_ROOT% | Out-File -FilePath platforms/android/local.properties -Encoding ascii
```

5) Preparar y build Debug (CLI únicamente)

```
ionic cordova prepare android
ionic cordova build android --debug
```

Salida: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

6) Build Release sin firmar (opcional)

```
ionic cordova build android --release
```

Salida: `platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk`

7) Firma con apksigner (opcional)

```
keytool -genkeypair -v -keystore C:\work\my-release-key.jks -storetype JKS -keyalg RSA -keysize 2048 -validity 10000 -alias mykey
apksigner sign --ks C:\work\my-release-key.jks --ks-key-alias mykey --out C:\work\app-release-signed.apk platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
zipalign -v 4 C:\work\app-release-signed.apk C:\work\app-release-aligned.apk
apksigner verify C:\work\app-release-aligned.apk
```

## Capturas sugeridas
- Lista con categorías de seed (Trabajo, Hogar, Estudio)
- Lista con tareas seed (2 completas, 2 pendientes)
- Filtro por categoría funcionando
- Botón “Completar visibles” visible cuando la flag remota `feature_bulk_complete` está en true

## Notas de rendimiento
- Componentes standalone con ChangeDetectionStrategy.OnPush.
- Listas con trackBy y flujos RxJS.
- Evita pipes pesadas en plantillas.
- Virtual scroll opcional para listas muy largas.
