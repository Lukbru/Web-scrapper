import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function displayShopProducts(ShopProducts, loading, error) {
    if (loading || error) {
        return;
    }

    return (
        <ul>
            {ShopProducts.map((ShopProduct) =>
                <li key={ShopProduct._id}>
                    <h2>{ShopProduct.name}</h2>
                    <p>Link: <a href={ShopProduct.link} target="_blank" rel="noopener noreferrer">{ShopProduct.link}</a></p>
                    <p>Shop ID: {ShopProduct.shopId}</p>
                    <p>Source ID: {ShopProduct.sourceId}</p>
                    <p>Name: {ShopProduct.name}</p>
                    <p>Data: {ShopProduct.createdAt}</p>
                    <p>Product Id: {
                        ShopProduct.productId ?
                            ShopProduct.productId :
                            <button>
                                <Link to={`/ConnectProducts/${ShopProduct._id}`}>Połącz z produktem</Link>
                            </button>}
                    </p>
                </li>
            )}
        </ul>
    )
}

function Product() {
    const [ShopProduct, setShopProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchShop_products = async () => {
        try {
            const response = await axios.get('http://localhost:3000/shopproduct');

            if (response.status !== 200) {
                throw new error('Error - please try again later')
            }
            setShopProduct(response.data);
            setLoading(false);

        } catch (error) {
            setError('Failed to load products');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShop_products();
    }, []);

    return (
        <div>
            <h1>Shop Product List</h1>
            {loading && <p>Loading</p>}
            {error && <p>{error}</p>}
            {displayShopProducts(ShopProduct, loading, error)}
        </div>
    );
}

export default Product;
