import { ConfigProvider } from "antd";
import React from "react";
import { useSelector } from "react-redux";
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
        <SideBar user={user}/>
        <div className={styles.content}>
          <Outlet />
        </div>

      </div>
    </ConfigProvider>
  );
}

export default LandlordView;