import { Button, Form, Input, message, Select, Modal } from "antd";
import ListRoom from "../../ListRoom/ListRoom";
import styles from "./SearchRoom.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

function SearchRoom() {
  const [province, setProvince] = useState("Tất cả tỉnh");
  const [district, setDistrict] = useState("Tất cả quận");
  const [ward, setWard] = useState("Tất cả phường");
  const [category, setCategory] = useState("Tất cả loại phòng");
  const [minArea, setMinArea] = useState(0);
  const [maxArea, setMaxArea] = useState(100);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [totalItems, setTotalItems] = useState(0);

  const [form] = Form.useForm();

  const handleChangeProvince = async (value) => {
    const selectedProvince = provinces.find(prov => prov.value === value);
    setProvince(selectedProvince ? selectedProvince.label : "Tất cả tỉnh");
    setDistrict("Tất cả quận");
    setWard("Tất cả phường");

    // Lấy danh sách quận dựa trên tỉnh đã chọn
    try {
      const res = await axios.get(`https://vapi.vnappmob.com/api/province/district/${value}`);
      setDistricts(res.data.results.map(d => ({ label: d.district_name, value: d.district_id })));
    } catch (error) {
      console.error(error);
      messageApi.error("Có lỗi khi tải danh sách quận.");
    }
  };

  const handleChangeDistrict = async (value) => {
    const selectedDistrict = districts.find(d => d.value === value);
    setDistrict(selectedDistrict ? selectedDistrict.label : "Tất cả quận");
    setWard("Tất cả phường");

    // Lấy danh sách phường dựa trên quận đã chọn
    try {
      const res = await axios.get(`https://vapi.vnappmob.com/api/province/ward/${value}`);
      setWards(res.data.results.map(w => ({ label: w.ward_name, value: w.ward_id })));
    } catch (error) {
      console.error(error);
      messageApi.error("Có lỗi khi tải danh sách phường.");
    }
  };

  const handleChangeWard = async (value) => {
    const selectedWard = wards.find(w => w.value === value);
    setWard(selectedWard ? selectedWard.label : "Tất cả phường");
  };

  const handleChangeCategory = (value) => {
    const selectedCategory = categories.find(cat => cat.value === value);
    setCategory(selectedCategory ? selectedCategory.label : "Tất cả loại phòng");
  };

  const handleSearchRoom = async (page = 1, pageSize = 3) => {
    form.validateFields().then(async (values) => {
      const payload = {
        province: province === "Tất cả tỉnh" ? "" : province,
        district: district === "Tất cả quận" ? "" : district,
        ward: ward === "Tất cả phường" ? "" : ward,
        category: values.category === "Tất cả loại phòng" || values.category === 0 ? "" : values.category,
        minArea: minArea,
        maxArea: maxArea,
        minPrice: minPrice,
        maxPrice: maxPrice,
      };
      console.log("Payload gửi đi:", payload);
      try {
        const res = await axios.get(
          `http://localhost:8000/api/room/search?province=${payload.province}&district=${payload.district}&ward=${payload.ward}&category=${payload.category}&minArea=${payload.minArea}&maxArea=${payload.maxArea}&minPrice=${payload.minPrice}&maxPrice=${payload.maxPrice}&page=${page}&size=${pageSize}`
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
        window.scrollTo({ top: 284, behavior: "smooth" });
      }
    });
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    handleSearchRoom();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  

  useEffect(() => {
    // Lấy danh sách tỉnh và loại phòng
    Promise.all([
      axios.get("https://vapi.vnappmob.com/api/province/"),
      axios.get("http://localhost:8000/api/room-category/all"),
    ]).then(([resCities, resRoomCates]) => {
      resCities.data.results.unshift({ province_name: "Tất cả tỉnh", province_id: "" });
      setProvinces(resCities.data.results.map(city => ({ label: city.province_name, value: city.province_id })));

      resRoomCates.data.categories.unshift({ _id: 0, category: "Tất cả loại phòng" });
      setCategories(resRoomCates.data.categories.map(category => ({ label: category.category, value: category._id })));
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
                <Form.Item name="category" initialValue={category}>
                  <Select onChange={handleChangeCategory} className={styles.search_location}>
                    {categories.map(cat => (
                      <Select.Option key={cat.value} value={cat.value}>
                        {cat.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className={styles.search_room}>
                <Form.Item name="province" initialValue={province}>
                  <Select onChange={handleChangeProvince} className={styles.search_location}>
                    {provinces.map(loc => (
                      <Select.Option key={loc.value} value={loc.value}>
                        {loc.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className={styles.search_room}>
                <Form.Item name="district" initialValue={district}>
                  <Select onChange={handleChangeDistrict} className={styles.search_location}>
                    {districts.map(d => (
                      <Select.Option key={d.value} value={d.value}>
                        {d.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className={styles.search_room}>
                <Form.Item name="ward" initialValue={ward}>
                  <Select onChange={handleChangeWard} className={styles.search_location}>
                    {wards.map(w => (
                      <Select.Option key={w.value} value={w.value}>
                        {w.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Button className={styles.btn_search} onClick={showModal}>
                Chọn diện tích và giá
              </Button>

              <Button className={styles.btn_search} onClick={handleSearchRoom}>
                Tìm kiếm
              </Button>
            </div>
          </Form>

          <Modal title="Chọn diện tích và giá" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            <div>
              <p>Chọn diện tích từ (m³)</p>
              <Slider
                range
                min={0}
                max={100}
                value={[minArea, maxArea]}
                onChange={(value) => {
                  setMinArea(value[0]);
                  setMaxArea(value[1]);
                }}
              />
              <p>Chọn giá từ (VNĐ)</p>
              <Slider
                range
                min={0}
                max={10000000}
                value={[minPrice, maxPrice]}
                onChange={(value) => {
                  setMinPrice(value[0]);
                  setMaxPrice(value[1]);
                }}
              />
            </div>
          </Modal>
        </div>
      </div>
      <div className={styles.list_room}>
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
