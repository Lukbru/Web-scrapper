import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CategoryTree from './CategoryTree';

function Product() {
    const [products, setProducts] = useState([]);
    const [sortProduct, setSortProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectCategoryIds, setSelectCategoryIds] = useState([]);

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
            <h1>Product List:</h1>
             <CategoryTree onSelectCategory={selectCategory}/>
             {/* <select
            id ="categories"
            value={SelectCategory}
            onChange={(e)=>setSelectCategory(e.target.value)}
            >
                <option value="All">All</option>
                {category.map((category)=>(
                    <option key={category._id} value={category._id}>
                        {category.name}
                    </option>
                ))}
            </select> */}
            {loading && <p>Loading</p>}
            {error && <p>{error}</p>}
            <ul>
                {sortProduct.map((products)=>(
                    <li key={products._id}>
                        <h2>{products.name}</h2>
                        <button>
                        <Link to={`/products/${products._id}`}>Product details</Link>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Product;
