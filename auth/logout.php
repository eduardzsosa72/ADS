<?php
header('Content-Type: application/json');
require_once '../config/auth.php';

session_destroy();
echo json_encode(['ok' => true]);
