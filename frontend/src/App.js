import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import Product from './Product';
import ShopProduct from './ShopProduct';
import ConnectProducts from './ConnectProducts';
import ProductDetail from './ProductDetail';

function App() {
  const navbar={
    position: 'fixed',
    top: 0,
    width: '100%',
    backgroundColor: 'grey',
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

  return (
    <Router>
    <div className="App">
      <nav style={navbar}>
      <li style={menuboxes}>
        <Link to = './ShopProduct' style={linkboxes}>ShopProduct</Link>
      </li>
      <li style={menuboxes}>
        <Link to = './' style={linkboxes}>Product</Link>
      </li>
      </nav>

      ---------------

      <Routes>
        <Route path="/products/:productId" element={<ProductDetail />} />

        <Route path="/products" element={<Product />} />

        <Route path="/shopproduct" element={<ShopProduct />} />

        <Route path="/ConnectProducts/:shopProductId" element={<ConnectProducts />} />

        <Route path="/" element={<Product />} />
     
       
      </Routes>
    </div>
    </Router>
  );
}

export default App;
