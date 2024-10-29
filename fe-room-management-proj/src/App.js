import { Route, Routes } from "react-router-dom";

import { ConfigProvider } from "antd";
import SignUpForm from "./components/SignUpForm/SignUpForm";
import { themes } from "./helper";
import Home from "./pages/Home/Home";


function App() {
  return (
    <div className="App">
      <ConfigProvider theme={themes}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/sign-up" element={<SignUpForm />} />
        </Routes>
      </ConfigProvider>

    </div>
  );
}

export default App;
