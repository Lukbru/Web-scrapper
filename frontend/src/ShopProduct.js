import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CategoryTree from './CategoryTree';

function displayShopProducts(ShopProducts, loading, error, selectShopProduct, checkBoxShoProduct) {
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
                    <p>Product Id: 
                    < input 
                        type='checkbox'
                        checked={selectShopProduct.includes(ShopProduct._id)}
                        onChange={()=> checkBoxShoProduct(ShopProduct._id)}
                           />{
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
    const [selectShopA, setSelectShopA] = useState('');
    const [selectShopB, setSelectShopB] = useState('');
    const [connectedProduct, setConnectedProduct] = useState('All');
    const [selectShopProduct, setSelectShopProduct]= useState([]);
    const [selectCategoryIds, setSelectCategoryIds] = useState('');
    const [searchFilter, setSearchFilter] = useState('');
    
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

    const filtrProductsBySearch = (shopProducts) => {
        if (searchFilter === ''){
            return shopProducts;
        } else {
            return shopProducts.filter((shopProduct)=>
               shopProduct.name && shopProduct.name.toLowerCase().includes(searchFilter.toLowerCase())
        );
        }
    }

    const checkSearch = (shopProduct) => {
        setSearchFilter(shopProduct.target.value);
    }

    const filtrByShopId_CategoryId = (shopProducts, shopId) => {
        return shopProducts.filter((shopProduct) => shopProduct.shopId === shopId && (selectCategoryIds.length === 0 || selectCategoryIds.includes(shopProduct.categoryId)));
    }

    const filterProductsA = filtrProductsBySearch(filtrByShopId_CategoryId(ShopProduct, selectShopA));
    const filterProductsB = filtrProductsBySearch(filtrByShopId_CategoryId(ShopProduct, selectShopB));

    const filterConnected = (ShopProduct, filter) => {
        return ShopProduct.filter(product=>{
            if (filter === 'Connected') return product.productId;
            if (filter === 'Not Connected') return !product.productId;
            return true;
        });
    }

    const checkBoxShoProduct = (shopProductId) => {
        // setSelectShopProduct(shopProducts=>0
        //     shopProducts.includes(shopProductId) ? shopProducts.filter(id => id !== shopProductId) : [...shopProducts, shopProductId]
        // );
        const newShopProductsIds = selectShopProduct.includes(shopProductId) ? selectShopProduct.filter(id => id !== shopProductId) : [...selectShopProduct, shopProductId]
        setSelectShopProduct(newShopProductsIds);
        sessionStorage.setItem('selectShopProduct', JSON.stringify(newShopProductsIds));
    }

    const selectCategory = (selectCategory, selectCategoryIds) => {
        setSelectCategoryIds(selectCategory === 'All' ? [] : selectCategoryIds)
    }

return (
    <div>
            <h1>Shop Product List</h1>
            {loading && <p>Loading</p>}
            {error && <p>{error}</p>}
            <CategoryTree onSelectCategory={selectCategory}/>
            <p>Search Bar:  <input type='text' placeholder='Search for Products' value={searchFilter} onChange={checkSearch}/></p>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div style={{flex:1}}>
                <h2>Select Shop</h2>
                <select id="selectShopA" value={selectShopA} onChange={(e)=> setSelectShopA(e.target.value)}>
                    <option value=''>None</option>
                    {shop.map((shop=>(
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    )))}
                </select>
                <select id="connectedProduct" value={connectedProduct} onChange={(e)=> setConnectedProduct(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Connected">Connected</option>
                    <option value="Not Connected">Not Connected</option>
                </select>
                {displayShopProducts(filterConnected(filterProductsA, connectedProduct), loading, error,selectShopProduct, checkBoxShoProduct)}
            </div>
            <div style={{flex:1}}>
            <h2>Select Shop</h2>
                <select id="selectShopB" value={selectShopB} onChange={(e)=> setSelectShopB(e.target.value)}>
                    <option value=''>None</option>
                    {shop.map((shop=>(
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    )))}
                </select>
                <select id="connectedProduct" value={connectedProduct} onChange={(e)=> setConnectedProduct(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Connected">Connected</option>
                    <option value="Not Connected">Not Connected</option>
                </select>
                {displayShopProducts(filterConnected(filterProductsB, connectedProduct), loading, error,selectShopProduct, checkBoxShoProduct)}
            </div>
        </div>
    </div>
);
}

export default Product;
