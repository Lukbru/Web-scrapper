import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import Product from './Product';
import ShopProduct from './ShopProduct';
import ConnectProducts from './ConnectProducts';

function App() {
  return (
    <Router>
    <div className="App">
      <li>
        <Link to = './ShopProduct'>ShopProduct</Link>
      </li>
      <li>
        <Link to = './'>Product</Link>
      </li>

      ---------------

      <Routes>
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
