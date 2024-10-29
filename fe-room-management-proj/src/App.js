import { Route, Routes } from "react-router-dom";

import { ConfigProvider } from "antd";
import { themes } from "./helper";
import Home from "./pages/Home/Home";


function App() {
  return (
    <div className="App">
      <ConfigProvider theme={themes}>
        <Routes>
          <Route path="/home" element={<Home />} />
        </Routes>
      </ConfigProvider>

    </div>
  );
}

export default App;
