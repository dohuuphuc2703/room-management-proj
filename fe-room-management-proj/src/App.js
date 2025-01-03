import { Route, Routes } from "react-router-dom";

import socketClient from "socket.io-client";

import { ConfigProvider } from "antd";
import AdminStatistical from "./components/Admin/AdminStatistical/AdminStatistical";
import Category from "./components/Admin/Category/Category";
import LandlordManage from "./components/Admin/LandlordManage/LandlordManage";
import TenantManage from "./components/Admin/TenantManage/TenantManage";
import AccountLandlord from "./components/Landlord/Account/AccountLandlord";
import ContractIndex from "./components/Landlord/Contract/ContractIndex/ContractIndex";
import CreateContract from "./components/Landlord/Contract/CreateContract/CreateContract";
import InvoiceIndex from "./components/Landlord/Invoice/InvoiceIndex/InvoiceIndex";
import NewInvoice from "./components/Landlord/Invoice/NewInvoice/NewInvoice";
import LandlordChat from "./components/Landlord/LandlordChat/LandlordChat";
import CreateRoom from "./components/Landlord/ManageRoom/CreateRoom/CreateRoom";
import LandlordListRoom from "./components/Landlord/ManageRoom/RoomIndex/RoomIndex";
import Statistical from "./components/Landlord/Statistical/Statistical";
import AccountManagement from "./components/Tenant/Account/AccountManagement";
import Chat from "./components/Tenant/Chat/Chat";
import ListSavedRooms from "./components/Tenant/ListSavedRooms/ListSavedRooms";
import MyRoom from "./components/Tenant/MyRoom/MyRoom";
import RoomDetail from "./components/Tenant/RoomDetail/RoomDetail";
import SearchRoom from "./components/Tenant/SearchRoom/SearchRoom";
import { themes } from "./helper";
import AdminView from "./pages/Admin/AdminView";
import Home from "./pages/Home/Home";
import LandlordView from "./pages/LandlordView/LandlordView";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
import VerifyContract from "./pages/VerifyContract/VerifyContract";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";

const socket = socketClient("http://127.0.0.1:8000", {
  reconnectionAttempts: 5,
  reconnectionDelay: 10000,
  reconnection: true,
  connectionStateRecovery: {
    maxDisconnectionDuration: 3 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
  query: {
    uid: new Date().getTime(),
  }
});

function App() {
  return (
    <div className="App">
      <ConfigProvider theme={themes}>
        <Routes>
          <Route path="/verify/:status" element={<VerifyEmail />} />
          <Route path="/verify-contract/success" element={<VerifyContract />} />
          <Route path="" element={<Home socket={socket}/>}>
            <Route path="/" element={<SearchRoom />} />
            <Route path="/detail-room/:roomId" element={<RoomDetail />} />
            <Route path="/account" element={<AccountManagement />} />
            <Route path="/saved-rooms" element={<ListSavedRooms />} />
            <Route path="/my-room" element={<MyRoom />} />
            <Route path="/chat" element={<Chat socket={socket}/>} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/search" element={<SearchRoom />} />
          
          <Route path="/landlord" element={<LandlordView />}>
            <Route path="statistical" element={<Statistical />} />
            <Route path="createRoom" element={<CreateRoom />} />
            <Route path="rooms" element={<LandlordListRoom />} />
            <Route path="contract" element={<ContractIndex />} />
            <Route path="createContract" element={<CreateContract socket={socket} />} />
            <Route path="invoice" element={<InvoiceIndex />} />
            <Route path="newInvoice" element={<NewInvoice socket={socket} />} />
            <Route path="account" element={<AccountLandlord />} />
            <Route path="chat" element={<LandlordChat socket={socket}/>} />
          </Route>
          <Route path="/admin" element={<AdminView />}>
            <Route path="statistical" element={<AdminStatistical />} />
            <Route path="landlord-manage" element={<LandlordManage />} />
            <Route path="tenant-manage" element={<TenantManage />} />
            <Route path="category-manage" element={<Category />} />
          </Route >
        </Routes>
      </ConfigProvider>

    </div>
  );
}

export default App;
