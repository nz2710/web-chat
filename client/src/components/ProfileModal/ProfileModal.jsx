import React, { useState, useEffect } from "react";
import { Modal, useMantineTheme } from "@mantine/core";
import "./ProfileModal.css";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../actions/UserAction";
import * as UserApi from "../../api/UserRequests";
import { Upload, Button, message } from "antd";
import { storage } from "../../actions/UploadAction";

const ProfileModal = ({ modalOpened, setModalOpened, data }) => {
  const theme = useMantineTheme();
  const { password, ...other } = data;
  const [formData, setFormData] = useState(other);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.authReducer.authData);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const [messageApi] = message.useMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let result = null;
      if (fileAvatar) {
        const _avatar = await upFirebase(fileAvatar);
        setFormData({ ...formData, profilePicture: _avatar });
        result = await UserApi.updateUser(user._id, {
          ...formData,
          profilePicture: _avatar,
        });
      } else {
        result = await UserApi.updateUser(user._id, { ...formData });
      }
      dispatch(updateUser(result.data));
      messageApi.success("Update user thành công");
      setModalOpened(false);
    } catch (error) {
      messageApi.error("Có lỗi xảy ra khi update user");
    } finally {
      setLoading(false);
    }
  };

  const [avatar, setAvatar] = useState();
  const [fileAvatar, setFileAvatar] = useState(null);

  const handleUpload = (_) => {
    setAvatar(URL.createObjectURL(_.file));
    setFileAvatar(_.file);
  };

  useEffect(() => {
    setAvatar(user.profilePicture);
  }, []);

  return (
    <Modal
      overlayColor={
        theme.colorScheme === "dark"
          ? theme.colors.dark[9]
          : theme.colors.gray[2]
      }
      overlayOpacity={0.55}
      overlayBlur={3}
      size="55%"
      opened={modalOpened}
      closeOnClickOutside={false}
      onClose={() => setModalOpened(false)}
    >
      <form className="infoForm" onSubmit={handleSubmit}>
        <h3>Your Info</h3>
        <div>
          <input
            value={formData.firstname}
            onChange={handleChange}
            type="text"
            placeholder="First Name"
            name="firstname"
            className="infoInput"
          />
          <input
            value={formData.lastname}
            onChange={handleChange}
            type="text"
            placeholder="Last Name"
            name="lastname"
            className="infoInput"
          />
        </div>

        <div>
          <input
            value={formData.worksAt}
            onChange={handleChange}
            type="text"
            placeholder="Works at"
            name="worksAt"
            className="infoInput"
          />
        </div>
        <div style={{ display: "flex" }}>
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

        <div style={{ marginTop: "60px" }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Đồng ý
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileModal;
