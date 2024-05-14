import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ProductDetail(){
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shops, setShops] = useState({});

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

    useEffect(() => {
        fetchProductsAndPrices();
    }, [productId]);

    function renderVariants() {
        if (loading) {
            return;
        }


        
        return (<div>
            Shops
            
            <ul>
            {product.shopProducts.map(shopProduct => {
                return (<li>
                    {shops[shopProduct.shopId]}
                    
                    <p>
                     Current Price {shopProduct.prices.at(-1).price}
                    </p>

                    <div>
                        Price History

                        {shopProduct.prices.map(priceData => {
                            return <p>
                                {`Date ${priceData.createdAt}, Price ${priceData.price}`}
                            </p>
                        })}
                    </div>
                </li>)
            })}
            </ul>
        </div>)
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
export default ProductDetail;