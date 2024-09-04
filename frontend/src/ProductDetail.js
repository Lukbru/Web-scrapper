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

const styles = {
    detailsBox :{
        display: 'flex',
        border: '1px solid #ccc',
        padding: '10px',
        alignItems: 'center',
        flexDirection: 'row',
        marginRight: '40px',
        marginLeft: '40px'
    },
    image :{
        maxWidth : '200px',
        maxHeight : '200px',
        marginRight: '30px',
        marginLeft: '10px'
    },
    mainImage:{
        maxWidth : '220px',
        maxHeight : '220px',
        marginRight: '10px',
        border: '1px solid grey',
    },
    textBox :{
        felx: '1'
    },
    shopImage :{
        maxWidth : '200px',
    }
}

const Shop_Images = {
 '6626adc5a5b15d56ea2cb5dc' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW22XHQS1aQPPMghJ1k9Q9dlk2aSyUZn2PuQ&s',
 '66255aee1b80af46d117b52b' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLZVumRI75Ki1B0EF_d4SYUV6psLVxsAy-HA&s'
}

const PlaceHolder_Image = 'https://t4.ftcdn.net/jpg/05/17/53/57/360_F_517535712_q7f9QC9X6TQxWi6xYZZbMmw5cnLMr279.jpg'

function ProductDetail(){
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shops, setShops] = useState({});
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth()));
    const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

    const fetchProducts = async () => {
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
        fetchProducts();
    }, [productId]);

    function renderVariants() {
        if (loading) {
            return;
        }

        const datasets  = product.shopProducts.map(shopProduct=>{
            return {
                label:shops[shopProduct.shopId],
                data: filterPricesByDate(shopProduct.prices).map(priceData=> ({
                    x: new Date((new Date(priceData.createdAt)).setHours(0, 0, 0, 0)),
                    y: priceData.price
                })),
                borderColor: RandomColor()
            }});
        
        const maxDate = new Date (Math.max(...datasets.flatMap(shopProduct=>shopProduct.data.map(priceData=> priceData.x.toLocaleDateString()))));
        const minDate = new Date (Math.min(...datasets.flatMap(shopProduct=>shopProduct.data.map(priceData=> priceData.x.toLocaleDateString()))));

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
                     datasets 
                     }}  
                 options={{
                responsive: true,
                scales:{
                    x:{
                        type:'time',
                        time: {
                            unit:'day',
                            tooltipFormat:"d.MM.yyyy"
                        },
                    min: minDate,
                    max: maxDate,
                    },
                    y:{
                        beginAtZero:"true"
                    }
                }
                   }}
              />
          </div>
        </div>
    );
}

function LoadDetails(){
    if (loading) {
        return;
    }
    return product.shopProducts.map((shopProduct)=> {
        const newestPrice = shopProduct.prices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        return (
        <div style={styles.detailsBox}>
            {Shop_Images[shopProduct.shopId] && (
                <img src={Shop_Images[shopProduct.shopId]} style={styles.shopImage}/>
            )}
            {shopProduct.imageUrl && <img src={shopProduct.imageUrl} style={styles.image}/>}
            <p style={styles.textBox}>{shopProduct.description}</p>
            <p style={styles.detailsBox}>Current Price : {newestPrice.price}</p>
            <p><a href={shopProduct.link}><button>Go to Shop</button></a></p>
        </div>
    )});
}

function MainDetails(){
    const mainObi = product.shopProducts.find(Url => shops[Url.shopId] === 'OBI');
    const mainCastorama = product.shopProducts.find(Url =>  shops[Url.shopId] === 'Castorama');

    const mainImageUrl = mainObi?.imageUrl || mainCastorama?.imageUrl || PlaceHolder_Image; // Checks Obi then Castorama for image
    const mainDescription = mainObi?.description || mainCastorama?.description || "No description";

    return(
        <div style={styles.detailsBox}>
            <img src={mainImageUrl} style={styles.mainImage}/>
            <p><h2>{product.name}</h2> {mainDescription}</p>
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
                    {MainDetails()}
                    <ul>{LoadDetails()}</ul>
                    <ul>{renderVariants()}</ul>
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