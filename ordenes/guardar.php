<?php
header('Content-Type: application/json');
require_once '../config/db.php';
require_once '../config/auth.php';

requireLogin();

$id            = intval($_POST['id'] ?? 0);

if ($id > 0 && ($_SESSION['usuario']['rol'] ?? '') !== 'admin') {
    echo json_encode(['error' => 'Solo el admin puede editar']);
    exit;
}
$cliente_id    = intval($_POST['cliente_id'] ?? 0);
$vehiculo_id   = intval($_POST['vehiculo_id'] ?? 0);
$descripcion   = trim($_POST['descripcion'] ?? '');
$estado        = trim($_POST['estado'] ?? 'pendiente');
$observaciones = trim($_POST['observaciones'] ?? '');

if (!$descripcion) {
    echo json_encode(['error' => 'La descripción es requerida']);
    exit;
}

if (!$vehiculo_id) {
    echo json_encode(['error' => 'Selecciona un vehículo']);
    exit;
}

$estados_validos = ['pendiente', 'en_proceso', 'finalizado'];
if (!in_array($estado, $estados_validos)) {
    $estado = 'pendiente';
}

$conn = getConn();

try {

    if ($id > 0) {
        $stmt = $conn->prepare("
            UPDATE ordenes 
            SET cliente_id = ?, vehiculo_id = ?, descripcion = ?, estado = ?, observaciones = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $cliente_id,
            $vehiculo_id,
            $descripcion,
            $estado,
            $observaciones,
            $id
        ]);

    } else {
        $fecha = date('Y-m-d');

        $stmt = $conn->prepare("
            INSERT INTO ordenes 
            (cliente_id, vehiculo_id, descripcion, estado, observaciones, fecha_creacion)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $cliente_id,
            $vehiculo_id,
            $descripcion,
            $estado,
            $observaciones,
            $fecha
        ]);
    }

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}