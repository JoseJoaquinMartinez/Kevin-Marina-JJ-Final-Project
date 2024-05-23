import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom";
import { Context } from "../../store/appContext";
import Loader from '../User/loader.jsx';

import "../../../styles/Trainer-styles/trainerView.css";

const TrainerView = () => {
  const { id } = useParams();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { store } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainerUsers = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/trainer/${store.user_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + store.token
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerUsers();
  }, []);

  const handleDetailClick = (userId) => {
    navigate(`/trainer/${store.user_id}/user/${userId}`);
  };

  return (
    <div className="userCard">
      <h1>Users</h1>
      {loading && <Loader />}
      {error && <p>Error: {error}</p>}
      <div className="user-list">
        {!loading && users.map(user => (
          <div key={user.id} className="user-card">
            <h2>{user.user_name}</h2>
            <p>Height: {user.user_height} cm</p>
            <p>Weight: {user.user_weight} kg</p>
            <p>Illness: {user.user_illness}</p>
            <p>Objectives: {user.user_objetives}</p>
            <button onClick={() => handleDetailClick(user.user_id)}>Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerView;
