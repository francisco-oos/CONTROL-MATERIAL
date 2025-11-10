// ===============================
// VistaNodos.js
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
  { id: 10, nombre: "incautado" }
];

const API_NODOS = `${API_BASE}/nodos`;
const API_TECNOLOGIAS = `${API_BASE}/tecnologias`;
const API_ESTATUS = `${API_BASE}/estatus`;

let currentPage = 1;
const limit = 50;
let currentSerie = "";
let currentTecnologia = "";
let currentEstatus = "";
let nodosCache = []; // Guardamos todos los nodos en memoria

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("vista-ver-nodos")) {
    inicializarVistaNodos();
  }
  
});

export async function inicializarVistaNodos() {
  await cargarFiltrosTecnologia();
  await cargarTodosNodos();
  await cargarFiltrosestatus();
  renderizarPagina();
}

// Cargar tecnologías para el filtro
async function cargarFiltrosTecnologia() {
  const select = document.getElementById("filtro-tecnologia-nodos");
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
async function cargarFiltrosestatus() {
  const select = document.getElementById("filtro-estatus-nodos");
  if (!select) return console.warn("No se encontró el elemento #filtro-estatus-nodos en el DOM");
  select.innerHTML = `<option value="">Todas</option>`;
  try {
    const res = await fetch(API_ESTATUS);
    const estatus = await res.json();
    // Reemplazamos el contenido del array (o reasignamos)
    listaEstatus = estatus;
    console.log("Estatus cargados:", listaEstatus);
    estatus.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.nombre;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error(" Error al cargar Estatus:", err);
  }
}



// Cargar todos los nodos (solo una vez)
async function cargarTodosNodos() {
  try {
    const res = await fetch(API_NODOS);
    nodosCache = await res.json(); // ⚠ Puede ser enorme, pero paginaremos en memoria
  } catch (err) {
    console.error("Error al cargar nodos:", err);
  }
}

function renderizarPagina() {
  const tbody = document.getElementById("tbody-nodos");
  tbody.innerHTML = "";

// En renderizarPagina, incluir filtro por estatus
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

      const nombreTec = listaTecnologias.find(t => t.id === n.id_tecnologia)?.nombre || n.id_tecnologia;
      const nombreEstatus = listaEstatus.find(e => e.id === n.id_estatus)?.nombre;

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

  document.getElementById("pagina-actual-nodos").textContent = `Página ${currentPage} de ${totalPaginas || 1}`;
}


// Actualizar estatus del nodo
export async function actualizarEstatus(id, nuevoEstatus, fila) {
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
      alert(` Error: ${data.error}`);
    }
  } catch (err) {
    console.error(" Error al actualizar estatus:", err);
    alert("Error al conectar con el servidor");
  }
}

// Navegación de páginas
export function paginaSiguiente() { currentPage++; renderizarPagina(); }
export function paginaAnterior() { if (currentPage > 1) { currentPage--; renderizarPagina(); } }
// Ir a una página específica
// Función para ir a una página específica
export function irAPagina() {
  const paginaInput = document.getElementById("pagina-input").value.trim();
  const paginaNumero = parseInt(paginaInput, 10);  // Convertir a número

  // Si el campo está vacío, no hacemos nada
  if (!paginaInput) {
    return; // No se hace nada si el campo está vacío
  }

  // Verificar si el número ingresado es válido y está dentro del rango de páginas
  const totalPaginas = Math.ceil(nodosCache.length / limit);

  if (!isNaN(paginaNumero) && paginaNumero >= 1 && paginaNumero <= totalPaginas) {
    currentPage = paginaNumero;
    renderizarPagina();
  } else {
    alert("Número de página inválido");
  }

  // Limpiar el campo de entrada después de usarlo
  document.getElementById("pagina-input").value = "";
}

// Aplicar filtros (arreglado)
export function aplicarFiltrosNodos(){
  currentSerie = document.getElementById("filtro-serie-nodos").value.trim();
  currentTecnologia = document.getElementById("filtro-tecnologia-nodos").value.trim();
  // id correcto y paréntesis bien colocados:
  currentEstatus = document.getElementById("filtro-estatus-nodos")?.value.trim() || "";
  currentPage = 1;
  renderizarPagina();
}





// Hacer las funciones globales
window.paginaSiguiente = paginaSiguiente;
window.paginaAnterior = paginaAnterior;
window.aplicarFiltrosNodos = aplicarFiltrosNodos;
window.irAPagina=irAPagina;
