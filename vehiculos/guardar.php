<?php
header('Content-Type: application/json');
require_once '../config/db.php';
require_once '../config/auth.php';

requireLogin();

$id         = intval($_POST['id'] ?? 0);

if ($id > 0 && ($_SESSION['usuario']['rol'] ?? '') !== 'admin') {
    echo json_encode(['error' => 'Solo el admin puede editar']);
    exit;
}
$cliente_id = intval($_POST['cliente_id'] ?? 0);
$marca      = trim($_POST['marca'] ?? '');
$modelo     = trim($_POST['modelo'] ?? '');
$placa      = strtoupper(trim($_POST['placa'] ?? ''));

if (!$cliente_id) {
    echo json_encode(['error' => 'Selecciona un cliente']);
    exit;
}
if (!$marca || !$placa) {
    echo json_encode(['error' => 'Marca y placa son requeridos']);
    exit;
}

$conn = getConn();

try {
    if ($id > 0) {
        $stmt = $conn->prepare("UPDATE vehiculos SET cliente_id=?, marca=?, modelo=?, placa=? WHERE id=?");
        $stmt->execute([$cliente_id, $marca, $modelo, $placa, $id]);
    } else {
        $stmt = $conn->prepare("INSERT INTO vehiculos (cliente_id, marca, modelo, placa) VALUES (?, ?, ?, ?)");
        $stmt->execute([$cliente_id, $marca, $modelo, $placa]);
    }

    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
