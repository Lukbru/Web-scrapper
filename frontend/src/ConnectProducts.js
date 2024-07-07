import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import CategoryTree from './CategoryTree';

function ConnectProducts() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [status, setStatus] = useState('');
    const [selectCategoryIds, setSelectCategoryIds] = useState('');
    const [sortProduct, setSortProduct] = useState([]);
    const [selectShopProduct, setSelectShopProduct]= useState([]);

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
    }, [selectCategoryIds, products]);

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

    return (
        <div>
            <h1></h1>
            Selected shopProductId: <ul>{selectShopProduct.map((shopProductId)=>(
                <li key={shopProductId}>{shopProductId}</li>
            ))}
            </ul>
            <form onSubmit={Connection}>
            <div>
                <CategoryTree onSelectCategory={selectCategory}/>
            </div>

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
                        <option value='' disabled>Select Product</option>
                        {sortProduct.map(product => (
                            <option key={product._id} value={product._id}>
                                {product.name} 
                            </option> 
                        ))}
                    </select>
                </div>
                <button type="submit">Connect</button>
            </form>

            {status}
        </div>
    );
}
export default ConnectProducts;
