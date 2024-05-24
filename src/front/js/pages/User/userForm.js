import React, { useState, useEffect, useContext } from "react";
import "./../../../styles/User-styles/userForm.css";
import { Context } from "../../store/appContext";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';


const UserForm = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        user_name: '',
        user_height: '',
        user_weight: '',
        user_illness: '',
        user_objetives: '',
        user_age: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        try {
            if (
                formData.user_name === '' ||
                formData.user_height === '' ||
                formData.user_weight === '' ||
                formData.user_illness === '' ||
                formData.user_age === ''
            ) {
                Swal.fire({
                    title: "Error",
                    text: "Please, complete all fields",
                    type: "error",
                    showConfirmButton: false,
                    timer: 1000,
                });
                return;
            } else {
                await actions.postUserData(formData);
                navigate(`/user/${store.user_id}`)
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "Error de red",
                type: "error",
                showConfirmButton: false,
                timer: 1000,
            });
        }
    };

    return (
        <div className="container-form">
            <div className="form-container">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                }}>
                    <label className="form-label">
                        Full Name:
                        <input
                            type="text"
                            name="user_name"
                            value={formData.user_name}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </label>
                    <br />
                    <label className="form-label">
                        Age
                        <input
                            type="number"
                            name="user_age"
                            min="16"
                            value={formData.user_age}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </label>
                    <br />
                    <label className="form-label">
                        Height (cm):
                        <input
                            type="number"
                            name="user_height"
                            value={formData.user_height}
                            onChange={handleChange}
                            placeholder="000"
                            required
                            className="form-input"
                        />
                    </label>
                    <br />
                    <label className="form-label">
                        Weight (kg):
                        <input
                            type="number"
                            name="user_weight"
                            value={formData.user_weight}
                            onChange={handleChange}
                            pattern="\d+(\.\d{1,2})?"
                            placeholder="00.00"
                            required
                            className="form-input"
                        />
                    </label>
                    <br />
                    <label className="form-label">
                        Illness:
                        <input
                            type="text"
                            name="user_illness"
                            value={formData.user_illness}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </label>
                    <br />
                    <label className="form-label">
                        Objetives:
                        <input
                            type="text"
                            name="user_objetives"
                            value={formData.user_objetives}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </label>
                    <br />
                    <button type="submit" className="form-button">Send</button>
                </form>
            </div>
        </div>
    );
}

export default UserForm;