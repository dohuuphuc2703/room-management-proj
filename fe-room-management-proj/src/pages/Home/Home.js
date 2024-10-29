import Header from "../../components/Header/Header";
import styles from "./Home.module.css";
import { ConfigProvider } from "antd";

import Footer from "../../components/Footer/Footer";

import { Outlet } from "react-router-dom";

function Home() {
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
        <Header />
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