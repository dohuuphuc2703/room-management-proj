const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");

async function createPDFFromHTML(contract, tenant, landlord, room) {
  try {
    // Đảm bảo thư mục chứa file PDF tồn tại

    // Tạo file tạm thời, nhưng không cần sử dụng tên mặc định
    const tempFile = tmp.tmpNameSync({ postfix: '.pdf' }); 

    // HTML content mà bạn sẽ chuyển thành PDF
    const createdAt = new Date(contract.createdAt);
    const start_date = new Date(contract.start_date);
    const formattedCreatedAt = `ngày ${createdAt.getDate()} tháng ${createdAt.getMonth() + 1} năm ${createdAt.getFullYear()}`;
    const formattedStart_date = `ngày ${start_date.getDate()} tháng ${start_date.getMonth() + 1} năm ${start_date.getFullYear()}`;

    console.log("contract.createdAt:", contract.createdAt);
    console.log("createdAt:", createdAt);
    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hợp Đồng Thuê Nhà/Phòng</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            /* padding: 20px; */
            
        }
        .container {
        /* width: 80%; */
        margin-left: 80px;
        margin-right: 80px;
        background-color: #fff;
        padding: 20px;
      }

        .contract-header {
            text-align: center;
            margin-bottom: 30px;
        }

        .contract-header h1 {
            font-size: 24px;
            margin: 0;
        }

        .contract-header p {
            font-size: 16px;
            margin: 5px 0;
        }

        .section-title {
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        .section-content {
            margin-bottom: 20px;
        }

        .indent {
            margin-left: 20px;
        }

        .contract-footer {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
        }

        .signatures {
            text-align: center;
        }

        .signatures p {
            margin-top: 50px;
        }
        .align-right {
            text-align: right;
            margin-right: 20px;
        }
    </style>
</head>
<body>

    <div class="container">

        <div class="contract-header">
            <h2>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
            <p>Độc lập - Tự do - Hạnh phúc</p>
            <p class="align-right">Hà Nội, ${formattedCreatedAt}</p>
            <h2>HỢP ĐỒNG THUÊ NHÀ</h2>
            <h5>${contract._id}</h5>
        </div>
    
        <div class="section-content">
            <p><strong>Căn cứ:</strong></p>
            <ul>
                <li>Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;</li>
                <li>Luật Thương mại số 36/2005/QH11 ngày 14 tháng 06 năm 2005;</li>
                <li>Căn cứ vào nhu cầu và sự thỏa thuận của các bên tham gia Hợp đồng;</li>
            </ul>
        </div>
    
        <div class="section-content">
            <p><strong>Hôm nay, ${formattedCreatedAt}, các Bên gồm:</strong></p>
    
            <p class="section-title">BÊN CHO THUÊ (Bên A):</p>
            <p class="indent">Ông/Bà: ${landlord.user.fullName}</p>
            <p class="indent">CMND số: ................ Cơ quan cấp:………...……….. Ngày cấp:..............</p>
            <p class="indent">Nơi ĐKTT: .......................................................................................</p>
    
            <p class="section-title">BÊN THUÊ (Bên B):</p>
            <p class="indent">Ông/Bà: ${tenant.user.fullName}</p>
            <p class="indent">CMND số: ................ Cơ quan cấp…………...……….. Ngày cấp:..............</p>
            <p class="indent">Nơi ĐKTT: .......................................................................................</p>
    
            <p>Bên A và Bên B sau đây gọi chung là “Hai Bên” hoặc “Các Bên”.</p>
        </div>
    
        <div class="section-content">
            <p><strong>Điều 1. Nhà ở và các tài sản cho thuê kèm theo nhà ở:</strong></p>
            <ul>
                <li>Bên A đồng ý cho Bên B thuê và Bên B cũng đồng ý thuê quyền sử dụng đất và một căn phòng/nhà gắn liền với quyền sử dụng đất tại địa chỉ ${room.address.detail}, ${room.address.ward}, ${room.address.district}, ${room.address.province}  để sử dụng làm nơi để ở.</li>
                <li>Diện tích quyền sử dụng đất: ${room.acreage}m2;</li>
                <li>Diện tích căn nhà/phòng: ${room.acreage}m2;</li>
                <li>Bên A cam kết quyền sử dụng đất và căn nhà gắn liền trên đất là tài sản sở hữu hợp pháp của Bên A. Mọi tranh chấp phát sinh từ tài sản cho thuê trên Bên A hoàn toàn chịu trách nhiệm trước pháp luật.</li>
            </ul>
        </div>
    
        <div class="section-content">
            <p><strong>Điều 2. Bàn giao và sử dụng diện tích thuê:</strong></p>
            <ul>
                <li>2.1. Thời điểm Bên A bàn giao tài sản thuê vào ${formattedStart_date};</li>
                <li>2.2. Bên B được toàn quyền sử dụng tài sản thuê kể từ thời điểm được Bên A bàn giao từ thời điểm quy định tại Mục 2.1 trên đây.</li>
            </ul>
        </div>
    
        <div class="section-content">
            <p><strong>Điều 3. Thời hạn thuê:</strong></p>
            <ul>
                <li>3.1. Bên A cam kết cho Bên B thuê tài sản thuê với thời hạn là 6 tháng kể từ ngày bàn giao Tài sản thuê;</li>
                <li>3.2. Hết thời hạn thuê nêu trên nếu Bên B có nhu cầu tiếp tục sử dụng thì Bên A phải ưu tiên cho Bên B tiếp tục thuê.</li>
            </ul>
        </div>
    
        <div class="section-content">
            <p><strong>Điều 4. Đặc cọc tiền thuê nhà:</strong></p>
            <ul>
                <li>4.1. Bên B sẽ giao cho Bên A một khoản tiền là ${room.price} VNĐ (bằng chữ: ...............................................) ngay sau khi ký hợp đồng này.</li>
                <li>4.2. Nếu Bên B đơn phương chấm dứt hợp đồng mà không thực hiện nghĩa vụ báo trước tới Bên A thì Bên A sẽ không phải hoàn trả lại Bên B số tiền đặt cọc này.</li>
                <li>4.3. Tiền đặt cọc của Bên B sẽ không được dùng để thanh toán tiền thuê.</li>
                <li>4.4. Vào thời điểm kết thúc thời hạn thuê hoặc kể từ ngày chấm dứt Hợp đồng, Bên A sẽ hoàn lại cho Bên B số tiền đặt cọc sau khi đã khấu trừ khoản tiền chi phí để khắc phục thiệt hại (nếu có).</li>
            </ul>
        </div>
    
        <div class="section-content">
            <p><strong>Điều 5. Tiền thuê nhà:</strong></p>
            <ul>
                <li>5.1. Tiền thuê nhà đối với diện tích thuê nêu tại mục 1.1 Điều 1 là: ${room.price}  VNĐ/tháng (Bằng chữ: ...........................................)</li>
                <li>5.2. Tiền thuê nhà không bao gồm chi phí khác như tiền điện, nước, vệ sinh.... Khoản tiền này sẽ do Bên B trả theo khối lượng, công suất sử dụng thực tế của Bên B hàng tháng, được tính theo đơn giá của nhà nước.</li>
            </ul>
        </div>
    
        <div class="section-content">
            <p><strong>Điều 6. Phương thức thanh toán tiền thuê nhà:</strong></p>
            <p>Tiền thuê nhà được thanh toán theo 01 (một) tháng/lần vào ngày 05 (năm) hàng tháng. Các chi phí khác được Bên B tự thanh toán với các cơ quan, đơn vị có liên quan khi được yêu cầu.</p>
        </div>
    
        <div class="contract-footer">
            <div class="signatures">
                <p>BÊN CHO THUÊ</p>
                <h3>${landlord.user.fullName}</h3>
                <p>(ký và ghi rõ họ tên)</p>
            </div>
            <div class="signatures">
                <p>BÊN THUÊ</p>
                <p>(ký và ghi rõ họ tên)</p>
            </div>
        </div>

    </div>


</body>
</html>



      `;

    // Sử dụng một thư viện như 'puppeteer' hoặc 'html-pdf-chrome' để chuyển HTML thành PDF và lưu file
    // Ví dụ sử dụng puppeteer:
    const pdf = await puppeteer.launch();
    const page = await pdf.newPage();
    await page.setContent(htmlContent);
    await page.pdf({ path: tempFile });

    await pdf.close();

    return tempFile ;
  } catch (error) {
    console.error("Error creating PDF:", error);
    throw new Error("Error creating PDF");
  }
}

module.exports = { createPDFFromHTML };
