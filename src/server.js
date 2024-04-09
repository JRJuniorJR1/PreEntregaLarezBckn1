import express from 'express';
import { ProductManager } from './ProductManager.js';
import { CartManager } from './CartManager.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const productManager = new ProductManager('products.json');
const cartManager = new CartManager('carts.json', productManager);


app.get('/api/products', (req, res) => {
    try {
        let products = productManager.getProducts();
        const limit = req.query.limit;
        if (limit) {
            products = products.slice(0, parseInt(limit));
        }
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const product = await productManager.getProductById(id);
        res.json(product);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.post('/api/products', (req, res) => {
    try {
        const product = req.body;
        productManager.addProduct(product);
        res.status(201).json({ product, message: 'Producto agregado satisfactoriamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const { product, message } = await productManager.updateProduct(id, req.body);
        res.json({ product, message });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const product = await productManager.getProductById(id);
        await productManager.deleteProduct(id);
        res.json({ product, message: 'Producto eliminado satisfactoriamente' });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.get('/api/carts', (req, res) => {
    try {
        const allCarts = cartManager.getAllCarts();
        res.json(allCarts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los carritos' });
    }
});

app.post('/api/carts', (req, res) => {
    try {
        const cart = cartManager.createCart();
        res.status(201).json({ cart, message: 'Carrito creado satisfactoriamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/carts/:cid', (req, res) => {
    const cid = parseInt(req.params.cid);
    try {
        const cart = cartManager.getCartById(cid);
        res.json(cart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.post('/api/carts/:cid/product/:pid', (req, res) => {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);
    const quantity = parseInt(req.body.quantity || 1);

    try {
        cartManager.addProductToCart(cid, pid, quantity);
        res.json({ message: 'Producto agregado al carrito satisfactoriamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/carts/:cid', (req, res) => {
    const cid = parseInt(req.params.cid);
    try {
        cartManager.deleteCart(cid);
        res.json({ message: 'Carrito eliminado satisfactoriamente' });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
