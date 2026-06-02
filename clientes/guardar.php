<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$id       = intval($_POST['id'] ?? 0);
$nombre   = trim($_POST['nombre'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$correo   = trim($_POST['correo'] ?? '');

if (!$nombre) { echo json_encode(['error' => 'El nombre es requerido']); exit; }

$conn = getConn();

if ($id > 0) {
    $stmt = $conn->prepare("UPDATE clientes SET nombre=?, telefono=?, correo=? WHERE id=?");
    $stmt->bind_param('sssi', $nombre, $telefono, $correo, $id);
} else {
    $stmt = $conn->prepare("INSERT INTO clientes (nombre, telefono, correo) VALUES (?, ?, ?)");
    $stmt->bind_param('sss', $nombre, $telefono, $correo);
}

$stmt->execute();
echo json_encode(['ok' => true]);
$stmt->close();
$conn->close();
