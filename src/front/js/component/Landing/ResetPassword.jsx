import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import '../../../styles/Landing-styles/resetPassword.css';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            Swal.fire({
                title: 'Passwords do not match',
                icon: 'error',
                showConfirmButton: true,
            });
            return;
        }

        const response = await fetch(`${process.env.BACKEND_URL}/reset_password/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(password),
        });

        if (response.ok) {
            Swal.fire({
                title: 'Password has been reset',
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

    return (
        <div className='reset-password-container'>
            <form onSubmit={handleSubmit} className='reset-password-form'>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="reset-input"
                    required
                />
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="reset-input"
                    required
                />
                <button type="submit" className="reset-button">Reset Password</button>
            </form>
        </div>
    );
};

export default ResetPassword;