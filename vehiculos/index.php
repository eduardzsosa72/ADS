<?php
header('Content-Type: application/json');

require_once '../config/db.php';
$conn = getConn();

$res = $conn->query("SELECT * FROM vehiculos ORDER BY placa ASC");

$rows = [];

while ($row = $res->fetch(PDO::FETCH_ASSOC)) {
    $rows[] = $row;
}

echo json_encode($rows);