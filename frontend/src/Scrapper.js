import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';

function Scrapper() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrapper, setScrapper] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectCategory, setSelectCategory] = useState('');
    const [shops, setShops]= useState([]);
    const [selectShop, setSelectShop]= useState('')
    const [linkScrapper, setLinkScrapper] = useState([])
    const [selectScrapper, setSelectScrapper] = useState([])


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

    const fetchShops = async () => {
        try {
            const response = await axios.get('http://localhost:3000/shops');
            if (response.status !== 200) {
                throw new error('Error - please try again later')
            }
            setLoading(false);
            setShops(response.data);
            console.log(response.data)
        } catch (error) {
            setError('Failed to load categories');
            setLoading(false);
        }
    };

    const fetchScrapper = async () => {
        try {
            const response = await axios.get('http://localhost:3000/Scrapper');
            if (response.status !== 200) {
                throw new error('Error - please try again later')
            }
            setLoading(false);
            setLinkScrapper(response.data);
        } catch (error) {
            setError('Failed to load categories');
            setLoading(false);
        }
    };

    const checkBoxScrapper=(scrapId)=>{
        setSelectScrapper(checkId=>{
            if (checkId.includes(scrapId)){
                return checkId.filter(id => id !== scrapId);
            } else {
                return [...checkId,scrapId]
            }
        });
    }

    const selectedAll = () => {
        if (selectScrapper.length === linkScrapper.length){
            setSelectScrapper([]);
        } else {
            setSelectScrapper(linkScrapper.map(scrapper=>scrapper._id));
        }
    }

    useEffect(() => {
        fetchCategories();
        fetchShops();
        fetchScrapper();
    }, []);

    const SaveLinks = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/Scrapper',{link: scrapper, categoryId : selectCategory, shopId : selectShop});
            if (response.status !== 200) {
                throw new error('Error - please try again later')
            }
            setLoading(false);
            setLinkScrapper([...linkScrapper, {link: scrapper, categoryId : selectCategory, shopId : selectShop}]);

        } catch (error) {
            setError('Failed to save the link');
            setLoading(false);
        }
    };

    const StartScrapper = async () => {

        try {
            const selectedCheckBoxes = linkScrapper.filter(scrap=> selectScrapper.includes(scrap._id))
            const response = await axios.post('http://localhost:3000/Scrapper/Run',{ scrapper: selectedCheckBoxes });
            if (response.status !== 200) {
                throw new error('Error - please try again later')
            }
            setLoading(false);
        } catch (error) {
            setError('Failed to Run the Scrapper');
            setLoading(false);
        }
    };

    return (
        <div className='container mt-4'>
            <h1 className='text-center mb-4'>Web Scrapper</h1>
            <form onSubmit={SaveLinks} className='border p-4 rounded shadow-sm bg-light'>
                <div className='mb-3'>
                <input
                type="text"
                className='form-control'
                value={scrapper}
                onChange={(e)=>setScrapper(e.target.value)}
                placeholder='Space for Link'
                required
                /> 
                </div>
                <div className='mb-3'>
                <select 
                id='selectCategory'
                className='form-select'
                value={selectCategory}
                onChange={(e)=> setSelectCategory(e.target.value)}
                >
                    <option value='' disabled>Select Category</option>
                    {categories.map((category)=>(
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                </div>
                <div className='mb-3'>
                <select
                className='form-select'
                value={selectShop}
                onChange={(e)=>setSelectShop(e.target.value)}
                required>
                    <option value='' disabled>Select a Shop</option>
                    {shops.map(shop=>(
                        <option key={shop.id} value={shop.id}>
                            {shop.name}
                        </option>
                    ))}
                </select>
                </div>
                <button type='submit' className='btn btn-primary w-100' disabled={error}>
                    {'Add new Scrapper'}
                </button>
                </form>
                {loading && <p>Loading</p>}
                {error && <p>{error}</p>}
                <h2 className='mt-3'>Links thats being Scrapped</h2>
                <div className='d-flex gap-2 mb-3'>
                <button className='btn btn-secondary' onClick={selectedAll}>
                    {'Select All'}
                </button>
                <button className='btn btn-success' onClick={StartScrapper} disabled={loading}>
                    {'Run Scrapper'}
                </button>
                </div>
                <ul className='list-group'>
                    {linkScrapper.map(scrap=>(
                        <li className='list-group-item' key={scrap._id}>
                            <p>
                            < input 
                        type='checkbox'
                        className='form-check-input me-2'
                        checked={selectScrapper.includes(scrap._id)}
                        onChange={()=> checkBoxScrapper(scrap._id)}
                           />
                            Link : <a href={scrap.link}>{scrap.link}</a></p>
                            <div className='mt-1 text-muted'>
                            Category : {categories.find(categ=>categ._id === scrap.categoryId)?.name} |
                            Shop : {shops.find(shop=>shop.id === scrap.shopId)?.name}
                            </div>
                       </li>
                    ))}      
                </ul>
        </div>
    );
}

export default Scrapper;