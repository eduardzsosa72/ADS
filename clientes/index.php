<?php
header('Content-Type: application/json');
require_once '../config/db.php';
$conn = getConn();
$res = $conn->query("SELECT * FROM clientes ORDER BY nombre ASC");
$rows = [];
while ($row = $res->fetch_assoc()) $rows[] = $row;
echo json_encode($rows);
$conn->close();
