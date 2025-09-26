# Build Android (Ionic + Angular + Cordova)

## Comandos rápidos

Desarrollo web:
```
npm start
```

Build producción web (solo genera `www/`):
```
npm run build:web
```

Build móvil (produce `www/` lista, aplana `www/browser/` y prepara Cordova):
```
npm run build:mobile
```

APK debug:
```
npm run android:debug
```

APK release (firmar manualmente después):
```
npm run android:release
```

Instalar debug en dispositivo (ejemplo):
```
C:\Android\Sdk\platform-tools\adb.exe install -r platforms\android\app\build\outputs\apk\debug\app-debug.apk
```

## Verificación post build

1. `www/index.html` contiene `<base href="./">` y referencia `styles-*.css` y `main-*.js`.
2. `platforms/android/app/src/main/assets/www/index.html` debe contener lo mismo tras `cordova prepare`.
3. Abrir la app y usar `chrome://inspect/#devices` para revisar consola y que aparezcan logs `[APP] bootstrap success`.

## Notas
- Se desactivó `inlineCritical` en producción para evitar que el WebView omita estilos diferidos.
- El script `tools/flatten-www.js` mueve el contenido de `www/browser/` (si Angular lo genera) a la raíz `www/` para que Cordova lo sirva correctamente.
- Tema claro forzado en `src/global.scss` y meta tags en `src/index.html`.
