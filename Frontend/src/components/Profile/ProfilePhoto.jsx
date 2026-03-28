import React from "react";

const ProfilePhoto = ({ photoUrl, firstName, lastName }) => {
  const avatarUrl = photoUrl    ? photoUrl    : `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0d6efd&color=fff&rounded=true`;
  return (
    <div className="text-center mb-4">
      <img
        src={avatarUrl} 
        alt="Perfil"
        className="rounded-circle shadow"
        style={{ width: "120px", height: "120px", objectFit: "cover" }}
      />
    </div>
  );
};
export default ProfilePhoto;