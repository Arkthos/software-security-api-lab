# Estado de resultados

**No existen resultados experimentales reales de crAPI en este incremento.** No se han validado las imágenes Docker ni el arranque. Las pruebas del instrumento no pueden citarse como hallazgos del software objetivo.

## Observación de código verificada

En `services/identity/src/main/java/com/crapi/config/JwtProvider.java` al commit `700f03d12a392d9e408260b4beae72ed02a4a1a4`, `generateJwtToken` emite exp, mientras que la rama RS256 de `validateJwtToken` verifica firma y retorna sin comparar exp. `JwtAuthTokenFilter` llama ese validador antes de establecer la identidad.

[Inference] Ese camino podría permitir aceptar el mismo JWT después de exp. Falta comprobar la conducta del despliegue real, la configuración efectiva y posibles verificaciones en otras capas. T10/T11 se diseñaron para contrastarlo. No es un hallazgo experimental confirmado.

## Plantilla de análisis posterior

| Run/caso | Precondición demostrada | Observación | Clasificación | Riesgo | Recomendación | Límite |
|---|---|---|---|---|---|---|
| Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |

Cada hallazgo debe enlazar un run, sus aserciones y fuentes pertinentes. No afirmar cobertura de toda la API a partir de un dashboard. Las recomendaciones definitivas se elaboran después de los runs reales.
