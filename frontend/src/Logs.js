import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Logs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


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

   
    return (
        <div>
            <h1>Log List:</h1>
            <ul>
                {logs.map((log)=>(
                    <li>Date : {log.timestamp} || {log.message}</li>
                ))}
            </ul>
            {loading && <p>Loading</p>}
            {error && <p>{error}</p>}
        </div>
    );
}

export default Logs;
