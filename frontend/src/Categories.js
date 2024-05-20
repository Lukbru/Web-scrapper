import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Product() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [newCategory, setnewCategory] = useState({name:'',level:1,parentCategoryId: null});

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

    const addCategory = async (e) => {
        e.preventDefault();
        const { name, level, parentCategoryId } = newCategory;
        const response = await axios.post('http://localhost:3000/category', { name, level, parentCategoryId });
        if (response.status !== 200) {
            throw new Error('Error - please try again later');
        }
        setCategories([...categories, response.data]);
    };

    useEffect(() => {
        fetchCategories();
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

        return <ol>{firstLevelCategories.map((firstLevelCategory) =>
            <li key={firstLevelCategory._id}>
                {firstLevelCategory.name}
                <ol>
                    {(secondLevelCategoriesMap[firstLevelCategory._id] ?? []).map(secondLevelCategory => <li key={secondLevelCategory._id}>
                        {secondLevelCategory.name}
                        <ol>
                            {(thirdLevelCategoriesMap[secondLevelCategory._id] ?? []).map(thirdLevelCategory => <li key={thirdLevelCategory._id}>
                                {thirdLevelCategory.name}
                            </li>)}
                        </ol>
                    </li>
                    )}
                </ol>
            </li>
        )}
        </ol>
    }

    return (
        <div>
            <h1>Category:</h1>
            <label htmlFor='categoryselect'>Category: </label>
            {displayCategoriesTree()}
            <div>
                <form onSubmit={addCategory}>
                    <input
                        type='text'
                        value={newCategory.name}
                        onChange={(e) => setnewCategory({ ...newCategory, name: e.target.value })}
                        placeholder='Add new Category'
                        required
                    />
                    <input
                        type='number'
                        value={newCategory.level}
                        onChange={(e) => setnewCategory({ ...newCategory, level: parseInt(e.target.value) })}
                        placeholder='Add Category Level'
                        required
                    />
                    {newCategory.level > 1 && (
                        <select
                            value={newCategory.parentCategoryId}
                            onChange={(e) => setnewCategory({ ...newCategory, parentCategoryId: e.target.value })}
                            required>
                            {categories.filter((category) => category.level === newCategory.level - 1).map((category) => 
                                <option key={category.name} value={category._id}>
                                    {category.name}
                                </option>
                            )}
                        </select>
                    )}
                    <button type="submit">Add Category</button></form></div>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
        </div>
    );
}

export default Product;