# Limitaciones

- crAPI tiene fallos intencionales y los datos son ficticios. Los hallazgos no estiman prevalencia ni gravedad de APIs de producción.
- Se ensaya v1.1.6-rc8, una versión candidata. Commit y ocho digests están fijados y el arranque se validó en GitHub Actions. La correspondencia entre código e imágenes usa la publicación del proveedor, sin atestación de compilación.
- Tres repeticiones completas sobre un mismo despliegue, con cuentas nuevas. El listado de usuarios crece entre runs; dentro de cada run el cuerpo ordinario coincide con el administrativo.
- Cobertura limitada a los endpoints y campos documentados. No se ensayan OAuth, refresh, logout/revocación, cambios de rol durante sesión, TOCTOU, concurrencia ni eliminación de recursos.
- T08/T09 verifican estado de cuenta. T04 altera una firma conservando el payload; no demuestra toma de cuentas ni modificación del subject.
- T11 observa aceptación del mismo token a exp+10 s. Los relojes HTTP/local concuerdan con ese instante, pero RFC 7519 permite tolerancia acotada. No se probó duración indefinida ni una política de producción. La lectura del código apoya la hipótesis de omisión de exp y se identifica como interpretación complementaria.
- Date tiene resolución de un segundo y no mide por separado el reloj interno del validador.
- Evidencia con observaciones permitidas y hashes; no incluye cuerpos completos, JWT ni contraseñas. Una reconstrucción más compleja requiere otra ejecución y revisión local.
- Actions fijadas por SHA y Node 22.14.0. ubuntu-24.04 y Docker/Compose del runner pueden actualizarse; versiones efectivas constan en manifiestos. No se declara auditoría integral de supply chain.
- El entorno local no dispone de Docker; crAPI se ejecutó en GitHub. Durante el cierre falló el entorno local de edición y la consolidación se ejecutó/verificó en Actions.
- El PDF académico individual sigue por redactar; la evidencia y guía están listas.

El chatbot no se inicia ni recibe credenciales externas. Su upstream no utilizado apunta a identity para que nginx cargue la plantilla; ninguna prueba visita /chatbot. Se usa Bash explícitamente para la comprobación TCP del gateway porque CMD-SHELL de Debian no soporta /dev/tcp. TLS interno se desactiva en el laboratorio. Estas adaptaciones, el aislamiento y el TTL no modifican las decisiones de seguridad de los endpoints ensayados.
