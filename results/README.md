# Conservación de evidencia

`npm run lab:run` crea `results/runs/<run-id>/` con manifest, results.json y summary.md. Las cuentas, passwords y JWT viven en memoria. No se exporta el reporte JSON completo de Newman, porque contiene solicitudes y tokens.

Cada fila conserva método, estado HTTP, hash/longitud del cuerpo, presencia de campos relevantes y aserciones. El manifiesto conserva SHA de colección/repo, versiones, digests de imágenes si existen, iat/exp y timestamps. Una huella no reconstruye por sí sola la respuesta; las aserciones y observaciones son necesarias.

Los runs están ignorados por Git. GitHub Actions carga solamente este directorio como artifact durante 90 días. Después de revisar y validar un run, publicar su evidencia sanitizada en `results/approved/<run-id>/` mediante PR para conservación durable. No cambiar silenciosamente una evidencia; corregir con una nueva ejecución o nota versionada.

Resultados: PASS, FAIL, BLOCKED y ERROR. T06/T07 no ejecutados se registran como BLOCKED. Una ejecución incompleta debe declararse incluso si hay controles que pasan. La señal de éxito del workflow refleja ejecución operativa, no ausencia de vulnerabilidades.
