<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    include_once '../config/database.php';
    
    $database = new Database();
    $db = $database->getConnection();
    
    $response = [
        'success' => true,
        'message' => 'Backend PHP está funcionando!',
        'timestamp' => date('Y-m-d H:i:s'),
        'php_version' => phpversion()
    ];
    
    if ($db) {
        $response['database'] = 'Conexão com PostgreSQL OK';
        
        // Testar algumas tabelas importantes
        $tables_to_check = ['cliente', 'produto', 'pedido', 'categoria'];
        $tables_status = [];
        
        foreach ($tables_to_check as $table) {
            try {
                $query = "SELECT COUNT(*) as count FROM $table LIMIT 1";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                $tables_status[$table] = "OK (" . $result['count'] . " registros)";
            } catch (Exception $e) {
                $tables_status[$table] = "ERRO: " . $e->getMessage();
            }
        }
        
        $response['tables'] = $tables_status;
    } else {
        $response['success'] = false;
        $response['database'] = 'Erro na conexão com o banco de dados';
    }
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => 'Erro: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s'),
        'php_version' => phpversion()
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>