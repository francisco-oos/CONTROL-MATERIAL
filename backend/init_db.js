// backend/init_db.js
// --------------------------------------------------
// Inicializa la base de datos control_material.db
// Crea todas las tablas necesarias.
// --------------------------------------------------

import Database from "better-sqlite3";
import fs from "fs";
import { DB_PATH } from "./config.js";

if (fs.existsSync(DB_PATH)) {
  console.log("🟡 Base de datos ya existe:", DB_PATH);
} else {
  console.log("🟢 Creando base de datos:", DB_PATH);
}

const db = new Database(DB_PATH);

// =======================================
// TABLAS BASE
// =======================================
db.exec(`
CREATE TABLE IF NOT EXISTS tecnologia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS permiso (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  perfil TEXT NOT NULL,
  nivel INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS estatus_equipos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS estatus_chips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS nodos_estatus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL,
  niveles_permitidos TEXT
);

CREATE TABLE IF NOT EXISTS tipo_tendido (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL
);
`);

// =======================================
// TABLAS PRINCIPALES
// =======================================
db.exec(`
CREATE TABLE IF NOT EXISTS usuario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  apellido_p TEXT,
  apellido_m TEXT,
  unickname TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  id_permiso INTEGER,
  FOREIGN KEY (id_permiso) REFERENCES permiso(id)
);

CREATE TABLE IF NOT EXISTS archivos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  ruta TEXT,
  fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nodos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  serie TEXT UNIQUE NOT NULL,
  id_tecnologia INTEGER,
  id_estatus INTEGER,
  fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_tecnologia) REFERENCES tecnologia(id),
  FOREIGN KEY (id_estatus) REFERENCES nodos_estatus(id)
);

CREATE TABLE IF NOT EXISTS celular (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  modelo TEXT,
  serie TEXT,
  imei1 TEXT,
  imei2 TEXT,
  numero_economico TEXT,
  fecha_recepcion TEXT,
  id_estatus INTEGER,
  id_archivo_resguardo INTEGER,
  id_archivo_devolucion INTEGER,
  comentario TEXT,
  fecha_devolucion TEXT,
  FOREIGN KEY (id_estatus) REFERENCES estatus_equipos(id)
);

CREATE TABLE IF NOT EXISTS chips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT UNIQUE,
  fecha_recepcion TEXT,
  id_estatus INTEGER,
  fecha_actualizacion TEXT,
  comentario TEXT,
  FOREIGN KEY (id_estatus) REFERENCES estatus_chips(id)
);

CREATE TABLE IF NOT EXISTS handy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  modelo TEXT,
  serie TEXT,
  id_estatus INTEGER,
  id_archivo_resguardo INTEGER,
  id_archivo_devolucion INTEGER,
  comentario TEXT,
  fecha_recepcion TEXT,
  fecha_devolucion TEXT,
  FOREIGN KEY (id_estatus) REFERENCES estatus_equipos(id)
);

CREATE TABLE IF NOT EXISTS asignacion_equipos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_celular INTEGER,
  id_chip INTEGER,
  id_handy INTEGER,
  nombre_personal TEXT,
  fecha_entrega TEXT,
  fecha_actualizacion TEXT,
  FOREIGN KEY (id_celular) REFERENCES celular(id),
  FOREIGN KEY (id_chip) REFERENCES chips(id),
  FOREIGN KEY (id_handy) REFERENCES handy(id)
);
`);

// =======================================
// TABLAS ESPECIALES
// =======================================
db.exec(`
CREATE TABLE IF NOT EXISTS nodos_robados_extraviados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_nodo INTEGER,
  id_tecnologia INTEGER,
  id_estatus_nodo INTEGER,
  id_archivo_pdf INTEGER,
  id_archivo_word INTEGER,
  id_reporte1 INTEGER,
  id_reporte2 INTEGER,
  id_reporte3 INTEGER,
  fecha_busqueda1 TEXT,
  fecha_busqueda2 TEXT,
  fecha_busqueda3 TEXT,
  nombre1 TEXT,
  nombre2 TEXT,
  nombre3 TEXT,
  linea TEXT,
  estaca TEXT,
  terreno TEXT,
  comentario TEXT,
  id_archivo_actualizacion_pdf INTEGER,
  id_archivo_actualizacion_word INTEGER,
  FOREIGN KEY (id_nodo) REFERENCES nodos(id),
  FOREIGN KEY (id_tecnologia) REFERENCES tecnologia(id),
  FOREIGN KEY (id_estatus_nodo) REFERENCES nodos_estatus(id)
);

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

CREATE TABLE IF NOT EXISTS mantenimiento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha_llegada TEXT,
  linea TEXT,
  estaca TEXT,
  id_nodo INTEGER,
  id_tecnologia INTEGER,
  id_estatus_nodo INTEGER,
  id_archivo_pdf INTEGER,
  id_archivo_word INTEGER,
  id_foto1 INTEGER,
  id_foto2 INTEGER,
  id_foto3 INTEGER,
  id_foto4 INTEGER,
  FOREIGN KEY (id_nodo) REFERENCES nodos(id)
);

CREATE TABLE IF NOT EXISTS tendido (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  linea TEXT,
  estaca TEXT,
  id_nodo INTEGER,
  geofono TEXT,
  arnes TEXT,
  id_tipo_tendido INTEGER,
  nombre_tendio TEXT,
  nombre_roto TEXT,
  nombre_levanto TEXT,
  FOREIGN KEY (id_nodo) REFERENCES nodos(id),
  FOREIGN KEY (id_tipo_tendido) REFERENCES tipo_tendido(id)
);
`);

console.log("✅ Todas las tablas creadas correctamente.");

// =======================================
// INSERTS INICIALES
// =======================================
db.exec(`
INSERT OR IGNORE INTO tecnologia (nombre) VALUES
('Inova Analógico'), ('Inova Digital'), ('Sercel AFU'), ('Sercel DFU');

INSERT OR IGNORE INTO permiso (perfil, nivel) VALUES
('Administrador', 1),
('Técnico', 2),
('Visual', 3),
('Master', 4);

INSERT OR IGNORE INTO estatus_equipos (nombre) VALUES
('Activo'), ('Inactivo'), ('Reparacion'), ('Dañado'), ('Extraviado'), ('Devolucion');

INSERT OR IGNORE INTO estatus_chips (nombre) VALUES
('Activo'), ('Inactivo'), ('Extraviado'), ('Devuelto'), ('Sin saldo'), ('Sin servicio');

INSERT OR IGNORE INTO nodos_estatus (nombre, niveles_permitidos) VALUES
('Tendido', '1'),
('Operativo', '1,2'),
('Mantenimiento', '1,2'),
('Robado', '1'),
('Extraviado', '1'),
('Para Garantía', '1'),
('En Garantía', '1'),
('Dañado', '1,2'),
('Pruebas', '1,2'),
('Incautado', '1,2'),
('Recuperado', '1,2');

INSERT OR IGNORE INTO tipo_tendido (nombre) VALUES
('Producción'), ('Prueba');

-- Asegurar índice único para integridad de estatus
CREATE UNIQUE INDEX IF NOT EXISTS idx_nodos_estatus_nombre
ON nodos_estatus (nombre);
`);

console.log("✅ Datos iniciales insertados correctamente.");
db.close();
