<?php
header('Content-Type: application/json');
require_once '../config/db.php';
require_once '../config/auth.php';

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if (!$username || !$password) {
    echo json_encode(['error' => 'Credenciales requeridas']);
    exit;
}

$conn = getConn();
$stmt = $conn->prepare("SELECT id, username, password, rol FROM usuarios WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(['error' => 'Usuario o contraseña incorrectos']);
    exit;
}

$_SESSION['usuario'] = ['id' => $user['id'], 'username' => $user['username'], 'rol' => $user['rol']];
echo json_encode(['ok' => true, 'username' => $user['username'], 'rol' => $user['rol']]);
