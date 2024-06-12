import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import "../../../styles/Landing-styles/forgotPassword.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (email === '') {
            Swal.fire({
                title: 'Email is required',
                icon: 'error',
                showConfirmButton: true,
            });
            return;
        } else {
            const response = await fetch(`${process.env.BACKEND_URL}/forgot_password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(email),
            });
            if (response.ok) {
                Swal.fire({
                    title: 'Password reset email has been sent',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                });
                navigate('/');
            } else {
                const data = await response.json();
                Swal.fire({
                    title: 'Error',
                    text: data.message,
                    icon: 'error',
                    showConfirmButton: true,
                });
            }
        }
    }

    return (
        <div className='forgot-password-container'>
            <form onSubmit={handleSubmit} className='forgot-password-form'>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="forgot-input"
                    required
                />
                <button type="submit" className="forgot-button">Reset Password</button>
            </form>
        </div>
    );
};

export default ForgotPassword;
