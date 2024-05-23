import React from 'react';
import { FaRegTrashAlt } from "react-icons/fa";
import '../../../styles/Trainer-styles/exerciseTable.css';

const ExerciseTable = ({ routine, handleRemoveExercise }) => {
    return (
        <table className="exercise-table">
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Exercises</th>
                </tr>
            </thead>
            <tbody>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <tr key={day}>
                        <td>{day.charAt(0).toUpperCase() + day.slice(1)}</td>
                        <td>
                            <ul>
                                {routine[day].length === 0 ? (
                                    <li>Descanso</li>
                                ) : (
                                    routine[day].map((exercise, index) => (
                                        <li key={index}>
                                            {exercise}
                                            <span onClick={() => handleRemoveExercise(day, index)} style={{ cursor: 'pointer', color: 'black' }}> <FaRegTrashAlt /></span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ExerciseTable;
