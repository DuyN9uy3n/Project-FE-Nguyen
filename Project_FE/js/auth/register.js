document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    clearErrors();

    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    let isValid = true;

    if (fullname === "") {
      showError("fullname-error", "Vui lòng nhập họ và tên");
      isValid = false;
    } else if (fullname.length < 3) {
      showError("fullname-error", "Họ và tên phải có ít nhất 3 ký tự");
      isValid = false;
    }

    if (email === "") {
      showError("email-error", "Vui lòng nhập địa chỉ email");
      isValid = false;
    } else if (!isValidEmail(email)) {
      showError("email-error", "Địa chỉ email không hợp lệ");
      isValid = false;
    }

    if (password === "") {
      showError("password-error", "Vui lòng nhập mật khẩu");
      isValid = false;
    } else if (password.length < 6) {
      showError("password-error", "Mật khẩu phải có ít nhất 6 ký tự");
      isValid = false;
    }

    if (confirmPassword === "") {
      showError("confirmPassword-error", "Vui lòng xác nhận mật khẩu");
      isValid = false;
    } else if (password !== confirmPassword) {
      showError("confirmPassword-error", "Mật khẩu xác nhận không khớp");
      isValid = false;
    }

    if (isValid) {
      console.log("Form submitted successfully!");
      console.log({
        fullname,
        email,
        password,
      });

      registerForm.reset();
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
    }
  });

  function showError(id, message) {
    const errorElement = document.getElementById(id);
    errorElement.textContent = message;
  }

  function clearErrors() {
    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach((element) => {
      element.textContent = "";
    });
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});
