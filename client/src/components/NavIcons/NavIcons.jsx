import React, { useEffect, useState } from "react";
import ProfileModal from "../ProfileModal/ProfileModal";
import { useSelector } from "react-redux";


const serverPublic = process.env.REACT_APP_PUBLIC_FOLDER;
const NavIcons = () => {
  const { user } = useSelector((state) => state.authReducer.authData);
  const [modalOpened, setModalOpened] = useState(false);
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "100px",
          justifyContent: "space-between",
        }}
      >
        <div className="navIcons" onClick={() => setModalOpened(true)}>
          <img
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "100%",
              objectFit: "cover",
            }}
            src={
              user.profilePicture
                ? user.profilePicture
                : serverPublic + "defaultProfile.png"
            }
            alt="ProfileImage"
          />
          <div>
            <div
              style={{
                fontWeight: "600",
              }}
            >
              {user.firstname} {user.lastname}
            </div>
            <p
              style={{
                marginTop: "5px",
                marginBottom: "0px",
                fontSize: "12px",
              }}
            >
              {user.worksAt || "Thích tình cảm"}
            </p>
          </div>
        </div>
      </div>
      <ProfileModal
        modalOpened={modalOpened}
        setModalOpened={setModalOpened}
        data={user}
      />
    </>
  );
};

export default NavIcons;
