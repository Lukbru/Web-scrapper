import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';

function Product() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [newCategory, setnewCategory] = useState({name:'',level:1,parentCategoryId: null});
    const [products, setProducts] = useState([]);
    const [selectCategory, setSelectCategory] = useState('');
    const [selectProduct, setSelectProduct] = useState('');

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

    const addCategory = async (e) => {
        e.preventDefault();
        const { name, level, parentCategoryId } = newCategory;
        const response = await axios.post('http://localhost:3000/category', { name, level, parentCategoryId });
        if (response.status !== 200) {
            throw new Error('Error - please try again later');
        }
        setCategories([...categories, response.data]);
    };

    const ChangeCategory = async (e) => {
        if (!selectProduct||!selectCategory){
            setError('Both Category and Product need to be selected');
            return;
        } else {
            const response = await axios.put('http://localhost:3000/productsCategory', {
            productId: selectProduct,    
            categoryId: selectCategory});
            if (response.status !== 200){
                throw new Error('Error - please in chaning category, please try again later');
            }
            setProducts(products.map(Product=>Product._id === selectProduct ? {...Product, categoryId: selectCategory} : Product));
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);


    function displayCategoriesTree() {
        if (loading) {
            return;
        }

        const firstLevelCategories = [];
        const secondLevelCategoriesMap = {};
        const thirdLevelCategoriesMap = {};
        for (const category of categories) {
            if (category.level === 1) {
                firstLevelCategories.push(category);
            } else if (category.level === 2) {
                if (!secondLevelCategoriesMap[category.parentCategoryId]) {
                    secondLevelCategoriesMap[category.parentCategoryId] = [];
                }

                secondLevelCategoriesMap[category.parentCategoryId].push(category);
            } else if (category.level === 3) {
                if (!thirdLevelCategoriesMap[category.parentCategoryId]) {
                    thirdLevelCategoriesMap[category.parentCategoryId] = [];
                }

                thirdLevelCategoriesMap[category.parentCategoryId].push(category);
            }
        }

        return (
        <ol className='list-group list-group-numbered'>
            {firstLevelCategories.map((firstLevelCategory) =>(
            <li key={firstLevelCategory._id} className='list-group-item list-group-item-secondary'>
                <strong>{firstLevelCategory.name}</strong>
                <ol className='list-group ms-4 list-group-numbered'>
                    {(secondLevelCategoriesMap[firstLevelCategory._id] ?? []).map(secondLevelCategory => <li key={secondLevelCategory._id} className='list-group-item mt-2 list-group-item-dark'>
                        {secondLevelCategory.name}
                        <ol className='list-group ms-4 '>
                            {(thirdLevelCategoriesMap[secondLevelCategory._id] ?? []).map(thirdLevelCategory => <li key={thirdLevelCategory._id} className='list-group-item mt-2 list-group-item-light'>
                                {thirdLevelCategory.name}
                            </li>)}
                        </ol>
                    </li>
                    )}
                </ol>
            </li>
        ))}
        </ol>)
    }

    return (
        <div className='container mt-5'>
            <h1 className='text-center mb-4'>Category</h1>
            {displayCategoriesTree()}
            <div className='mt-3'>
                <form onSubmit={addCategory} className='row g-2'>
                    <div className='col-md-4'>
                    <input
                        className='form-control'
                        type='text'
                        value={newCategory.name}
                        onChange={(e) => setnewCategory({ ...newCategory, name: e.target.value })}
                        placeholder='Add new Category'
                        required
                    /></div>
                    <div className='col-md-2'>
                    <input
                        className='form-control'
                        type='number'
                        value={newCategory.level}
                        onChange={(e) => setnewCategory({ ...newCategory, level: parseInt(e.target.value) })}
                        placeholder='Add Category Level'
                        required
                    /></div>
                    {newCategory.level > 1 && (
                        <div className='col-md-4'>
                        <select
                            className='form-select'
                            value={newCategory.parentCategoryId}
                            onChange={(e) => setnewCategory({ ...newCategory, parentCategoryId: e.target.value })}
                            required>
                            {categories.filter((category) => category.level === newCategory.level - 1).map((category) => 
                                <option key={category.name} value={category._id}>
                                    {category.name}
                                </option>
                            )}
                        </select>
                        </div>
                    )}
                    <div className='col-md-2'>
                    <button type="submit" className='btn btn-secondary mb-2'>Add Category</button></div></form></div>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
        </div>
    );
}

export default Product;