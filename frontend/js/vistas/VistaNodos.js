// ===============================
// VistaNodos.js
// ===============================

import { API_BASE } from '../../config.js';

let listaTecnologias = [];
const listaEstatus = [
  { id: 2, nombre: "Operativo" },
  { id: 8, nombre: "Dañado" },
  { id: 3, nombre: "Mantenimiento" },
  { id: 6, nombre: "Para garantía" },
  { id: 7, nombre: "En garantía" }
];

const API_NODOS = `${API_BASE}/nodos`;
const API_TECNOLOGIAS = `${API_BASE}/tecnologias`;

let currentPage = 1;
const limit = 50;
let currentSerie = "";
let currentTecnologia = "";
let nodosCache = []; // Guardamos todos los nodos en memoria

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("vista-ver-nodos")) {
    inicializarVistaNodos();
  }
});

export async function inicializarVistaNodos() {
  await cargarFiltrosTecnologia();
  await cargarTodosNodos();
  renderizarPagina();
}

// Cargar tecnologías para el filtro
async function cargarFiltrosTecnologia() {
  const select = document.getElementById("filtro-tecnologia");
  select.innerHTML = `<option value="">Todas</option>`;
  try {
    const res = await fetch(API_TECNOLOGIAS);
    const tecnologias = await res.json();
    listaTecnologias = tecnologias;
    tecnologias.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.nombre;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("❌ Error al cargar tecnologías:", err);
  }
}

// Cargar todos los nodos (solo una vez)
async function cargarTodosNodos() {
  try {
    const res = await fetch(API_NODOS);
    nodosCache = await res.json(); // ⚠ Puede ser enorme, pero paginaremos en memoria
  } catch (err) {
    console.error("❌ Error al cargar nodos:", err);
  }
}

// Renderiza la página actual
function renderizarPagina() {
  const tbody = document.getElementById("tbody-nodos");
  tbody.innerHTML = "";

  // Aplicar filtros
  let nodosFiltrados = nodosCache.filter(n => {
    return (!currentSerie || n.serie.includes(currentSerie)) &&
           (!currentTecnologia || n.id_tecnologia == currentTecnologia);
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

      const nombreTec = listaTecnologias.find(t => t.id === n.id_tecnologia)?.nombre || n.id_tecnologia;
      const nombreEstatus = listaEstatus.find(e => e.id === n.id_estatus)?.nombre || "Desconocido";

      fila.style.background = nombreEstatus === "Operativo" ? "#d1ffd1" : "#ffd1d1";

      const opciones = listaEstatus
        .map(e => `<option ${e.nombre === nombreEstatus ? 'selected' : ''}>${e.nombre}</option>`)
        .join('');

      fila.innerHTML = `
        <td>${n.id}</td>
        <td>${n.serie}</td>
        <td>${nombreTec}</td>
        <td class="estatus-celda">${nombreEstatus}</td>
        <td>${n.fecha_actualizacion || "-"}</td>
        <td><select data-id="${n.id}">${opciones}</select></td>
      `;

      fila.querySelector("select").addEventListener("change", async (e) => {
        await actualizarEstatus(n.id, e.target.value, fila);
      });

      tbody.appendChild(fila);
    });
  }

  document.getElementById("pagina-actual").textContent = `Página ${currentPage} de ${totalPaginas || 1}`;
}

// Actualizar estatus del nodo
async function actualizarEstatus(id, nuevoEstatus, fila) {
  try {
    const res = await fetch(`${API_NODOS}/${id}/estatus`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estatus: nuevoEstatus }),
    });

    const data = await res.json();

    if (res.ok) {
      fila.querySelector(".estatus-celda").textContent = data.estatus;
      fila.cells[4].textContent = data.fecha_actualizacion;
      fila.style.background = data.estatus === "Operativo" ? "#d1ffd1" : "#ffd1d1";
      // Actualizar cache también
      const nodoIndex = nodosCache.findIndex(n => n.id === id);
      if (nodoIndex !== -1) {
        nodosCache[nodoIndex].id_estatus = listaEstatus.find(e => e.nombre === data.estatus)?.id || nodosCache[nodoIndex].id_estatus;
        nodosCache[nodoIndex].fecha_actualizacion = data.fecha_actualizacion;
      }
    } else {
      alert(`❌ Error: ${data.error}`);
    }
  } catch (err) {
    console.error("❌ Error al actualizar estatus:", err);
    alert("Error al conectar con el servidor");
  }
}

// Navegación de páginas
export function paginaSiguiente() { currentPage++; renderizarPagina(); }
export function paginaAnterior() { if (currentPage > 1) { currentPage--; renderizarPagina(); } }

// Aplicar filtros
export function aplicarFiltros() {
  currentSerie = document.getElementById("filtro-serie").value.trim();
  currentTecnologia = document.getElementById("filtro-tecnologia").value.trim();
  currentPage = 1;
  renderizarPagina();
}
