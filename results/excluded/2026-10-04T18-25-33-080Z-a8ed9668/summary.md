# Ejecución 2026-10-04T18-25-33-080Z-a8ed9668

Estado: INCOMPLETE.

| Caso | Resultado | HTTP |
|---|---|---|
| T08 | Login before account creation | PASS | 401 |
| SETUP | Create user A | PASS | 200 |
| SETUP | Create user B | PASS | 200 |
| T01 | Valid login A | PASS | 200 |
| SETUP | Valid login B | PASS | 200 |
| T02 | Wrong password | PASS | 401 |
| T03 | Protected vehicles without token | BLOCKED | 401 |
| T04 | Dashboard with altered signature | FAIL | 200 |
| T05 | Own dashboard | PASS | 200 |
| T09 | Dashboard after signup and login | PASS | 200 |
| FIXTURE | Read vehicle email A | BLOCKED | 200 |
| FIXTURE | Link vehicle A | BLOCKED | 403 |
| CONTROL | Owned vehicles A | BLOCKED | 200 |
| CONTROL | Own location A | BLOCKED | 400 |
| FIXTURE | Read vehicle email B | BLOCKED | 200 |
| FIXTURE | Link vehicle B | BLOCKED | 403 |
| CONTROL | Owned vehicles B | BLOCKED | 200 |
| CONTROL | Own location B | BLOCKED | 400 |
| T06 | Cross-user location A to B | BLOCKED | 400 |
| T06 | Cross-user location B to A | BLOCKED | 400 |
| CONTROL | Admin login | PASS | 200 |
| CONTROL | Admin identity | PASS | 200 |
| CONTROL | Ordinary identity | PASS | 200 |
| CONTROL | Admin user listing | PASS | 200 |
| T07 | Ordinary user attempts admin listing | FAIL | 200 |
| TIME-SETUP | Fresh login | PASS | 200 |
| T10 | Same token before expiration | BLOCKED | 200 |
| T11 | Same token after expiration | BLOCKED | 200 |

FAIL indica una propiedad incumplida; requiere análisis. BLOCKED no es PASS.
