<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$id            = intval($_POST['id'] ?? 0);
$cliente_id    = intval($_POST['cliente_id'] ?? 0);
$vehiculo_id   = intval($_POST['vehiculo_id'] ?? 0);
$descripcion   = trim($_POST['descripcion'] ?? '');
$estado        = trim($_POST['estado'] ?? 'pendiente');
$observaciones = trim($_POST['observaciones'] ?? '');

if (!$descripcion) { echo json_encode(['error' => 'La descripción es requerida']); exit; }
if (!$vehiculo_id) { echo json_encode(['error' => 'Selecciona un vehículo']); exit; }

$estados_validos = ['pendiente', 'en_proceso', 'finalizado'];
if (!in_array($estado, $estados_validos)) $estado = 'pendiente';

$conn = getConn();

if ($id > 0) {
    $stmt = $conn->prepare("UPDATE ordenes SET cliente_id=?, vehiculo_id=?, descripcion=?, estado=?, observaciones=? WHERE id=?");
    $stmt->bind_param('iisssi', $cliente_id, $vehiculo_id, $descripcion, $estado, $observaciones, $id);
} else {
    $fecha = date('d/m/Y');
    $stmt = $conn->prepare("INSERT INTO ordenes (cliente_id, vehiculo_id, descripcion, estado, observaciones, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('iissss', $cliente_id, $vehiculo_id, $descripcion, $estado, $observaciones, $fecha);
}

$stmt->execute();
echo json_encode(['ok' => true]);
$stmt->close();
$conn->close();
