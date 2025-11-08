// js/cargarIncautados.js
// --------------------------------------------------
// Vista para cargar nodos incautados desde CSV
// --------------------------------------------------
import { API_BASE } from "../../config.js";

$(document).ready(() => {
  const fileInput = $("#csvFileIncautados");
  const preview = $("#csv-preview-incautados");
  const tableHead = $("#tabla-preview-incautados thead");
  const tableBody = $("#tabla-preview-incautados tbody");

  // 📂 1️⃣ Vista previa del archivo CSV
  fileInput.on("change", () => {
    const file = fileInput[0].files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result.trim();
      if (!text) return alert("⚠️ El archivo está vacío o no es válido.");

      const rows = text.split("\n").map((r) => r.split(","));
      const headers = rows.shift();

      // Crear encabezados dinámicos
      tableHead.html("<tr>" + headers.map(h => `<th>${h.trim()}</th>`).join("") + "</tr>");
      tableBody.empty();

      // Crear filas
      rows.forEach((row) => {
        const cols = row.map((c) => `<td>${c.trim()}</td>`).join("");
        tableBody.append(`<tr>${cols}</tr>`);
      });

      preview.show();
    };

    reader.readAsText(file);
  });

// 📥 2️⃣ Descargar formato CSV
$("#btn-descargar-formato-incautados").on("click", () => {
  const headers = [
    "LINEA","ESTACA","PUNTO","EQUIPO","SERIE","STATUS",
    "FECHA INCAUTADO","REPORTADO: CABO/ CHECADOR",
    "FECHA DE RECUPERADO","REPORTADO: CABO/ CHECADOR",
    "HIZO REPORTE","PROPIETARIO","TELEFONO",
    "LOCALIDAD","MUNICIPIO","COMENTARIO","NOTA INFORMATIVA"
  ];

  const csvContent = headers.join(",") + "\n";
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Formato_Incautados.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
  // 🚀 3️⃣ Enviar CSV al servidor
  $("#btn-enviar-incautados").on("click", async () => {
    const file = fileInput[0].files[0];
    if (!file) return alert("⚠️ Selecciona un archivo CSV primero.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/cargar-incautados`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "✅ Carga completada correctamente.");
        if (data.errores?.length) {
          console.warn("Registros no válidos:", data.errores);
        }
      } else {
        alert(`❌ Error del servidor: ${data.error || "Error desconocido."}`);
      }
    } catch (error) {
      console.error("❌ Error al enviar el archivo:", error);
      alert("❌ Error al conectar con el servidor.");
    }
  });
});
