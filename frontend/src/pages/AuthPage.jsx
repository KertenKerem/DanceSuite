import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Link as MuiLink } from '@mui/material';

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
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    {isLogin ? 'Login' : 'Register'}
                </Typography>
                <Box component="form" onSubmit={handleAuth} noValidate sx={{ mt: 1 }}>
                    {!isLogin && (
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="Name"
                            name="name"
                            autoComplete="name"
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus={isLogin}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {isLogin ? 'Login' : 'Register'}
                    </Button>
                </Box>
                {message && (
                    <Typography variant="body2" color={message.includes('successful') ? 'success.main' : 'error.main'} sx={{ mt: 2 }}>
                        {message}
                    </Typography>
                )}
                <MuiLink component="button" variant="body2" onClick={() => setIsLogin(!isLogin)} sx={{ mt: 2 }}>
                    {isLogin ? "Don't have an account? Register here" : "Already have an account? Login here"}
                </MuiLink>
            </Box>
        </Container>
    );
};

export default AuthPage;