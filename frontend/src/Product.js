import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CategoryTree from './CategoryTree';
import 'bootstrap/dist/css/bootstrap.css';

function Product() {
    const [products, setProducts] = useState([]);
    const [sortProduct, setSortProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectCategoryIds, setSelectCategoryIds] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchFilter, setSearchFilter] = useState('');
    const [bothShopsOnly, setBothShopsOnly] = useState(false);
    const [shopProducts, setShopProducts] = useState([]);


    const fetchConnectedProducts = async () => {
        try {
            const productResponse = await axios.get('http://localhost:3000/products');

            if (productResponse.status !== 200) {
                throw new error('Error - please try again later')
            }

            const shopProductResponse = await axios.get('http://localhost:3000/shopproduct');

            if (shopProductResponse.status !== 200) {
                throw new error('Error - please try again later')
            }

            // const connectedProductIds = shopProductResponse.data.filter(shopProduct => shopProduct.productId).map(shopProduct => shopProduct.productId);

            // const connectedProducts = productResponse.data.filter(product => connectedProductIds.includes(product._id));

            setLoading(false);
            setProducts(productResponse.data);
            setShopProducts(shopProductResponse.data)
        } catch (error) {
            setError('Failed to load products');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConnectedProducts();
    }, []);

    useEffect(() => {
        filtrProducts();
    }, [selectCategoryIds, products, bothShopsOnly]);

    useEffect(()=>{
        filtrProductsBySearch();
    }, [searchFilter, sortProduct]);

    const filtrProducts = () => {

        const connectedProductIds = shopProducts.map(shopProduct => shopProduct.productId);
        let filtered = products.filter((product) => connectedProductIds.includes(product._id));
        if (selectCategoryIds.length > 0){
            filtered = filtered.filter((product) => selectCategoryIds.includes(product.categoryId));
        } 
        if (bothShopsOnly) {
            const productsBothShops = products.filter((product) => { 
                const shopsWithProduct = shopProducts.filter(shopProduct => shopProduct.productId === product._id);
                return shopsWithProduct.length > 1;
            });
            filtered = filtered.filter((product) => productsBothShops.includes(product));
        }
        setSortProduct(filtered);
    }

    const selectCategory = (selectCategory, selectCategoryIds) => {
        setSelectCategoryIds(selectCategory === 'All' ? [] : selectCategoryIds)
    }

    const filtrProductsBySearch = () => {
        if (searchFilter === ''){
            setFilteredProducts(sortProduct);
        } else {
            setFilteredProducts(sortProduct.filter((products)=>
                products.name.toLowerCase().includes(searchFilter.toLowerCase())
        ));
        }
    }

    const checkSearch = (product) => {
        setSearchFilter(product.target.value);
    }

    const productCount = filteredProducts.length;

    const buttonBothShopsOnly = () => {
        setBothShopsOnly(!bothShopsOnly);
    }

    return (
        <div className='container mt-4'>
            <h1 className='text-center mb-4'>Product List</h1>
            <div className='row mb-3'>
                <div className='col-md-5'>
             <p>Search Bar:  <input className='form-control' type='text' placeholder='Search for Products' value={searchFilter} onChange={checkSearch}/></p>
                </div>
                <div className='col-md-3'>
                <CategoryTree onSelectCategory={selectCategory}/>
                </div>
             <div className='col-md-4 d-flex align-items-end'>
                <div className='form-check form-switch'>
             <p>Show only products aviable in both shops <input className='form-check-input' type='checkbox' checked={bothShopsOnly} onChange={buttonBothShopsOnly}/></p>
             </div>
             </div>
             </div>
             <p className='text-primary'>Total Products: {productCount}</p>
            {loading && <p>Loading</p>}
            {error && <p>{error}</p>}
            <div className='row'>
                {filteredProducts.map((products)=>(
                    <div key={products._id} className='col-md-4 mb-3'>
                        <div className='card border-dark h-100 shadow-sm'>
                            <div className='card-body text-center'>
                        <h5 className='card-title'>{products.name}</h5>
                        <Link to={`/products/${products._id}`} className='btn btn-secondary mt-3'>Product details</Link>
                        </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Product;
