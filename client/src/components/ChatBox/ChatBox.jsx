import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { addMessage, getMessages } from "../../api/MessageRequests";
import { getUser, getAllUser } from "../../api/UserRequests";
import "./ChatBox.css";
import { format } from "timeago.js";
import InputEmoji from "react-input-emoji";
import { useSelector } from "react-redux";
import { Button, Modal, Table, message, Upload } from "antd";
import { findRoom, createRoom, updateRoom } from "../../api/RoomRequests";
import { storage } from "../../actions/UploadAction";
const serverPublic = process.env.REACT_APP_PUBLIC_FOLDER;
const ChatBox = ({
  chat,
  currentUser,
  setSendMessage,
  receivedMessage,
  setRoom,
  isSearch,
  setIsSearch,
  setFields,
  updateRoomSock,
}) => {
  const [userData, setUserData] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);

  const handleChange = (newMessage) => {
    setNewMessage(newMessage);
  };

  const { user } = useSelector((state) => state.authReducer.authData);

  useEffect(() => {
    const userId = chat && chat.members.find((id) => id !== currentUser);
    const getUserData = async () => {
      try {
        const { data } = await getUser(userId);
        setUserData(data);
      } catch (error) {
        console.log(error);
      }
    };

    if (chat !== null && chat.type === "single") getUserData();
  }, [chat, currentUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await getMessages(chat._id);
        setMessages(data);
      } catch (error) {
        console.log(error);
      }
    };

    if (chat !== null) {
      fetchMessages();
    }
  }, [chat]);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const keyEnter = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const upFirebase = async (_) => {
    return new Promise((resolve, reject) => {
      const uploadTask = storage.ref(`/${_.name}`).put(_);

      uploadTask.on("state_changed", null, reject, async () => {
        try {
          const url = await storage.ref("").child(_.name).getDownloadURL();
          resolve(url);
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const handleSend = async (e) => {
    setLoadingButton(true);
    let message = {};
    let result = {};
    if (isSearch) {
      result = await findRoom({
        members: [chat._id, currentUser],
      });
    }

    if (isSearch && result.data && !result.data._id) {
      const { data } = await createRoom({
        title: "",
        type: "single",
        members: [chat._id, currentUser],
      });
      updateRoomSock(data);
      message = {
        senderId: currentUser,
        text: newMessage,
        roomId: data._id,
        sender: {
          profilePicture: user.profilePicture,
          fullname: user.firstname + " " + user.lastname,
        },
      };
      setRoom(data);
      setIsSearch(false);
    } else {
      message = {
        senderId: currentUser,
        text: newMessage,
        roomId: chat._id,
        sender: {
          profilePicture: user.profilePicture,
          fullname: user.firstname + " " + user.lastname,
        },
      };
    }

    if (fileThumb) {
      const _thumb = await upFirebase(fileThumb);
      message = {
        ...message,
        image: _thumb,
      };
    }

    setSendMessage({ ...message, userId: currentUser });
    try {
      await addMessage(message);
      // setMessages([...messages, data]);
      setNewMessage("");
      setFileThumb(null);
      setThumb(null);
    } catch {
      console.log("error");
    } finally {
      setLoadingButton(false);
    }
  };

  useEffect(() => {
    if (receivedMessage !== null && receivedMessage.roomId === chat._id) {
      setMessages([...messages, receivedMessage]);
    }
  }, [receivedMessage]);

  const scroll = useRef();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const [loadingTable, setLoadingTable] = useState([]);
  const addUsers = async () => {
    showModal();
    try {
      setLoadingTable(true);
      const { data } = await getAllUser();
      setUsers(data.map((item) => ({ key: item._id, ...item })));
    } finally {
      setLoadingTable(false);
      setSelectedRowKeys(chat.members);
    }
  };
  const [messageApi] = message.useMessage();
  const handleUpdateRoom = async () => {
    try {
      setLoadingTable(true);
      const { data } = await updateRoom(chat._id, {
        ...chat,
        members: [...selectedRowKeys],
      });
      updateRoomSock(data);
      setRoom(data);
      handleCancel();
      messageApi.success("Cập nhật thành viên thành công");
    } finally {
      setLoadingTable(false);
    }
  };

  const [thumb, setThumb] = useState(null);
  const [fileThumb, setFileThumb] = useState(null);

  const handleUpload = (_) => {
    setThumb(URL.createObjectURL(_.file));
    setFileThumb(_.file);
    console.log(thumb);
  };
  const [loadingButton, setLoadingButton] = useState(false);

  const columns = [
    {
      title: "Ảnh đại diện",
      dataIndex: "profilePicture",
      align: "center",
      width: "120px",
      render: (text, record) => (
        <img
          src={record.profilePicture
            ? record.profilePicture
            : serverPublic + "defaultProfile.png"}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "100%",
            objectFit: "cover",
          }}
          alt="avatar"
        />
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "fullname",
      render: (text, record) => (
        <span>{record.firstname + " " + record.lastname}</span>
      ),
    },
    {
      title: "Nơi làm việc",
      dataIndex: "worksAt",
    },
  ];

  return (
    <>
      <div className="ChatBox-container">
        {chat ? (
          <>
            {chat.type === "multiple" ? (
              <>
                <div className="chat-header">
                  <div className="follower">
                    <div>
                      <img
                        src={
                          chat.profilePicture
                            ? chat.profilePicture
                            : serverPublic + "defaultProfile.png"
                        }
                        alt="Profile"
                        className="followerImage"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <div className="name" style={{ fontSize: "0.9rem" }}>
                        <span>{chat.title}</span>
                        <p
                          style={{
                            fontSize: "12px",
                            margin: "5px 0px 0px 0px",
                          }}
                        >
                          {chat.description || "Thành viên"}
                        </p>
                      </div>
                    </div>
                    {chat.type === "multiple" ? (
                      <div>
                        <Button type="primary" onClick={() => setFields(chat)}>
                          Sửa thông tin
                        </Button>
                        <Button type="primary" onClick={addUsers}>
                          Thành viên
                        </Button>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="chat-header">
                  <div className="follower">
                    <div>
                      <img
                        src={
                          userData.profilePicture
                            ? userData.profilePicture
                            : serverPublic + "defaultProfile.png"
                        }
                        alt="Profile"
                        className="followerImage"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <div className="name" style={{ fontSize: "0.9rem" }}>
                        <span>
                          {userData.firstname} {userData.lastname}
                        </span>
                        <p
                          style={{
                            fontSize: "12px",
                            margin: "5px 0px 0px 0px",
                          }}
                        >
                          {userData.worksAt || "Thanh niên cứng"}
                        </p>
                      </div>
                    </div>
                    {chat.type === "multiple" ? (
                      <div>
                        <Button type="primary" onClick={() => setFields(chat)}>
                          Sửa thông tin
                        </Button>
                        <Button type="primary" onClick={addUsers}>
                          Thành viên
                        </Button>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  <hr
                    style={{
                      width: "95%",
                      marginTop: "20px",
                    }}
                  />
                </div>
              </>
            )}
            <div className="chat-body">
              {messages.map((message) => (
                <>
                  {message.senderId !== currentUser ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        {message.sender && (
                          <img
                            src={
                              message.sender && message.sender.profilePicture
                                ? message.sender.profilePicture
                                : process.env.REACT_APP_PUBLIC_FOLDER +
                                  "defaultProfile.png"
                            }
                            alt="avatar"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "100%",
                              objectFit: "cover",
                              backgroundColor: "#53c66e",
                            }}
                          />
                        )}
                        <div ref={scroll} className="message">
                          <span>{message.text}</span>{" "}
                          <span>{format(message.createdAt)}</span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            textAlign: "left",
                            marginTop: "2px",
                          }}
                        >
                          {message.image && (
                            <img
                              style={{
                                width: "240px",
                                height: "200px",
                                borderRadius: "10px",
                                objectFit: "cover",
                                marginLeft: "50px",
                              }}
                              src={message.image}
                              alt=""
                            />
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        <div ref={scroll} className="message own">
                          <span>{message.text}</span>{" "}
                          <span>{format(message.createdAt)}</span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                            marginTop: "2px",
                          }}
                        >
                          {message.image && (
                            <img
                              style={{
                                width: "240px",
                                height: "200px",
                                borderRadius: "10px",
                                objectFit: "cover",
                                marginLeft: "auto",
                              }}
                              src={message.image}
                              alt=""
                            />
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              ))}
            </div>
            {/* chat-sender */}
            <div className="chat-sender ">
              {thumb && fileThumb ? (
                <>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        width: "25px",
                        height: "25px",
                        fontSize: "18px",
                        borderRadius: "100%",
                        position: "absolute",
                        right: "-15px",
                        top: "-20px",
                        backgroundColor: "#f60106",
                        color: "#fff",
                        textAlign: "center",
                      }}
                      onClick={() => {
                        setFileThumb(null);
                        setThumb(null);
                      }}
                    >
                      x
                    </span>
                    <img
                      style={{
                        width: "100px",
                        height: "60px",
                        borderRadius: "6px",
                        objectFit: "cover",
                      }}
                      src={thumb}
                      alt=""
                    />
                  </div>
                </>
              ) : (
                <Upload
                  listType="picture-card"
                  showUploadList={false}
                  onChange={handleUpload}
                  beforeUpload={() => false}
                >
                  <div className="ant-upload-text">+</div>
                </Upload>
              )}
              <InputEmoji
                value={newMessage}
                onChange={handleChange}
                onKeyDown={keyEnter}
              />
              <Button
                onClick={handleSend}
                disabled={!newMessage}
                type="primary"
                loading={loadingButton}
              >
                Gửi đi
              </Button>
            </div>
          </>
        ) : (
          <span className="chatbox-empty-message">
            Tap on a chat to start conversation...
          </span>
        )}
      </div>

      <Modal
        title="Cập nhật thành viên vào nhóm"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={false}
        width="800px"
      >
        <Table
          loading={loadingTable}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={users}
          pagination={{
            position: ["topRight"],
          }}
        />
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button type="primary" onClick={handleUpdateRoom}>
            Đồng ý
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ChatBox;
