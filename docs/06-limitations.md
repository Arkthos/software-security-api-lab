# Limitaciones

- crAPI contiene fallos intencionales; no representa una muestra de APIs de producción.
- T06/T07 cuentan con implementación y controles; su ejecución real debe validarse. T05 cubre identidad del dashboard y T06 aislamiento de ubicaciones de vehículos.
- No se ensayan OAuth, refresh tokens, logout/revocación ni roles cambiados durante una sesión.
- T08/T09 cubren estado de cuenta; no cubren TOCTOU, concurrencia o eliminación de recursos.
- La tolerancia temporal experimental es 10 s; confirmar reloj/configuración antes de evaluar como vulnerabilidad.
- La evidencia publicada usa observaciones permitidas y hashes; no contiene respuestas completas. Reconstruir una interpretación compleja puede requerir una nueva ejecución con revisión local. Los cuerpos completos no se suben por defecto.
- Readiness, imágenes y Docker Compose no se validaron en esta sesión sin Docker. Los digests globales están fijados en lab/crapi.lock.json; su arranque real requiere validación. La versión probada es candidata, v1.1.6-rc8, no una versión estable.
- Las actions usan versiones mayores v4; la imagen ubuntu-24.04 puede recibir actualizaciones. Falta fijar actions por SHA y documentar todas las capas que afectan reproducibilidad.
- Dependencias npm transitivas son las del runner elegido; no se declara una auditoría de supply chain.
- El informe académico PDF no se ha redactado; el repositorio servirá como su evidencia técnica.
