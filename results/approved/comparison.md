# Comparación de tres ejecuciones reales

Commit del experimento: `f28d50d6412dccc167c5d9b3c7caa1755ba1d610`. Resultados estables: true.

| Caso | Run 1 | Run 2 | Run 3 | HTTP 1/2/3 |
|---|---|---|---|---|
| T08 \| Login before account creation | PASS | PASS | PASS | 401/401/401 |
| T01 \| Valid login A | PASS | PASS | PASS | 200/200/200 |
| T02 \| Wrong password | PASS | PASS | PASS | 401/401/401 |
| T03 \| Protected vehicles without token | PASS | PASS | PASS | 401/401/401 |
| T04 \| Dashboard with altered signature | FAIL | FAIL | FAIL | 200/200/200 |
| T05 \| Own dashboard | PASS | PASS | PASS | 200/200/200 |
| T09 \| Dashboard after signup and login | PASS | PASS | PASS | 200/200/200 |
| T06 \| Cross-user location A to B | FAIL | FAIL | FAIL | 200/200/200 |
| T06 \| Cross-user location B to A | FAIL | FAIL | FAIL | 200/200/200 |
| T07 \| Ordinary user attempts admin listing | FAIL | FAIL | FAIL | 200/200/200 |
| T10 \| Same token before expiration | PASS | PASS | PASS | 200/200/200 |
| T11 \| Same token after expiration | FAIL | FAIL | FAIL | 200/200/200 |

FAIL requiere interpretación con controles; no equivale por sí solo a una clasificación de vulnerabilidad. Ver analysis.json y docs/05-results-analysis.md.
