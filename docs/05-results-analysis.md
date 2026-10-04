# Resultados reales y análisis

## Serie definitiva

El [workflow 37225125461](https://github.com/Arkthos/software-security-api-lab/actions/runs/37225125461) ejecutó tres repeticiones completas el 4 de octubre de 2026, de 18:39:34 a 18:46:09 UTC. Cada repetición usa cuentas nuevas sobre el mismo despliegue. Las siete pruebas del instrumento pasaron por separado; no constituyen hallazgos de crAPI.

Commit del experimento: `f28d50d6412dccc167c5d9b3c7caa1755ba1d610`. Colección SHA-256: `9bc19d69749a00da0d7f679e927c09970aa0feecae2bdf8f24ffcde6e5aa3bf1`. Objetivo: crAPI v1.1.6-rc8 y los ocho digests fijados, verificados contra los manifiestos del despliegue. Los manifiestos originales conservan el estado del lock previo a su verificación; deployment registra las imágenes efectivamente ejecutadas.

| Run | Manifiesto | Solicitudes | PASS | FAIL | ERROR/BLOCKED |
|---|---|---|---|---|---|
| 1 | [2026-10-04T18-39-34-899Z-1b753bc5](../results/approved/2026-10-04T18-39-34-899Z-1b753bc5/run-manifest.json) | 28 | 23 | 5 | 0 |
| 2 | [2026-10-04T18-41-47-463Z-a8702241](../results/approved/2026-10-04T18-41-47-463Z-a8702241/run-manifest.json) | 28 | 23 | 5 | 0 |
| 3 | [2026-10-04T18-43-58-429Z-031b8653](../results/approved/2026-10-04T18-43-58-429Z-031b8653/run-manifest.json) | 28 | 23 | 5 | 0 |

Total: 84 solicitudes, 69 PASS y 15 FAIL. T06 tiene dos direcciones: por eso hay cinco solicitudes FAIL asociadas a cuatro IDs de caso. Todos los controles de preparación, propietarios, roles y TTL pasaron. Los resultados por caso son estables en las tres repeticiones; esto no es una estimación estadística.

- [Comparación por caso](../results/approved/comparison.md)
- [CSV para tablas del informe](../results/approved/cases.csv)
- [Corroboraciones calculadas](../results/approved/analysis.json)
- [Procedencia y hashes del archivo original](../results/approved/provenance.json)
- [Hashes SHA-256 de los archivos conservados](../results/approved/checksums.json)

## Hallazgos, riesgo y recomendación

La prioridad indica orden de trabajo propuesto para una API con este comportamiento. No se calculó CVSS y los datos del laboratorio son ficticios.

| ID / caso | Observación y control | Interpretación y riesgo | Recomendación verificable |
|---|---|---|---|
| H01 / T04 | Firma alterada: HTTP 200 y hash del email igual al dashboard legítimo T05, en 3/3 runs. | Autenticación insuficiente en esa ruta, compatible con OWASP API2:2023. Se entrega información del dashboard usando una firma alterada. No se ensayó modificación del subject ni se demostró toma de cuentas. Prioridad alta. | Aplicar validación criptográfica antes de usar claims y proteger la ruta en la cadena común de autenticación. Repetir T04: denegación sin datos; T05 debe seguir pasando. |
| H02 / T06 | A→B y B→A: HTTP 200; carId y hash de ubicación coinciden con el control del propietario objetivo. Los UUID propios son distintos. | BOLA, OWASP API1:2023: dos identidades acceden a ubicación de un objeto ajeno existente. Riesgo de exposición de ubicación e información asociada si este patrón se trasladara a producción. Prioridad alta. | Comprobar autorización por propietario al resolver cada UUID; denegar por defecto sin ubicación/objeto. Repetir ambos sentidos y conservar los controles propios exitosos. |
| H03 / T07 | ROLE_USER y ROLE_ADMIN verificados; el usuario ordinario obtiene exactamente el mismo cuerpo que el listado administrativo. Contiene 9, 11 y 13 usuarios por run. | BFLA, OWASP API5:2023, respecto de la política administrativa explícita de AdminUserView. La autenticación sola no impone el rol de la función. Riesgo de exposición del directorio de usuarios. Prioridad alta. | Exigir permiso administrativo en servidor antes de consultar/serializar el listado. Repetir T07: denegación sin users; mantener el control admin exitoso. |
| H04 / T11 | El mismo JWT de TTL 120 s produce HTTP 200 y el mismo cuerpo de vehículos después de exp+10 s. Huella idéntica y Date del servidor posterior a exp. | Incumple el margen experimental de 10 s. La lectura del validador RS256 publicado no muestra comparación de exp, lo que apoya la hipótesis de una omisión. RFC 7519 permite tolerancia de reloj pequeña: este run aislado no prueba violación de toda política RFC ni aceptación indefinida. Prioridad de revisión alta, con ese límite. | Validar exp mediante una biblioteca JWT, declarar tolerancia acotada y contrastar relojes. Repetir T10/T11 y añadir posteriormente una medición que exceda la tolerancia de producción declarada. |
| O01 / T02, T03, T08 | Las nueve respuestas 401 no incluyen WWW-Authenticate; no se observaron los campos protegidos comprobados. | Observación de conformidad HTTP respecto de RFC 9110 §15.5.2. La denegación de acceso sí pasó el oráculo; no se cuenta como exposición de datos. Prioridad baja. | Emitir el desafío de autenticación apropiado y verificar su presencia en los 401, además de mantener la ausencia de datos. |

## Evidencia temporal

Los valores son segundos respecto a exp. Un valor negativo corresponde a la solicitud anterior al vencimiento. Date tiene resolución de un segundo y procede de la respuesta HTTP; no representa una medición independiente del reloj interno del validador.

| Run | exp−iat | T10 local−exp | T11 local−exp | T11 Date−exp | Mismo JWT |
|---|---|---|---|---|---|
| 1 | 120 | -119.105 | 10.042 | 10 | Sí |
| 2 | 120 | -119.070 | 10.061 | 10 | Sí |
| 3 | 120 | -119.176 | 10.056 | 10 | Sí |

Las respuestas T10/T11 tienen el mismo SHA-256 en cada run. Esto demuestra igualdad del cuerpo observado junto con el control de vehículo propio; no permite reconstruir el token. El experimento solo mide aceptación en esos instantes.

## Código y literatura que apoyan la interpretación

- H01: [WebSecurityConfig](https://github.com/OWASP/crAPI/blob/d1cbf263a310ea4ed342e44a21a3ea32431e8ea6/services/identity/src/main/java/com/crapi/config/WebSecurityConfig.java) y el camino de resolución de usuario del dashboard. Relacionar con OWASP API2 y mediación completa.
- H02: [VehicleController](https://github.com/OWASP/crAPI/blob/d1cbf263a310ea4ed342e44a21a3ea32431e8ea6/services/identity/src/main/java/com/crapi/controller/VehicleController.java) y [VehicleServiceImpl](https://github.com/OWASP/crAPI/blob/d1cbf263a310ea4ed342e44a21a3ea32431e8ea6/services/identity/src/main/java/com/crapi/service/Impl/VehicleServiceImpl.java): getVehicleLocation recibe el UUID y devuelve el objeto sin comparar al solicitante. Relacionar con OWASP API1, la propiedad user-namespace de Atlidakis et al. y mediación completa.
- H03: [AdminUserView](https://github.com/OWASP/crAPI/blob/d1cbf263a310ea4ed342e44a21a3ea32431e8ea6/services/workshop/crapi/user/views.py) y [jwt_auth_required](https://github.com/OWASP/crAPI/blob/d1cbf263a310ea4ed342e44a21a3ea32431e8ea6/services/workshop/utils/jwt.py): política administrativa en código, sin imposición de ROLE_ADMIN en esa función. Relacionar con OWASP API5 y mínimo privilegio.
- H04: [JwtProvider](https://github.com/OWASP/crAPI/blob/d1cbf263a310ea4ed342e44a21a3ea32431e8ea6/services/identity/src/main/java/com/crapi/config/JwtProvider.java): generateJwtToken emite exp; la rama RS256 de validateJwtToken verifica firma y retorna sin compararlo. Relacionar con RFC 7519 §4.1.4. La correspondencia código/imagen se basa en la publicación del proveedor; no hay atestación de compilación.
- O01: RFC 9110 §15.5.2. No deducir una exposición a partir de un encabezado ausente.

Las cinco referencias completas y sus límites están en [sources.md](../references/sources.md). La taxonomía no sustituye a los controles y observaciones.

## Resultados que sí satisfacen el oráculo

T01, T02, T03, T05, T08, T09 y T10 pasan en 3/3 runs. Las secuencias de estado muestran denegación antes de crear la cuenta y acceso del mismo email después de signup/login. Es evidencia acotada de ese cambio de estado; no cubre eliminación de recursos, concurrencia, logout ni revocación.
