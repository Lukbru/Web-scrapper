import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DropdownTreeSelect from 'react-dropdown-tree-select';
import 'react-dropdown-tree-select/dist/styles.css';

function Product() {
    const [products, setProducts] = useState([]);
    const [sortProduct, setSortProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [SelectCategory, setSelectCategory] = useState('All');
    const [category, setCategory] = useState([]); //TODO w react w boxie - obrazek i opis/link

const categoryTree = (category)=>{
    const categoryMap={};
    category.forEach(cate=>{
        categoryMap[cate._id] = {label: cate.name, value: cate._id, children:[]}
    });
    const tree = [];
    category.forEach(cate=>{
        if (cate.parentCategoryId){
            categoryMap[cate.parentCategoryId].children.push(categoryMap[cate._id]);
        } else {
            tree.push(categoryMap[cate._id])
        }
    });
    return tree;
}

const selectCategoryTree = (currentTreem, selectTree)=>{
if (selectTree.length === 0){
    setSelectCategory('All');
    setSortProduct(products);
} else {
    setSelectCategory(selectTree[0].value);
    const selectCategoryId = selectTree[0].value;
    const selectCategoryIds = getAllCategories(selectCategoryId);
    setSortProduct(products.filter(product=>selectCategoryIds.includes(product.categoryId)));
}
}

const categoryT = categoryTree(category);

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

    const getAllCategories = (categoryId) => {
        const allCategoriesId = [categoryId];
        const getChildCategory = (parentId) => {
            category.forEach(category => {
                if (category.parentCategoryId === parentId){
                    allCategoriesId.push(category._id);
                    getChildCategory(category._id);
                }
            });
        }
        getChildCategory(categoryId);
        return allCategoriesId;
    }
    

    useEffect(() => {
                if (SelectCategory === 'All'){
                    setSortProduct(products);
                } else {
                    const selectedCategory = getAllCategories(SelectCategory);
                    setSortProduct(products.filter(products=>selectedCategory.includes(products.categoryId)));
                }
            }, [SelectCategory,products, category]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    return (
        <div>
            <h1>Product List:</h1>
             <label htmlFor='categoryselect'> Categoty: </label>
             <DropdownTreeSelect
             data={categoryT}
             onChange={selectCategoryTree}
             mode='radioSelect'
             />
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
