<?php
header('Content-Type: application/json');

require_once '../config/db.php';
$conn = getConn();

$placa = strtoupper(trim($_GET['placa'] ?? ''));

if (!$placa) {
    echo json_encode(['error' => 'Ingresa una placa']);
    exit;
}

try {

    //  Buscar vehículo
    $stmt = $conn->prepare("SELECT * FROM vehiculos WHERE placa = ?");
    $stmt->execute([$placa]);
    $vehiculo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$vehiculo) {
        echo json_encode(['error' => "No se encontró ningún vehículo con placa \"$placa\""]);
        exit;
    }

    //  Buscar cliente
    $stmt = $conn->prepare("SELECT * FROM clientes WHERE id = ?");
    $stmt->execute([$vehiculo['cliente_id']]);
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    //  Buscar órdenes
    $stmt = $conn->prepare("SELECT * FROM ordenes WHERE vehiculo_id = ? ORDER BY id DESC");
    $stmt->execute([$vehiculo['id']]);
    $ordenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //  Respuesta final
    echo json_encode([
        'vehiculo' => $vehiculo,
        'cliente'  => $cliente,
        'ordenes'  => $ordenes,
    ]);

} catch (Exception $e) {
    echo json_encode([
        'error' => 'Error en consulta',
        'detalle' => $e->getMessage()
    ]);
}