// ===============================
// VistaIncautados.js
// ===============================
import { API_BASE } from '../../config.js';

let listaTecnologias = [];
let listaEstatus = [
  { id: 1, nombre: "Tendido" },
  { id: 2, nombre: "Operativo" },
  { id: 4, nombre: "Robado" },
  { id: 5, nombre: "Extraviado" },
  { id: 8, nombre: "Dañado" },
  { id: 3, nombre: "Mantenimiento" },
  { id: 6, nombre: "Para garantía" },
  { id: 7, nombre: "En garantía" },
  { id: 9, nombre: "Pruebas" },
  { id: 10, nombre: "Incautado" }
];

const API_INCAUTADOS = `${API_BASE}/incautados`;
const API_TECNOLOGIAS = `${API_BASE}/tecnologias`;
const API_ESTATUS = `${API_BASE}/estatus`;

let currentPage = 1;
const limit = 50;
let currentSerie = "";
let currentTecnologia = "";
let currentEstatus = "";
let incautadosCache = []; // Guardamos todos los incautados en memoria

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("vista-ver-incautados")) {
    inicializarVistaIncautados();
  }
});

export async function inicializarVistaIncautados() {
     console.log("Vista de Incautados inicializada");
  await cargarFiltrosTecnologia();
  await cargarTodosIncautados();
  await cargarFiltrosEstatus();
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
    console.log("Tecnologías cargadas:", listaTecnologias);  // Verifica que se cargan las tecnologías
    tecnologias.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.nombre;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error(" Error al cargar tecnologías:", err);
  }
}

// Cargar estatus para el filtro
async function cargarFiltrosEstatus() {
  const select = document.getElementById("filtro-estatus");
   if (!select) return console.warn("No se encontró el elemento #filtro-estatus en el DOM");
  select.innerHTML = `<option value="">Todas</option>`;
  try {
    const res = await fetch(API_ESTATUS);
    const estatus = await res.json();
      // Reemplazamos el contenido del array (o reasignamos)
    listaEstatus = estatus;
    console.log("Estatus cargados:", listaEstatus);
    estatus.forEach(e => {
      const opt = document.createElement("option");
      opt.value = e.id;
      opt.textContent = e.nombre;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error al cargar estatus:", err);
  }
}

// Cargar todos los incautados
async function cargarTodosIncautados() {
  try {
    const res = await fetch(API_INCAUTADOS);
    incautadosCache = await res.json(); // Guardamos los datos en memoria
  } catch (err) {
    console.error("Error al cargar incautados:", err);
  }
}

function renderizarPagina() {
  const tbody = document.getElementById("tbody-incautados");
  tbody.innerHTML = "";

  let incautadosFiltrados = incautadosCache.filter(i => {
    return (!currentSerie || i.nodo.includes(currentSerie)) &&
           (!currentTecnologia || i.id_tecnologia === Number(currentTecnologia)) &&
           (!currentEstatus || i.id_estatus_nodo === Number(currentEstatus));
  });

  const totalPaginas = Math.ceil(incautadosFiltrados.length / limit);
  if (currentPage > totalPaginas) currentPage = totalPaginas || 1;

  const inicio = (currentPage - 1) * limit;
  const fin = inicio + limit;
  const incautadosPagina = incautadosFiltrados.slice(inicio, fin);

  if (!incautadosPagina.length) {
    tbody.innerHTML = `<tr><td colspan="16" style="text-align:center;">No se encontraron registros</td></tr>`;
  } else {
    incautadosPagina.forEach(i => {
      const fila = document.createElement("tr");

      const nombreTec = listaTecnologias.find(t => t.id === i.id_tecnologia)?.nombre || i.id_tecnologia;
      const nombreEstatus = listaEstatus.find(e => e.id === i.id_estatus_nodo)?.nombre || "Desconocido";

      fila.style.background = nombreEstatus === "Operativo" ? "#d1ffd1" : "#ffd1d1";

      const opciones = listaEstatus
        .map(e => `<option ${e.nombre === nombreEstatus ? 'selected' : ''}>${e.nombre}</option>`)
        .join('');

      fila.innerHTML = `
        <td>${i.id}</td>
        <td>${i.nodo}</td>
        <td>${nombreTec}</td>
        <td>${nombreEstatus}</td>
        <td>${i.fecha_incautado || "-"}</td>
        <td><select data-id="${i.id}">${opciones}</select></td>
      `;

      fila.querySelector("select").addEventListener("change", async (e) => {
        await actualizarEstatusIncautado(i.id, e.target.value, fila);
      });

      tbody.appendChild(fila);
    });
  }

  document.getElementById("pagina-actual").textContent = `Página ${currentPage} de ${totalPaginas || 1}`;
}

// Actualizar estatus del incautado
export async function actualizarEstatusIncautado(id, nuevoEstatus, fila) {
  try {
    const res = await fetch(`${API_INCAUTADOS}/${id}/estatus`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estatus: nuevoEstatus }),
    });

    const data = await res.json();

    if (res.ok) {
      fila.querySelector("td:nth-child(4)").textContent = data.estatus;
      fila.style.background = data.estatus === "Operativo" ? "#d1ffd1" : "#ffd1d1";
      // Actualizar cache también
      const incautadoIndex = incautadosCache.findIndex(i => i.id === id);
      if (incautadoIndex !== -1) {
        incautadosCache[incautadoIndex].id_estatus_nodo = listaEstatus.find(e => e.nombre === data.estatus)?.id || incautadosCache[incautadoIndex].id_estatus_nodo;
      }
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (err) {
    console.error("Error al actualizar estatus:", err);
    alert("Error al conectar con el servidor");
  }
}

// Navegación de páginas
export function paginaSiguiente() { currentPage++; renderizarPagina(); }
export function paginaAnterior() { if (currentPage > 1) { currentPage--; renderizarPagina(); } }

// Ir a una página específica
export function irAPagina() {
  const paginaInput = document.getElementById("pagina-input").value.trim();
  const paginaNumero = parseInt(paginaInput, 10);

  if (!paginaInput) {
    return;
  }

  const totalPaginas = Math.ceil(incautadosCache.length / limit);

  if (!isNaN(paginaNumero) && paginaNumero >= 1 && paginaNumero <= totalPaginas) {
    currentPage = paginaNumero;
    renderizarPagina();
  } else {
    alert("Número de página inválido");
  }

  document.getElementById("pagina-input").value = "";
}

// Aplicar filtros
export function aplicarFiltros() {
  currentSerie = document.getElementById("filtro-serie").value.trim();
  currentTecnologia = document.getElementById("filtro-tecnologia").value.trim();
  currentEstatus = document.getElementById("filtro-estatus")?.value.trim() || "";
  currentPage = 1;
  renderizarPagina();
}

// Hacer las funciones globales
window.paginaSiguiente = paginaSiguiente;
window.paginaAnterior = paginaAnterior;
window.aplicarFiltros = aplicarFiltros;
window.irAPagina = irAPagina;
