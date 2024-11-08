import { Route, Routes } from "react-router-dom";

import { ConfigProvider } from "antd";
import AccountManagement from "./components/Tenant/Account/AccountManagement";
import ListSavedRooms from "./components/Tenant/ListSavedRooms/ListSavedRooms";
import RoomDetail from "./components/Tenant/RoomDetail/RoomDetail";
import SearchRoom from "./components/Tenant/SearchRoom/SearchRoom";
import { themes } from "./helper";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
// import SideBar from "./components/Landlord/SideBar/SideBar";
import LandlordView from "./pages/LandlordView/LandlordView";

function App() {
  return (
    <div className="App">
      <ConfigProvider theme={themes}>
        <Routes>
          <Route path="" element={<Home />}>
            <Route path="/" element={<SearchRoom />} />
            <Route path="/detail-room/:roomId" element={<RoomDetail />} />
            <Route path="/account" element={<AccountManagement />} />
            <Route path="/saved-rooms" element={<ListSavedRooms />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/search" element={<SearchRoom />} />
          
          <Route path="/landlord" element={<LandlordView />} />
        </Routes>
      </ConfigProvider>

    </div>
  );
}

export default App;
