import { ConfigProvider } from "antd";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTenantInfo } from '../../actions';
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import styles from "./LandlordView.module.css";

import { Outlet } from "react-router-dom";
import SideBar from "../../components/Landlord/SideBar/SideBar";

function LandlordView() {
  const user = useSelector(state => state.userReducer);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await axios.get("http://localhost:8000/api/tenant/info", {
//           withCredentials: true,
//         });
//         if (res.data) {
//           dispatch(setTenantInfo({
//             uid: res.data.info._id,
//             ...res.data.info.user,
//           }));
//         }
//       } catch (error) {
//         console.error("Error fetching user:", error);
//       }
//     };
  
//     if (user === null) {
//       fetchUser();
//     }
//   }, [dispatch, user]);

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
        {/* <Header 
            user={user}
        /> */}
        <SideBar />
        <div className={styles.content}>
          <Outlet />

          <h1>abc</h1>
        </div>

      </div>
    </ConfigProvider>
  );
}

export default LandlordView;