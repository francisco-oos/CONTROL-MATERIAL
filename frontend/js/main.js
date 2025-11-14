// main.js
// --------------------------------------------------
// Control de navegación de vistas en el dashboard
// --------------------------------------------------

// Importar la función de inicialización de la vista de nodos
import { inicializarVistaNodos } from './vistas/VistaNodos.js';
import { inicializarVistaIncautados } from './vistas/VistaIncautados.js';
import { inicializarVistaMantenimiento } from './vistas/VistaMantenimiento.js';

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("aside nav button"); // botones del menú lateral
  const vistas = document.querySelectorAll(".vista");            // todas las vistas disponibles
  const content = document.getElementById("content");           // contenedor principal

  // Manejo de navegación entre vistas
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Quitar estado activo de todos los botones
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Ocultar todas las vistas
      vistas.forEach((v) => (v.style.display = "none"));

      // Identificar la vista a mostrar
      const view = btn.dataset.view;

      // -------------------------
      // VISTA: INICIO
      // -------------------------
      if (view === "vista-inicio") {
        content.innerHTML = `
          <div class="card">
            <h3>Bienvenido</h3>
            <p>Selecciona una sección del menú lateral para comenzar.</p>
          </div>`;
      }

      // -------------------------
      // VISTA: CARGAR BASE DE NODOS
      // -------------------------
      else if (view === "cargar-nodos") {
        const vista = document.getElementById("vista-cargar-nodos");
        if (vista) vista.style.display = "block";
      }

      // -------------------------
      // VISTA: VER NODOS
      // -------------------------
      else if (view === "ver-nodos") {
        const vista = document.getElementById("vista-ver-nodos");
        if (vista) {
          vista.style.display = "block";
          // Inicializar la vista de nodos
          inicializarVistaNodos();
        }
      }
            // -------------------------
      // VISTA: VER incautados
      // -------------------------
      else if (view === "vista-ver-incautados") {
        const vista = document.getElementById("vista-ver-incautados");
        if (vista) {
          vista.style.display = "block";
          // Inicializar la vista de nodos
          inicializarVistaIncautados();
        }
      }
      // -------------------------
// VISTA: CARGAR MATERIAL INCAUTADO
// -------------------------
else if (view === "vista-cargar-incautados") {
  const vista = document.getElementById("vista-cargar-incautados");
  if (vista) vista.style.display = "block";
}

    else if (view === "vista-nodos-mantenimiento") {
        const vista = document.getElementById("vista-nodos-mantenimiento");
        if (vista) {
          vista.style.display = "block";
          // Inicializar la vista de nodos
          inicializarVistaMantenimiento();
        }
      }
      // -------------------------
      // OTRAS VISTAS FUTURAS
      // -------------------------
      // else if (view === "material") { ... }
      // else if (view === "reportes") { ... }

    });
  });
});
