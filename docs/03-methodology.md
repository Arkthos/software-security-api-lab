# Metodología

## Selección del instrumento

| Herramienta | Uso que favorece | Decisión |
|---|---|---|
| Postman + Newman | Requests explícitas, variables, secuencias, aserciones y ejecución CLI de una colección | Seleccionada para este taller |
| OWASP ZAP | Proxy, exploración y escaneo; requiere configurar autenticación y cobertura | Alternativa para una fase de escaneo |
| Burp Suite | Inspección y manipulación manual de tráfico mediante proxy | Alternativa para exploración manual |

Esta tabla es una decisión metodológica, no un benchmark comparativo. Documentación oficial: https://learning.postman.com/docs/reference/newman-cli/command-line-integration-with-newman ; https://www.zaproxy.org/docs/ ; https://portswigger.net/burp/documentation . No afirmamos superioridad general de una herramienta.

## Diseño

1. Fijar software/configuración y verificar readiness.
2. Generar identidades de laboratorio únicas y contraseña desechable en memoria.
3. Ejecutar secuencias, cambiando una variable de interés por caso.
4. Registrar estado HTTP, aserciones, observaciones permitidas, hashes y tiempo.
5. Separar PASS, FAIL, BLOCKED y ERROR.
6. Revisar FAIL con controles positivos y el contrato antes de clasificarlo.
7. Relacionar la recomendación con la causa observada.

PASS: aserciones satisfechas dentro del alcance ensayado. FAIL: propiedad incumplida, pendiente de interpretación. BLOCKED: precondición faltante o prueba no implementada. ERROR: conexión, servidor 5xx u otro error operativo. Una denegación 500 no es PASS. Las denegaciones de autenticación esperan 401/403 y ausencia de campos protegidos; las pruebas BOLA podrán aceptar 404 con un objeto existente demostrado por su propietario.

El oráculo inicial comprueba campos conocidos del dashboard y JWT; no prueba ausencia universal de datos sensibles. El código HTTP y las aserciones quedan separados en la evidencia.

## Tiempo

Duración experimental: 120000 ms, verificada en JwtProvider.generateJwtToken: Date.getTime() más el valor de JWT_EXPIRATION. La configuración abrevia el TTL, no modifica el validador ni el JWT. Se registran iat/exp, instante anterior/posterior, hash del Authorization para demostrar el mismo token y margen de 10 s. La tolerancia de 10 s es política del experimento, no obligación del RFC. Contrastar con reloj del servidor antes de confirmar el hallazgo.

## Repetición

La primera fase estabiliza una ejecución. Antes del informe, repetir al menos tres runs reales; conservar desviaciones, variación de reloj, configuración y todos los IDs de ejecución. Este número es una decisión del protocolo, no una conclusión de la literatura. Las evidencias sintéticas solo validan el instrumento.
