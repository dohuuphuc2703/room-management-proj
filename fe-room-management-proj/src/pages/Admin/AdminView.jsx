import { ConfigProvider } from "antd";
import styles from "./AdminView.module.css";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import SideBar from "../../components/Admin/SideBar/SideBar";

function AdminView() {
  const admin = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await axios.get("http://localhost:8000/api/admin/info", {
//           withCredentials: true,
//         });
//         if (res.data) {
//           dispatch(
//             setAdminInfo({
//               uid: res.data.info._id,
//               ...res.data.info.user,
//             })
//           );
//         }
//       } catch (error) {
//         console.error("Error fetching user:", error);
//       }
//     };

//     if (admin === null) {
//       fetchUser();
//     }
//   }, [dispatch, admin]);

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
        <SideBar admin={admin} />
        <div className={styles.content}>
          {admin ? (
            <Outlet context={{ admin }} />
          ) : (
            <p>Loading admin information...</p>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
}

export default AdminView;
