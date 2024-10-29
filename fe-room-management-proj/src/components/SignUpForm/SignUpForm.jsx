import React, { useState } from 'react';
import styles from './SignUpForm.module.css';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    accountType: 'TÌM KIẾM',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
  };

  return (
    <form className={styles.signUpForm} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Tạo tài khoản mới</h2>
      
      <label className={styles.label} htmlFor="name">Họ Tên</label>
      <input
        className={styles.input}
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
      />

      <label className={styles.label} htmlFor="phone">E-mail</label>
      <input
        className={styles.input}
        type="text"
        id="phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />

      <label className={styles.label} htmlFor="password">Tạo Mật Khẩu</label>
      <input
        className={styles.input}
        type="password"
        id="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
      />

      <label className={styles.label} htmlFor="password">Xác Nhận Mật Khẩu</label>
      <input
        className={styles.input}
        type="password"
        id="confirm-password"
        name="confirm-password"
        value={formData.password}
        onChange={handleChange}
      />

      <label className={styles.label}>Loại Tài Khoản</label>
      <div className={styles.accountTypeContainer}>
        <label>
          <input
            type="radio"
            name="accountType"
            value="NGƯỜI DÙNG"
            checked={formData.accountType === 'NGƯỜI DÙNG'}
            onChange={handleChange}
          />
          Người dùng
        </label>
        <label>
          <input
            type="radio"
            name="accountType"
            value="CHO THUÊ"
            checked={formData.accountType === 'CHO THUÊ'}
            onChange={handleChange}
          />
          Cho thuê
        </label>
      </div>

      <button className={styles.submitButton} type="submit">Tạo tài khoản</button>
      
      <p className={styles.agreementText}>
        Bấm vào nút đăng ký tức là bạn đã đồng ý với <a href="#terms">quy định sử dụng</a> của chúng tôi
      </p>
    </form>
  );
};

export default SignUpForm;
