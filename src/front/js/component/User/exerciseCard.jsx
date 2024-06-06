import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../styles/User-styles/exerciseCard.css";

const ExerciseCard = ({ exercise }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/exercise/${exercise.id}`);
  };
  return (
    <Link className="exercise-card" to={`/exercise/${exercise.id}`} onClick={handleClick}>
      <div className="exercise-card-container">
        <img src={exercise.gifUrl} alt={exercise.name} loading="lazy" className="exercise-card-image" />
        <div className="card-body">
          <span className="primary-muscle">{exercise.bodyPart}</span>
          <span className="primary-muscle">{exercise.target}</span>
          <p className="card-text part-name">{exercise.name}</p>
          {/* <button className="card-button" onClick={handleClick}>More info</button> */}
        </div>
      </div>
    </Link>
  );
};

export default ExerciseCard;
