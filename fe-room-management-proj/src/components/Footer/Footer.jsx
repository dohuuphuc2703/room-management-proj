import React from "react";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top_section}>
        <div className={styles.logo_section}>
          <img src="/logo.png" alt="Phongtro123" className={styles.logo} />
          <p>Kênh thông tin phòng trọ số 1 Việt Nam</p>
          <p>
            Phongtro123.com tự hào có lượng dữ liệu bài đăng lớn nhất trong lĩnh
            vực cho thuê phòng trọ.
          </p>
        </div>
        <div className={styles.links_section}>
          <h4>Về PHONGTRO123.COM</h4>
          <ul>
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/gioi-thieu">Giới thiệu</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/quy-che-hoat-dong">Quy chế hoạt động</a></li>
            <li><a href="/quy-dinh-su-dung">Quy định sử dụng</a></li>
            <li><a href="/chinh-sach-bao-mat">Chính sách bảo mật</a></li>
            <li><a href="/lien-he">Liên hệ</a></li>
          </ul>
        </div>
        <div className={styles.support_section}>
          <h4>Hỗ trợ khách hàng</h4>
          <ul>
            <li><a href="/faq">Câu hỏi thường gặp</a></li>
            <li><a href="/huong-dan-dang-tin">Hướng dẫn đăng tin</a></li>
            <li><a href="/bang-gia-dich-vu">Bảng giá dịch vụ</a></li>
            <li><a href="/quy-dinh-dang-tin">Quy định đăng tin</a></li>
            <li><a href="/giai-quyet-khieu-nai">Giải quyết khiếu nại</a></li>
          </ul>
        </div>
        <div className={styles.social_section}>
          <h4>Liên hệ với chúng tôi</h4>
          <div className={styles.social_icons}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img src="/facebook.png" alt="Facebook" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <img src="/youtube.png" alt="YouTube" />
            </a>
            <a href="https://zalo.me" target="_blank" rel="noopener noreferrer">
              <img src="/zalo.png" alt="Zalo" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <img src="/twitter.png" alt="Twitter" />
            </a>
          </div>
          <h4>Phương thức thanh toán</h4>
          <div className={styles.payment_methods}>
            <img src="/momo.png" alt="Momo" />
            <img src="/visa.png" alt="Visa" />
            <img src="/mastercard.png" alt="MasterCard" />
            <img src="/jcb.png" alt="JCB" />
            <img src="/ib.png" alt="Internet Banking" />
            <img src="/tienmat.png" alt="Tiền mặt" />
          </div>
        </div>
      </div>
      <div className={styles.bottom_section}>
        <p>Copyright © 2015 - 2024 Phongtro123.com</p>
        <p>CÔNG TY TNHH LBKCORP - Tổng đài CSKH: 0917686101</p>
      </div>
    </footer>
  );
}

export default Footer;
