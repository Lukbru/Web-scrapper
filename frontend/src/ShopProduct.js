import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CategoryTree from './CategoryTree';
import 'bootstrap/dist/css/bootstrap.css';

function displayShopProducts(ShopProducts, loading, error, selectShopProduct, checkBoxShoProduct) {
    if (loading || error) {
        return;
    }

    return (
        <ul>
            {ShopProducts.map((ShopProduct) =>
                <li key={ShopProduct._id} className='card shadow p-3 mb-4'>
                    <div className='card-body'>
                    <h4 className='card-title'>{ShopProduct.name}</h4>
                    <p>Link: <a href={ShopProduct.link} target="_blank" rel="noopener noreferrer">{ShopProduct.link}</a></p>
                    <p>Shop ID: {ShopProduct.shopId}</p>
                    <p>Source ID: {ShopProduct.sourceId}</p>
                    <p>Name: {ShopProduct.name}</p>
                    <p>Data: {ShopProduct.createdAt}</p>
                    <div className='d-flex justify-content-between mt-3'>
                        <div className='align-items-center'>
                    < input 
                        type='checkbox'
                        className='form-check-input me-2'
                        checked={selectShopProduct.includes(ShopProduct._id)}
                        onChange={()=> checkBoxShoProduct(ShopProduct._id)}
                           />{
                        ShopProduct.productId ? (
                           <label>Product ID: {ShopProduct.productId} </label> ) : (
                            <label>No Product Id</label>
                           )}
                            </div>
                           {!ShopProduct.productId && ( <Link to={`/ConnectProducts/${ShopProduct._id}`} className='btn btn-primary'>Połącz z produktem</Link>)}
                           </div>
                           </div>
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
        const newShopProductsIds = selectShopProduct.includes(shopProductId) ? selectShopProduct.filter(id => id !== shopProductId) : [...selectShopProduct, shopProductId]
        setSelectShopProduct(newShopProductsIds);
        sessionStorage.setItem('selectShopProduct', JSON.stringify(newShopProductsIds));
    }

    const selectCategory = (selectCategory, selectCategoryIds) => {
        setSelectCategoryIds(selectCategory === 'All' ? [] : selectCategoryIds)
    }

return (
    <div className='container mt-4'>
            <h1 className='text-center mb-4'>Shop Product List</h1>
            {loading && <p>Loading</p>}
            {error && <p>{error}</p>}
            <div className='row mb-3'>
            <div className='col-md-9'>
            <p>Search Bar:  <input type='text' className='form-control' placeholder='Search for Products' value={searchFilter} onChange={checkSearch}/></p>
                </div>
                <div className='col-md-3'>
            <CategoryTree onSelectCategory={selectCategory}/>
                </div>
            </div>
        <div className='row'>
            <div className='col-md-6'>
                <h2>Select Shop</h2>
                <div className='d-flex mb-3'>
                <select id="selectShopA" className='form-select mb-2' value={selectShopA} onChange={(e)=> setSelectShopA(e.target.value)}>
                    <option value=''>None</option>
                    {shop.map((shop=>(
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    )))}
                </select>
                <select id="connectedProduct" className='form-select mb-2' value={connectedProduct} onChange={(e)=> setConnectedProduct(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Connected">Connected</option>
                    <option value="Not Connected">Not Connected</option>
                </select>
                </div>
                {displayShopProducts(filterConnected(filterProductsA, connectedProduct), loading, error,selectShopProduct, checkBoxShoProduct)}
            </div>
            <div className='col-md-6'>
            <h2>Select Shop</h2>
            <div className='d-flex mb-3'>
                <select id="selectShopB" className='form-select mb-2' value={selectShopB} onChange={(e)=> setSelectShopB(e.target.value)}>
                    <option value=''>None</option>
                    {shop.map((shop=>(
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    )))}
                </select>
                <select id="connectedProduct" className='form-select mb-2' value={connectedProduct} onChange={(e)=> setConnectedProduct(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Connected">Connected</option>
                    <option value="Not Connected">Not Connected</option>
                </select>
                </div>
                {displayShopProducts(filterConnected(filterProductsB, connectedProduct), loading, error,selectShopProduct, checkBoxShoProduct)}
            </div>
        </div>
    </div>
    
);
}

export default Product;
