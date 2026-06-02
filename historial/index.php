<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$placa = strtoupper(trim($_GET['placa'] ?? ''));
if (!$placa) { echo json_encode(['error' => 'Ingresa una placa']); exit; }

$conn = getConn();

// Find vehicle
$stmt = $conn->prepare("SELECT * FROM vehiculos WHERE placa=?");
$stmt->bind_param('s', $placa);
$stmt->execute();
$res = $stmt->get_result();
$vehiculo = $res->fetch_assoc();
$stmt->close();

if (!$vehiculo) {
    echo json_encode(['error' => "No se encontró ningún vehículo con placa \"$placa\""]);
    $conn->close(); exit;
}

// Find owner
$stmt = $conn->prepare("SELECT * FROM clientes WHERE id=?");
$stmt->bind_param('i', $vehiculo['cliente_id']);
$stmt->execute();
$cliente = $stmt->get_result()->fetch_assoc();
$stmt->close();

// Find orders
$stmt = $conn->prepare("SELECT * FROM ordenes WHERE vehiculo_id=? ORDER BY id DESC");
$stmt->bind_param('i', $vehiculo['id']);
$stmt->execute();
$res = $stmt->get_result();
$ordenes = [];
while ($row = $res->fetch_assoc()) $ordenes[] = $row;
$stmt->close();
$conn->close();

echo json_encode([
    'vehiculo' => $vehiculo,
    'cliente'  => $cliente,
    'ordenes'  => $ordenes,
]);
