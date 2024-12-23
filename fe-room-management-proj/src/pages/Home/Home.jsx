import { ConfigProvider, message } from "antd";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTenantInfo } from '../../actions';
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import styles from "./Home.module.css";

import { Outlet } from "react-router-dom";

function Home() {
  const user = useSelector(state => state.userReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/tenant/info", {
          withCredentials: true,
        });
        if (res.data) {
          dispatch(setTenantInfo({
            uid: res.data.info._id,
            ...res.data.info.user,
          }));
        }
      } catch (error) {
        message.error("Error fetching user:", error);
      }
    };

    if(!user?._id){
      fetchUser();
    }

  }, [user, dispatch]);
  
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
      <div>
        <Header user = {user}/>
        <div className={styles.content}>
          <Outlet />
        </div>
        <div
          className={styles.footer_main}
          style={{
            width: "1150px",
            // height: "170px",
            margin: "0 auto",
          }}
        >
          <Footer />
        </div>
      </div>
    </ConfigProvider>
  );
}

export default Home;