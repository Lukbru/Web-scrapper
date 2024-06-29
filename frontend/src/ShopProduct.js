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
    const [shop, setShop] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectShopA, setSelectShopA]= useState('')
    const [selectShopB, setSelectShopB]= useState('')
    
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

    const fetch_shops = async () => {
        try {
            const response = await axios.get('http://localhost:3000/shops'); 

            if (response.status !== 200) {
                throw new error('Error - please try again later')
            }
            setShop(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to load products');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShop_products();
        fetch_shops();
    }, []);

    const filterProductsA = ShopProduct.filter(shopProduct => shopProduct.shopId === selectShopA);
    const filterProductsB = ShopProduct.filter(shopProduct => shopProduct.shopId === selectShopB);

return (
    <div>
            <h1>Shop Product List</h1>
            {loading && <p>Loading</p>}
            {error && <p>{error}</p>}
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div style={{flex:1}}>
                <h2>Select Shop</h2>
                <select id="selectShopA" value={selectShopA} onChange={(e)=> setSelectShopA(e.target.value)}>
                    <option value=''>None</option>
                    {shop.map((shop=>(
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    )))}
                </select>
                {displayShopProducts(filterProductsA, loading, error)}
            </div>
            <div style={{flex:1}}>
            <h2>Select Shop</h2>
                <select id="selectShopB" value={selectShopB} onChange={(e)=> setSelectShopB(e.target.value)}>
                    <option value=''>None</option>
                    {shop.map((shop=>(
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    )))}
                </select>
                {displayShopProducts(filterProductsB, loading, error)}
            </div>
        </div>
    </div>
);
}

export default Product;
