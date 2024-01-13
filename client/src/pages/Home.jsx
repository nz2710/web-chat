import React, { useRef, useState } from "react";
import ChatBox from "../components/ChatBox/ChatBox";
import Conversation from "../components/Coversation/Conversation";
import NavIcons from "../components/NavIcons/NavIcons";
import "./Home.css";
import { useEffect, useReducer } from "react";
import {
  getAllRoom,
  createRoom,
  findRoom,
  updateRoom,
} from "../api/RoomRequests";
import { getAllUser } from "../api/UserRequests";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { logout } from "../actions/AuthActions";
import { Button, Modal, Form, Input, message, Switch, Upload } from "antd";

import { storage } from "../actions/UploadAction";

const { Search } = Input;
function getWindowDimensions() {
  const { innerWidth: _width, innerHeight: _height } = window;
  return {
    _width,
    _height,
  };
}

const Home = () => {
  const socket = useRef();
  const { user } = useSelector((state) => state.authReducer.authData);
  const dispatch = useDispatch();

  const [rooms, setRooms] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [sendMessage, setSendMessage] = useState(null);
  const [receivedMessage, setReceivedMessage] = useState(null);
  const [updateRoomState, setUpdateRoomState] = useState(null);

  const handleLogOut = () => {
    dispatch(logout());
  };

  useEffect(() => {
    const getRooms = async () => {
      try {
        const { data } = await getAllRoom(user._id);
        setRooms(data);
      } catch (error) {
        console.log(error);
      }
    };
    getRooms();
  }, [user._id]);

  // Connect to Socket.io
  useEffect(() => {
    socket.current = io("ws://localhost:8800");
  }, [user]);

  // Send Message to socket server
  useEffect(() => {
    if (sendMessage !== null) {
      socket.current.emit("send-message", sendMessage);
      console.log("Send", sendMessage);
    }
  }, [sendMessage]);

  useEffect(() => {
    if (currentChat) {
      socket.current.emit("join-room", currentChat._id);
    }
  }, [currentChat]);

  useEffect(() => {
    if (updateRoomState) {
      socket.current.emit("update-room");
    }
  }, [updateRoomState]);

  // Get the message from socket server
  useEffect(() => {
    socket.current.on("recieve-message", (data) => {
      setReceivedMessage(data);
    });
  }, []);

  useEffect(() => {
    socket.current.on("update-room", (data) => {
      const getRooms = async () => {
        try {
          const { data } = await getAllRoom(user._id);
          setRooms(data);
          const isOutRoom = rooms.find((item) => item._id === currentChat._id);
          if (!isOutRoom) {
            setCurrentChat(null);
          }
        } catch (error) {
          console.log(error);
        }
      };
      getRooms();
    });
  }, []);

  const checkOnlineStatus = (chat) => {
    const chatMember = chat.members.find((member) => member !== user._id);
    const online = onlineUsers.find((user) => user.userId === chatMember);
    return online ? true : false;
  };

  const [typeSearch, setTypeSearch] = useState("room");
  const [isSearch, setIsSearch] = useState(false);

  const onSearch = async (value, _e, info) => {
    try {
      if (typeSearch === "user") {
        const { data } = await getAllUser(value);
        const _data = [];
        data.map((item) => {
          if (item._id !== user._id) {
            _data.push({
              ...item,
              isSearch: true,
              members: [user._id, item._id],
              type: "single",
            });
          }
          return {};
        });
        setRooms(_data);
      } else {
        const { data } = await getAllRoom(user._id, value);
        setRooms(data);
      }
      setIsSearch(true);
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeSearch = async (e) => {
    if (e.target.value === "") {
      setIsSearch(false);
      try {
        const { data } = await getAllRoom(user._id);
        setRooms(data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const setChatRoom = async (room) => {
    if (isSearch) {
      const result = await findRoom({
        members: [room._id, user._id],
      });
      setCurrentChat(result.data && result.data._id ? result.data : room);
    } else {
      setCurrentChat(room);
    }
  };

  const [form] = Form.useForm();
  const [isCreateForm, setIsCreateForm] = useState(true);

  const handleUpdateRoom = (_fields) => {
    form.setFieldsValue({
      ..._fields,
    });
    setAvatar(_fields.image);
    setIsCreateForm(false);
    setIsModalOpen(true);
  };
  const [messageApi, contextHolder] = message.useMessage();

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

  const [avatar, setAvatar] = useState("");
  const [fileAvatar, setFileAvatar] = useState(null);

  const handleUpload = (_) => {
    setAvatar(URL.createObjectURL(_.file));
    setFileAvatar(_.file);
    console.log(avatar);
  };

  const onFinish = async (values) => {
    try {
      setLoadingButton(true);
      let _avatar;
      if (fileAvatar) {
        _avatar = await upFirebase(fileAvatar);
      }
      if (isCreateForm) {
        await createRoom({
          ...values,
          type: "multiple",
          members: [user._id],
          ...(_avatar && { image: _avatar }),
        });
        const { data } = await getAllRoom(user._id);
        setRooms(data);
        setIsModalOpen(false);
        messageApi.success("Thêm nhóm thành công");
      } else {
        const result = await updateRoom(currentChat._id, {
          ...currentChat,
          ...values,
          ...(_avatar && { image: _avatar }),
        });
        setCurrentChat({ ...result.data });
        console.log({ ...result.data });
        const { data } = await getAllRoom(user._id);
        setRooms(data);
        setIsModalOpen(false);
        messageApi.success("Cập nhật nhóm thành công");
      }
    } finally {
      setLoadingButton(false);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    form.setFieldsValue({
      title: "",
      description: "",
      image: "",
    });
    setAvatar("");
    setCurrentChat(null);
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [loadingButton, setLoadingButton] = useState(false);
  const { darkMode } = useSelector((state) => {
    return state.themeReducer;
  });

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <NavIcons />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div>
            <span style={{ marginRight: "10px", fontWeight: "500" }}>
              {!darkMode ? "Off" : "On"} dark mode:
            </span>
            <Switch
              value={!darkMode}
              onChange={() => dispatch({ type: "SWITCH_MODE" })}
            />
          </div>
          <Button onClick={handleLogOut}>Đăng xuất</Button>
        </div>
      </div>
      <div className="control-tabs" style={{ marginTop: "20px", maxWidth: '600px' }}>
        <div>
          <div
            style={{
              display: "flex",
              gap: " 10px",
              marginBottom: "5px",
              justifyContent: "space-between",
            }}
          >
            <Button type="primary" onClick={showModal}>
              Thêm nhóm
            </Button>
            <div style={{ display: "flex", gap: " 10px" }}>
              <Button
                type={typeSearch !== "user" ? "primary" : "default"}
                onClick={() => setTypeSearch("room")}
              >
                Tìm nhóm
              </Button>
              <Button
                type={typeSearch === "user" ? "primary" : "default"}
                onClick={() => setTypeSearch("user")}
              >
                Tìm người dùng
              </Button>
            </div>
          </div>
          {typeSearch === "user" ? (
            <Search
              placeholder="Tìm người dùng"
              onSearch={onSearch}
              onChange={onChangeSearch}
            />
          ) : (
            <Search
              placeholder="Tìm nhóm chat"
              onSearch={onSearch}
              onChange={onChangeSearch}
            />
          )}
        </div>
      </div>
      <div className="Chat">
        {/* Left Side */}
        <div className="Left-side-chat">
          <div className="Chat-container">
            <h2 style={{ margin: "0px 0px 0px 0px" }}>Chats</h2>
            <div className="Chat-list">
              {rooms.map((room, index) => (
                <div onClick={() => setChatRoom(room)} key={index}>
                  <Conversation
                    data={room}
                    currentUser={user._id}
                    chat={currentChat}
                    online={checkOnlineStatus(room)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="Right-side-chat">
          <ChatBox
            chat={currentChat}
            currentUser={user._id}
            setSendMessage={setSendMessage}
            receivedMessage={receivedMessage}
            setRoom={(room) => setCurrentChat(room)}
            isSearch={isSearch}
            setIsSearch={setIsSearch}
            updateRoomSock={(room) => setUpdateRoomState(room)}
            setFields={(_fields) => handleUpdateRoom(_fields)}
          />
        </div>
      </div>

      <Modal
        title={isCreateForm ? "Thêm nhóm mới" : "Cập nhật thông tin nhóm"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={false}
        maskClosable={false}
      >
        <Form
          name="basic"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          form={form}
        >
          <Form.Item
            label="Tên nhóm"
            name="title"
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              {
                required: true,
                message: "Please input your description!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <div style={{ display: "flex", gap: "20px" }}>
            <Upload
              listType="picture-card"
              showUploadList={false}
              onChange={handleUpload}
              beforeUpload={() => false}
            >
              <div className="ant-upload-text">Upload</div>
            </Upload>
            {avatar && (
              <img
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "12px",
                  objectFit: "cover",
                }}
                src={avatar}
                alt=""
              />
            )}
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loadingButton}>
              Đồng ý
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Home;
