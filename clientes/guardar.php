<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$id       = intval($_POST['id'] ?? 0);
$nombre   = trim($_POST['nombre'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$correo   = trim($_POST['correo'] ?? '');

if (!$nombre) {
    echo json_encode(['error' => 'El nombre es requerido']);
    exit;
}

$conn = getConn();

try {

    if ($id > 0) {
        $stmt = $conn->prepare("
            UPDATE clientes 
            SET nombre = ?, telefono = ?, correo = ?
            WHERE id = ?
        ");
        $stmt->execute([$nombre, $telefono, $correo, $id]);

    } else {
        $stmt = $conn->prepare("
            INSERT INTO clientes (nombre, telefono, correo)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$nombre, $telefono, $correo]);
    }

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}