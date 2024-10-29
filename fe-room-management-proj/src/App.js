import { Route, Routes } from "react-router-dom";

import { ConfigProvider } from "antd";
import SignUpForm from "./components/SignUpForm/SignUpForm";
import { themes } from "./helper";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";


function App() {
  return (
    <div className="App">
      <ConfigProvider theme={themes}>
        <Routes>
          <Route path="" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUpForm />} />
        </Routes>
      </ConfigProvider>

    </div>
  );
}

export default App;
