# Changelog

## [2026-06-03]

### Autenticación y roles

- Al registrarse, se crea automáticamente un registro en la tabla `clientes` con el nombre de usuario, teléfono y correo ingresados.
- El formulario de registro ahora solicita teléfono y correo electrónico.
- Se definen dos roles: `admin` y `usuario`.

### Control de permisos

| Acción | usuario | admin |
|---|---|---|
| Ver datos | ✅ | ✅ |
| Crear vehículo, cita, orden | ✅ | ✅ |
| Editar clientes, vehículos, citas, órdenes | ❌ | ✅ |
| Eliminar cualquier registro | ❌ | ✅ |
| Cambiar estado de orden | ❌ | ✅ |

### Archivos modificados

**Frontend**
- `index.html` — campos de teléfono y correo en formulario de registro.
- `assets/app.js` — botones de editar (clientes) y cambiar estado (órdenes) solo visibles para admin.

**Backend**
- `auth/registro.php` — inserta cliente al registrarse, con teléfono y correo.
- `clientes/guardar.php` — requiere rol `admin`.
- `vehiculos/guardar.php` — requiere login; edición solo `admin`.
- `citas/guardar.php` — requiere login; edición solo `admin`.
- `ordenes/guardar.php` — requiere login; edición solo `admin`.
- `ordenes/cambiar_estado.php` — requiere rol `admin`.
