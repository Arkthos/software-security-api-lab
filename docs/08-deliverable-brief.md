# Material para el entregable

Pregunta: ¿cómo cambia la decisión de acceso de crAPI al variar credenciales, propietario, rol, estado de cuenta e instante respecto a exp?

| Sección de la consigna | Material y trabajo de redacción |
|---|---|
| Portada | Añadir nombre, universidad, asignatura, docente y fecha reales. |
| Introducción | Explicar pregunta, objetivo, alcance local y necesidad de controles positivos. |
| Situación actual | Describir crAPI deliberadamente vulnerable y justificar Postman/Newman con docs/03-methodology.md. |
| Resultados | Usar docs/05-results-analysis.md, results/approved/comparison.md y cases.csv. Mostrar el control y la prueba adversa. |
| Recomendaciones | Relacionar cada medida con la causa, el resultado y el criterio de verificación posterior. |
| Conclusiones | Responder la pregunta y distinguir autenticación, autorización, estado y tiempo con sus límites. |
| Referencias | Adaptar las cinco fuentes a APA 7 y citar dentro del texto. |

La consigna revisada no fija páginas. El repositorio es evidencia técnica y guía; todavía no es el PDF individual.

## Evidencia que conviene incluir

- T01–T11, con dos direcciones de T06 y resultados de las tres repeticiones.
- H01–H04 y O01: controles, observación, riesgo, recomendación y límite.
- Tabla temporal con exp−iat, mismo JWT, instante antes/después y Date; explicar tolerancia de 10 s.
- Commit, versión candidata e imágenes ejecutadas.
- Separación entre siete pruebas del instrumento y tres runs reales.

No insertar JWT, passwords ni respuestas sin sanitizar en capturas. Los hashes demuestran igualdad dentro del run; no reconstruyen el contenido. Tres repeticiones sobre un despliegue no estiman prevalencia.

## Preparar la defensa

Explicar por qué BOLA necesita dos propietarios y recursos existentes, por qué T07 usa una política administrativa y roles observados, por qué T11 conserva el token y qué permite inferir exp+10 s. Diferenciar FAIL, BLOCKED y ERROR, y explicar qué pruebas pasarían después de cada recomendación.

La interpretación y selección de lo que se incluye en el informe forman parte del trabajo del estudiante. Este material permite redactarlas con evidencias verificables.
