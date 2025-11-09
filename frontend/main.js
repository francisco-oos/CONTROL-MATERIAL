// main.js
// --------------------------------------------------
// Controlador de vistas dinámicas para el dashboard
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("aside button");
  const content = document.getElementById("content");

  // Plantillas de contenido por vista
  const views = {
    inicio: `
      <div class="card">
        <h3>Equipos Activos</h3>
        <p>23 equipos en operación actualmente.</p>
      </div>
      <div class="card">
        <h3>Material en Bodega</h3>
        <p>Última actualización hace 2 horas.</p>
      </div>
      <div class="card">
        <h3>Alertas Pendientes</h3>
        <p>No se han detectado alertas recientes.</p>
      </div>
    `,

    equipos: `
      <div class="card">
        <h3>Gestión de Equipos</h3>
        <p>Aquí podrás agregar, editar y consultar equipos asignados.</p>
      </div>
      <div class="card">
        <button onclick="alert('Abrir módulo de gestión de equipos')">Abrir módulo</button>
      </div>
    `,

    material: `
      <div class="card">
        <h3>Control de Material</h3>
        <p>Visualiza y actualiza el inventario en tiempo real.</p>
      </div>
      <div class="card">
        <button onclick="alert('Abrir control de materiales')">Ir a Inventario</button>
      </div>
    `,

    reportes: `
      <div class="card">
        <h3>Reportes</h3>
        <p>Genera reportes personalizados por fecha o tipo de equipo.</p>
      </div>
      <div class="card">
        <button onclick="alert('Generar reporte PDF')">Generar Reporte</button>
      </div>
    `,

    configuracion: `
      <div class="card">
        <h3>Configuración del Sistema</h3>
        <p>Modifica opciones generales y preferencias del usuario.</p>
      </div>
      <div class="card">
        <button onclick="alert('Abrir configuración avanzada')">Configurar</button>
      </div>
    `
  };

  // Manejar clics en botones del menú
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Quitar estado activo a todos
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const view = btn.dataset.view;

      // --- Vista especial: Cargar Base de Nodos ---
      if (view === "cargar-nodos") {
        // Ocultar cualquier vista previa de nodos
        const vistaCargar = document.getElementById("vista-cargar-nodos");
        vistaCargar.style.display = "block";
        content.innerHTML = "";
        content.appendChild(vistaCargar);
        return;
      }

      // --- Vista especial: Incautados ---
      if (view === "incautados") {
        // Cargar el script de la vista incautados
        import('./js/vistas/VistaIncautados.js').then(module => {
          // Llamar a la función para inicializar la vista de Incautados
          if (typeof module.inicializarVistaIncautados === 'function') {
            module.inicializarVistaIncautados();
          }
        }).catch(error => {
          console.error("Error al cargar la vista de Incautados:", error);
        });

        // Mostrar el contenido relacionado a los incautados
        const vistaIncautados = document.getElementById("vista-incautados");
        vistaIncautados.style.display = "block";
        content.innerHTML = "";
        content.appendChild(vistaIncautados);
        return;
      }

      // --- Resto de vistas comunes ---
      const html = views[view];
      if (html) {
        // Si es una vista estándar, muestra el contenido
        content.innerHTML = html;

        // Oculta la vista de incautados si estaba activa
        const vistaIncautados = document.getElementById("vista-incautados");
        if (vistaIncautados) vistaIncautados.style.display = "none";

        // Oculta la vista de carga de nodos si estaba activa
        const vistaCargar = document.getElementById("vista-cargar-nodos");
        if (vistaCargar) vistaCargar.style.display = "none";
      } else {
        content.innerHTML = "<p>Vista no encontrada.</p>";
      }
    });
  });
});
