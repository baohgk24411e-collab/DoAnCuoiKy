// js/login.js

document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in, redirect them
  if (window.AuthService) {
    const currentUser = window.AuthService.getCurrentUser();
    if (currentUser) {
      if (currentUser.isAdmin) {
        window.location.href = "admin-dashboard.html";
      } else {
        window.location.href = "profile.html";
      }
      return;
    }
  }

  // Bind form submits
  const loginForm = document.getElementById("auth-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  const registerForm = document.getElementById("auth-register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegisterSubmit);
  }

  // Check URL query parameters for default tab
  const mode = window.getUrlParam ? window.getUrlParam("mode") : "";
  if (mode === "register") {
    switchAuthTab("register");
  }
});

// Switch tab login vs register
window.switchAuthTab = function(tabName) {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const panelLogin = document.getElementById("panel-login");
  const panelRegister = document.getElementById("panel-register");

  if (!tabLogin || !tabRegister || !panelLogin || !panelRegister) return;

  if (tabName === "login") {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    panelLogin.classList.add("active");
    panelRegister.classList.remove("active");
  } else {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    panelRegister.classList.add("active");
    panelLogin.classList.remove("active");
  }
};

// Handle Login submit
function handleLoginSubmit(e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const remember = document.getElementById("login-remember").checked;

  if (!window.AuthService) return;

  const result = window.AuthService.login(email, password, remember);

  if (result.success) {
    window.showToast(result.message, "success");
    
    // Check if we came from checkout
    const referrer = document.referrer;
    setTimeout(() => {
      if (result.user.isAdmin) {
        window.location.href = "admin-dashboard.html";
      } else if (referrer && referrer.includes("checkout.html")) {
        window.location.href = "checkout.html";
      } else if (referrer && referrer.includes("cart.html")) {
        window.location.href = "checkout.html";
      } else {
        window.location.href = "profile.html";
      }
    }, 1000);
  } else {
    window.showToast(result.message, "error");
  }
}

// Handle Register submit
function handleRegisterSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const phone = document.getElementById("register-phone").value.trim();
  const password = document.getElementById("register-password").value;
  const goal = document.getElementById("register-goal").value;

  if (!window.AuthService) return;

  const result = window.AuthService.register(name, email, phone, password, goal);

  if (result.success) {
    window.showToast(result.message, "success");
    // Switch to login tab and prefill email
    setTimeout(() => {
      switchAuthTab("login");
      const emailField = document.getElementById("login-email");
      if (emailField) {
        emailField.value = email;
        document.getElementById("login-password").focus();
      }
    }, 1500);
  } else {
    window.showToast(result.message, "error");
  }
}

// Forgot Password Helper
window.handleForgotPassword = function(e) {
  e.preventDefault();
  
  const isEn = document.body.classList.contains("lang-en");
  const msgVi = "Hệ thống đã gửi liên kết khôi phục mật khẩu vào Email của bạn (Mô phỏng). Vui lòng kiểm tra hộp thư.";
  const msgEn = "We have sent a password reset link to your email (Mockup). Please check your inbox.";
  
  window.showToast(isEn ? msgEn : msgVi, "success");
};
