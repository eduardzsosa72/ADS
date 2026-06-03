<?php
header('Content-Type: application/json');
require_once '../config/db.php';
require_once '../config/auth.php';

requireAdmin();

$id = intval($_POST['id'] ?? 0);
if (!$id) { echo json_encode(['error' => 'ID inválido']); exit; }

$conn = getConn();
try {
    $conn->prepare("DELETE FROM vehiculos WHERE id = ?")->execute([$id]);
    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
