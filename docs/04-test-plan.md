# Plan de pruebas completo

Los IDs se fijan en este archivo y test-cases.json; prevalecen sobre los borradores previos de la conversación.

| ID | Caso | Estado | Expectativa |
|---|---|---|---|
| T01 | Login válido | implemented | 200 y JWT estructuralmente válido |
| T02 | Contraseña incorrecta | implemented | 401/403 sin token o datos protegidos |
| T03 | Listado autenticado de vehículos sin token | implemented | 401/403 sin vehículos |
| T04 | Firma JWT alterada | implemented | 401/403 sin datos protegidos |
| T05 | Acceso al dashboard propio | implemented | 200 y email de A |
| T06 | Ubicación de vehículo de otro propietario | implemented | 403/404 sin ubicación o datos del objeto B |
| T07 | Función privilegiada | implemented | Denegación y ausencia de datos/efectos privilegiados |
| T08 | Login antes de existir la cuenta | implemented | 401/403 sin token |
| T09 | Acceso posterior a signup/login | implemented | Dashboard 200 correspondiente a A |
| T10 | JWT antes de exp | implemented | 200, vehículo propio de A y marca temporal anterior a exp |
| T11 | Mismo JWT después de exp | implemented | 401/403 sin datos; misma huella JWT y marca posterior a exp+10 s |

## Endpoints leídos en OpenAPI y código al SHA fijado

- POST `/identity/api/auth/signup`: email, name, number, password.
- POST `/identity/api/auth/login`: email, password; respuesta con `token`.
- GET `/identity/api/v2/user/dashboard`: bearer; respuesta con email del usuario.
- GET `/identity/api/v2/vehicle/vehicles`: lista de vehículos del usuario y UUID.
- GET `/identity/api/v2/vehicle/{vehicleId}/location`: respuesta carId/fullName/vehicleLocation.

## T06: protocolo con fixtures automatizados

1. Vincular un vehículo distinto a cada cuenta mediante el flujo normal de crAPI/MailHog.
2. Consultar `vehicles` con token A y token B; verificar propietarios y UUID distintos.
3. Consultar ubicación A con token A y B con token B como controles positivos.
4. Consultar la misma ubicación B con token A, sin cambiar nada más.
5. FAIL solamente si se obtiene la ubicación/objeto B; 200 sin datos identificables no basta para confirmar BOLA.
6. Comprobar también B→A y repetir. Conservar igualdad/identidad del objeto de forma sanitizada.

No se inventan UUID ni se prueba un recurso inexistente como sustituto de BOLA.

## T07: política de función verificada

`AdminUserView` en services/workshop/crapi/user/views.py declara explícitamente que es una vista administrativa y lista datos de todos los usuarios. utils/jwt.py autentica y resuelve la identidad sin comprobar ROLE_ADMIN. Se utiliza esa intención de política documentada en el código; se contrasta con una identidad seed ROLE_ADMIN y una cuenta nueva ROLE_USER, verificadas en el dashboard. El control admin debe devolver users; la cuenta ordinaria debería recibir denegación sin lista. La aceptación de datos desde una función declarada administrativa constituye el comportamiento evaluado, no se deduce solo del nombre de la ruta.

## Diferenciación de endpoints

T03 usa el listado de vehículos que requiere autenticación en WebSecurityConfig. T04 usa el dashboard para comprobar la excepción permitAll y la validación de la firma en esa ruta. T10/T11 usan el mismo listado autenticado de vehículos; no usan el dashboard, que tiene una excepción de autenticación. Los teléfonos de las cuentas son únicos por run para evitar duplicados de registro al repetir.
