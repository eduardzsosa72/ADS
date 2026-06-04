<?php
if (session_status() === PHP_SESSION_NONE) session_start();

function requireAdmin() {
    if (empty($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Solo el admin puede realizar esta acción']);
        exit;
    }
}

function requireLogin() {
    if (empty($_SESSION['usuario'])) {
        http_response_code(401);
        echo json_encode(['error' => 'No autenticado']);
        exit;
    }
}

function dbError(Exception $e): string {
    $dev = ($_ENV['APP_ENV'] ?? getenv('APP_ENV') ?: 'production') === 'development';
    return $dev ? $e->getMessage() : 'Error interno del servidor';
}

function csrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrf(): void {
    $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
        http_response_code(403);
        echo json_encode(['error' => 'Token CSRF inválido']);
        exit;
    }
}
