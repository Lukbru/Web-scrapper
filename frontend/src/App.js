import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import Product from './Product';
import ShopProduct from './ShopProduct';
import ConnectProducts from './ConnectProducts';
import ProductDetail from './ProductDetail';
import Categories from './Categories';
import Scrapper from './Scrapper';
import Logs from './Logs';
import Login from './Login'

function App() {
  const navbar={
    position: 'fixed',
    top: 0,
    width: '100%',
    backgroundColor: 'grey',
    zIndex: 100,
  };
  const linkboxes={
    display: 'inline-block',
    padding: '10px',
    color: 'white',
    textDecoration: 'none',
  }
  const menuboxes={
    display: 'inline',
  }
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <Router>
    <div className="App">
      <nav style={navbar}>
      <li style={menuboxes}>
        <Link to = './ShopProduct' style={linkboxes}>ShopProduct</Link>
      </li>
      <li style={menuboxes}>
        <Link to = './Categories' style={linkboxes}>Categories</Link>
      </li>
      <li style={menuboxes}>
        <Link to = './Scrapper' style={linkboxes}>Scrapper</Link>
      </li>
      <li style={menuboxes}>
        <Link to = './Logs' style={linkboxes}>Logs</Link>
      </li>
      <li style={menuboxes}>
        <Link to = './' style={linkboxes}>Product</Link>
      </li>
      <li style={menuboxes}>
        <Link to = './Login' style={linkboxes}>Login</Link>
      </li>
      </nav>

      ---------------

      <Routes>
        <Route path="/products/:productId" element={<ProductDetail />} />

        <Route path="/products" element={<Product />} />

        <Route path="/shopproduct" element={<ShopProduct />} />

        <Route path="/Categories" element={<Categories />} />

        <Route path="/Scrapper" element={<Scrapper />} />

        <Route path="/Logs" element={<Logs />} />

        <Route path="/ConnectProducts/:shopProductId" element={<ConnectProducts />} />

        <Route path="/Login" element={<Login setToken={setToken} />} />

        <Route path="/" element={<Product />} />
     
       
      </Routes>
    </div>
    </Router>
  );
}

export default App;
