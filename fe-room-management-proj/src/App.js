import { Route, Routes } from "react-router-dom";
import './App.css';

import { ConfigProvider } from "antd";
import { themes } from "./helper";

function App() {
  return (
    <div className="App">
      <ConfigProvider theme={themes}>
        <Routes>

        </Routes>
      </ConfigProvider>

    </div>
  );
}

export default App;
