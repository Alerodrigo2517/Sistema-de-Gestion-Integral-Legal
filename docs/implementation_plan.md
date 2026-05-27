# Implementación de Nueva Interfaz SIGIL-MMO

Esta propuesta detalla los pasos para implementar el nuevo layout general y las vistas requeridas ("Ejercicio", "Nuevo Legajo", "Dashboard del Legajo" y "Modal"), manteniendo la lógica existente y la línea gráfica (colores institucionales, tipografías, etc.).

## Proposed Changes

### UI / Layout
Modificaremos la estructura principal para adoptar un esquema de **Barra Lateral (Sidebar)** y **Barra Superior (Header)**, reemplazando la navegación superior actual.

#### [MODIFY] index.html
- **Header:** Actualizar para incluir el menú hamburguesa a la izquierda y los elementos a la derecha (Ayuda, Foto, Nombre "MARIANO MARTIN", Configuración).
- **Sidebar:** Añadir un elemento `<aside>` o `<nav>` lateral con los ítems (Home, Ejercicio -> Legajos de obra, Cuenta, Perfil).
- **Vista Ejercicio (`#expedientes`):**
  - Título "Ejercicio" y botón "+ Nuevo Legajo".
  - Añadir Tabs (Legajos, Historial).
  - Añadir Panel de Filtros (Comitente, Fecha, Estado, Número Legajo, Ordenar por, Botón Filtrar, Borrar) y el Badge flotante.
- **Vista Nuevo Legajo (`#nuevo-legajo`):**
  - Botón "< VOLVER".
  - Indicador de Progreso (Stepper horizontal 1 al 5).
  - Tarjeta con el Paso 1 (Selects: Matrícula, Rubro, Modalidad).
- **Vista Dashboard del Legajo (`#dashboard-legajo`):**
  - KPI Cards (Datos de Obra, Métricas de Trámites).
  - Tabla de Seguimiento Legal (4 Etapas: Viabilidad, Permiso de Obra, Ejecución, Finalización) con Badges de estado.
- **Modal Actualizar Trámite:**
  - Ventana modal oculta por defecto para actualizar el estado, subir PDF y guardar cambios.

#### [MODIFY] style.css
- Añadir estilos para el layout de Sidebar (fijo a la izquierda, colapsable) y el nuevo Header.
- Añadir estilos para las Tabs y el Panel de Filtros (Responsive Grid).
- Añadir estilos para el Stepper horizontal (círculos activos/inactivos).
- Añadir estilos para las KPI Cards del Dashboard y la Tabla de Seguimiento.
- Añadir estilos para el componente Modal (overlay, ventana centrada, z-index alto).

#### [MODIFY] app.js
- Agregar lógica para el menú hamburguesa (colapsar/expandir Sidebar).
- Modificar la función `setupDashboard()` para que muestre la barra lateral y el header correspondientes post-login.
- Agregar navegación entre la vista "Ejercicio", "Nuevo Legajo" y el "Dashboard del Legajo".
- Agregar eventos para abrir y cerrar el modal.

## User Review Required
> [!IMPORTANT]
> - ¿Deseas que los menús desplegables del sidebar (Cuenta, Perfil) tengan contenido específico ahora mismo o solo los dejamos preparados (visualmente desplegables)?
> - Al entrar, actualmente hay un panel de Login. ¿Mantendremos el panel de Login como vista inicial, y una vez logueado aparecerá el Sidebar y el nuevo Header? (Asumo que sí para no romper la lógica actual).

## Verification Plan
1. **Automated Tests:** Ninguno aplicable.
2. **Manual Verification:** 
   - Abrir `index.html` en el navegador.
   - Iniciar sesión para acceder al layout principal.
   - Verificar la responsividad y funcionalidad del Sidebar.
   - Navegar por la vista "Ejercicio", probar el botón "+ Nuevo Legajo" para ver el formulario y sus pasos.
   - Simular el clic en un legajo para ver el "Dashboard" detallado.
   - Probar el botón de "Actualizar Trámite" para abrir el modal.
