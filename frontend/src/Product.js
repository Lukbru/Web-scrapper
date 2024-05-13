import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Product() {
    const [products, setProducts] = useState([]);
    const [sortProduct, setSortProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [SelectCategory, setSelectCategory] = useState('All');
    const [category, setCategory] = useState([]); //TODO w react w boxie - obrazek i opis/link

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:3000/category');

            if (response.status !== 200) {
                throw new error('Error - please try again later')
            }

            setLoading(false);
            setCategory(response.data);
        } catch (error) {
            setError('Failed to load categories');
            setLoading(false);
        }
    };

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
                if (SelectCategory === 'All'){
                    setSortProduct(products);
                } else {
                    setSortProduct(products.filter(
                        (product)=> product.categoryId === SelectCategory
                    ));
                }
            }, [SelectCategory,products]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    return (
        <div>
            <h1>Product List:</h1>
             <label htmlFor='categoryselect'> Categoty: </label>
             <select
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
            </select>
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
