import React, { useState, useEffect } from 'react';
import axios from 'axios';


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
        <div>
            <h1>Web Scrapper</h1>
            <form onSubmit={SaveLinks}>
                <input
                type="text"
                value={scrapper}
                onChange={(e)=>setScrapper(e.target.value)}
                placeholder='Space for Link'
                required
                /> 
                <select 
                id='selectCategory'
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
                <select
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
                <button type='submit' disabled={error}>
                    {'Add new Scrapper'}
                </button>
                </form>
                {loading && <p>Loading</p>}
                {error && <p>{error}</p>}
                <h2>Links thats being Scrapped</h2>
                <button onClick={selectedAll}>
                    {'Select All'}
                </button>
                <button onClick={StartScrapper} disabled={loading}>
                    {'Run Scrapper'}
                </button>
                <ul>
                    {linkScrapper.map(scrap=>(
                        <li key={scrap._id}>
                            <p>
                            < input 
                        type='checkbox'
                        checked={selectScrapper.includes(scrap._id)}
                        onChange={()=> checkBoxScrapper(scrap._id)}
                           />
                            Link : <a href={scrap.link}>{scrap.link}</a></p>
                            <p>Category : {categories.find(categ=>categ._id === scrap.categoryId)?.name}</p>
                            <p>Shop : {shops.find(shop=>shop.id === scrap.shopId)?.name}</p>
                       </li>
                    ))}      
                </ul>
        </div>
    );
}

export default Scrapper;