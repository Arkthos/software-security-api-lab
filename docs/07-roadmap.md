# Roadmap y recuperación de sesión

## Incremento 0.1

- [x] Leer consigna y diseñar matriz de cumplimiento.
- [x] Revisar versión estable, OpenAPI, formato JWT y configuración temporal.
- [x] Implementar T01–T05, T08–T11 y generación determinista de colección.
- [x] Runner Newman con evidencias permitidas y separación FAIL/BLOCKED/ERROR.
- [x] Preparación Docker, CLI multiplataforma y workflows.
- [x] Repositorio `Arkthos/software-security-api-lab` privado creado por el propietario, rama main inicializada con README.
- [x] Publicar incremento en rama `feat/reproducible-lab-v0.1` y PR #1.
- [x] Validación CI del primer commit aprobada; repetir ante cambios posteriores.
- El estado vigente del merge y sus checks se consulta en [PR #1](https://github.com/Arkthos/software-security-api-lab/pull/1).
- [ ] Ejecutar crAPI real y reparar problemas de preparación/instrumentación.

## Incremento 0.2: completar autorización

- [ ] Validar fixtures de vehículos A/B y automatizar vinculación con MailHog.
- [ ] Implementar T06, controles propios y ambos sentidos A→B/B→A.
- [ ] Leer política de funciones/roles; seleccionar operación adecuada para T07 y control privilegiado.
- [ ] Mejorar evidencia: igualdad de objeto y propietario comprobada sin exponer datos sensibles.
- [ ] Comprobar WWW-Authenticate y cuerpos de denegación por contrato.

## Incremento 0.3: evidencia definitiva

- [ ] Fijar digests globales y SHAs de actions tras validar un run.
- [ ] Validar misma huella JWT, timestamps y reloj del servidor en T10/T11.
- [ ] Repetir tres veces con manifiestos y comparar resultados.
- [ ] Revisar hallazgos y recomendaciones vinculadas a fuentes.
- [ ] Registrar hashes de archivos de evidencia; conservar runs aprobados mediante PR.
- [ ] Exportar artifacts antes de vencer 90 días y versionar evidencias aprobadas.

## Incremento 1.0: informe

- [ ] Redactar informe ejecutivo individual en español con APA 7.
- [ ] Incluir todas las secciones de la consigna y evidencia legible.
- [ ] Revisar rúbrica y preparar defensa de decisiones/hallazgos.

## Retomar

Leer README, este roadmap y docs/05-results-analysis.md. Verificar PRs/workflows existentes antes de repetir operaciones. Recuperar el último artifact y run-manifest; no inventar progreso perdido. Los pushes/merges se gestionan desde esta conversación con la cuenta Arkthos. Los workflows no publican commits automáticamente.

## Backlog en GitHub

- [Issue #2: primer despliegue real](https://github.com/Arkthos/software-security-api-lab/issues/2).
- [Issue #3: BOLA y función privilegiada](https://github.com/Arkthos/software-security-api-lab/issues/3).
- [Issue #4: repeticiones, análisis e informe](https://github.com/Arkthos/software-security-api-lab/issues/4).

Validación local de v0.1: seis pruebas del instrumento aprobadas, incluida una ejecución Newman sintética. El workflow de validación comprueba el mismo instrumento en GitHub.
