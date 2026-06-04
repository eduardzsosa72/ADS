<?php
header('Content-Type: application/json');
require_once '../config/auth.php';

if (!empty($_SESSION['usuario'])) {
    echo json_encode(['ok' => true, 'username' => $_SESSION['usuario']['username'], 'rol' => $_SESSION['usuario']['rol'], 'csrf_token' => csrfToken()]);
} else {
    echo json_encode(['ok' => false]);
}
