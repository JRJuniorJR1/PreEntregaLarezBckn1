import { promises as fs } from 'fs';
import { ProductManager } from './ProductManager.js';

const productManager = new ProductManager('products.json');

export class CartManager {
    constructor(filename, productManager) {
        this.filename = filename;
        this.carts = [];
        this.cartIdCounter = 1;
        this.productManager = productManager;
        this.loadCarts();
    }

    async loadCarts() {
        try {
            const data = await fs.readFile(this.filename, 'utf8');
            this.carts = JSON.parse(data);
            if (this.carts.length > 0) {
                this.cartIdCounter = Math.max(...this.carts.map(cart => cart.id)) + 1;
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('El archivo de carritos no existe. Creando uno nuevo.');
                await this.saveCarts();
            } else {
                console.error('Error al cargar carritos:', error);
            }
        }
    }

    async saveCarts() {
        try {
            await fs.writeFile(this.filename, JSON.stringify(this.carts, null, 2));
        } catch (error) {
            console.error('Error al guardar carritos:', error);
        }
    }

    createCart() {
        const cart = { id: this.cartIdCounter++, products: [] };
        this.carts.push(cart);
        this.saveCarts();
        return cart;
    }

    getCartById(cid) {
        const cart = this.carts.find(cart => cart.id === cid);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        return cart;
    }

    getAllCarts() {
        return this.carts;
    }

    async deleteCart(cid) {
        const index = this.carts.findIndex(cart => cart.id === cid);
        if (index === -1) {
            throw new Error('Carrito no encontrado');
        }
        this.carts.splice(index, 1);
        this.saveCarts();
    }

    async addProductToCart(cid, pid, quantity) {
        const cart = this.getCartById(cid);
        const product = await this.productManager.getProductById(pid);
    
        if (!product) {
            throw new Error(`El producto con ID ${pid} no existe.`);
        }
    
        const productIndex = cart.products.findIndex(item => item.productId === pid);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            const newQuantity = (cart.products[productIndex]?.quantity || 0) + quantity;
            cart.products.push({ productId: pid, quantity: newQuantity });
        }
        this.saveCarts();
    }
    
}