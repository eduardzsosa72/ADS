-- Taller PMV — Setup de base de datos
-- Ejecutar en MySQL/MariaDB antes de usar el sistema

CREATE DATABASE IF NOT EXISTS taller_pmv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taller_pmv;

CREATE TABLE IF NOT EXISTS clientes (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    nombre    VARCHAR(120) NOT NULL,
    telefono  VARCHAR(30)  DEFAULT '',
    correo    VARCHAR(120) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS vehiculos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id  INT NOT NULL,
    marca       VARCHAR(60)  NOT NULL,
    modelo      VARCHAR(80)  DEFAULT '',
    placa       VARCHAR(20)  NOT NULL UNIQUE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS citas (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id  INT NOT NULL,
    vehiculo_id INT NOT NULL,
    fecha       DATE         NOT NULL,
    hora        TIME         NOT NULL,
    motivo      VARCHAR(255) NOT NULL,
    FOREIGN KEY (cliente_id)  REFERENCES clientes(id)  ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ordenes (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id      INT NOT NULL,
    vehiculo_id     INT NOT NULL,
    descripcion     TEXT        NOT NULL,
    estado          ENUM('pendiente','en_proceso','finalizado') DEFAULT 'pendiente',
    observaciones TEXT NULL,
    fecha_creacion  VARCHAR(12) DEFAULT '',
    FOREIGN KEY (cliente_id)  REFERENCES clientes(id)  ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS usuarios (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60)  NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol      ENUM('admin','usuario') DEFAULT 'usuario'
);

-- Usuario admin por defecto: admin / admin123
INSERT IGNORE INTO usuarios (username, password, rol)
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
