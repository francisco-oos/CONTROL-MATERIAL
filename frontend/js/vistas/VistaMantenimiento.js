// ===============================
// VistaMantenimiento.js
// ===============================

let listaTecnologias = [
  { id: 1, nombre: "Inova Analógico" },
  { id: 2, nombre: "Inova Digital" },
  { id: 3, nombre: "AFU" },
  { id: 4, nombre: "DFU" },
];

let listaEstatus = [
  { id: 10, nombre: "Pruebas" },
  { id: 2, nombre: "Reparacion" },
  { id: 3, nombre: "No reparable" },
  { id: 8, nombre: "Dañado" },
];

// Datos ficticios realistas
let nodosCache = [
  { id: 1, serie: "Q00710011", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 09:15:22" },
  { id: 2, serie: "Q00710025", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 09:16:40" },
  { id: 3, serie: "Q00710102", id_tecnologia: 2, id_estatus: 10, fecha_actualizacion: "2025-11-10 09:20:15" },
  { id: 4, serie: "Q00710344", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 09:23:01" },
  { id: 5, serie: "Q00710512", id_tecnologia: 3, id_estatus: 10, fecha_actualizacion: "2025-11-10 09:30:45" },
  { id: 6, serie: "Q00710678", id_tecnologia: 4, id_estatus: 10, fecha_actualizacion: "2025-11-10 09:42:19" },
  { id: 7, serie: "Q00710735", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 09:48:12" },
  { id: 8, serie: "Q00710894", id_tecnologia: 2, id_estatus: 10, fecha_actualizacion: "2025-11-10 09:52:08" },
  { id: 9, serie: "Q00711051", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:05:55" },
  { id: 10, serie: "Q00711107", id_tecnologia: 3, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:15:20" },
  { id: 11, serie: "Q00711289", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:25:41" },
  { id: 12, serie: "Q00711304", id_tecnologia: 2, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:29:50" },
  { id: 13, serie: "Q00711365", id_tecnologia: 4, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:31:09" },
  { id: 14, serie: "Q00711427", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:33:44" },
  { id: 15, serie: "Q00711509", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:36:12" },
  { id: 16, serie: "Q00711592", id_tecnologia: 2, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:39:30" },
  { id: 17, serie: "Q00711677", id_tecnologia: 3, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:42:01" },
  { id: 18, serie: "Q00711754", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:45:09" },
  { id: 19, serie: "Q00711823", id_tecnologia: 4, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:48:55" },
  { id: 20, serie: "Q00711877", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:52:13" },
  { id: 21, serie: "Q00711945", id_tecnologia: 2, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:55:01" },
  { id: 22, serie: "Q00712011", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 10:58:22" },
  { id: 23, serie: "Q00712078", id_tecnologia: 3, id_estatus: 10, fecha_actualizacion: "2025-11-10 11:00:00" },
  { id: 24, serie: "Q00712134", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 11:02:15" },
  { id: 25, serie: "Q00712206", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 11:05:44" },
  { id: 26, serie: "Q00712259", id_tecnologia: 4, id_estatus: 10, fecha_actualizacion: "2025-11-10 11:09:09" },
  { id: 27, serie: "Q00712317", id_tecnologia: 2, id_estatus: 10, fecha_actualizacion: "2025-11-10 11:12:30" },
  { id: 28, serie: "Q00712401", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 11:15:55" },
  { id: 29, serie: "Q00712479", id_tecnologia: 3, id_estatus: 10, fecha_actualizacion: "2025-11-10 11:18:10" },
  { id: 30, serie: "Q00712542", id_tecnologia: 1, id_estatus: 10, fecha_actualizacion: "2025-11-10 11:21:39" },
];

let currentPage = 1;
const limit = 50;
let currentSerie = "";
let currentTecnologia = "";
let currentEstatus = "";

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("vista-nodos-mantenimiento")) {
    inicializarVistaMantenimiento();
  }
});

export async function inicializarVistaMantenimiento() {
  cargarFiltrosTecnologia();
  cargarFiltrosEstatus();
  renderizarPaginaMantenimiento();
}

// Filtros
function cargarFiltrosTecnologia() {
  const select = document.getElementById("filtro-tecnologia-mantenimiento");
  select.innerHTML = `<option value="">Todas</option>`;
  listaTecnologias.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.nombre;
    select.appendChild(opt);
  });
}

function cargarFiltrosEstatus() {
  const select = document.getElementById("filtro-estatus-mantenimiento");
  select.innerHTML = `<option value="">Todas</option>`;
  listaEstatus.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = e.nombre;
    select.appendChild(opt);
  });
}

// Renderizado
function renderizarPaginaMantenimiento() {
  const tbody = document.getElementById("tbody-nodos-mantenimiento");
  tbody.innerHTML = "";

  let nodosFiltrados = nodosCache.filter(n => {
    return (!currentSerie || n.serie.includes(currentSerie)) &&
           (!currentTecnologia || n.id_tecnologia === Number(currentTecnologia)) &&
           (!currentEstatus || n.id_estatus === Number(currentEstatus));
  });

  const totalPaginas = Math.ceil(nodosFiltrados.length / limit);
  if (currentPage > totalPaginas) currentPage = totalPaginas || 1;

  const inicio = (currentPage - 1) * limit;
  const fin = inicio + limit;
  const nodosPagina = nodosFiltrados.slice(inicio, fin);

  if (!nodosPagina.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No se encontraron registros</td></tr>`;
  } else {
    nodosPagina.forEach(n => {
      const fila = document.createElement("tr");
      const nombreTec = listaTecnologias.find(t => t.id === n.id_tecnologia)?.nombre || "Desconocida";
      const nombreEstatus = listaEstatus.find(e => e.id === n.id_estatus)?.nombre || "Incautado";
      fila.style.background = "#fff3cd"; // color amarillo claro para incautado
      fila.innerHTML = `
        <td>${n.id}</td>
        <td>${n.serie}</td>
        <td>${nombreTec}</td>
        <td class="estatus-celda">${nombreEstatus}</td>
        <td>${n.fecha_actualizacion}</td>
        <td><button class="btn btn-sm btn-warning" disabled>Incautado</button></td>
      `;
      tbody.appendChild(fila);
    });
  }

  document.getElementById("pagina-actual-mantenimiento").textContent =
    `Página ${currentPage} de ${totalPaginas || 1}`;
}

// Navegación
export function paginaSiguientemantenimiento() { currentPage++; renderizarPaginaMantenimiento(); }
export function paginaAnteriormantenimiento() { if (currentPage > 1) { currentPage--; renderizarPaginaMantenimiento(); } }

// Filtros
export function aplicarFiltrosmantenimiento() {
  currentSerie = document.getElementById("filtro-serie-mantenimiento").value.trim();
  currentTecnologia = document.getElementById("filtro-tecnologia-mantenimiento").value.trim();
  currentEstatus = document.getElementById("filtro-estatus-mantenimiento")?.value.trim() || "";
  currentPage = 1;
  renderizarPaginaMantenimiento();
}

// Global
window.paginaSiguientemantenimiento = paginaSiguientemantenimiento;
window.paginaAnteriormantenimiento = paginaAnteriormantenimiento;
window.aplicarFiltrosmantenimiento = aplicarFiltrosmantenimiento;
