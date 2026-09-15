<?php

declare(strict_types=1);

/**
 * Endpoint de Comunicación (API HTTP)
 * 
 * Este script actúa como puente entre las peticiones Fetch de JavaScript
 * y nuestra clase Tamagotchi en PHP, gestionando la persistencia en sesión ($_SESSION).
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Iniciar o reanudar la sesión de PHP
session_start();

require_once __DIR__ . '/../src/Tamagotchi.php';

// Obtener o inicializar la mascota en la sesión
if (!isset($_SESSION['tamagotchi']) || !is_array($_SESSION['tamagotchi'])) {
    // Si no existe, usamos el Constructor con sus valores por defecto
    $tamagotchi = new Tamagotchi("Tama", 0, 80, 80);
    $_SESSION['tamagotchi'] = $tamagotchi->toArray();
} else {
    // Reconstruimos la mascota a partir de los datos guardados en la sesión
    $tamagotchi = Tamagotchi::fromArray($_SESSION['tamagotchi']);
}

// Leer la acción solicitada (admite GET, POST o JSON en el cuerpo)
$rawInput = file_get_contents('php://input');
$jsonData = json_decode($rawInput, true) ?? [];

$action = $_GET['action'] ?? $_POST['action'] ?? $jsonData['action'] ?? 'status';

switch ($action) {
    case 'feed':
        $tamagotchi->feed(20);
        break;

    case 'play':
        $tamagotchi->play(20);
        break;

    case 'tick':
        $tamagotchi->tick(2, 2);
        break;

    case 'reset':
        // Creamos una nueva mascota desde cero utilizando el constructor
        $tamagotchi = new Tamagotchi("Tama", 0, 80, 80);
        break;

    case 'status':
    default:
        // Solo consultar el estado actual
        break;
}

// Guardar el estado actualizado en la sesión para la próxima petición
$_SESSION['tamagotchi'] = $tamagotchi->toArray();

// Responder al cliente en formato JSON estándar
echo json_encode([
    'success' => true,
    'action' => $action,
    'data' => $tamagotchi->toArray()
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
