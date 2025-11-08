import Database from "better-sqlite3";
import { DB_PATH } from "./config.js"; // 🧩 Importa la ruta desde config.js

// Conexión a la base de datos usando DB_PATH
const db = new Database(DB_PATH);

// Eliminar tabla si existe
/*db.exec(`DROP TABLE IF EXISTS incautado;`);

// Crear tabla nuevamente con la estructura actualizada
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
`);*/

db.prepare(`
  INSERT OR IGNORE INTO nodos_estatus (nombre, niveles_permitidos)
  VALUES ('Recuperado', '1,2');
`).run();

db.close();
console.log("✅ Estatus 'Recuperado' agregado (si no existía).");

