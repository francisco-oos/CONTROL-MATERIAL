// js/cargarNodos.js
// --------------------------------------------------
// Vista para cargar la base de nodos desde CSV
// --------------------------------------------------
// Nota: API_BASE se obtiene desde config.js (NO se vuelve a declarar aquí)
import { API_BASE } from '../../config.js';

$(document).ready(() => {
  const fileInput = $("#csvFileNodos");
  const preview = $("#csv-preview-nodos");
  const tableHead = $("#tabla-preview-nodos thead");
  const tableBody = $("#tabla-preview-nodos tbody");

  // ==================================================
  //Vista previa automática del archivo CSV
  // ==================================================
  fileInput.on("change", () => {
    const file = fileInput[0].files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result.trim();

      if (!text) return alert(" El archivo está vacío o no es válido.");

      // Separar filas y columnas
      const rows = text.split("\n").map((r) => r.split(","));
      const headers = rows.shift();

      // 🧩 Crear encabezados dinámicos
      tableHead.html(
        "<tr>" + headers.map((h) => `<th>${h.trim()}</th>`).join("") + "</tr>"
      );

      // 🧩 Crear filas del cuerpo
      tableBody.empty();
      rows.forEach((row) => {
        const cols = row.map((c) => `<td>${c.trim()}</td>`).join("");
        tableBody.append(`<tr>${cols}</tr>`);
      });

      // Mostrar contenedor de vista previa
      preview.show();
    };

    reader.readAsText(file);
  });

  // ==================================================
  //  Enviar CSV al servidor para carga en la base
  // ==================================================
  $("#btn-enviar-nodos").on("click", async () => {
    const file = fileInput[0].files[0];
    if (!file) return alert("Selecciona un archivo CSV primero.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 🔗 Enviamos al endpoint usando API_BASE de config.js
 const response = await fetch(`${API_BASE}/cargar-nodos`, {
  method: "POST",
  body: formData,
});


      const data = await response.json();

      if (response.ok) {
        alert(data.message || "✅ Carga completada correctamente.");
      } else {
        alert(`Error del servidor: ${data.error || "Error desconocido."}`);
      }
    } catch (error) {
      console.error("Error al enviar el archivo:", error);
      alert("Error al conectar con el servidor.");
    }
  });
});
