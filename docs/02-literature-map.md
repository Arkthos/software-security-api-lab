# Trazabilidad literaria

| Fuente | Afirmación usada | Casos | Límite de uso |
|---|---|---|---|
| OWASP API 2023 | Clasificar acceso indebido por objeto/función y fallos de autenticación | T01–T07, T11 | Clasificar después de confirmar datos, propietarios y política |
| RFC 7519 §4.1.4 | Un exp presente restringe el intervalo de aceptación | T10–T11 | JWT no implica OAuth; declarar tolerancia de reloj |
| RFC 9110 §15.5 | Interpretar 401/403/404 | T02–T03, T08 | Comprobar cuerpo; falta verificar WWW-Authenticate |
| Atlidakis et al. 2020 §II–III | Secuencias y propiedades de aislamiento de usuarios | T06, T08–T09 | No se reproduce el fuzzer ni extrapolan resultados |
| Saltzer y Schroeder 1975 §I.A.3 | Mediación completa y mínimo privilegio | T05–T07 | Son principios, no resultados experimentales |

Trazabilidad final requerida: fuente → propiedad → caso → request → observación → hallazgo → riesgo → recomendación. Referencias e IDs se conservan en `references/sources.json` y `tests/test-cases.json`.

La secuencia de estado inicial es inexistencia → signup → login → dashboard. Es una transición de estado de cuenta; no cubre modificación/eliminación de objetos, revocación, TOCTOU o condiciones de carrera.
