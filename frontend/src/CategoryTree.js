import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DropdownTreeSelect from 'react-dropdown-tree-select';
import 'react-dropdown-tree-select/dist/styles.css';

function CategoryTree({onSelectCategory}) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState([]); 

    useEffect(()=>{
        fetchCategories();
    },[]);

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

    const categoryTree = (category )=>{
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
    
    const selectCategoryTree = (currentTree, selectTree)=>{
        if (selectTree.length === 0){
            onSelectCategory('All');
        } else {
            const selectCategoryId = selectTree[0].value;
            const selectCategoryIds = getAllCategories(selectCategoryId);
            onSelectCategory(selectCategoryId, selectCategoryIds);
        }
        }
    
        const categoryT = categoryTree(category);

    return (
        <div>
              {loading && <p>Loading</p>}
              {error && <p>{error}</p>}
              <label htmlFor='categoryselect'>Category:</label>
              <DropdownTreeSelect data={categoryT} onChange={selectCategoryTree} mode='radioSelect'/>
        </div>
    )
    

}

export default CategoryTree;