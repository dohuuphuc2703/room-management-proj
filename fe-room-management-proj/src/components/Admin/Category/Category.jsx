import { DeleteOutlined, EditOutlined } from '@ant-design/icons'; // Import icons từ Ant Design
import { Button, Form, Input, message, Modal, Popconfirm, Select, Table } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

const { Option } = Select;

const Category = () => {
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategory();
  }, [page, size]);

  const fetchCategory = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/admin/list-category`, {
        withCredentials: true,
        params: {
          page,
          size,
        },
      });
      setCategory(res.data.data || []);
      setTotal(res.data.pagination.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (values) => {
    setIsSubmitting(true);
    try {
      // Gửi dữ liệu với body chứa category và description
      await axios.post(
        `http://localhost:8000/api/admin/new-category`,
        {
          category: values.category,  // giá trị từ form
          description: values.description, // giá trị từ form
        },
        {
          withCredentials: true,
        }
      );
      message.success("Tạo mới category thành công!");
      fetchCategory();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => (page - 1) * size + index + 1,
    },
    {
      title: "Tên",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },

  ];

  return (
    <div>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setIsModalVisible(true)}>
        Tạo mới category
      </Button>
      <Table
        columns={columns}
        dataSource={category}
        loading={loading}
        rowKey="_id"
        pagination={{
          current: page,
          pageSize: size,
          total: total,
          onChange: (currentPage, pageSize) => {
            setPage(currentPage);
            setSize(pageSize);
          },
        }}
      />

      <Modal
        title="Tạo mới category"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCategory}>
          <Form.Item
            label="Tên category"
            name="category"
            rules={[{ required: true, message: "Vui lòng nhập tên category!" }]}
          >
            <Input placeholder="Nhập tên category" />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Tạo mới
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Category;
