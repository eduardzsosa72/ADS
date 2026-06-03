<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$id = intval($_POST['id'] ?? 0);

if (!$id) {
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

$conn = getConn();

try {
    $stmt = $conn->prepare("DELETE FROM vehiculos WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}