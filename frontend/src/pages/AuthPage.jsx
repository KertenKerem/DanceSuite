import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true); // true for login form, false for register form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // For registration
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (event) => {
        event.preventDefault();
        setMessage('');

        const endpoint = isLogin ? 'http://localhost:3000/login' : 'http://localhost:3000/register';
        const body = isLogin ? { email, password } : { email, password, name };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(isLogin ? 'Login successful!' : 'Registration successful!');
                if (isLogin) {
                    localStorage.setItem('jwtToken', data.token);
                    navigate('/dashboard'); // Redirect to dashboard on successful login
                } else {
                    // After successful registration, switch to login form
                    setIsLogin(true);
                    setEmail('');
                    setPassword('');
                    setName('');
                }
            } else {
                setMessage(data.error || 'Authentication failed.');
            }
        } catch (error) {
            console.error('Error during authentication:', error);
            setMessage('An error occurred during authentication.');
        }
    };

    return (
        <div>
            <h1>{isLogin ? 'Login' : 'Register'}</h1>
            <form onSubmit={handleAuth}>
                {!isLogin && (
                    <div>
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                )}
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
            </form>
            {message && <p style={{ color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
            <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Register here' : 'Login here'}
                </button>
            </p>
        </div>
    );
};

export default AuthPage;