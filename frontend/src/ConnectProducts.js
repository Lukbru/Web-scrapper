import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import CategoryTree from './CategoryTree';
import 'bootstrap/dist/css/bootstrap.css';

function ConnectProducts() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [status, setStatus] = useState('');
    const [selectCategoryIds, setSelectCategoryIds] = useState('');
    const [sortProduct, setSortProduct] = useState([]);
    const [selectShopProduct, setSelectShopProduct]= useState([]);
    const [searchFilter, setSearchFilter] = useState('');

    useEffect(()=>{
        const storedSelectedShopProduct = sessionStorage.getItem('selectShopProduct')
        if (storedSelectedShopProduct) {
            setSelectShopProduct(JSON.parse(storedSelectedShopProduct));
        }
    },[]);

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
            setStatus('Please select product to connect.')
            return;
        }

        e.preventDefault();
        try {
            await Promise.all(
                selectShopProduct.map((shopProductId)=>
                    axios.put('http://localhost:3000/connect',{
                        productId: selectedProduct,
                        shopProductId
                    }
                ))
            );
            setStatus('Connected both collections together');
        } catch (error) {
            setStatus('Something failed while connecting collections');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filtrProducts();
    }, [selectCategoryIds, products, searchFilter]);

    const filtrProducts = () => {
        if (selectCategoryIds.length === 0){
            setSortProduct(products);
        } else {
            setSortProduct(products.filter((product) => selectCategoryIds.includes(product.categoryId)))
        }
    }

    const selectCategory = (selectCategory, selectCategoryIds) => {
        setSelectCategoryIds(selectCategory === 'All' ? [] : selectCategoryIds)
    }

    const filtrProductsBySearch = () => {
        if (searchFilter === ''){
            return sortProduct;
        } else {
            return sortProduct.filter(product => product.name.toLowerCase().includes(searchFilter.toLowerCase())
        );
        }
    }

    return (
        <div className='container mt-4'>
            <h1 className='text-center mb-3'>Connect Products</h1>
            <h5>Selected shopProductId:</h5> 
            <ul className='list-group' >{selectShopProduct.map((shopProductId)=>(
                <li key={shopProductId} className='list-group-item'>{shopProductId}</li>
            ))}
            </ul>
            <form onSubmit={Connection} className='bg-light p-4 shadow rounded'>
            <div className='mb-3'>
                <CategoryTree onSelectCategory={selectCategory}/>
            </div>
            <div className='mb-3'>
                <p>Search Bar:  <input className='form-control' type='text' placeholder='Search for Products' value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}/></p>
            </div>

                <div className='mb-3'>
                    <label htmlFor="product_selected">
                        Select Product:
                    </label>
                    <select
                        className='form-select'
                        id="product_selected"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        required
                    >
                        <option value='' disabled>Select Product</option>
                        {filtrProductsBySearch().map(product => (
                            <option key={product._id} value={product._id}>
                                {product.name} 
                            </option> 
                        ))}
                    </select>
                </div>
                <button type="submit" className='btn btn-primary w-100'>Connect</button>
            </form>

            {status}
        </div>
    );
}
export default ConnectProducts;
