<?php
header('Content-Type: application/json');
require_once '../config/db.php';
require_once '../config/auth.php';

// Rate limiting: máx 5 intentos por sesión, bloqueo de 15 min
$attempts  = $_SESSION['login_attempts'] ?? 0;
$lockUntil = $_SESSION['login_lock_until'] ?? 0;

if ($lockUntil > time()) {
    http_response_code(429);
    $wait = ceil(($lockUntil - time()) / 60);
    echo json_encode(['error' => "Demasiados intentos. Espera $wait minuto(s)."]);
    exit;
}

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
    $_SESSION['login_attempts'] = $attempts + 1;
    if ($_SESSION['login_attempts'] >= 5) {
        $_SESSION['login_lock_until'] = time() + 900; // 15 min
        $_SESSION['login_attempts']   = 0;
    }
    echo json_encode(['error' => 'Usuario o contraseña incorrectos']);
    exit;
}

// Login exitoso: limpiar contadores
unset($_SESSION['login_attempts'], $_SESSION['login_lock_until']);

$_SESSION['usuario'] = ['id' => $user['id'], 'username' => $user['username'], 'rol' => $user['rol']];
echo json_encode(['ok' => true, 'username' => $user['username'], 'rol' => $user['rol'], 'csrf_token' => csrfToken()]);
