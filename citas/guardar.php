<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$id          = intval($_POST['id'] ?? 0);
$cliente_id  = intval($_POST['cliente_id'] ?? 0);
$vehiculo_id = intval($_POST['vehiculo_id'] ?? 0);
$fecha       = trim($_POST['fecha'] ?? '');
$hora        = trim($_POST['hora'] ?? '');
$motivo      = trim($_POST['motivo'] ?? '');

if (!$fecha || !$hora || !$motivo) {
    echo json_encode(['error' => 'Fecha, hora y motivo son requeridos']);
    exit;
}

$conn = getConn();

try {

    if ($id > 0) {
        $stmt = $conn->prepare("
            UPDATE citas 
            SET cliente_id = ?, vehiculo_id = ?, fecha = ?, hora = ?, motivo = ?
            WHERE id = ?
        ");
        $stmt->execute([$cliente_id, $vehiculo_id, $fecha, $hora, $motivo, $id]);

    } else {
        $stmt = $conn->prepare("
            INSERT INTO citas (cliente_id, vehiculo_id, fecha, hora, motivo)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$cliente_id, $vehiculo_id, $fecha, $hora, $motivo]);
    }

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}