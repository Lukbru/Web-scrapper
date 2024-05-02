import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, useParams } from 'react-router-dom';


function displayProducts(products, loading, error) {
    if (loading || error) {
        return;
    }

    return (
        <>
            {products.map((product) =>
                <option value={product.id}>{product.name}</option>
            )}
        </>
    )
}

function ConnectProducts() {
    const selectedShopProduct = useParams().shopProductId;

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [status, setStatus] = useState('');

    const fetchProducts = async () => {
        try {
            const [productResponse] = await Promise.all([
                axios.get('http://localhost:3000/products'),
            ]);
            setProducts(productResponse.data);
        } catch (error) {
            setStatus('Failed to get data');
        }
    };

    const Connection = async (e) => {
        if (!selectedProduct) {
            // TODO ustaw status na dole strony ze nie wybrano nic
            return;
        }

        e.preventDefault();
        try {
            await axios.put('http://localhost:3000/connect', {
                productId: selectedProduct,
                shopProductId: selectedShopProduct
            });
            setStatus('Connected both collections together');
        } catch (error) {
            setStatus('Something failed while connecting collections');
        }
    };

    useEffect(() => {
        // TODO jak ktos w sciezce poda cos innego niz shopProductId to trzeba powrocic do strony glownej #walidacja
        // najlepiej zrobic osobny endpoint w serwerze i tam przesylac id i zwracac status 404 jesli taki nie istnieje a jesli istnieje to status i jego dane
        fetchProducts();
    }, []);


    // function listOptions(collection) {
    //     return collection.map((element) => (
    //         <option key={element.id} value={element.id}>
    //             {element.name}
    //         </option>
    //     ))
    // }

    return (
        <div>
            Selected shopProductId: {selectedShopProduct}

            <form onSubmit={Connection}>
                <div>
                    <label htmlFor="product_selected">
                        Select Product
                    </label>
                    <select
                        id="product_selected"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        required
                    >
                        {displayProducts(products.map(product => ({ id: product._id, name: product.name })))}
                    </select>
                </div>

                <button type="submit">Connect</button>
            </form>

            {status}
        </div>
    );
}
export default ConnectProducts;
