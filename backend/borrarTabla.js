import Database from "better-sqlite3";
import { DB_PATH } from "./config.js"; // 🧩 Ruta de la base de datos

// Crear conexión
const db = new Database(DB_PATH);

/*/ Eliminar la tabla si ya existe
db.exec(`DROP TABLE IF EXISTS incautado;`);

// Crear la tabla con los nuevos campos
db.exec(`
  CREATE TABLE IF NOT EXISTS incautado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_nodo INTEGER,
    id_tecnologia INTEGER,
    id_estatus_nodo INTEGER,

    -- Datos de ubicación
    linea TEXT,
    estaca TEXT,
    punto TEXT,
    latitud REAL,
    longitud REAL,
    altitud REAL,

    -- Identificación del equipo
    equipo TEXT,
    serie TEXT,

    -- Estado y fechas
    status TEXT,
    fecha_incautado TEXT,
    fecha_recuperado TEXT,

    -- Reportes y cabos responsables
    nombre_reporte_incautado TEXT,
    id_archivo_reporte_incautado INTEGER,
    nombre_reporte_recuperado TEXT,
    id_archivo_reporte_recuperado INTEGER,

    -- Archivo general de respaldo (PDF/Word)
    id_archivo_pdf INTEGER,
    id_archivo_word INTEGER,

    -- Propietario o información adicional
    hizo_reporte TEXT,
    propietario TEXT,
    telefono TEXT,
    localidad TEXT,
    municipio TEXT,
    comentario TEXT,
    nota_informativa TEXT,

    -- Archivos de actualización
    id_archivo_actualizacion_pdf INTEGER,
    id_archivo_actualizacion_word INTEGER,

    FOREIGN KEY (id_nodo) REFERENCES nodos(id),
    FOREIGN KEY (id_tecnologia) REFERENCES tecnologia(id),
    FOREIGN KEY (id_estatus_nodo) REFERENCES nodos_estatus(id),
    FOREIGN KEY (id_archivo_pdf) REFERENCES archivos(id),
    FOREIGN KEY (id_archivo_word) REFERENCES archivos(id),
    FOREIGN KEY (id_archivo_reporte_incautado) REFERENCES archivos(id),
    FOREIGN KEY (id_archivo_reporte_recuperado) REFERENCES archivos(id),
    FOREIGN KEY (id_archivo_actualizacion_pdf) REFERENCES archivos(id),
    FOREIGN KEY (id_archivo_actualizacion_word) REFERENCES archivos(id)
  );
`);


db.close();
console.log("✅ Tabla 'incautado' recreada y estatus 'Recuperado' agregado (si no existía).");
*/
/*try {
  db.prepare(`
    INSERT OR IGNORE INTO tecnologia (nombre)
    VALUES ('Geófono');
  `).run();

  console.log("✅ Tecnología 'Geófono' agregada correctamente (si no existía).");
} catch (err) {
  console.error("❌ Error al agregar la tecnología:", err);
} finally {
  db.close();
}*/

/*/ Eliminar la tabla si ya existe*/
db.exec(`DROP TABLE IF EXISTS tendido;`);
db.exec(`
CREATE TABLE IF NOT EXISTS tendido (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  linea TEXT,
  estaca TEXT,
  id_nodo INTEGER,
  geofono INTEGER DEFAULT 0,  -- 0 = false, 1 = true
  arnes TEXT,
  id_tipo_tendido INTEGER,
  nombre_tendio TEXT,
  nombre_roto TEXT,
  nombre_levanto TEXT,
  latitud REAL,
  longitud REAL,
  elevacion REAL,
  fecha_estatus TEXT, -- formato YYYY-MM-DD
  FOREIGN KEY (id_nodo) REFERENCES nodos(id),
  FOREIGN KEY (id_tipo_tendido) REFERENCES tipo_tendido(id)
  );
`);
db.close();
console.log("✅ Tabla 'tendido' recreada ");