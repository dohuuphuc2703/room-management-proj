import { Button, Form, Input, InputNumber, Select } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const { Option } = Select;

const CreateInvoiceForm = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newElectricIndex, setNewElectricIndex] = useState(null);
  const [newWaterIndex, setNewWaterIndex] = useState(null);
  const [totalServices, setTotalServices] = useState([]);

  useEffect(() => {
    // Fetch rooms with status "rented"
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/room/by-landlord`, {
            params: {
              status: "rented",
            },
            withCredentials: true,
          });
        setRooms(response.data.rooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  const handleRoomChange = (roomId) => {
    const room = rooms.find((r) => r._id === roomId);
    setSelectedRoom(room);
  };

  const calculateTotalAmount = () => {
    if (!selectedRoom) return;

    const electricAmount = (newElectricIndex - selectedRoom.electric.old) * selectedRoom.electric.price;
    const waterAmount = (newWaterIndex - selectedRoom.water.old) * selectedRoom.water.price;

    const updatedServices = [
      {
        name: 'Electric',
        quantity: newElectricIndex - selectedRoom.electric.old,
        totalAmount: electricAmount,
      },
      {
        name: 'Water',
        quantity: newWaterIndex - selectedRoom.water.old,
        totalAmount: waterAmount,
      },
      ...selectedRoom.servicerooms.map((service) => ({
        name: service.name,
        quantity: 1,
        totalAmount: service.price,
      })),
    ];

    setTotalServices(updatedServices);
  };

  const handleSubmit = async (values) => {
    const invoiceData = {
      contract: selectedRoom.contract, // Assuming contract is associated with room
      title: values.title,
      totalOfSv: totalServices,
    };

    try {
      await axios.post('/api/invoices', invoiceData);
      alert('Invoice created successfully!');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice.');
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit}>
      <Form.Item label="Select Room" name="room" rules={[{ required: true, message: 'Please select a room!' }]}>
        <Select placeholder="Select a room" onChange={handleRoomChange}>
          {rooms.map((room) => (
            <Option key={room._id} value={room._id}>{room.title}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="New Electric Index" name="electricIndex" rules={[{ required: true, message: 'Please input the new electric index!' }]}>
        <InputNumber min={0} onChange={(value) => setNewElectricIndex(value)} />
      </Form.Item>

      <Form.Item label="New Water Index" name="waterIndex" rules={[{ required: true, message: 'Please input the new water index!' }]}>
        <InputNumber min={0} onChange={(value) => setNewWaterIndex(value)} />
      </Form.Item>

      <Button type="primary" onClick={calculateTotalAmount} style={{ marginBottom: '20px' }}>
        Calculate Total Amount
      </Button>

      {totalServices.length > 0 && (
        <div>
          <h3>Total Services Breakdown:</h3>
          <ul>
            {totalServices.map((service, index) => (
              <li key={index}>{service.name}: Quantity - {service.quantity}, Total Amount - {service.totalAmount.toFixed(2)}</li>
            ))}
          </ul>
        </div>
      )}

      <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please input the invoice title!' }]}>
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Create Invoice
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateInvoiceForm;
