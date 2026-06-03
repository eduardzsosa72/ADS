<?php
require_once __DIR__ . '/../vendor/autoload.php';

if (file_exists(dirname(__DIR__) . '/.env')) {
    Dotenv\Dotenv::createImmutable(dirname(__DIR__))->load();
}

function getConn() {
    static $conn = null;
    if ($conn === null) {
        $conn = new PDO(
            "mysql:host=" . getenv('DB_HOST') .
            ";port=" . getenv('DB_PORT') .
            ";dbname=" . getenv('DB_NAME') .
            ";charset=utf8mb4",
            getenv('DB_USER'),
            getenv('DB_PASS')
        );
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    return $conn;
}
