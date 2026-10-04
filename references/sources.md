# Fuentes adoptadas

Cinco fuentes para este incremento. URLs de contenido, no resúmenes de Consensus.

## OWASP-API-2023

OWASP Foundation. (2023). OWASP API Security Top 10 – 2023.

https://api-security.owasp.org/editions/2023/en/0x11-t10/

Localizador: API1, API2 y API5

Apoya: Taxonomía de autorización por objeto/función y autenticación.

Límite: No define el contrato de cada endpoint; comprobar datos y política antes de clasificar.

## RFC7519

Jones, M., Bradley, J., & Sakimura, N. (2015). JSON Web Token (JWT) (RFC 7519). IETF.

https://www.rfc-editor.org/rfc/rfc7519.html

Localizador: §4.1.4, §4.1.6

Apoya: Si exp está presente, el token no debe aceptarse a partir de ese instante; el protocolo permite una tolerancia de reloj acotada.

Límite: No exige exp en todos los JWT. La política de tolerancia debe declararse; no identifica OAuth.

## RFC9110

Fielding, R., Nottingham, M., & Reschke, J. (2022). HTTP Semantics (RFC 9110). IETF.

https://www.rfc-editor.org/rfc/rfc9110.html

Localizador: §15.5.2, §15.5.4 y §15.5.5

Apoya: Semántica de 401, 403 y 404 para interpretar respuestas.

Límite: Un código de estado no prueba ausencia de exposición; 401 debe incluir WWW-Authenticate. Ese encabezado queda pendiente de comprobación.

## ATLIDAKIS-2020

Atlidakis, V., Godefroid, P., & Polishchuk, M. (2020). Checking Security Properties of Cloud Service REST APIs. 2020 IEEE 13th International Conference on Software Testing, Validation and Verification (ICST), 387–397.

https://patricegodefroid.github.io/public_psfiles/icst2020.pdf

Localizador: §II y §III.A, regla user-namespace

Apoya: Secuencias de solicitudes y propiedades verificables; recursos de un espacio de usuario no deben ser accesibles desde otro.

Límite: No reproducimos el fuzzer o su evaluación; adoptamos propiedades y lógica experimental.

## SALTZER-1975

Saltzer, J. H., & Schroeder, M. D. (1975). The protection of information in computer systems. Proceedings of the IEEE, 63(9), 1278–1308.

https://web.mit.edu/saltzer/www/publications/protection/Basic.html

Localizador: §I.A.3: design principles

Apoya: Mediación completa, mínimo privilegio y denegación por defecto.

Límite: Principios de diseño, no evidencia empírica de los resultados de crAPI.

## Ajuste de alcance

RFC 9700 se mantiene como candidato del corpus previo, pero no se usa como norma del login de crAPI: no se ha establecido un flujo OAuth. RFC 7519 ocupa ese espacio para comprobar el claim exp realmente emitido. El paper ICST 2020 se adopta en este incremento porque combina secuencias y propiedades de seguridad; RESTler 2019 sigue como antecedente, sin duplicarlo en las cinco fuentes.

## Documentación operativa adicional

No forma parte del corpus académico de cinco: especificación OpenAPI y código de crAPI fijados al commit del laboratorio, documentación oficial de Postman/Newman.

- https://github.com/OWASP/crAPI/tree/d1cbf263a310ea4ed342e44a21a3ea32431e8ea6
- https://github.com/OWASP/crAPI/blob/d1cbf263a310ea4ed342e44a21a3ea32431e8ea6/openapi-spec/crapi-openapi-spec.json
- https://learning.postman.com/docs/reference/newman-cli/command-line-integration-with-newman
