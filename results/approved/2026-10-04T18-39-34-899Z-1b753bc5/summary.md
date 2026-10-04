# Ejecución 2026-10-04T18-39-34-899Z-1b753bc5

Estado: COMPLETED.

| Caso | Resultado | HTTP |
|---|---|---|
| T08 | Login before account creation | PASS | 401 |
| SETUP | Create user A | PASS | 200 |
| SETUP | Create user B | PASS | 200 |
| T01 | Valid login A | PASS | 200 |
| SETUP | Valid login B | PASS | 200 |
| T02 | Wrong password | PASS | 401 |
| T03 | Protected vehicles without token | PASS | 401 |
| T04 | Dashboard with altered signature | FAIL | 200 |
| T05 | Own dashboard | PASS | 200 |
| T09 | Dashboard after signup and login | PASS | 200 |
| FIXTURE | Read vehicle email A | PASS | 200 |
| FIXTURE | Link vehicle A | PASS | 200 |
| CONTROL | Owned vehicles A | PASS | 200 |
| CONTROL | Own location A | PASS | 200 |
| FIXTURE | Read vehicle email B | PASS | 200 |
| FIXTURE | Link vehicle B | PASS | 200 |
| CONTROL | Owned vehicles B | PASS | 200 |
| CONTROL | Own location B | PASS | 200 |
| T06 | Cross-user location A to B | FAIL | 200 |
| T06 | Cross-user location B to A | FAIL | 200 |
| CONTROL | Admin login | PASS | 200 |
| CONTROL | Admin identity | PASS | 200 |
| CONTROL | Ordinary identity | PASS | 200 |
| CONTROL | Admin user listing | PASS | 200 |
| T07 | Ordinary user attempts admin listing | FAIL | 200 |
| TIME-SETUP | Fresh login | PASS | 200 |
| T10 | Same token before expiration | PASS | 200 |
| T11 | Same token after expiration | FAIL | 200 |

FAIL indica una propiedad incumplida; requiere análisis. BLOCKED no es PASS.
