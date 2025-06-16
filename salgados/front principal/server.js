// Servidor de desenvolvimento simples para testar o frontend
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Dados mock para desenvolvimento
const mockData = {
    products: [
        {
            id: 1,
            nome: "Coxinha de Frango",
            preco: 45.00,
            categoria: "salgados",
            descricao: "Deliciosa coxinha de frango temperado",
            eh_porcionado: false,
            eh_personalizado: false
        },
        {
            id: 2,
            nome: "Pastel de Carne",
            preco: 40.00,
            categoria: "salgados",
            descricao: "Pastel crocante com recheio de carne",
            eh_porcionado: false,
            eh_personalizado: false
        },
        {
            id: 3,
            nome: "Pão de Açúcar",
            preco: 35.00,
            categoria: "assados",
            descricao: "Pão doce tradicional",
            eh_porcionado: false,
            eh_personalizado: false
        },
        {
            id: 4,
            nome: "Sortido Especial",
            preco: 50.00,
            categoria: "sortidos",
            descricao: "Mix de salgados variados",
            eh_porcionado: false,
            eh_personalizado: false
        },
        {
            id: 5,
            nome: "Porção de Batata",
            preco: 15.00,
            categoria: "opcionais",
            descricao: "Porção individual de batata frita",
            eh_porcionado: true,
            eh_personalizado: false
        }
    ],
    orders: [],
    users: [],
    admins: [
        {
            id: 1,
            nome_usuario: "sara",
            funcao: "super_admin",
            criado_em: new Date().toISOString()
        }
    ],
    config: {
        taxa_entrega: 10.00
    }
};

// Rotas da API Mock
app.get('/api/products', (req, res) => {
    res.json({
        sucesso: true,
        dados: mockData.products
    });
});

app.get('/api/config', (req, res) => {
    const key = req.query.key;
    if (key && mockData.config[key] !== undefined) {
        res.json({
            sucesso: true,
            dados: { [key]: mockData.config[key] }
        });
    } else {
        res.json({
            sucesso: true,
            dados: mockData.config
        });
    }
});

app.get('/api/orders', (req, res) => {
    res.json({
        sucesso: true,
        dados: mockData.orders
    });
});

app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;
    
    // Mock login - aceitar qualquer telefone/senha para desenvolvimento
    if (phone && password) {
        const user = {
            id: 1,
            nome: "Usuário Teste",
            telefone: phone,
            email: "teste@email.com",
            endereco: "Rua Teste, 123",
            numero: "123",
            complemento: "",
            cidade: "Quinze de Novembro",
            bairro: "Centro",
            cep: "99000-000",
            criado_em: new Date().toISOString()
        };
        
        res.json({
            sucesso: true,
            mensagem: "Login realizado com sucesso!",
            usuario: user
        });
    } else {
        res.status(400).json({
            sucesso: false,
            mensagem: "Telefone e senha são obrigatórios"
        });
    }
});

app.post('/api/auth/register', (req, res) => {
    const userData = req.body;
    
    if (userData.name && userData.phone && userData.email && userData.password) {
        const user = {
            id: Date.now(),
            nome: userData.name,
            telefone: userData.phone,
            email: userData.email,
            endereco: userData.address,
            numero: userData.number,
            complemento: userData.complement || "",
            cidade: userData.city,
            bairro: userData.neighborhood || "",
            cep: userData.cep || "",
            criado_em: new Date().toISOString()
        };
        
        mockData.users.push(user);
        
        res.json({
            sucesso: true,
            mensagem: "Conta criada com sucesso!",
            usuario: user
        });
    } else {
        res.status(400).json({
            sucesso: false,
            mensagem: "Dados incompletos"
        });
    }
});

app.post('/api/auth/admin-login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'sara' && password === 'password') {
        res.json({
            sucesso: true,
            mensagem: "Login realizado com sucesso!",
            admin: {
                id: 1,
                nome_usuario: "sara",
                funcao: "super_admin",
                criado_em: new Date().toISOString()
            }
        });
    } else {
        res.status(401).json({
            sucesso: false,
            mensagem: "Usuário ou senha incorretos"
        });
    }
});

app.post('/api/orders/create', (req, res) => {
    const orderData = req.body;
    
    const newOrder = {
        id: Date.now(),
        numero_pedido: `#${String(mockData.orders.length + 1).padStart(3, '0')}-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}`,
        usuario_id: orderData.user_id,
        dados_cliente: orderData.customer_data,
        itens: orderData.items,
        subtotal: orderData.total - (orderData.is_delivery ? 10 : 0),
        taxa_entrega: orderData.is_delivery ? 10 : 0,
        total: orderData.total,
        eh_entrega: orderData.is_delivery,
        metodo_pagamento: orderData.payment_method,
        status: 'pendente',
        motivo_rejeicao: null,
        criado_em: new Date().toISOString()
    };
    
    mockData.orders.push(newOrder);
    
    res.json({
        sucesso: true,
        mensagem: "Pedido criado com sucesso!",
        codigo: newOrder.id,
        numero_pedido: newOrder.numero_pedido
    });
});

// Rota para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Middleware para capturar rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        sucesso: false,
        mensagem: `Rota não encontrada: ${req.originalUrl}`
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📱 Acesse a aplicação em http://localhost:${PORT}`);
    console.log(`🔧 API Mock disponível em http://localhost:${PORT}/api`);
    console.log('\n📋 Credenciais de teste:');
    console.log('   👤 Login usuário: qualquer telefone/senha');
    console.log('   🔐 Login admin: sara / password');
});