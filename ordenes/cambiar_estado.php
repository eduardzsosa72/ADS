<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$id     = intval($_POST['id'] ?? 0);
$estado = trim($_POST['estado'] ?? '');

$validos = ['pendiente', 'en_proceso', 'finalizado'];
if (!$id || !in_array($estado, $validos)) {
    echo json_encode(['error' => 'Datos inválidos']); exit;
}

$conn = getConn();
$stmt = $conn->prepare("UPDATE ordenes SET estado=? WHERE id=?");
$stmt->bind_param('si', $estado, $id);
$stmt->execute();
echo json_encode(['ok' => true]);
$stmt->close();
$conn->close();
