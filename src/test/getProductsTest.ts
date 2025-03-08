import { getProducts } from '../firebase/productService';

const testGetProducts = async () => {
    try {
        const products = await getProducts();
        console.log('Produits récupérés:', products);
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
    }
};

testGetProducts();
