<?php
header('Content-Type: application/json');
require_once '../config/db.php';
require_once '../config/auth.php';

if (($_SESSION['usuario']['rol'] ?? '') !== 'admin') {
    echo json_encode(['error' => 'Sin permisos']);
    exit;
}

$id     = intval($_POST['id'] ?? 0);
$estado = trim($_POST['estado'] ?? '');

$validos = ['pendiente', 'en_proceso', 'finalizado'];

if (!$id || !in_array($estado, $validos)) {
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
}

$conn = getConn();

try {
    $stmt = $conn->prepare("UPDATE ordenes SET estado = ? WHERE id = ?");
    $stmt->execute([$estado, $id]);

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}