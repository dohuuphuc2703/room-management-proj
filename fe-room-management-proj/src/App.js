import { Route, Routes } from "react-router-dom";

import { ConfigProvider } from "antd";
import SearchRoom from "./components/Tenant/SearchRoom/SearchRoom";
import { themes } from "./helper";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";


function App() {
  return (
    <div className="App">
      <ConfigProvider theme={themes}>
        <Routes>
          <Route path="" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/search" element={<SearchRoom />} />
        </Routes>
      </ConfigProvider>

    </div>
  );
}

export default App;
