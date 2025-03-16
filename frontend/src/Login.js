import React, { useState } from 'react';
import axios from 'axios';

function Login({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLogin, setisLogin] = useState(true);
    const [succesMessage, setSuccesMessage] = useState('')

    const registerUser = async (e) => {
        e.preventDefault();
        setSuccesMessage('')
        setError(null); 
        try {
            const url = isLogin ? 'http://localhost:3000/Login' : 'http://localhost:3000/Register';
            const response = await axios.post(url, { username, password});

            if (isLogin) {
                localStorage.setItem('token', response.data.token);
                setToken(response.data.token);
                setSuccesMessage('You are logged in successfully!');
            } else {
                setisLogin(true);
            }
    } catch (error) {
        setSuccesMessage('Authorization failed')
    }
}
   
    return (
        <div className='container mt-5'>
            <h1 className='text-center mb-3'>{isLogin ? 'Login' : 'Register'}</h1>
            <form onSubmit={registerUser} className='border p-4 rounded shadow-sm bg-light'>
                <div className='mb-3'>
                    <input type='text' className='form-control' value={username} onChange={(e)=> setUsername(e.target.value)} placeholder='Username' required/>
                </div>
                <div className='mb-3'>
                    <input type='password' className='form-control' value={password} onChange={(e)=> setPassword(e.target.value)} placeholder='Password' required/>
                </div>
                <button type='submit' className='btn btn-primary w-100'>{isLogin ? 'Login' : 'Register'}</button>
                </form>
                <button className='btn btn-link mt-1' onClick={()=>setisLogin(!isLogin)}>
                    {isLogin ? 'Dont have an account? Register' : 'I have an account? Login'}
                </button>
                {error && <p>{error}</p>}
                {succesMessage && <p className='alert alert-success mt-3'>{succesMessage}</p>}
        </div>
    );
}

export default Login;
