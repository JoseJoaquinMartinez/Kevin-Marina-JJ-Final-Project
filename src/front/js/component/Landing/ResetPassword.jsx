import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Loader from "../User/loader.jsx";

import '../../../styles/Landing-styles/resetPassword.css';
import { CgPassword } from 'react-icons/cg';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validToken, setValidToken] = useState(true);
    const navigate = useNavigate();

    /*  useEffect(() => {
         console.log(token);
         const verifyToken = async () => {
             const response = await fetch(`${process.env.BACKEND_URL}/verify_reset_token/${token}`, {
                 method: 'GET',
             });
 
             if (response.ok) {
                 setValidToken(true);
             } else {
                 Swal.fire({
                     title: 'Invalid or expired token',
                     icon: 'error',
                     showConfirmButton: true,
                 });
                 navigate('/');
             }
         };
 
         verifyToken();
     }, [token, navigate]); */

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
            navigate('/login');
        } else {
            const data = await response.json();
            Swal.fire({
                title: 'Error',
                text: data.message,
                icon: 'error',
                showConfirmButton: true,
            });
        }
    };

    return (
        <div className='reset-password-container'>
            {validToken ? (
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
            ) : (
                <div className='loader-container'>
                    <p>Verifying token...</p>
                    <Loader />
                </div>
            )}
        </div>
    );
};

export default ResetPassword;
