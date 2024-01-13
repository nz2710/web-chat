import React, { useState } from "react";
import { useEffect } from "react";
import { getUser } from "../../api/UserRequests";
const serverPublic = process.env.REACT_APP_PUBLIC_FOLDER;
const Conversation = ({ data, currentUser, online, chat }) => {
  const [userData, setUserData] = useState({});
  // const dispatch = useDispatch();

  useEffect(() => {
    const userId = data.members.find((id) => id !== currentUser);
    const getUserData = async () => {
      try {
        const { data } = await getUser(userId);
        setUserData(data);
      } catch (error) {
        console.log(error);
      }
    };

    getUserData();
  }, []);

  return (
    <>
      <div
        className={`${
          chat && chat._id === data._id
            ? "hoverDiv follower conversation"
            : "follower conversation"
        }`}
      >
        {data.type === "multiple" ? (
          <>
            <div>
              <img
                src={
                  data.profilePicture
                    ? data.profilePicture
                    : serverPublic + "defaultProfile.png"
                }
                alt="Profile"
                className="room image"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "100%",
                  objectFit: "cover",
                }}
              />
              <div className="name" style={{ fontSize: "0.8rem" }}>
                <span>{data.title}</span>
                <span style={{ color: online ? "#51e200" : "" }}>
                  {data.description}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {data.isSearch ? (
              <>
                <div>
                  <img
                    src={
                      data.profilePicture
                        ? data.profilePicture
                        : serverPublic + "defaultProfile.png"
                    }
                    alt="Profile"
                    className="room image"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div className="name" style={{ fontSize: "0.8rem" }}>
                    <span>
                      {data.firstname} {data.lastname}
                    </span>
                    <span style={{ color: online ? "#51e200" : "" }}>
                      {data.worksAt || "Thành niên cứng"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <img
                    src={
                      userData.profilePicture
                        ? userData.profilePicture
                        : serverPublic + "defaultProfile.png"
                    }
                    alt="Profile"
                    className="room image"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div className="name" style={{ fontSize: "0.8rem" }}>
                    <span>
                      {userData.firstname} {userData.lastname}
                    </span>
                    <span style={{ color: online ? "#51e200" : "" }}>
                      {userData.worksAt || "Thành niên cứng"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Conversation;
