<?php
header('Content-Type: application/json');
require_once '../config/db.php';
require_once '../config/auth.php';

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if (strlen($username) < 3 || strlen($password) < 6) {
    echo json_encode(['error' => 'Usuario mín. 3 caracteres y contraseña mín. 6']);
    exit;
}

$conn = getConn();
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    echo json_encode(['error' => 'El usuario ya existe']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$conn->prepare("INSERT INTO usuarios (username, password, rol) VALUES (?, ?, 'usuario')")->execute([$username, $hash]);

$id       = $conn->lastInsertId();
$telefono = trim($_POST['telefono'] ?? '');
$correo   = trim($_POST['correo'] ?? '');
$conn->prepare("INSERT INTO clientes (nombre, telefono, correo) VALUES (?, ?, ?)")->execute([$username, $telefono, $correo]);

$_SESSION['usuario'] = ['id' => $id, 'username' => $username, 'rol' => 'usuario'];
echo json_encode(['ok' => true, 'username' => $username, 'rol' => 'usuario']);
