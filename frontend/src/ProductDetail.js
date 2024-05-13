import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ProductDetail(){
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/products/${productId}`);

            if (response.status !== 200) {
                throw new error('Error - please try again later')
            }

            setLoading(false);
            setProduct(response.data);
        } catch (error) {
            setError('Failed to load products');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [productId]);

    return (
        <div>
            <h1>Product Detail: </h1>
            {loading && <p>Loading</p>}
            {error && <p>{error}</p>}
            { product && (
                <div>
                    <h2>Product Name: </h2>
                    <p>Details: {product.name}</p>
                </div>
            )}
        </div>
    )
    
}
export default ProductDetail;