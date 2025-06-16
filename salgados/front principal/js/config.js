// Configuração da API
const API_CONFIG = {
    // Detectar automaticamente se estamos em desenvolvimento ou produção
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:8000/api'  // Servidor de desenvolvimento
        : 'http://localhost/salgados-da-sara/backend/api', // XAMPP
    endpoints: {
        // Auth
        login: '/auth/login',
        register: '/auth/register',
        forgotPassword: '/auth/forgot-password',
        adminLogin: '/auth/admin-login',
        
        // Products
        products: '/products',
        createProduct: '/products/create',
        updateProduct: '/products/update',
        deleteProduct: '/products/delete',
        
        // Orders
        orders: '/orders',
        createOrder: '/orders/create',
        updateOrderStatus: '/orders/update-status',
        
        // Admin
        admins: '/admin/admins',
        
        // Config
        config: '/config'
    }
};

// Função para fazer requisições HTTP
const ApiClient = {
    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const config = { ...defaultOptions, ...options };
        
        try {
            console.log(`Fazendo requisição para: ${url}`);
            const response = await fetch(url, config);
            
            // Verificar se a resposta é HTML (página de erro)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error(`Servidor retornou HTML em vez de JSON. Verifique se a API está rodando em ${API_CONFIG.baseURL}`);
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.mensagem || `Erro HTTP: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('Erro na API:', error);
            
            // Se for erro de conexão, mostrar mensagem mais amigável
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Não foi possível conectar com o servidor. Verifique se a API está rodando.');
            }
            
            throw error;
        }
    },
    
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    delete(endpoint, data) {
        return this.request(endpoint, {
            method: 'DELETE',
            body: JSON.stringify(data)
        });
    }
};

// Tornar disponível globalmente
window.API_CONFIG = API_CONFIG;
window.ApiClient = ApiClient;