// js/vistas/asignarEvidencia.js
// --------------------------------------------------
// Módulo para manejar la asignación de evidencias a varios incautados
// --------------------------------------------------

import { API_BASE } from "../../config.js";

const modal = document.getElementById("modal-asignar-evidencia");
const listaDiv = document.getElementById("lista-incautados-relacionados");
const btnConfirmar = document.getElementById("btn-confirmar-asignacion");
const btnCancelar = document.getElementById("btn-cancelar-asignacion");

let archivoActual = null;
let incautadoPrincipal = null;

// 🧷 Mostrar modal con la lista de incautados
export function abrirModalAsignarEvidencia(archivoSubido, incautadoId) {
  archivoActual = archivoSubido;
  incautadoPrincipal = incautadoId;
  modal.style.display = "flex";

  // Llenar la lista de posibles relacionados
  fetch(`${API_BASE}/incautados/relacionados/${incautadoId}`)
    .then(res => res.json())
    .then(data => {
      listaDiv.innerHTML = "";
      if (data.length === 0) {
        listaDiv.innerHTML = "<p>No hay materiales relacionados.</p>";
        return;
      }
      data.forEach(item => {
        const label = document.createElement("label");
        label.innerHTML = `
          <input type="checkbox" value="${item.id}">
          [${item.id}] ${item.serie || "Sin serie"} - ${item.tecnologia}
        `;
        listaDiv.appendChild(label);
      });
    })
    .catch(err => {
      console.error("Error al cargar relacionados:", err);
      listaDiv.innerHTML = "<p>Error al cargar datos.</p>";
    });
}

// 🧹 Cerrar modal
function cerrarModal() {
  modal.style.display = "none";
  listaDiv.innerHTML = "";
  archivoActual = null;
  incautadoPrincipal = null;
}

//btnCancelar.addEventListener("click", cerrarModal);
btnCancelar.addEventListener("click", () => {
  modal.style.display = "none";
});


// 💾 Confirmar asignación
btnConfirmar.addEventListener("click", async () => {
  const seleccionados = Array.from(listaDiv.querySelectorAll("input:checked"))
    .map(chk => Number(chk.value));

  // Incluye siempre el incautado principal
  if (!seleccionados.includes(incautadoPrincipal)) {
    seleccionados.push(incautadoPrincipal);
  }

  try {
    const res = await fetch(`${API_BASE}/evidencias/asignar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        archivo: archivoActual,
        idsIncautados: seleccionados
      })
    });
    if (!res.ok) throw new Error("Error en el servidor");
    alert("Evidencia asignada correctamente.");
    cerrarModal();
  } catch (err) {
    console.error(err);
    alert("No se pudo asignar la evidencia.");
  }
});
