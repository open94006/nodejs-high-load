import { useEffect, useState } from 'react';

function App() {
    const [message, setMessage] = useState('載入中');

    useEffect(() => {
        fetch('http://localhost:5100/api/hello')
            .then((res) => res.json())
            .then((data) => setMessage(data.message));
    }, []);

    return (
        <div>
            <h1>React + Express + TS</h1>
            <p>{message}</p>
        </div>
    );
}

export default App;
