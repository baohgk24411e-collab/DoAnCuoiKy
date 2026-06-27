// services/orderService.js
window.OrderService = {
  getOrders() {
    const orders = localStorage.getItem("tqg_orders");
    if (orders) return JSON.parse(orders);

    // Initial mock orders to seed dashboard beautifully
    const mockOrders = [
      {
        id: "TQG1256",
        userId: "u_1",
        customerName: "Nguyễn Thị Hà",
        customerPhone: "0912345678",
        customerEmail: "nguyenha@gmail.com",
        address: "15 Tràng Tiền, Hoàn Kiếm, Hà Nội",
        paymentMethod: "COD",
        items: [
          { productId: 45, name: "Mix Hạt Dinh Dưỡng 5 loại cao cấp", price: 149000, quantity: 2, image: "images/granola/Mix hạt.png" },
          { productId: 1, name: "Xoài cát Hòa Lộc", price: 95000, quantity: 3, image: "images/fruits/Xoài cát Hòa Lộc.png" }
        ],
        subtotal: 583000,
        shipping: 0,
        discount: 50000,
        total: 533000,
        status: "Đang xử lý",
        date: "2026-06-26T09:21:00.000Z"
      },
      {
        id: "TQG1255",
        userId: "u_2",
        customerName: "Trần Văn Nam",
        customerPhone: "0902345678",
        customerEmail: "vannam@gmail.com",
        address: "123 Nguyễn Đình Chiểu, Quận 3, TP. Hồ Chí Minh",
        paymentMethod: "E-wallet",
        items: [
          { productId: 48, name: "Combo Eat Clean Sống Khỏe Mỗi Ngày", price: 269000, quantity: 1, image: "images/combo/Combo.png" },
          { productId: 14, name: "Sầu riêng Musang King", price: 250000, quantity: 1, image: "images/fruits/Sầu riêng Musang.png" }
        ],
        subtotal: 519000,
        shipping: 0,
        discount: 30000,
        total: 489000,
        status: "Đang giao",
        date: "2026-06-26T08:15:00.000Z"
      },
      {
        id: "TQG1254",
        userId: "u_3",
        customerName: "Lê Minh Anh",
        customerPhone: "0934567890",
        customerEmail: "minhanh@gmail.com",
        address: "456 Trần Hưng Đạo, Sơn Trà, Đà Nẵng",
        paymentMethod: "Bank transfer",
        items: [
          { productId: 47, name: "Granola hạt & trái cây tự nhiên", price: 129000, quantity: 2, image: "images/granola/Granola.png" },
          { productId: 3, name: "Ổi Ruby không hạt", price: 45000, quantity: 4, image: "images/fruits/Ổi Ruby.png" }
        ],
        subtotal: 438000,
        shipping: 30000,
        discount: 0,
        total: 468000,
        status: "Hoàn thành",
        date: "2026-06-25T07:42:00.000Z"
      },
      {
        id: "TQG1253",
        userId: "u_4",
        customerName: "Phạm Thị Lan",
        customerPhone: "0945678901",
        customerEmail: "lanpham@gmail.com",
        address: "789 Lê Lợi, Ngô Quyền, Hải Phòng",
        paymentMethod: "COD",
        items: [
          { productId: 50, name: "Combo Quà Tặng Gia Đình Tứ Quý", price: 399000, quantity: 1, image: "images/combo/Combo trái cây.png" }
        ],
        subtotal: 399000,
        shipping: 30000,
        discount: 0,
        total: 429000,
        status: "Chờ xác nhận",
        date: "2026-06-24T22:30:00.000Z"
      },
      {
        id: "TQG1252",
        userId: "u_5",
        customerName: "Hoàng Quốc Bảo",
        customerPhone: "0956789012",
        customerEmail: "baohq@gmail.com",
        address: "12 Lý Tự Trọng, Cần Thơ",
        paymentMethod: "COD",
        items: [
          { productId: 10, name: "Bưởi da xanh Bến Tre", price: 85000, quantity: 1, image: "images/fruits/Bưởi da xanh.png" }
        ],
        subtotal: 85000,
        shipping: 30000,
        discount: 0,
        total: 115000,
        status: "Đã hủy",
        date: "2026-06-24T21:05:00.000Z"
      }
    ];
    this.saveOrders(mockOrders);
    return mockOrders;
  },

  saveOrders(orders) {
    localStorage.setItem("tqg_orders", JSON.stringify(orders));
  },

  getUserOrders(userId) {
    return this.getOrders().filter(order => order.userId === userId);
  },

  getOrderById(orderId) {
    return this.getOrders().find(order => order.id === orderId);
  },

  createOrder(customerInfo, shippingAddress, paymentMethod, totals) {
    const orders = this.getOrders();
    const cart = window.CartService.getCart();
    
    if (cart.length === 0) {
      return { success: false, message: "Giỏ hàng của bạn đang trống." };
    }

    const items = cart.map(item => {
      const product = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      };
    });

    // Deduct stock
    cart.forEach(item => {
      const product = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    });
    // Save updated stock to local storage mockup (we can overwrite in memory or localStorage)
    // To make product CRUD persistent, let's store products in localStorage too if modified
    localStorage.setItem("tqg_products", JSON.stringify(window.MOCK_PRODUCTS));

    const currentUser = window.AuthService.getCurrentUser();
    const orderId = "TQG" + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      id: orderId,
      userId: currentUser ? currentUser.id : "guest_" + Date.now(),
      customerName: customerInfo.fullName,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email || "",
      address: `${shippingAddress.address}, ${shippingAddress.ward}, ${shippingAddress.district}, ${shippingAddress.province}`,
      paymentMethod,
      items,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      discount: totals.discount,
      total: totals.total,
      status: "Chờ xác nhận",
      date: new Date().toISOString(),
      note: shippingAddress.note || ""
    };

    orders.unshift(newOrder); // Add to beginning
    this.saveOrders(orders);
    
    // Clear cart & vouchers
    window.CartService.clearCart();
    window.CartService.removeVoucher();

    return { success: true, message: "Đặt hàng thành công!", orderId };
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const orderIdx = orders.findIndex(o => o.id === orderId);

    if (orderIdx === -1) {
      return { success: false, message: "Không tìm thấy đơn hàng." };
    }

    orders[orderIdx].status = newStatus;
    this.saveOrders(orders);
    
    window.dispatchEvent(new Event("ordersUpdated"));
    return { success: true, message: `Cập nhật trạng thái đơn hàng sang: ${newStatus}` };
  },

  getAdminKPIs() {
    const orders = this.getOrders();
    const activeOrders = orders.filter(o => o.status !== "Đã hủy");

    const totalOrders = orders.length;
    const revenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const totalProducts = window.MOCK_PRODUCTS.length;
    
    // Get unique customers
    const uniqueUsers = new Set(orders.map(o => o.userId));
    const totalCustomers = uniqueUsers.size + 3; // mock additional count

    // Low stock products
    const lowStock = window.MOCK_PRODUCTS.filter(p => p.stock < 15).slice(0, 5);

    // Bestselling calculation based on quantity sold in orders
    const salesMap = {};
    orders.forEach(order => {
      if (order.status !== "Đã hủy") {
        order.items.forEach(item => {
          salesMap[item.productId] = (salesMap[item.productId] || 0) + item.quantity;
        });
      }
    });

    const bestSellers = Object.keys(salesMap)
      .map(id => {
        const prod = window.MOCK_PRODUCTS.find(p => p.id === parseInt(id));
        return {
          id: parseInt(id),
          name: prod ? prod.name : "Sản phẩm ẩn",
          image: prod ? prod.image : "",
          sales: salesMap[id]
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return {
      totalOrders,
      revenue,
      totalProducts,
      totalCustomers,
      lowStock,
      bestSellers
    };
  }
};
