<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$id = intval($_POST['id'] ?? 0);
if (!$id) { echo json_encode(['error' => 'ID inválido']); exit; }

$conn = getConn();
$stmt = $conn->prepare("DELETE FROM ordenes WHERE id=?");
$stmt->bind_param('i', $id);
$stmt->execute();
echo json_encode(['ok' => true]);
$stmt->close();
$conn->close();
