import React, { useState, useEffect } from 'react';
import axios from 'axios';

function displayProducts(products, loading, error) {
    if (loading || error) {
        return;
    }
    return (
        <ul>
            {products.map((product) => 
                <li key={product._id}>
                    <h2>{product.name}</h2>
                </li>
            )}
        </ul>
    )
}

function Product() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/products');

            if (response.status !== 200) {
                throw new error('Error - please try again later')
            }

            setLoading(false);
            setProducts(response.data);
        } catch (error) {
            setError('Failed to load products');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div>
            <h1>Product List</h1>
            {loading && <p>Loading</p>}
            {error && <p>{error}</p>}
            {displayProducts(products, loading, error)}
        </div>
    );
}

export default Product;
