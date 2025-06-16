<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    include_once '../../config/database.php';
    include_once '../../models/Pedido.php';

    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception('Erro de conexão com banco de dados');
    }

    $pedido = new Pedido($db);

    $input = file_get_contents("php://input");
    $data = json_decode($input);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido recebido: ' . json_last_error_msg());
    }

    // Validar dados obrigatórios
    if (empty($data->user_id) || empty($data->items) || empty($data->total)) {
        http_response_code(400);
        echo json_encode(array(
            "sucesso" => false,
            "mensagem" => "Dados obrigatórios faltando: user_id, items ou total"
        ));
        exit();
    }

    // Validar se há itens no pedido
    if (!is_array($data->items) || count($data->items) === 0) {
        http_response_code(400);
        echo json_encode(array(
            "sucesso" => false,
            "mensagem" => "Pedido deve conter pelo menos um item"
        ));
        exit();
    }

    // Preparar dados do pedido
    $pedido->codigo_cliente = $data->user_id;
    $pedido->valor = floatval($data->total);
    $pedido->forma_pagamento = isset($data->payment_method) ? $data->payment_method : 'dinheiro';
    $pedido->forma_entrega = (isset($data->is_delivery) && $data->is_delivery) ? 'entrega' : 'retirada';
    $pedido->status = 'pendente';
    $pedido->observacoes = isset($data->notes) ? $data->notes : '';

    // Converter itens para o formato do banco
    $itens = array();
    foreach ($data->items as $item) {
        // Validar dados do item
        if (empty($item->id) || empty($item->totalPrice)) {
            throw new Exception('Item inválido: ID ou preço total faltando');
        }

        $quantidade = isset($item->quantity) ? intval($item->quantity) : 1;
        $precoUnitario = floatval($item->totalPrice) / $quantidade;
        
        $itens[] = array(
            'codigo_produto' => intval($item->id),
            'quantidade' => $quantidade,
            'preco_unitario' => $precoUnitario,
            'tipo_quantidade' => isset($item->quantityType) ? $item->quantityType : 'cento',
            'quantidade_unidades' => isset($item->unitCount) ? intval($item->unitCount) : 1
        );
    }

    // Criar pedido
    if ($pedido->create($itens)) {
        
        // Se for entrega, criar registro de delivery
        if (isset($data->is_delivery) && $data->is_delivery && isset($data->customer_data)) {
            $endereco_entrega = $data->customer_data->address . ', ' . $data->customer_data->number;
            if (isset($data->customer_data->complement) && !empty($data->customer_data->complement)) {
                $endereco_entrega .= ', ' . $data->customer_data->complement;
            }
            
            // Mapear cidade para sigla
            $cidades_map = [
                'Quinze de Novembro' => 'QN',
                'Selbach' => 'SB',
                'Colorado' => 'CO',
                'Alto Alegre' => 'AA',
                'Fortaleza dos Valos' => 'FV',
                'Tapera' => 'TP',
                'Lagoa dos Três Cantos' => 'LTC',
                'Saldanha Marinho' => 'SM',
                'Espumoso' => 'EP',
                'Campos Borges' => 'CB',
                'Santa Bárbara do Sul' => 'SBS',
                'Não-Me-Toque' => 'NMT',
                'Boa Vista do Cadeado' => 'BVC',
                'Boa Vista do Incra' => 'BVI',
                'Carazinho' => 'CZ',
                'Ibirubá' => 'IB'
            ];
            
            $sigla_cidade = isset($cidades_map[$data->customer_data->city]) ? 
                           $cidades_map[$data->customer_data->city] : 'QN';
            
            try {
                $pedido->createDelivery($endereco_entrega, $sigla_cidade);
            } catch (Exception $e) {
                // Log do erro mas não falha o pedido
                error_log("Erro ao criar delivery: " . $e->getMessage());
            }
        }
        
        http_response_code(201);
        echo json_encode(array(
            "sucesso" => true,
            "mensagem" => "Pedido criado com sucesso!",
            "codigo" => $pedido->codigo,
            "numero_pedido" => $pedido->numero_pedido
        ));
    } else {
        http_response_code(500);
        echo json_encode(array(
            "sucesso" => false,
            "mensagem" => "Erro ao criar pedido no banco de dados"
        ));
    }

} catch (Exception $e) {
    error_log("Erro ao criar pedido: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro interno: ' . $e->getMessage()
    ]);
}
?>