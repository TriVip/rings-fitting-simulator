const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const toggleCamBtn = document.getElementById('toggleCam');


document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('webcam');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const toggleCamBtn = document.getElementById('toggleCam');

  let model = null;
  let webcamStream = null;
  let isCamOn = false;

  const ringImg = new Image();
  ringImg.src = "https://cdn.pnj.io/nhan/ring-fitting-simulator/rings/ring1.png";
  
  const categoryButtons = document.querySelectorAll('.category-selector button');
  const productTitle = document.querySelector('.product-list h4');

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

  toggleCamBtn.onclick = async () => {
    if (!isCamOn) {
      webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = webcamStream;
      video.play();
      toggleCamBtn.textContent = 'Tắt Camera';
      isCamOn = true;

      if (!model) {
        model = await handpose.load();
      }
      renderLoop();
    } else {
      webcamStream.getTracks().forEach(track => track.stop());
      toggleCamBtn.textContent = 'Bật Camera';
      isCamOn = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
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
    
          drawRotatedRing(base, middle);
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
      const offsetY = distance * 0.45;
    
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
});

function loadProducts(category) {
  const productItems = document.querySelector('.product-items');
  productItems.innerHTML = '';

  const items = {
      rings: [
          {name: 'Nhẫn Vàng Đính Kim Cương', price: '12.500.000 VND'},
          {name: 'Nhẫn Bạc Đơn Giản', price: '1.200.000 VND'},
          {name: 'Nhẫn Vàng Hồng', price: '8.900.000 VND'}
      ],
      necklaces: [
          {name: 'Vòng Cổ Kim Cương', price: '15.500.000 VND'},
          {name: 'Vòng Cổ Bạc', price: '2.500.000 VND'},
          {name: 'Vòng Cổ Vàng', price: '9.500.000 VND'}
      ],
      earrings: [
          {name: 'Bông tai Kim Cương', price: '5.500.000 VND'},
          {name: 'Bông tai Bạc', price: '700.000 VND'},
          {name: 'Bông tai Vàng', price: '3.500.000 VND'}
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
// let model = null;
// let webcamStream = null;
// let isCamOn = false;

// const ringImg = new Image();
// ringImg.src = "https://cdn.pnj.io/nhan/ring-fitting-simulator/rings/ring1.png";

// toggleCamBtn.onclick = async () => {
//   if (!isCamOn) {
//     webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
//     video.srcObject = webcamStream;
//     video.play();
//     toggleCamBtn.textContent = 'Tắt Camera';
//     isCamOn = true;

//     if (!model) {
//       model = await handpose.load();
//     }
//     renderLoop();
//   } else {
//     webcamStream.getTracks().forEach(track => track.stop());
//     toggleCamBtn.textContent = 'Bật Camera';
//     isCamOn = false;
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//   }
// };

// async function renderLoop() {
//   if (isCamOn && model && video.readyState === video.HAVE_ENOUGH_DATA) {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const predictions = await model.estimateHands(video);

//     if (predictions.length > 0) {
//       const finger = predictions[0].annotations.ringFinger;

//       // Dùng đốt gần (finger[1]) và đốt giữa (finger[2]) để fit nhẫn chính xác nhất
//       const base = finger[1]; // Đốt gần bàn tay hơn
//       const middle = finger[2]; // Đốt ở giữa ngón tay

//       drawRotatedRing(base, middle);
//     }
//   }

//   if (isCamOn) requestAnimationFrame(renderLoop);
// }

// // Hàm fit nhẫn hoàn chỉnh nhất
// function drawRotatedRing(base, middle) {
//   const dx = middle[0] - base[0];
//   const dy = middle[1] - base[1];
//   const angle = Math.atan2(dy, dx);
//   const distance = Math.hypot(dx, dy);

//   // Điều chỉnh kích thước để fit vừa nhất
//   const ringWidth = distance * 1.6; // Chiều rộng nhẫn (có thể tinh chỉnh nhỏ hơn hoặc lớn hơn)
//   const ringHeight = distance * 2.0; // Chiều cao nhẫn (tùy chỉnh)

//   // Dịch chuyển nhẹ vị trí hiển thị xuống dưới một chút
//   const offsetY = distance * 0.45;

//   ctx.save();
//   ctx.translate(base[0], base[1]);
//   ctx.rotate(angle + Math.PI / 2);
//   ctx.drawImage(
//     ringImg, 
//     -ringWidth / 2, 
//     -ringHeight / 2 + offsetY, 
//     ringWidth, 
//     ringHeight
//   );
//   ctx.restore();
// }

// const products = {
//   rings: [
//     { name: "Nhẫn Vàng Đính Kim Cương", price: "12.500.000 VND", img: "https://cdn.pnj.io/nhan/ring-fitting-simulator/rings/ring1.png" },
//     { name: "Nhẫn Bạc Đơn Giản", price: "1.200.000 VND", img: "https://cdn.pnj.io/nhan/ring-fitting-simulator/rings/ring2.png" },
//     { name: "Nhẫn Vàng Hồng", price: "8.900.000 VND", img: "https://cdn.pnj.io/nhan/ring-fitting-simulator/rings/ring3.png" }
//   ],
//   necklaces: [
//     { name: "Vòng Cổ Kim Cương", price: "15.500.000 VND", img: "https://cdn.pnj.io/nhan/ring-fitting-simulator/necklaces/necklace1.png" },
//     { name: "Vòng Cổ Bạc", price: "2.500.000 VND", img: "https://cdn.pnj.io/nhan/ring-fitting-simulator/necklaces/necklace2.png" },
//     { name: "Vòng Cổ Vàng", price: "9.500.000 VND", img: "https://cdn.pnj.io/nhan/ring-fitting-simulator/necklaces/necklace3.png" }
//   ]
// };


// function loadProducts(category) {
//   const productItems = document.getElementById('productItems');
//   productItems.innerHTML = '';

//   currentProducts = products[category];

//   currentProducts.forEach((product, index) => {
//     productItems.innerHTML += `
//       <div class="product-item ${index === 0 ? 'active' : ''}" onclick="selectProduct(${index})">
//         <img src="${product.img}" class="product-preview"/>
//         <div class="product-info">
//           <span>${product.name}</span>
//           <strong>${product.price}</strong>
//         </div>
//       </div>
//     `;
//   });

//   ringImg.src = currentProducts[0].img; // mặc định chọn hình đầu tiên
// }

// window.selectProduct = (index) => {
//   document.querySelectorAll('.product-item').forEach((item, i) => {
//     item.classList.toggle('active', i === index);
//   });
//   ringImg.src = currentProducts[index].img;
// };

// // Load mặc định sản phẩm nhẫn
// loadProducts('rings');




