<?php
class BaseApi {
    protected function __construct() {
        $this->setCorsHeaders();
        $this->handlePreflight();
        $this->setupErrorHandling();
    }

    private function setCorsHeaders() {
        header('Access-Control-Allow-Origin: http://localhost:5173');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Allow-Credentials: true');
        header('Content-Type: application/json');
    }

    private function handlePreflight() {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }

    private function setupErrorHandling() {
        ini_set('display_errors', 0);
        error_reporting(E_ALL);
        ini_set('log_errors', 1);
        ini_set('error_log', __DIR__ . '/../error.log');
    }

    protected function sendResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }

    protected function sendError($message, $statusCode = 400) {
        $this->sendResponse([
            'success' => false,
            'message' => $message
        ], $statusCode);
    }
}
?> 