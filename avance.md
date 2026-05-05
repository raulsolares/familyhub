# FamilyHub V9.2 - Status Report

## Arquitectura Técnica
- **Stack:** React + TypeScript + Vite + Lucide Icons + React Router Dom.
- **Base de Datos:** Firebase Firestore (Real-time sync) con fallback a LocalStorage.
- **Sincronización:** Estado único consolidado en document `familyhub/main_state`.
- **Autenticación:** Sistema de perfiles (Admin: Raúl, Tania | Kids: Alan, Aria).
- **Diseño:** CSS dinámico con temas Light, Dark y Fun (Kids). 100% responsivo (Tablas convertibles a listas).

## Módulos Implementados

### 1. Centro de Comando (Dashboard)
- Saludo personalizado según usuario.
- Notificador de urgencias (School tasks) calculando días restantes mediante fechas ISO.
- Widgets de rendimiento semanal (puntos de todos los miembros), menú de hoy y tareas pendientes.

### 2. Gestión de Alimentos y Menú
- **Catálogo:** Soporte multicategoría, alimentos favoritos, metadatos (kcal, prepTime, maxPerWeek).
- **Menú Semanal:** Planificación multi-integrante y multi-platillo por tiempo de comida.
- **Vista HOY:** Seguimiento visual de consumo de alimentos por miembro.

### 3. Logística de Compras (Súper)
- **Catálogo de Productos:** Ligado a ingredientes del menú para cálculo automático de cantidades (agregación inteligente).
- **Lista de Súper:** Sincronización con menú + artículos manuales + Notas familiares.
- **Modo Compras:** Interfaz móvil para marcar artículos en el supermercado con seguimiento de presupuesto.

### 4. Agenda y Rutinas (Game Center)
- **Rutinas:** Bloques horarios configurables por miembro (nombre, icono, lista de subtareas).
- **Tareas Hogar:** Asignación individual o compartida ("Familia"). Vínculo opcional a rutinas.
- **Kid Duel:** Pantalla dividida para competencia real entre Alan y Aria (feedback visual/sonoro).
- **Reto Relámpago:** Timer programable para tareas rápidas.

### 5. Auditoría y Economía Familiar
- **Puntos y Logros:** Historial de auditoría para el administrador (Raúl).
- **Reglas:** Sistema de puntaje configurable (Logros: +, Consecuencias: -).
- **Tienda:** Catálogo de premios canjeables (controlado por padres).

### 6. Módulo Escolar
- Gestión de pendientes (materiales, exámenes, eventos) con fechas reales y asignación dinámica de niño.

## Pendientes para Claude
- **Optimización de Audio:** Implementar sistema de carga de assets de audio reales (actualmente mocks).
- **Calendario Visual:** Implementar el módulo de calendario mensual/semanal con drag-and-drop de eventos (actualmente placeholder).
- **Validaciones de Seguridad:** Reforzar reglas de seguridad de Firestore y validación de formularios complejos.
- **Notificaciones Push:** Integración con Service Workers para alertas nativas en móvil (vencimientos de escuela).
- **Analytics:** Reportes mensuales de cumplimiento de tareas y presupuesto del súper.

## Archivos Clave
- `src/context/DataContext.tsx`: Lógica de sincronización y estado global.
- `src/pages/Settings.tsx`: Panel maestro de configuración.
- `src/pages/KidZone.tsx`: Nueva interfaz inmersiva de pedidos y juegos.
- `src/pages/ShoppingList.tsx`: Motor de cálculo de ingredientes.
