# Plan de pruebas v0.1

Los IDs se fijan en este archivo y test-cases.json; prevalecen sobre los borradores previos de la conversación.

| ID | Caso | Estado | Expectativa |
|---|---|---|---|
| T01 | Login válido | implemented | 200 y JWT estructuralmente válido |
| T02 | Contraseña incorrecta | implemented | 401/403 sin token o datos protegidos |
| T03 | Dashboard sin token | implemented | 401/403 sin datos del usuario |
| T04 | Firma JWT alterada | implemented | 401/403 sin datos protegidos |
| T05 | Acceso al dashboard propio | implemented | 200 y email de A |
| T06 | Ubicación de vehículo de otro propietario | planned | 403/404 sin ubicación o datos del objeto B |
| T07 | Función privilegiada | planned | Denegación y ausencia de datos/efectos privilegiados |
| T08 | Login antes de existir la cuenta | implemented | 401/403 sin token |
| T09 | Acceso posterior a signup/login | implemented | Dashboard 200 correspondiente a A |
| T10 | JWT antes de exp | implemented | 200, identidad A y marca temporal anterior a exp |
| T11 | Mismo JWT después de exp | implemented | 401/403 sin datos; misma huella JWT y marca posterior a exp+10 s |

## Endpoints leídos en OpenAPI y código al SHA fijado

- POST `/identity/api/auth/signup`: email, name, number, password.
- POST `/identity/api/auth/login`: email, password; respuesta con `token`.
- GET `/identity/api/v2/user/dashboard`: bearer; respuesta con email del usuario.
- GET `/identity/api/v2/vehicle/vehicles`: lista de vehículos del usuario y UUID.
- GET `/identity/api/v2/vehicle/{vehicleId}/location`: respuesta carId/fullName/vehicleLocation.

## T06: protocolo pendiente de fixtures

1. Vincular un vehículo distinto a cada cuenta mediante el flujo normal de crAPI/MailHog.
2. Consultar `vehicles` con token A y token B; verificar propietarios y UUID distintos.
3. Consultar ubicación A con token A y B con token B como controles positivos.
4. Consultar la misma ubicación B con token A, sin cambiar nada más.
5. FAIL solamente si se obtiene la ubicación/objeto B; 200 sin datos identificables no basta para confirmar BOLA.
6. Comprobar también B→A y repetir. Conservar igualdad/identidad del objeto de forma sanitizada.

No se inventan UUID ni se prueba un recurso inexistente como sustituto de BOLA.

## T07: protocolo pendiente de política

OpenAPI contiene `/workshop/api/management/users/all`. Antes de usarlo, revisar código, permisos y un acceso permitido con el rol esperado. Una ruta con nombre “management” por sí sola no demuestra una política. No crear un resultado BFLA hasta verificarla.
