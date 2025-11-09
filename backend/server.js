// server.js
// --------------------------------------------------
// Servidor principal Express para manejar la API REST.
// Compatible con ejecución local o en servidor remoto.
// --------------------------------------------------

import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import csv from "csv-parser";
import db from "./database.js";

const app = express();
const PORT = process.env.PORT || 3001; // ← configurable

// Middlewares
app.use(cors());
app.use(express.json());

// Carpeta de archivos subidos
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const upload = multer({ dest: uploadDir });
// --------------------------------------------------
// 📥 Cargar nodos desde CSV (acepta tecnologia o tecnologia_id)
// --------------------------------------------------
app.post("/api/cargar-nodos", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;

  try {
// Leer el CSV
const results = [];
const fileStream = fs.createReadStream(filePath).pipe(csv());

for await (const row of fileStream) {
  const serie = (row.serie || row.SERIE || "").trim();
  const tecnologia = (row.tecnologia || row.TECNOLOGIA || "").trim();
  const tecnologia_id = parseInt(
    row.tecnologia_id ||
    row.TECNOLOGIA_ID ||
    row.tecnologia ||
    row.TECNOLOGIA ||
    0
  );

  if (serie && (tecnologia || tecnologia_id)) {
    results.push({ serie, tecnologia, tecnologia_id });
  }
}

    // Obtener todas las tecnologías válidas
    const tecnologiasBD = db
      .prepare("SELECT id, nombre FROM tecnologia")
      .all()
      .reduce((acc, t) => {
        acc[t.nombre.toLowerCase()] = t.id;
        return acc;
      }, {});

    // Preparar inserción de nodos
const insertNodo = db.prepare(
  "INSERT OR IGNORE INTO nodos (serie, id_tecnologia, id_estatus) VALUES (?, ?, ?)"
);

    let insertados = 0;
    const estatus = 2; //// id del estatus "Operativo"

    db.transaction(() => {
      for (const r of results) {
        let idTecnologia = null;

        if (r.tecnologia_id) {
          idTecnologia = parseInt(r.tecnologia_id);
        } else if (r.tecnologia && tecnologiasBD[r.tecnologia.toLowerCase()]) {
          idTecnologia = tecnologiasBD[r.tecnologia.toLowerCase()];
        }

        if (idTecnologia) {
          insertNodo.run(r.serie, idTecnologia, estatus);
          insertados++;
        }
      }
    })();

    // Eliminar el archivo temporal
    fs.unlinkSync(filePath);

    res.json({
      message: `✅ ${insertados} nodos insertados correctamente.`,
      totales: { leidos: results.length, insertados },
    });
  } catch (error) {
    console.error("❌ Error al procesar CSV:", error);
    res.status(500).json({ error: "Error al procesar el archivo CSV." });
  }
});


// Ejemplo de usuarios
app.get("/api/usuarios", (req, res) => {
  try {
    const usuarios = db.prepare(`
      SELECT u.id, u.nombre, u.apellido_p, u.apellido_m,
             u.unickname, p.perfil, p.nivel
      FROM usuario u
      JOIN permiso p ON u.id_permiso = p.id
    `).all();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subida de archivo
app.post("/api/upload", upload.single("archivo"), (req, res) => {
  try {
    const { originalname, filename } = req.file;
    const fecha = new Date().toISOString();

    db.prepare(`
      INSERT INTO archivos (nombre, ruta, fecha_creacion)
      VALUES (?, ?, ?)
    `).run(originalname, filename, fecha);

    res.json({ message: "Archivo subido correctamente", nombre: originalname });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// --------------------------------------------------
// Rutas para gestión de nodos
// --------------------------------------------------

// ✅ Obtener todos los nodos o filtrarlos por serie, tecnología o estatus
app.get("/api/nodos", (req, res) => {
  try {
    const { serie, tecnologia, estatus } = req.query;

    let query = "SELECT * FROM nodos WHERE 1=1";
    const params = [];

    if (serie) {
      query += " AND serie LIKE ?";
      params.push(`%${serie}%`);
    }
    if (tecnologia) {
      query += " AND tecnologia LIKE ?";
      params.push(`%${tecnologia}%`);
    }
    if (estatus) {
      query += " AND estatus = ?";
      params.push(estatus);
    }

    const nodos = db.prepare(query).all(...params);
    res.json(nodos);
  } catch (error) {
    console.error("❌ Error al obtener nodos:", error);
    res.status(500).json({ error: error.message });
  }
});

//  Editar estatus de un nodo por ID o serie
app.put("/api/nodos/estatus", (req, res) => {
  try {
    const { id, serie, estatus } = req.body;
    if (!estatus) return res.status(400).json({ error: "El estatus es obligatorio." });

    let result;
    if (id) {
      result = db.prepare("UPDATE nodos SET estatus = ? WHERE id = ?").run(estatus, id);
    } else if (serie) {
      result = db.prepare("UPDATE nodos SET estatus = ? WHERE serie = ?").run(estatus, serie);
    } else {
      return res.status(400).json({ error: "Debe especificar id o serie." });
    }

    if (result.changes === 0) {
      return res.status(404).json({ message: "Nodo no encontrado." });
    }

    res.json({ message: "Estatus actualizado correctamente." });
  } catch (error) {
    console.error("❌ Error al actualizar estatus:", error);
    res.status(500).json({ error: error.message });
  }
});
// ✅ Limpiar todos los nodos de la tabla
app.delete("/api/nodos/clear", (req, res) => {
  try {
    // Corregir la consulta SQL (DELETE en lugar de DELET)
    const result = db.prepare("DELETE FROM nodos").run();

    if (result.changes === 0) {
      return res.status(404).json({ message: "No se encontraron nodos para borrar." });
    }

    res.json({ message: "Todos los nodos han sido eliminados correctamente." });
  } catch (error) {
    console.error("❌ Error al eliminar los nodos:", error);
    res.status(500).json({ error: error.message });
  }
});
// ✅ Limpiar todos los nodos de la tabla
app.delete("/api/estatus/clear", (req, res) => {
  try {
    // Corregir la consulta SQL (DELETE en lugar de DELET)
    const result = db.prepare("DELETE FROM nodos_estatus").run();

    if (result.changes === 0) {
      return res.status(404).json({ message: "No se encontraron nodos para borrar." });
    }

    res.json({ message: "Todos los nodos han sido eliminados correctamente." });
  } catch (error) {
    console.error("❌ Error al eliminar los nodos:", error);
    res.status(500).json({ error: error.message });
  }
});
// --------------------------------------------------
// ENDPOINT: Actualizar el estatus de un nodo
// --------------------------------------------------
app.put("/api/nodos/:id/estatus", (req, res) => {
  const { id } = req.params;
  const { estatus } = req.body;

 const estatusValido = db.prepare(`
  SELECT id FROM nodos_estatus WHERE LOWER(nombre) = LOWER(?)
`).get(estatus);

if (!estatusValido) {
  return res.status(400).json({ error: "Estatus inválido o no encontrado en la base de datos" });
}


  try {
    const stmt = db.prepare(`
      UPDATE nodos
      SET id_estatus = (
        SELECT id FROM nodos_estatus WHERE LOWER(nombre) = LOWER(?)
      ),
      fecha_actualizacion = datetime('now','localtime')
      WHERE id = ?
    `);

    const result = stmt.run(estatus, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Nodo no encontrado" });
    }

    const nodo = db.prepare(`
      SELECT n.id, n.serie, ne.nombre AS estatus, n.fecha_actualizacion
      FROM nodos n
      LEFT JOIN nodos_estatus ne ON n.id_estatus = ne.id
      WHERE n.id = ?
    `).get(id);

    res.json(nodo);

  } catch (err) {
    console.error("❌ Error al actualizar estatus:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------
// (Próximo paso) Cargar celulares desde CSV
// --------------------------------------------------
// Este será similar a /api/cargar-nodos, pero con columnas:
// serie, chip, handy, tecnologia, estatus, etc.
app.post("/api/cargar-celulares", upload.single("file"), (req, res) => {
  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      const serie = data.SERIE || data.serie;
      const chip = data.CHIP || data.chip;
      const handy = data.HANDY || data.handy;
      const tecnologia = data.TECNOLOGIA || data.tecnologia;
      const estatus = data.ESTATUS || data.estatus || 2;

      if (serie && chip && handy) {
        results.push({ serie, chip, handy, tecnologia, estatus });
      }
    })
    .on("end", () => {
      try {
        const insert = db.prepare(
          "INSERT INTO celulares (serie, chip, handy, tecnologia, estatus) VALUES (?, ?, ?, ?, ?)"
        );
        db.transaction(() => {
          for (const r of results) insert.run(r.serie, r.chip, r.handy, r.tecnologia, r.estatus);
        })();

        fs.unlinkSync(filePath);
        res.json({ message: `${results.length} celulares insertados correctamente.` });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error al insertar celulares en la base de datos." });
      }
    });
});
// --------------------------------------------------
// 📦 Rutas GET para consultar todas las tablas
// --------------------------------------------------
// estatus
app.get("/api/estatus", (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM nodos_estatus").all();
    res.json(data);
  } catch (error) {
    console.error("❌ Error al obtener tecnologías:", error);
    res.status(500).json({ error: error.message });
  }
});
// Tecnologías
app.get("/api/tecnologias", (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM tecnologia").all();
    res.json(data);
  } catch (error) {
    console.error("❌ Error al obtener tecnologías:", error);
    res.status(500).json({ error: error.message });
  }
});

// Permisos
app.get("/api/permisos", (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM permiso").all();
    res.json(data);
  } catch (error) {
    console.error("❌ Error al obtener permisos:", error);
    res.status(500).json({ error: error.message });
  }
});

// Equipos
app.get("/api/equipos", (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM equipos").all();
    res.json(data);
  } catch (error) {
    console.error("❌ Error al obtener equipos:", error);
    res.status(500).json({ error: error.message });
  }
});

// Celulares
app.get("/api/celulares", (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM celulares").all();
    res.json(data);
  } catch (error) {
    console.error("❌ Error al obtener celulares:", error);
    res.status(500).json({ error: error.message });
  }
});

// Chips
app.get("/api/chips", (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM chips").all();
    res.json(data);
  } catch (error) {
    console.error("❌ Error al obtener chips:", error);
    res.status(500).json({ error: error.message });
  }
});

// Handy
app.get("/api/handy", (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM handy").all();
    res.json(data);
  } catch (error) {
    console.error("❌ Error al obtener handy:", error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------
// 📥 Cargar material incautado desde CSV
// (usa id_tecnologia directamente desde la tabla nodos)
// --------------------------------------------------
app.post("/api/cargar-incautados", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const errores = [];
  const resultados = [];

  try {
    const fileStream = fs.createReadStream(filePath).pipe(csv());
    for await (const row of fileStream) {
      const serie = (row.serie || row.SERIE || "").trim();
      const estatus = (row.estatus || row.ESTATUS || "").trim();
      const fecha_incautado = (row.fecha_incautado || row["FECHA INCAUTADO"] || "").trim();
      const propietario = (row.propietario || row.PROPIETARIO || "").trim();
      const localidad = (row.localidad || row.LOCALIDAD || "").trim();
      const contacto = (row.contacto || row["CONTACTO"] || row["TELEFONO"] || "").trim();
      const linea = (row.linea || row.LINEA || "").trim();
      const estaca = (row.estaca || row.ESTACA || "").trim();
      const punto = (row.punto || row.PUNTO || "").trim();
      const latitud = parseFloat(row.latitud || row.LATITUD || 0) || null;
      const longitud = parseFloat(row.longitud || row.LONGITUD || 0) || null;
      const altitud = parseFloat(row.altitud || row.ALTITUD || 0) || null;

      if (!serie) continue;

      resultados.push({
        serie,
        estatus,
        fecha_incautado,
        propietario,
        localidad,
        contacto,
        linea,
        estaca,
        punto,
        latitud,
        longitud,
        altitud,
      });
    }

    // 🧭 Mapear serie → id_nodo
    const nodos = db
      .prepare("SELECT id, serie FROM nodos")
      .all()
      .reduce((acc, n) => {
        acc[n.serie] = n.id;
        return acc;
      }, {});

    // 🧭 Mapear estatus → id_estatus
    const estatusBD = db
      .prepare("SELECT id, LOWER(nombre) AS nombre FROM nodos_estatus")
      .all()
      .reduce((acc, e) => {
        acc[e.nombre] = e.id;
        return acc;
      }, {});

    // 🧱 Preparar queries
    const insertIncautado = db.prepare(`
      INSERT INTO incautado (
        id_nodo, id_tecnologia, id_estatus_nodo,
        linea, estaca, punto, latitud, longitud, altitud,
        fecha_incautado, propietario, localidad, telefono
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const deleteIncautado = db.prepare(`DELETE FROM incautado WHERE id_nodo = ?`);
    const updateEstatusNodo = db.prepare(`
      UPDATE nodos SET id_estatus = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?
    `);

    let insertados = 0;

    // 🧩 Transacción principal
    db.transaction(() => {
      for (const r of resultados) {
        const idNodo = nodos[r.serie];
        if (!idNodo) {
          errores.push({ motivo: "Serie no encontrada", ...r });
          continue;
        }

        // Obtener id_tecnologia directamente del nodo
        const nodo = db.prepare("SELECT id_tecnologia FROM nodos WHERE id = ?").get(idNodo);
        if (!nodo || !nodo.id_tecnologia) {
          errores.push({ motivo: "Nodo sin tecnología asociada", ...r });
          continue;
        }

        // Determinar estatus destino
        const estatusLower = r.estatus.toLowerCase();
        let idEstatusNodo = estatusBD[estatusLower] || null;
        if (!idEstatusNodo) {
          errores.push({ motivo: "Estatus inválido", ...r });
          continue;
        }

        // 🟡 Si es “recuperado”, cambia a “operativo”
        if (estatusLower === "recuperado") {
          idEstatusNodo = estatusBD["operativo"];
          deleteIncautado.run(idNodo); // eliminar si existía
        }

        // 🔄 Actualizar estatus del nodo
        updateEstatusNodo.run(idEstatusNodo, idNodo);

        // Evitar duplicados de incautado
        const existeIncautado = db
          .prepare("SELECT COUNT(*) AS total FROM incautado WHERE id_nodo = ?")
          .get(idNodo).total;

        if (estatusLower === "incautado" && existeIncautado === 0) {
          insertIncautado.run(
            idNodo,
            nodo.id_tecnologia,
            idEstatusNodo,
            r.linea,
            r.estaca,
            r.punto,
            r.latitud,
            r.longitud,
            r.altitud,
            r.fecha_incautado || new Date().toISOString().split("T")[0],
            r.propietario || "",
            r.localidad || "",
            r.contacto || ""
          );
          insertados++;
        }
      }
    })();

    // 🧹 Limpiar archivo temporal
    fs.unlinkSync(filePath);

    // 📤 Respuesta final
    res.json({
      message: `✅ ${insertados} registros procesados correctamente.`,
      errores,
    });
  } catch (error) {
    console.error("❌ Error al procesar incautados:", error);
    res.status(500).json({ error: "Error al procesar el archivo CSV." });
  }
});

// --------------------------------------------------
// 📋 Obtener todos los registros de la tabla incautado
// --------------------------------------------------
app.get("/api/incautados", (req, res) => {
  try {
    const data = db.prepare(`
      SELECT 
        i.id,
        n.serie,
        t.nombre AS tecnologia,
        e.nombre AS estatus,
        i.linea,
        i.estaca,
        i.punto,
        i.latitud,
        i.longitud,
        i.altitud,
        i.fecha_incautado,
        i.fecha_recuperado,
        i.propietario,
        i.localidad,
        i.telefono,
        i.comentario,
        i.nota_informativa
      FROM incautado i
      LEFT JOIN nodos n ON i.id_nodo = n.id
      LEFT JOIN tecnologia t ON i.id_tecnologia = t.id
      LEFT JOIN nodos_estatus e ON i.id_estatus_nodo = e.id
      ORDER BY i.id DESC;
    `).all();

    res.json(data);
  } catch (error) {
    console.error("❌ Error al obtener incautados:", error);
    res.status(500).json({ error: "Error al obtener los registros incautados." });
  }
});
// --------------------------------------------------
// 📋 Obtener tabla incautado (solo IDs reales)
// --------------------------------------------------
app.get("/api/incautados/raw", (req, res) => {
  try {
    const data = db.prepare(`
      SELECT 
        id,
        id_nodo,
        id_tecnologia,
        id_estatus_nodo,
        linea,
        estaca,
        punto,
        latitud,
        longitud,
        altitud,
        fecha_incautado,
        fecha_recuperado,
        propietario,
        localidad,
        telefono,
        comentario,
        nota_informativa
      FROM incautado
      ORDER BY id DESC;
    `).all();

    res.json(data);
  } catch (error) {
    console.error("❌ Error al obtener incautados (raw):", error);
    res.status(500).json({ error: "Error al obtener los registros de incautado." });
  }
});



app.listen(PORT, () => {
  console.log(`🚀 Servidor backend en marcha en puerto ${PORT}`);
});
