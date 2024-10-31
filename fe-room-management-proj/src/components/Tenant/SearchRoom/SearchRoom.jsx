// Import necessary modules and components
import { Button, Form, Input, message, Select } from "antd";
import ListRoom from "../../ListRoom/ListRoom";
import styles from "./SearchRoom.module.css";
import { useEffect, useState } from "react";
import axios from "axios";

function SearchRoom() {
  const [address, setAddress] = useState("Tất cả địa điểm");
  const [category, setCategory] = useState("Tất cả loại phòng");

  const [messageApi, contextHolder] = message.useMessage();
  const [addresses, setAddresses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [totalItems, setTotalItems] = useState(0);

  const [form] = Form.useForm();

  const handleChangeLocation = (value) => {
    setAddress(value);
  };

  const handleChangeCategory = (value) => {
    setCategory(value);
  };

  const handleSearchRoom = async (page = 1, pageSize = 3) => {
    form
      .validateFields()
      .then(async (values) => {
        const payload = {};
        payload.q = values.q || "";
        payload.address = values.address === "Tất cả địa điểm" ? "" : values.address || "";
        payload.category = values.category === "Tất cả loại phòng" ? "" : values.category || "";

        try {
          const res = await axios.get(
            `http://localhost:8000/api/room/search?q=${payload.q}&address=${payload.address}&category=${payload.category}&page=${page}&size=${pageSize}`
          );
          setRooms(res.data.rooms);
          setTotalItems(res.data.info.total);
          setPage(res.data.info.page);
          setPageSize(res.data.info.size);
          setIsSearch(true);
        } catch (err) {
          console.error(err);
          messageApi.error("Có lỗi xảy ra: " + err?.response?.data?.message);
        } finally {
          window.scrollTo({
            top: 284,
            behavior: "smooth",
          });
        }
      });
  };

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:8000/api/room-category/all"),
      axios.get("https://vapi.vnappmob.com/api/province/"),
    ]).then(([resRoomCates, resCities]) => {
      resCities.data.results.unshift({
        province_name: "Tất cả địa điểm",
      });

      setAddresses(
        resCities.data.results.map((city) => ({
          label: city.province_name,
          value: city.province_name,
        }))
      );

      resRoomCates.data.categories.unshift({
        _id: 0,
        category: "Tất cả loại phòng",
      });

      setCategories(
        resRoomCates.data.categories.map((category) => ({
          label: category.category,
          value: category._id,
        }))
      );
    });
  }, []);

  return (
    <div className={styles.pages_room_search}>
      {contextHolder}
      <div className={styles.section_header}>
        <div className={styles.content}>
          <h1>Tìm phòng cho thuê nhanh 24h, phòng mới nhất trên toàn quốc</h1>
          <p>
            Tiếp cận <span className={styles.highlight}>40,000+</span> tin cho thuê phòng mỗi ngày từ hàng nghìn chủ nhà uy tín tại Việt Nam
          </p>

          <Form form={form}>
            <div className={styles.search_container}>
              <div className={styles.search_room}>
                <Form.Item name="q">
                  <Input placeholder="Mô tả" className={styles.search_room_input} />
                </Form.Item>
              </div>
              <div className={styles.search_room}>
                <Form.Item name="address" initialValue={address}>
                  <Select onChange={handleChangeLocation} className={styles.search_location}>
                    {addresses.map((loc) => (
                      <Select.Option key={loc.value} value={loc.value}>
                        {loc.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className={styles.search_room}>
                <Form.Item name="category" initialValue={category}>
                  <Select onChange={handleChangeCategory} className={styles.search_location}>
                    {categories.map((cat) => (
                      <Select.Option key={cat.value} value={cat.value}>
                        {cat.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <Button className={styles.btn_search} onClick={() => handleSearchRoom()}>
                Tìm kiếm
              </Button>
            </div>
          </Form>
        </div>
      </div>
      <div className={styles.list_room}>
        <div className={styles.title_list_room}>
          <h2>Phòng cho thuê tốt nhất</h2>
        </div>
        <div className={styles.list_room_content}>
          <ListRoom
            rooms={rooms}
            setRooms={setRooms}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalItems={totalItems}
            setTotalItems={setTotalItems}
            messageApi={messageApi} 
            handleSearchRoom={handleSearchRoom}
            isSearch={isSearch}
          />
        </div>
      </div>
    </div>
  );
}

export default SearchRoom;
