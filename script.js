const ringImg = new Image();
ringImg.src = "./rings/ring1.png";

document.addEventListener('DOMContentLoaded', function () {
  const video = document.getElementById('webcam');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const toggleCamBtn = document.getElementById('toggleCam');

  let model, webcamStream, isCamOn = false;

  const categoryButtons = document.querySelectorAll('.category-selector button');
  const productTitle = document.querySelector('.product-list h4');

  const products = {
  rings: [
      { name: "Nhẫn Kim Cương", price: "12.500.000 VND", img: "./rings/ring1.png" },
      { name: "Nhẫn Bạc Đơn Giản", price: "1.200.000 VND", img: "./rings/ring2.png" },
      { name: "Nhẫn Vàng Hồng", price: "8.900.000 VND", img: "./rings/ring3.png" },
      { name: "Nhẫn Vàng 18K", price: "15.900.000 VND", img: "./rings/ring4.png" },
      { name: "Nhẫn Cưới Cao Cấp", price: "22.000.000 VND", img: "./rings/ring5.png" }
  ],
  necklaces: [
      { name: "Vòng cổ Bạc", price: "2.500.000 VND", img: "./necklaces/necklace1.png" },
      { name: "Vòng cổ Kim Cương", price: "15.500.000 VND", img: "./necklaces/necklace2.png" },
      { name: "Vòng cổ Vàng", price: "9.500.000 VND", img: "./necklaces/necklace3.png" },
      { name: "Vòng cổ Ruby", price: "17.000.000 VND", img: "./necklaces/necklace4.png" },
      { name: "Vòng cổ Ngọc trai", price: "7.500.000 VND", img: "./necklaces/necklace5.png" }
  ]
};

let currentProducts = products.rings; 

  categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
          // Xóa active khỏi tất cả button
          categoryButtons.forEach(btn => btn.classList.remove('active'));

          // Thêm active vào nút đang chọn
          button.classList.add('active');

          const category = button.getAttribute('data-category');
          productTitle.textContent = `Chọn ${button.textContent.trim()}`;

          // Load sản phẩm tương ứng (ví dụ, chỉ minh họa)
          loadProducts(category);
      });
  });

  async function initModel() {
  if (!model) {
      model = await handpose.load();
  }
}
initModel();
  toggleCamBtn.onclick = async () => {
      if (!isCamOn) {
          webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = webcamStream;
          video.play();
          toggleCamBtn.textContent = 'Tắt Camera';
          isCamOn = true;

          // if (!model) {
          //     model = await handpose.load();
          // }
          renderLoop();
      } else {
          webcamStream.getTracks().forEach(track => track.stop());
          toggleCamBtn.textContent = 'Bật Camera';
          isCamOn = false;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
  };
  if (webcamStream) {
  webcamStream.getTracks().forEach(track => track.stop());
  };
  async function renderLoop() {
      if (isCamOn && model && video.readyState === video.HAVE_ENOUGH_DATA) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const predictions = await model.estimateHands(video);

          if (predictions.length > 0) {
              const finger = predictions[0].annotations.ringFinger;

              // Dùng đốt gần (finger[1]) và đốt giữa (finger[2]) để fit nhẫn chính xác nhất
              const base = finger[1]; // Đốt gần bàn tay hơn
              const middle = finger[2]; // Đốt ở giữa ngón tay

              if (isMobile()) {
                  drawRotatedRingMobile(base, middle);  // Dành riêng cho điện thoại
              } else {
                  drawRotatedRing(base, middle);        // Bản desktop giữ nguyên
              }
          }
      }

      if (isCamOn) requestAnimationFrame(renderLoop);
  }

  // Hàm fit nhẫn hoàn chỉnh nhất
  function drawRotatedRing(base, middle) {
      const dx = middle[0] - base[0];
      const dy = middle[1] - base[1];
      const angle = Math.atan2(dy, dx);
      const distance = Math.hypot(dx, dy);

      // Điều chỉnh kích thước để fit vừa nhất
      const ringWidth = distance * 1.6; // Chiều rộng nhẫn (có thể tinh chỉnh nhỏ hơn hoặc lớn hơn)
      const ringHeight = distance * 2.0; // Chiều cao nhẫn (tùy chỉnh)

      // Dịch chuyển nhẹ vị trí hiển thị xuống dưới một chút
      const offsetY = distance * 0.55;

      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      
      ctx.save();
      ctx.translate(base[0], base[1]);
      ctx.rotate(angle + Math.PI / 2);
      ctx.drawImage(
          ringImg,
          -ringWidth / 2,
          -ringHeight / 2 + offsetY,
          ringWidth,
          ringHeight
      );
      ctx.restore();
  }
  function isMobile() {
  return window.innerWidth <= 768;
}
//     function drawRotatedRing(base, middle) {
//     const videoWidth = video.videoWidth;
//     const videoHeight = video.videoHeight;
//     const canvasWidth = canvas.width;
//     const canvasHeight = canvas.height;

//     // Tính toán scale giữa video và canvas
//     const scaleX = canvasWidth / videoWidth;
//     const scaleY = canvasHeight / videoHeight;

//     // Áp dụng scale vào tọa độ base và tip
//     const scaledBase = [base[0] * scaleX, base[1] * scaleY];
//     const scaledTip = [middle[0] * scaleX, middle[1] * scaleY];

//     const dx = scaledTip[0] - scaledBase[0];
//     const dy = scaledTip[1] - scaledBase[1];
//     const angle = Math.atan2(dy, dx);
//     const distance = Math.hypot(dx, dy);

//     // Điều chỉnh kích thước nhẫn theo scale
//     const ringWidth = distance * 1.6;
//     const ringHeight = distance * 2.0;

//     const offsetY = distance * 0.75;

//     const centerX = (scaledBase[0] + scaledTip[0]) / 2;
//     const centerY = (scaledBase[1] + scaledTip[1]) / 2;

//     ctx.save();
//     ctx.translate(centerX, centerY);
//     ctx.rotate(angle + Math.PI / 2);

//     ctx.shadowColor = 'rgba(0,0,0,0.3)';
//     ctx.shadowBlur = 8;
//     ctx.shadowOffsetX = 3;
//     ctx.shadowOffsetY = 3;

//     ctx.drawImage(
//         ringImg,
//         -ringWidth / 2,
//         -ringHeight / 2 + offsetY,
//         ringWidth,
//         ringHeight
//     );
//     ctx.restore();
// }

function drawRotatedRingMobile(base, middle) {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Tính toán scale dựa trên kích thước video và canvas
      const scaleX = canvasWidth / videoWidth;
      const scaleY = canvasHeight / videoHeight;

      // Scale lại các điểm base, tip phù hợp với canvas
      const scaledBase = [base[0] * scaleX, base[1] * scaleY];
      const scaledTip = [middle[0] * scaleX, middle[1] * scaleY];

      const dx = scaledTip[0] - scaledBase[0];
      const dy = scaledTip[1] - scaledBase[1];
      const angle = Math.atan2(dy, dx);
      const distance = Math.hypot(dx, dy);

      // Đã test tối ưu cho màn hình điện thoại
      const ringWidth = distance * 1.6; // nhỏ hơn chút cho mobile
      const ringHeight = distance * 2.0;

      const offsetY = distance * 0.55;

      const centerX = (scaledBase[0] + scaledTip[0]) / 2;
      const centerY = (scaledBase[1] + scaledTip[1]) / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + Math.PI / 2);

      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.drawImage(
          ringImg,
          -ringWidth / 2,
          -ringHeight / 2 + offsetY,
          ringWidth,
          ringHeight
      );
      ctx.restore();
  }
});

function loadProducts(category) {
  const productItems = document.querySelector('.product-items');
  productItems.innerHTML = '';

  const items = {
      rings: [
          { name: 'Nhẫn Vàng Đính Kim Cương', price: '12.500.000 VND' },
          { name: 'Nhẫn Bạc Đơn Giản', price: '1.200.000 VND' },
          { name: 'Nhẫn Vàng Hồng', price: '8.900.000 VND' }
      ],
      necklaces: [
          { name: 'Vòng Cổ Kim Cương', price: '15.500.000 VND' },
          { name: 'Vòng Cổ Bạc', price: '2.500.000 VND' },
          { name: 'Vòng Cổ Vàng', price: '9.500.000 VND' }
      ],
      earrings: [
          { name: 'Bông tai Kim Cương', price: '5.500.000 VND' },
          { name: 'Bông tai Bạc', price: '700.000 VND' },
          { name: 'Bông tai Vàng', price: '3.500.000 VND' }
      ]
  };

  items[category].forEach(item => {
      productItems.innerHTML += `
<div class="product-item">
<div class="product-preview"></div>
<div class="product-info">
    <span>${item.name}</span>
    <strong>${item.price}</strong>
</div>
</div>`;
  });
}
const productItems = document.getElementById('productItems');

// Thêm event listener cho từng mẫu nhẫn
productItems.addEventListener('click', (event) => {
    const clickedItem = event.target.closest('.product-item');
    if (!clickedItem) return;

    const index = clickedItem.getAttribute('data-index');

    // Xóa active cũ và thêm active vào mẫu mới
    document.querySelectorAll('.product-item').forEach(item => item.classList.remove('active'));
    clickedItem.classList.add('active');

    // Cập nhật lại hình ảnh chiếc nhẫn đang chọn
    ringImg.src = `./rings/ring${Number(index) + 1}.png`;
});