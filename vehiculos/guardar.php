<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$id         = intval($_POST['id'] ?? 0);
$cliente_id = intval($_POST['cliente_id'] ?? 0);
$marca      = trim($_POST['marca'] ?? '');
$modelo     = trim($_POST['modelo'] ?? '');
$placa      = strtoupper(trim($_POST['placa'] ?? ''));

if (!$marca || !$placa) { echo json_encode(['error' => 'Marca y placa son requeridos']); exit; }

$conn = getConn();

// Check duplicate placa
$stmt = $conn->prepare("SELECT id FROM vehiculos WHERE placa=? AND id != ?");
$stmt->bind_param('si', $placa, $id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(['error' => 'Ya existe un vehículo con esa placa']);
    $stmt->close(); $conn->close(); exit;
}
$stmt->close();

if ($id > 0) {
    $stmt = $conn->prepare("UPDATE vehiculos SET cliente_id=?, marca=?, modelo=?, placa=? WHERE id=?");
    $stmt->bind_param('isssi', $cliente_id, $marca, $modelo, $placa, $id);
} else {
    $stmt = $conn->prepare("INSERT INTO vehiculos (cliente_id, marca, modelo, placa) VALUES (?, ?, ?, ?)");
    $stmt->bind_param('isss', $cliente_id, $marca, $modelo, $placa);
}

$stmt->execute();
echo json_encode(['ok' => true]);
$stmt->close();
$conn->close();
