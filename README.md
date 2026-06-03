# Taller Auto — Sistema de Gestión de Taller Mecánico

Aplicación web para gestionar clientes, vehículos, citas y órdenes de trabajo de un taller mecánico.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | PHP 8.3 |
| Base de datos | MySQL / MariaDB |
| Dependencias PHP | `vlucas/phpdotenv` (via Composer) |
| Despliegue | Docker (Apache) |

---

## Estructura del proyecto

```
ADS/
├── index.html              # SPA principal
├── assets/
│   ├── app.js              # Toda la lógica frontend
│   └── style.css           # Estilos
├── config/
│   └── db.php              # Conexión PDO (lee .env)
├── clientes/
│   ├── index.php           # GET → lista de clientes
│   ├── guardar.php         # POST → crear / editar cliente
│   └── eliminar.php        # POST → eliminar cliente
├── vehiculos/
│   ├── index.php           # GET → lista de vehículos
│   ├── guardar.php         # POST → crear / editar vehículo
│   └── eliminar.php        # POST → eliminar vehículo
├── citas/
│   ├── index.php           # GET → lista de citas
│   ├── guardar.php         # POST → crear / editar cita
│   └── eliminar.php        # POST → eliminar cita
├── ordenes/
│   ├── index.php           # GET → lista de órdenes
│   ├── guardar.php         # POST → crear / editar orden
│   ├── eliminar.php        # POST → eliminar orden
│   └── cambiar_estado.php  # POST → cambiar estado de orden
├── historial/
│   └── index.php           # GET ?placa=XX → historial de vehículo
├── setup.sql               # Script de creación de la BD
├── alter_db.py             # Script para migrar BD existente
├── .env                    # Variables de entorno (no commitear)
├── composer.json
└── Dockerfile
```

---

## Configuración

### 1. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=taller_pmv
DB_USER=root
DB_PASS=tu_password
```

### 2. Base de datos

**Instalación nueva:**
```bash
mysql -u root -p < setup.sql
```

**Migrar BD existente:**
```bash
pip install pymysql python-dotenv
python alter_db.py
```

### 3. Dependencias PHP

```bash
composer install
```

---

## Ejecución

### Con Docker

```bash
docker build -t taller-auto .
docker run -p 8080:80 --env-file .env taller-auto
```

Abre `http://localhost:8080`

### Sin Docker (PHP built-in server)

```bash
php -S localhost:8080
```

---

## Base de datos

### Esquema

```
clientes
  id, nombre, telefono, correo

vehiculos
  id, cliente_id → clientes(id), marca, modelo, placa (UNIQUE)

citas
  id, cliente_id → clientes(id), vehiculo_id → vehiculos(id),
  fecha, hora, motivo

ordenes
  id, cliente_id → clientes(id), vehiculo_id → vehiculos(id),
  descripcion, estado (pendiente | en_proceso | finalizado),
  observaciones, fecha_creacion
```

Todas las FK usan `ON DELETE CASCADE`.

---

## API endpoints

Todos devuelven JSON.

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `clientes/index.php` | Lista todos los clientes |
| POST | `clientes/guardar.php` | Crea o edita un cliente (`id` opcional) |
| POST | `clientes/eliminar.php` | Elimina un cliente (`id`) |
| GET | `vehiculos/index.php` | Lista todos los vehículos |
| POST | `vehiculos/guardar.php` | Crea o edita un vehículo |
| POST | `vehiculos/eliminar.php` | Elimina un vehículo |
| GET | `citas/index.php` | Lista todas las citas |
| POST | `citas/guardar.php` | Crea o edita una cita |
| POST | `citas/eliminar.php` | Elimina una cita |
| GET | `ordenes/index.php` | Lista todas las órdenes |
| POST | `ordenes/guardar.php` | Crea o edita una orden |
| POST | `ordenes/eliminar.php` | Elimina una orden |
| POST | `ordenes/cambiar_estado.php` | Cambia estado de una orden |
| GET | `historial/index.php?placa=ABC` | Historial completo por placa |
