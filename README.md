# Software Security API Lab

Cuaderno de laboratorio del Taller investigativo 1: **El uso de las funciones de seguridad y la comprobación de relaciones de tiempo y estado**. Postman es el instrumento; Newman ejecuta la misma colección por CLI. Objetivo: OWASP crAPI local, v1.1.6.

**Estado v0.1:** implementación inicial; ejecución real de crAPI pendiente. T01–T05 y T08–T11 implementados. T06 y T07 quedan BLOCKED. Las pruebas sintéticas verifican el instrumento y no representan hallazgos de crAPI.

## Inicio

Requisitos: Git, Node.js 22, Docker Engine/Desktop con Compose v2 y puertos locales 8888/8025 disponibles. No necesita una cuenta Postman para Newman. El arranque descarga imágenes y necesita internet.

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run validate
npm test
npm run lab:setup
npm run lab:run
npm run lab:down
```

Los mismos comandos funcionan en PowerShell con Docker Desktop en modo contenedores Linux. `lab:down` conserva los volúmenes. Los datos de prueba son cuentas ficticias nuevas por ejecución.

`lab:run` devuelve 0=experimento completo sin fallos, 1=propiedad incumplida, 2=error operativo, 3=cobertura incompleta. **v0.1 siempre tiene cobertura incompleta** por T06/T07; si además hay FAIL, devuelve 1. GitHub Actions preserva evidencias aunque una propiedad falle. Un workflow verde no afirma que crAPI sea seguro.

## Uso manual de Postman

Importar `postman/api-security-lab.postman_collection.json`. Configurar las **variables de colección** `user_a_email`, `user_b_email` con dos emails nuevos @example.com y `lab_password` con una contraseña ficticia fuerte. Ejecutar la colección en orden. La colección usa variables de colección, no de environment. El runner genera esas variables automáticamente y no las escribe a disco.

La pausa de T11 se calcula con el exp del token sin modificar su firma. Requiere el laboratorio configurado con JWT_EXPIRATION=120000. Si falta el token o la duración no corresponde, la precondición falla y no se considera una prueba temporal válida.

## Documentación

- [Alcance y consigna](docs/01-scope.md)
- [Mapa de literatura](docs/02-literature-map.md)
- [Metodología](docs/03-methodology.md)
- [Casos y endpoints](docs/04-test-plan.md)
- [Estado de resultados](docs/05-results-analysis.md)
- [Limitaciones](docs/06-limitations.md)
- [Roadmap y siguiente sesión](docs/07-roadmap.md)
- [Fuentes accesibles](references/sources.md)
- [Evidencia y conservación](results/README.md)

## Control de cambios

Trabajo en ramas `feat/…` o `fix/…`, PR con validación y merge desde la cuenta del propietario. No usar resultados esperados como resultados observados. Ningún workflow hace push/merge automáticamente. No subir PDFs de la universidad ni redistribuir papers; registrar URLs y referencias.

## Reproducibilidad

El código de crAPI se fija por SHA. Se seleccionan imágenes con tag 1.1.6 y se resuelven a digests antes del arranque; el manifiesto conserva digests e IDs. Aún falta un lock de digests global validado: dos instalaciones nuevas pueden descargar una etiqueta que haya cambiado. La futura fijación de digests debe basarse en una ejecución real. Dependencias npm fijadas con package-lock.json; runner ubuntu-24.04 y Node 22.14.0 en CI.
