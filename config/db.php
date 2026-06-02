<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();
function getConn() {
    static $conn = null;

    if ($conn === null) {
        $conn = new PDO(
            "mysql:host=" . $_ENV['DB_HOST'] .
            ";port=" . $_ENV['DB_PORT'] .
            ";dbname=" . $_ENV['DB_NAME'] .
            ";charset=utf8mb4",
            $_ENV['DB_USER'],
            $_ENV['DB_PASS']
        );

        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    return $conn;
}