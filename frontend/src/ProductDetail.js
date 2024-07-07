import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    TimeSeriesScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Line } from 'react-chartjs-2'; 
  import DatePicker from 'react-datepicker';
  import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeSeriesScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

function ProductDetail(){
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shops, setShops] = useState({});
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth()));
    const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

    const fetchProductsAndPrices = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/products/${productId}`);
            const shopsResponse = await axios.get(`http://localhost:3000/shops`);

            if (response.status !== 200 || shopsResponse.status !== 200) {
                throw new error('Error - please try again later')
            }

            setProduct(response.data);
            setShops(shopsResponse.data.reduce((acc, element) => {
                acc[element.id] = element.name;
                return acc;
            }, {}));
            setLoading(false);
        } catch (error) {
            setError('Failed to load products');
            setLoading(false);
        }
    };

    const filterPricesByDate = (price) => {
        return price.filter(priceData => {
            const date = new Date(priceData.createdAt);
            return date >= startDate && date <= endDate;
        });
    }

    useEffect(() => {
        fetchProductsAndPrices();
    }, [productId]);

    function renderVariants() {
        if (loading) {
            return;
        }

        const datasets  = product.shopProducts.map(shopProduct=>{
            return {
                label:shops[shopProduct.shopId],
                data: filterPricesByDate(shopProduct.prices).map(priceData=> ({
                    x: new Date(priceData.createdAt),
                    y: priceData.price
                })),
                borderColor: RandomColor()
            }});
        
        const labels= [...new Set(datasets.flatMap(shopProduct=>shopProduct.data.map(priceData=> priceData.x.toLocaleDateString())))];

  return (
    <div>Shops
        <div style={{ display: 'flex'}}>
        <DatePicker
            selected={startDate}
            onChange={(date)=>setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="d.MM.yyyy"
        />
        <DatePicker
            selected={endDate}
            onChange={(date)=>setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            dateFormat="d.MM.yyyy"
        />
        </div>
        <div style={{width: "80%", display: 'flex', justifyContent: 'center'}}>
                <Line data={{
                     labels,
                     datasets 
                     }}  
                 options={{
                responsive: true,
                   }}
              />
          </div>
        </div>
    );
}

    return (
        <div>
            <h1>Product Detail: </h1>
            {loading && <p>Loading</p>}
            {error && <p>{error}</p>}
            { product && (
                <div>
                    <h2>Product Name: {product.name}</h2>
                    <p>Details: </p>
                    <ul>
                        {renderVariants()}
                    </ul>
                </div>
            )}
        </div>
    )
    
}
function RandomColor(){
    const letters = '0123456789ABCD';
    let color ='#';
    for (let i=0;i<6;i++){
        color += letters[Math.floor(Math.random()*16)];
    }
    return color;
}

export default ProductDetail;