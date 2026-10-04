# Reglas del proyecto

- Mantener documentación de estudio en español.
- No fabricar resultados, fixtures, fechas de ejecución, fuentes ni etiquetas de vulnerabilidad.
- Leer docs/07-roadmap.md antes de retomar. Diferenciar pruebas sintéticas de runs reales.
- Trabajar por ramas y PR; pushes y merges desde la cuenta autorizada del propietario. No auto-push/auto-merge en workflows.
- Ejecutar npm run validate y npm test. Regenerar colección y comprobar diff cuando cambie su generador.
- Mantener versiones y trazabilidad fuente→caso→evidencia.
- No subir tokens, passwords, bodies sin revisar ni PDFs de terceros. El runner usa una allowlist.
- BLOCKED/ERROR nunca son PASS. Un 5xx no demuestra denegación segura.
- Nuevas pruebas necesitan precondiciones y controles positivos.
