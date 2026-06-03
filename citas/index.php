<?php
header('Content-Type: application/json');

require_once '../config/db.php';
$conn = getConn();

$stmt = $conn->prepare("SELECT * FROM citas ORDER BY fecha ASC, hora ASC");
$stmt->execute();

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));