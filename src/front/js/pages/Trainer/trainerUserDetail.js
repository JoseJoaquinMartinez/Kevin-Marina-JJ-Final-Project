import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../../store/appContext";
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import Loader from "../../component/User/loader.jsx";
import TrainerExercise from '../../component/Trainer/trainerExercise.jsx';
import AvatarDefault from "../../../img/avatar-default.png";

import "../../../styles/Trainer-styles/trainerUserDetails.css";

const TrainerUserDetail = () => {
    const { userId } = useParams();
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        user_name: '',
        user_age: '',
        user_height: '',
        user_weight: '',
        user_illness: '',
        user_objetives: ''
    });
    const [profileImage, setProfileImage] = useState(AvatarDefault);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const userDataResponse = await fetch(`${process.env.BACKEND_URL}/user_data/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + store.token
                    }
                });

                if (!userDataResponse.ok) {
                    throw new Error('Error fetching user data');
                }

                const userData = await userDataResponse.json();
                setFormData(userData);

                const imgResponse = await fetch(`${process.env.BACKEND_URL}/user/${userId}/profile_picture`, {
                    headers: {
                        Authorization: 'Bearer ' + store.token
                    }
                });

                if (imgResponse.ok) {
                    const imgData = await imgResponse.json();
                    setProfileImage(`data:${imgData.mimetype};base64,${imgData.img}`);
                } else {
                    setProfileImage(AvatarDefault);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        getUserData();
    }, [userId, store.token]);

    const handleDeleteUser = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0B3D91',
            cancelButtonColor: '#8BC34A',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            await actions.deleteUser(userId);
            navigate(`/trainer/${store.user_id}`);
        }
    }

    if (loading) {
        return (
            <>
                <h4>Loading...</h4>
                <Loader />
            </>
        );
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <section className="user-detail-view">
            <div className="user-detail-container">
                <section className="user-image-section">
                    <img
                        src={profileImage}
                        alt={`${formData.user_name}'s profile`}
                        className="user-detail-profile-image"
                    />
                </section>
                <section className="user-info-section">
                    <div className='user-info'>
                        <p className='dataForm'><span className='green-text dataForm-title'>Full Name:</span> {formData.user_name}</p>
                        <p className='dataForm'><span className='green-text dataForm-title'>Age:</span> {formData.user_age}</p>
                        <p className='dataForm'><span className='green-text dataForm-title'>Height:</span> {formData.user_height}</p>
                        <p className='dataForm'><span className='green-text dataForm-title'>Weight:</span> {formData.user_weight}</p>
                        <p className='dataForm'><span className='green-text dataForm-title'>Illness:</span> {formData.user_illness}</p>
                        <p className='dataForm'><span className='green-text dataForm-title'>Objectives:</span> {formData.user_objetives}</p>
                    </div>
                    <button onClick={handleDeleteUser} className="delete-user-btn">Delete User</button>
                </section>
            </div>
            <TrainerExercise />
        </section>
    );
};

export default TrainerUserDetail;