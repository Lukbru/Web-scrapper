import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';

function Logs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPages = 18;


    const fetchLogs = async () => {
        try {
            const logsResponse = await axios.get('http://localhost:3000/logs');

            if (logsResponse.status !== 200) {
                throw new error('Error - please try again later')
            }

            const newestLogs = logsResponse.data.reverse().slice(0,140);

            setLoading(false);
            setLogs(newestLogs);
        } catch (error) {
            setError('Failed to load logs');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const currentPageLogs = currentPage * logsPerPages;
    const preaviousPageLogs = currentPageLogs - logsPerPages;
    const currentLogs = logs.slice(preaviousPageLogs, currentPageLogs);
    const allPages = Math.ceil(logs.length / logsPerPages);
    const changePage = ((pageNumber) => setCurrentPage(pageNumber));

    const colorLevel = (logColor) => {
        switch(logColor) {
            case 'info':
                return 'text-primary';
            case 'error':
                return 'text-danger';
            default:
                return 'text-secondary';
        }
    }

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');

        return `${year}.${month}.${day} ${hour}:${minute}`;
    }

   
    return (
        <div className='container mt-5'>
            <h1 className='text-center mb-3'>Log List:</h1>
            {loading && <p>Loading</p>}
            {error && <p>{error}</p>}
            <ul className='list-group'>
                {currentLogs.map((log)=>(
                    <li className={`d-flex justify-content-between list-group-item`}>
                        <span>Date : {formatDate(log.timestamp)} </span>
                        <span className={colorLevel(log.level)}>{log.message}</span>
                        </li>
                ))}
            </ul>
            <nav className='mt-5'>
                <ul className='pagination justify-content-center'>
                    {[...Array(allPages)].map((a, index)=>(
                        <li className={`page-item ${currentPage===index + 1 ? 'active' : ''}`}>
                            <button onClick={() => changePage(index + 1)} className='page-link'>
                                {index + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

export default Logs;
