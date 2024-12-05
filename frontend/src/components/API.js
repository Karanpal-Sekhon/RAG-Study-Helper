import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = () => {
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get('/api/')
            .then(response => setMessage(response.data.message))
            .catch(error => console.error("Error:", error));
    }, []);

    return <h1>{message}</h1>;
};

export default API;
