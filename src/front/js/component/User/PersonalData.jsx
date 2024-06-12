import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../../store/appContext";
import { useNavigate } from 'react-router-dom';
import Loader from "../User/loader.jsx";
import Swal from 'sweetalert2';

import AvatarDefault from "../../../img/avatar-default.png";

import "../../../styles/User-styles/PersonalData.css";

const PersonalData = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [showFileInput, setShowFileInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!store.user_data) {
      async function fetchData() {
        await actions.fetchUserData();
        await actions.fetchUserImage();
        setIsLoading(false);

      }
      fetchData();
    }

  }, [store.user_id]);

  useEffect(() => {
    if (store.user_data && store.user_image) {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!store.user_image) {
      setImage(AvatarDefault);
    } else {
      setImage(store.user_image);
    }
  }, [store.user_image]);


  const handleEditForm = () => {
    navigate("/user/edit_form");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (file && validImageTypes.includes(file.type)) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      Swal.fire({
        title: "Invalid File Type",
        text: "Please upload a valid image file (jpg, jpeg, png).",
        icon: "error",
        showConfirmButton: true,
      });
    }
  };

  const handleUploadImage = async () => {
    if (selectedFile) {
      const updateUserImage = async (selectedFile) => {
        const formData = new FormData();
        formData.append("user_profile_picture", selectedFile);
        const method = store.user_image ? 'PUT' : 'POST';

        try {
          const response = await fetch(`${process.env.BACKEND_URL}/user/${store.user_id}/profile_picture`, {
            method: method,
            headers: {
              Authorization: `Bearer ${store.token}`
            },
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            const userImage = `data:${data.mimetype};base64,${data.img}`;
            actions.setUserImage(userImage);
            setImage(userImage);
            Swal.fire({
              title: "Success",
              text: "Profile picture updated successfully",
              type: "success",
              showConfirmButton: false,
              timer: 1000,
            });
          } /* else {
            Swal.fire({
              title: "Error",
              text: "Error updating user image",
              type: "error",
              showConfirmButton: false,
              timer: 1000,
            });
          } */
        } catch (error) {
          console.error('Error updating user image:', error);
          Swal.fire({
            title: "Error",
            text: "An error occurred while updating the profile picture",
            type: "error",
            showConfirmButton: false,
            timer: 1000,
          });
        }
      };
      updateUserImage(selectedFile);
      setShowFileInput(false);
      setSelectedFile(null);
    }
  };

  if (!store.user_data) {
    return (
      <div className='loader-container'>
        <h4>Loading...</h4>
        <Loader />
      </div>
    );
  }

  return (
    <div className='personalData'>
      <section className='user-image-container'>
        <img src={image} alt="user-image" className='user-image' />
        {!showFileInput && (
          <button onClick={() => setShowFileInput(true)} className="change-profile-pic-btn">Change Profile Picture</button>
        )}
        {showFileInput && (
          <div className="file-input-container">
            <input
              type="file"
              onChange={handleFileChange}
              accept='image/jpeg, image/jpg, image/png'
              className='picture-input'
            />
            <button
              onClick={handleUploadImage}
              disabled={!selectedFile}
              className="upload-img-btn">
              Upload Picture
            </button>
          </div>
        )}
      </section>
      <section className='user-info-container'>
        <div className='user-info'>
          <h2 className='user-info-title'>Personal <span className='green-text'>Information</span> </h2>
          <p className='dataForm'><span className='green-text dataForm-title'>Full Name:</span> {store.user_data.user_name}</p>
          <p className='dataForm'><span className='green-text dataForm-title'>Age:</span> {store.user_data.user_age}</p>
          <p className='dataForm'><span className='green-text dataForm-title'>Weight:</span> {store.user_data.user_weight}</p>
          <p className='dataForm'><span className='green-text dataForm-title'>Illness:</span> {store.user_data.user_illness}</p>
          <p className='dataForm'><span className='green-text dataForm-title'>Height:</span> {store.user_data.user_height}</p>
          <p className='dataForm'><span className='green-text dataForm-title'>Objectives:</span> {store.user_data.user_objetives}</p>
        </div>
        <button onClick={handleEditForm} className="edit-user-btn">Edit User Info</button>
      </section>
    </div>
  );
};

export default PersonalData;