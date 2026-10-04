# Historial de estabilización

Los fallos de preparación/instrumentación no se mezclan con hallazgos de seguridad.

| Workflow | Observación | Corrección / disposición |
|---|---|---|
| [37223134491](https://github.com/Arkthos/software-security-api-lab/actions/runs/37223134491) | Conjunto incompleto de imágenes 1.1.6 publicadas. | Adoptar v1.1.6-rc8, commit y ocho digests. Sin casos ejecutados. |
| [37223626457](https://github.com/Arkthos/software-security-api-lab/actions/runs/37223626457) | Proxy termina durante arranque; upstream chatbot ausente en plantilla. | Resolver upstream no utilizado a identity. Sin casos ejecutados. |
| [37223791385](https://github.com/Arkthos/software-security-api-lab/actions/runs/37223791385) | Servicios principales sanos, gateway unhealthy. | Bash explícito en comprobación TCP. Diagnóstico original conservado en results/excluded. |
| [37224235724](https://github.com/Arkthos/software-security-api-lab/actions/runs/37224235724) | VIN/PIN no obtenidos; dependencias bloqueadas. | Excluir del análisis; originales sanitizados conservados. |
| [37224400283](https://github.com/Arkthos/software-security-api-lab/actions/runs/37224400283) | Lector anterior, con observación HTTP añadida. | Misma cobertura incompleta; excluido. |
| [37224701928](https://github.com/Arkthos/software-security-api-lab/actions/runs/37224701928) | Receptor encontrado; VIN/PIN no se decodifican. | La proyección MongoDB de MailHog omite Content.Body y conserva Raw.Data. Añadir fallback y prueba realista. |
| [37224853448](https://github.com/Arkthos/software-security-api-lab/actions/runs/37224853448) | Controles reforzados pero lector anterior. | Excluido por fixtures bloqueados. |
| [37225125461](https://github.com/Arkthos/software-security-api-lab/actions/runs/37225125461) | Tres runs completos; 23 PASS/5 FAIL por run. | Serie definitiva, revisada con controles y manifest. |
| [37225760762](https://github.com/Arkthos/software-security-api-lab/actions/runs/37225760762) | Recuperación del ZIP rechazada en redirección de almacenamiento. | Retirar Authorization de GitHub al seguir URL firmada de otro host. No modifica pruebas del objetivo. |
| [37225833141](https://github.com/Arkthos/software-security-api-lab/actions/runs/37225833141) | Recuperación, hashes, análisis y exportación correctos. | Evidencia consolidada para publicación mediante conector. |

La comparación Markdown se regeneró con separadores escapados en el [workflow 37226291123](https://github.com/Arkthos/software-security-api-lab/actions/runs/37226291123). Los JSON/manifiestos originales permanecen idénticos; el inventario de hashes refleja la nueva tabla derivada.

El entorno local dejó de responder durante el cierre; la consolidación se completó en Actions. Los workflows no hacen pushes/merges. Las adaptaciones de arranque no alteran las decisiones de seguridad de los endpoints probados.

Fuente del lector: [proyección MongoDB de MailHog](https://github.com/mailhog/storage/blob/master/mongodb.go). Es documentación operativa complementaria al corpus académico de cinco fuentes; las imágenes ejecutadas quedan fijadas por digest.
