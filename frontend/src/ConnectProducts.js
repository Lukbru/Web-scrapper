import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ConnectProducts() {
    const selectedShopProduct = useParams().shopProductId;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [status, setStatus] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectCategory, setSelectCategory] = useState('');
    const [sortProduct, setSortProduct] = useState([]);

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

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:3000/category');
            if (response.status !== 200) {
                throw new error('Error - please try again later')
            }
            setLoading(false);
            setCategories(response.data);
        } catch (error) {
            setError('Failed to load categories');
            setLoading(false);
        }
    };

    const getAllCategories = (categoryId) => {
        const allCategoriesId = [categoryId];
        const getChildCategory = (parentId) => {
            categories.forEach(category => {
                if (category.parentCategoryId === parentId){
                    allCategoriesId.push(category._id);
                    getChildCategory(category._id);
                }
            });
        }
        getChildCategory(categoryId);
        return allCategoriesId;
    }

    const Connection = async (e) => {
        if (!selectedProduct) {
            setStatus('Please select product to connect.')
            return;
        }

        e.preventDefault();
        try {
            await axios.put('http://localhost:3000/connect', {
                productId: selectedProduct,
                shopProductId: selectedShopProduct
            });
            setStatus('Connected both collections together');
        } catch (error) {
            setStatus('Something failed while connecting collections');
        }
    };

    useEffect(() => {
        if (selectCategory === 'All'){
            setSortProduct(products);
        } else {
            const selectedCategory = getAllCategories(selectCategory);
            setSortProduct(products.filter(products=>selectedCategory.includes(products.categoryId)));
        }
    }, [selectCategory,products, categories]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    return (
        <div>
            <h1></h1>
            Selected shopProductId: {selectedShopProduct}
            <form onSubmit={Connection}>
            <div>
                <label htmlFor="category_selected">
                Sort by Category
                </label>
                <select 
                        id="category_selected"
                        value={selectCategory}
                        onChange={(e)=>setSelectCategory(e.target.value)}
                    >
                        <option value='' disabled>Select Category</option>
                        <option value='All'>All</option>
                        {categories.map(category=>(
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
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
