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
