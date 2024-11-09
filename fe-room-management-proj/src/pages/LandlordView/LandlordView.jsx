import { ConfigProvider } from "antd";
import styles from "./LandlordView.module.css";

import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { setLandlordInfo } from '../../actions';
import SideBar from "../../components/Landlord/SideBar/SideBar";

function LandlordView() {
  const user = useSelector(state => state.userReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/landlord/info", {
          withCredentials: true,
        });
        if (res.data) {
          dispatch(setLandlordInfo({
            uid: res.data.info._id,
            ...res.data.info.user,
          }));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
  
    if (user === null) {
      fetchUser();
    }
  }, [dispatch, user]);

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
        <SideBar user={user} />
        <div className={styles.content}>
          <Outlet />
        </div>

      </div>
    </ConfigProvider>
  );
}

export default LandlordView;