// ===============================
// VistaIncautados.js
// ===============================
import { API_BASE } from '../../config.js';
import { abrirModalAsignarEvidencia } from "./asignarEvidencia.js";

let listaTecnologias = [];
let listaEstatus = [
  { id: 10, nombre: "Incautado" },
  { id: 11, nombre: "Recuperado" },
   { id: 11, nombre: "recuperado" }
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
document
  .getElementById("btn-aplicar-filtros-incautados")
  .addEventListener("click", aplicarFiltrosIncautados);

document
  .getElementById("btn-anterior-incautados")
  .addEventListener("click", paginaAnteriorIncautados);

document
  .getElementById("btn-siguiente-incautados")
  .addEventListener("click", paginaSiguienteIncautados);

document
  .getElementById("btn-ir-incautados")
  .addEventListener("click", irAPaginaIncautados);


export async function inicializarVistaIncautados() {
     console.log("Vista de Incautados inicializada");
  await cargarFiltrosTecnologia();
  await cargarTodosIncautados();
  await cargarFiltrosEstatus();
  renderizarPagina();
}

async function cargarFiltrosTecnologia() {
  const selectTecnologia = document.getElementById("filtro-tecnologia-incautado");
  if (!selectTecnologia) return console.warn("No se encontró el select de tecnología en el DOM");

  selectTecnologia.innerHTML = `<option value="">Todas</option>`;
  try {
    const res = await fetch(API_TECNOLOGIAS);
    const tecnologias = await res.json();
    listaTecnologias = tecnologias;
    console.log("Tecnologías cargadas:", listaTecnologias);

    tecnologias.forEach(t => {
      const opt = document.createElement("option");
      //value = t.id;
      opt.value = t.nombre;
      opt.textContent = t.nombre;
      selectTecnologia.appendChild(opt);
    });
  } catch (err) {
    console.error("Error al cargar tecnologías:", err);
  }
}
// Cargar estatus para el filtro
async function cargarFiltrosEstatus() {
  const selectEstatus = document.getElementById("filtro-estatus-incautado");
  if (!selectEstatus) return console.warn("No se encontró el elemento #filtro-estatus en el DOM");

  selectEstatus.innerHTML = `<option value="">Todas</option>`; // Opción "Todas"

  try {
    const res = await fetch(API_ESTATUS);
    const estatus = await res.json();
    
    // Filtramos solo los estatus que necesitamos (Incautado y Recuperado)
    const estatusFiltrados = estatus.filter(e => e.nombre === "Incautado" || e.nombre === "Recuperado");

    listaEstatus = estatusFiltrados; // Guardamos los estatus filtrados

    console.log("Estatus cargados:", listaEstatus);

    // Añadimos las opciones al select
    estatusFiltrados.forEach(e => {
      const opt = document.createElement("option");
      //opt.value = e.id;
      opt.value = e.nombre;
      opt.textContent = e.nombre;
      selectEstatus.appendChild(opt);
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
  return (!currentSerie || (i.nodo && i.nodo.toLowerCase().includes(currentSerie.toLowerCase()))) &&
         (!currentTecnologia || i.tecnologia === currentTecnologia) &&
         (!currentEstatus || i.estatus.toLowerCase() === currentEstatus.toLowerCase());
});


  const totalPaginas = Math.ceil(incautadosFiltrados.length / limit);
  if (currentPage > totalPaginas) currentPage = totalPaginas || 1;

  const inicio = (currentPage - 1) * limit;
  const fin = inicio + limit;
  const incautadosPagina = incautadosFiltrados.slice(inicio, fin);

  if (!incautadosPagina.length) {
    tbody.innerHTML = `<tr><td colspan="16" style="text-align:center;">No se encontraron registros</td></tr>`;
    return;
  }

  incautadosPagina.forEach(i => {
    const fila = document.createElement("tr");

    const nombreTec = i.tecnologia || "Sin dato";
    const nombreEstatus = i.estatus || "Desconocido";

    // 🔹 Colores visuales según estatus actual (solo visual)
    let colorFondo = "#ffd1d1"; // por defecto (rojo claro)
    if (["Recuperado", "Operativo"].includes(nombreEstatus)) colorFondo = "#d1ffd1"; // verde
    else if (["Incautado", "Robado", "Extraviado"].includes(nombreEstatus)) colorFondo = "#fff1d1"; // amarillo

    fila.style.background = colorFondo;

    // 🔹 El select solo tiene Incautado / Recuperado (no los demás)
    const opciones = listaEstatus
      .map(e => `<option ${e.nombre === nombreEstatus ? 'selected' : ''} value="${e.nombre}">${e.nombre}</option>`)
      .join('');

    // 🔹 Si el estatus actual NO es Incautado ni Recuperado → se muestra pero el select queda deshabilitado
   const esEditable = (i.nodo !== null ||  i.tecnologia === "Geófono") &&
                   ["Incautado", "Recuperado","recuperado"].includes(nombreEstatus);

fila.innerHTML = `
  <td>${i.id}</td>
  <td>${i.nodo || "-"}</td>
  <td>${nombreTec}</td>
  <td>${nombreEstatus}</td>
  <td>${i.linea || "-"}</td>
  <td>${i.estaca || "-"}</td>
  <td>${i.propietario || "-"}</td>
  <td>${i.localidad || "-"}</td>
  <td>${i.fecha_incautado || "-"}</td>
  <td>
    <select data-id="${i.id}" ${!esEditable ? 'disabled' : ''}>
      ${opciones}
    </select>
  </td>
`;

    // 🔹 Solo agregamos listener si puede editarse
    if (esEditable) {
      fila.querySelector("select").addEventListener("change", async (e) => {
        await actualizarEstatusIncautado(i.id, e.target.value, fila);
      });
    }
    // Agregar celdas para archivos solo si el estatus permite editar
const cellArchivos = document.createElement("td");

cellArchivos.innerHTML = `
  <button data-id="${i.id}" class="btn-ver-archivos">Ver Archivos</button>
  <input type="file" data-id="${i.id}" class="input-subir-archivo"/>
  <select data-id="${i.id}" class="select-tipo-archivo">
  <option value="Nota Informativa 1">Nota Informativa</option>
    <option value="Nota Informativa 2">Nota Informativa actualizacion</option>
    <option value="reporte">Reporte</option>
  </select>
  <button data-id="${i.id}" class="btn-subir-archivo">Subir</button>
`;

fila.appendChild(cellArchivos);
// Subir archivo
cellArchivos.querySelector(".btn-subir-archivo").addEventListener("click", async e => {
  const id = i.id; // ID del incautado
  const fileInput = cellArchivos.querySelector(".input-subir-archivo");
  const tipoSelect = cellArchivos.querySelector(".select-tipo-archivo");

  if (!fileInput.files[0]) return alert("Selecciona un archivo");

  const formData = new FormData();
  formData.append("archivo", fileInput.files[0]);
  formData.append("tipo", tipoSelect.value);

  try {
    const res = await fetch(`${API_INCAUTADOS}/${id}/archivos`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error((await res.json()).error || "Error al subir archivo");

    const data = await res.json();
    alert(`Archivo "${data.nombre}" subido correctamente`);
  } catch (err) {
    console.error(err);
    alert(`Error al subir archivo: ${err.message}`);
  }
});

cellArchivos.querySelector(".btn-ver-archivos").addEventListener("click", async e => {
  const id = i.id;
  try {
    const res = await fetch(`${API_INCAUTADOS}/${id}/archivos`);
    if (!res.ok) throw new Error("No se pudieron cargar los archivos");

    const archivos = await res.json();
    if (!archivos.length) return alert("No hay archivos para este incautado");

    const lista = archivos.map(a => `${a.nombre} (${a.tipo || 'sin tipo'})`).join("\n");
    alert(`Archivos:\n${lista}`);
  } catch (err) {
    console.error(err);
    alert("Error al cargar archivos");
  }
});

    tbody.appendChild(fila);
  });

  document.getElementById("pagina-actual-incautados").textContent =
    `Página ${currentPage} de ${totalPaginas || 1}`;
}



export async function actualizarEstatusIncautado(id, nuevoEstatus, fila) {
  try {
    // Buscar el nombre del estatus usando el ID seleccionado
    const estatusSeleccionado = listaEstatus.find(e => e.id === Number(nuevoEstatus))?.nombre;
    if (!estatusSeleccionado) {
      alert("Estatus no válido");
      return;
    }

    const res = await fetch(`${API_INCAUTADOS}/${id}/estatus`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estatus: estatusSeleccionado }), // 🔹 Enviamos el nombre
    });

    const data = await res.json();

    if (res.ok) {
      //const data = await res.json();
      fila.querySelector("td:nth-child(4)").textContent = data.estatus;
      fila.style.background = data.estatus === "Recuperado" ? "#d1ffd1" : "#ffd1d1";

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
export function paginaSiguienteIncautados() {
  currentPage++;
  renderizarPagina();
}

export function paginaAnteriorIncautados() {
  if (currentPage > 1) {
    currentPage--;
    renderizarPagina();
  }
}

// Ir a una página específica
export function irAPaginaIncautados() {
  const paginaInput = document.getElementById("pagina-input-incautados")?.value.trim();
  const paginaNumero = parseInt(paginaInput, 10);

  if (!paginaInput) return;

  const totalPaginas = Math.ceil(incautadosCache.length / limit);

  if (!isNaN(paginaNumero) && paginaNumero >= 1 && paginaNumero <= totalPaginas) {
    currentPage = paginaNumero;
    renderizarPagina();
  } else {
    alert("Número de página inválido");
  }

  // limpia el campo si existe
  if (document.getElementById("pagina-input-incautados")) {
    document.getElementById("pagina-input-incautados").value = "";
  }
}


// Aplicar filtros
export function aplicarFiltrosIncautados() {
  currentSerie = document.getElementById("filtro-serie-incautado").value.trim();
  currentTecnologia = document.getElementById("filtro-tecnologia-incautado").value.trim();
  currentEstatus = document.getElementById("filtro-estatus-incautado")?.value.trim() || "";
  currentPage = 1;
  renderizarPagina();
}


// Hacer las funciones globales solo para esta vista
window.paginaSiguienteIncautados = paginaSiguienteIncautados;
window.paginaAnteriorIncautados = paginaAnteriorIncautados;
window.aplicarFiltrosIncautados = aplicarFiltrosIncautados;
window.irAPaginaIncautados = irAPaginaIncautados;
