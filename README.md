# Software Security API Lab

Cuaderno de laboratorio del Taller investigativo 1: **El uso de las funciones de seguridad y la comprobación de relaciones de tiempo y estado**. Postman es el instrumento; Newman ejecuta la misma colección por CLI. Objetivo: OWASP crAPI local, v1.1.6-rc8.

**Estado:** laboratorio implementado y ejecutado. T01–T11, tres repeticiones reales y 84 solicitudes sin ERROR/BLOCKED; siete pruebas del instrumento aprobadas. Evidencia, comparación y recomendaciones disponibles en main. El PDF individual se redacta con este material.

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

`lab:run` devuelve 0=experimento completo sin fallos, 1=propiedad incumplida, 2=error operativo, 3=cobertura incompleta. Si una precondición falla, la cobertura se declara incompleta; un FAIL con cobertura completa devuelve 1. GitHub Actions preserva evidencias aunque una propiedad falle. Un workflow verde no afirma que crAPI sea seguro.

## Uso manual de Postman

Importar `postman/api-security-lab.postman_collection.json`. Configurar las **variables de colección** `user_a_email`, `user_b_email` con dos emails nuevos @example.com y `lab_password` con una contraseña ficticia fuerte, `user_a_number`/`user_b_number` con teléfonos ficticios únicos y `admin_password` con la contraseña de la cuenta seed de crAPI (ver TestUsers.java al commit fijado). Ejecutar la colección en orden. La colección usa variables de colección, no de environment. MailHog debe estar disponible en http://127.0.0.1:8025; la colección obtiene VIN/PIN y vincula cada vehículo. La cuenta admin es un fixture público de crAPI, no una cuenta personal. El runner genera esas variables automáticamente y no las escribe a disco.

La pausa de T11 se calcula con el exp del token sin modificar su firma. Requiere el laboratorio configurado con JWT_EXPIRATION=120000. Si falta el token o la duración no corresponde, la precondición falla y no se considera una prueba temporal válida.

## Documentación

- [Alcance y consigna](docs/01-scope.md)
- [Mapa de literatura](docs/02-literature-map.md)
- [Metodología](docs/03-methodology.md)
- [Casos y endpoints](docs/04-test-plan.md)
- [Resultados y recomendaciones](docs/05-results-analysis.md)
- [Serie definitiva y CSV](results/approved/README.md)
- [Guía para redactar el PDF](docs/08-deliverable-brief.md)
- [Historial de estabilización](docs/09-execution-history.md)
- [Limitaciones](docs/06-limitations.md)
- [Roadmap y siguiente sesión](docs/07-roadmap.md)
- [Fuentes accesibles](references/sources.md)
- [Evidencia y conservación](results/README.md)

## Control de cambios

Trabajo en ramas `feat/…` o `fix/…`, PR con validación y merge desde la cuenta del propietario. El experimento corre mediante workflow_dispatch o un push intencional a `experiment/**`; no corre en cada push general. No usar resultados esperados como resultados observados. Ningún workflow hace push/merge automáticamente. No subir PDFs de la universidad ni redistribuir papers; registrar URLs y referencias.

## Reproducibilidad

El objetivo es crAPI **v1.1.6-rc8**, una versión candidata elegida porque posee un conjunto completo de imágenes publicadas. Se fijan el commit d1cbf263a310ea4ed342e44a21a3ea32431e8ea6 y los ocho digests en lab/crapi.lock.json; el arranque no usa latest ni una etiqueta mutable. La correspondencia entre el tag de las imágenes y el tag de código se basa en la publicación del proveedor; no se verificó una atestación de compilación. Los resultados se atribuyen a los digests ejecutados.

Dependencias npm fijadas con package-lock.json; runner ubuntu-24.04 y Node 22.14.0 en CI. El manifiesto registra los IDs y digests efectivos. La primera configuración v1.1.6 se descartó porque el tag de MailHog (y otras imágenes) no estaba publicado; no se obtuvieron resultados de seguridad en ese intento.

## Resultados disponibles

[Workflow real aprobado](https://github.com/Arkthos/software-security-api-lab/actions/runs/37225125461): cada run contiene 23 PASS y 5 FAIL de propiedades de seguridad. Los controles pasaron; un workflow verde indica ejecución operativa completa, no seguridad de crAPI. Se observaron firma alterada aceptada, BOLA en ambos sentidos, listado administrativo desde ROLE_USER y aceptación del mismo JWT a exp+10 s. La salvedad de tolerancia temporal y la observación WWW-Authenticate están en el análisis.

La evidencia sanitizada está versionada en `results/approved`; `results/excluded` conserva un fallo de arranque y el primer intento incompleto. Para regenerar la comparación de los archivos conservados:

```bash
npm run analyze -- results/approved
```

La recuperación mediante `consolidate-evidence.yml` fija los workflows revisados, verifica hashes de archivos ZIP y exporta solamente evidencia sanitizada; no hace pushes ni merges. Los artifacts de Actions vencen a los 90 días; los archivos versionados quedan en el repositorio.
