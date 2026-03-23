<?php
/**
 * BODMAS Battle — PHP Entry Point
 * 
 * When using PHP's built-in server (php -S localhost:8080),
 * this file serves the static index.html.
 * For Apache/Nginx, configure URL rewriting as needed.
 */

// If requesting the API
if (strpos($_SERVER['REQUEST_URI'], 'api.php') !== false) {
    require_once __DIR__ . '/api.php';
    exit();
}

// Serve the main game
$indexFile = __DIR__ . '/index.html';
if (file_exists($indexFile)) {
    readfile($indexFile);
} else {
    echo '<h1>BODMAS Battle</h1><p>index.html not found.</p>';
}
?>
