# Conservación de evidencia

results/approved contiene tres ejecuciones reales completas y archivos originales sanitizados del workflow 37225125461. analysis.json y comparison.md contrastan casos/controles; cases.csv prepara tablas del informe; provenance.json registra workflows, artifact IDs y SHA-256 del ZIP; checksums.json registra hashes de los archivos.

results/excluded conserva un fallo de arranque y el primer intento incompleto, sin corregir sus observaciones. BLOCKED no es PASS. No se incluyen en las tres repeticiones definitivas.

El runner conserva método, HTTP, aserciones, campos permitidos/hash y tiempo. Las cuentas, contraseñas y JWT viven en memoria; no se publica JSON crudo de Newman ni cuerpos completos. Una huella no reconstruye la respuesta: interpretar junto con controles y observaciones.

Los artifacts de Actions tienen 90 días de retención. La evidencia aprobada se versiona mediante PR y permanece en Git. La recuperación/consolidación verifica ZIP, requiere tres runs completos y exporta solamente archivos sanitizados; no publica commits. El workflow verde significa ejecución completa, no seguridad del objetivo.

Regenerar comparación e inventario:

```bash
npm run analyze -- results/approved
```

No editar evidencia original para cambiar un resultado. Corregir el instrumento con un nuevo run y una nota versionada.
