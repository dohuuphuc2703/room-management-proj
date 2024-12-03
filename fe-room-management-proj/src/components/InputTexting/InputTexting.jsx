import { Button, Col, Input, Row} from "antd";
import { RiSendPlane2Fill } from "react-icons/ri";

import { useState } from "react";

import styles from "./InputTexting.module.css";


function InputTexting({ handleSendMessage }) {
  const [message, setMessage] = useState("");

  return (
    <div className={styles.texting}>
      <Row justify="space-between" align="middle">
        <Col span={22}>
          <Input type="text" placeholder="Tin nhắn" className={styles.inputMessage}
            value={message}
            autoFocus
            onChange={(e) => setMessage(e.target.value)}
            onPressEnter={() => {
              handleSendMessage(message);
              setMessage("");
            }}
          />
        </Col>

        <Col>
          <Button
            icon={<RiSendPlane2Fill />}
            htmlType="submit"
            disabled={!message.trim()}
            className={styles.send}
            onClick={() => {
              handleSendMessage(message);
              setMessage("");
            }}
          ></Button>
        </Col>
      </Row>
    </div>
  )
}

export default InputTexting;