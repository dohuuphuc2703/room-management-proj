import { ConfigProvider } from "antd";
import styles from "./AdminView.module.css";

import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { setAdminInfo } from "../../actions";
import SideBar from "../../components/Admin/SideBar/SideBar";

function AdminView() {
  const admin = useSelector(state => state.userReducer);
  const dispatch = useDispatch();

  console.log(admin)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/admin/info", {
          withCredentials: true,
        });
        if (res.data) {
          dispatch(
            setAdminInfo({
              uid: res.data.info._id,
              ...res.data.info.user,
            })
          );
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    if(!admin?._id){
      fetchUser();
    }
  }, [admin, dispatch]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            defaultHoverBg: "blue",
          },
          Select: {
            defaultActiveBg: "blue",
          },
        },
      }}
    >
      <div className={styles.container}>
        <SideBar />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </ConfigProvider>
  );
}

export default AdminView;
