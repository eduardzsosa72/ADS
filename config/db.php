<?php
require_once __DIR__ . '/../vendor/autoload.php';

if (file_exists(dirname(__DIR__) . '/.env')) {
    Dotenv\Dotenv::createImmutable(dirname(__DIR__))->load();
}

function getConn() {
    static $conn = null;
    if ($conn === null) {
        $conn = new PDO(
            "mysql:host=" . ($_ENV['DB_HOST'] ?? getenv('DB_HOST')) .
            ";port=" . ($_ENV['DB_PORT'] ?? getenv('DB_PORT')) .
            ";dbname=" . ($_ENV['DB_NAME'] ?? getenv('DB_NAME')) .
            ";charset=utf8mb4",
            $_ENV['DB_USER'] ?? getenv('DB_USER'),
            $_ENV['DB_PASS'] ?? getenv('DB_PASS')
        );
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    return $conn;
}
