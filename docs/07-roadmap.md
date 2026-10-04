# Estado y recuperación

## Implementación y evidencia completas

- [x] Consigna, alcance, cinco fuentes y matriz de casos.
- [x] T01–T11 y colección determinista de 28 solicitudes.
- [x] Cuentas únicas, MailHog con lectura Raw.Data/MIME, vehículos A/B y controles propios.
- [x] T06 A→B/B→A y roles/política administrativa para T07.
- [x] Mismo JWT, TTL 120 s, exp+10 s, tiempos locales y Date para T10/T11.
- [x] Ocho digests y SHAs de Actions fijados; arranque real validado.
- [x] Siete pruebas del instrumento y validación CI.
- [x] Tres runs reales completos: 84 solicitudes, sin ERROR/BLOCKED.
- [x] Revisión de propiedades incumplidas, riesgos, recomendaciones y límites.
- [x] Observación de WWW-Authenticate separada de las denegaciones.
- [x] Archivo original verificado, evidencia sanitizada, CSV/comparación y hashes.
- [x] Material técnico para el informe individual.

El [workflow real](https://github.com/Arkthos/software-security-api-lab/actions/runs/37225125461) y el [workflow de consolidación](https://github.com/Arkthos/software-security-api-lab/actions/runs/37226291123) completaron correctamente. Consultar [PR #1](https://github.com/Arkthos/software-security-api-lab/pull/1) para el merge y la validación final.

## Siguiente trabajo: entregable individual

- [ ] Redactar portada, introducción, situación actual, resultados, recomendaciones y conclusiones.
- [ ] Aplicar APA 7 a las cinco fuentes y revisar trazabilidad de citas.
- [ ] Renderizar/revisar PDF conforme a la consigna y preparar defensa.

No hay una extensión ni fecha fijadas en el PDF de consigna revisado. Este taller es distinto del proyecto Saleor/NovaMarket.

## Retomar

Leer README, docs/05-results-analysis.md y docs/08-deliverable-brief.md. Los resultados definitivos están en results/approved, con manifests originales y checksums; los intentos incompletos están separados. No repetir ni modificar resultados salvo que exista una nueva pregunta o cambio de instrumento.

Los pushes y merges se gestionan desde esta conversación con la cuenta autorizada Arkthos. Los workflows ejecutan, exportan y conservan artifacts, sin publicar commits automáticamente. La recuperación desde Actions requiere que el artifact siga disponible; la copia versionada y el análisis local no dependen de sus 90 días de retención.

Issues: #2 despliegue y #3 autorización resueltos; #4 conserva la redacción del informe como siguiente trabajo.
