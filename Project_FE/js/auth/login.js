document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");
    emailError.textContent = "";
    passwordError.textContent = "";

    let isValid = true;

    if (email === "") {
      emailError.textContent = "Vui lòng nhập email";
      isValid = false;
    }

    if (password === "") {
      passwordError.textContent = "Vui lòng nhập mật khẩu";
      isValid = false;
    }

    if (isValid) {
      if (email === "admin@gmail.com" && password === "admin123") {
        window.location.href = "../../pages/dashboard/dashboard.html";
      } else {
        passwordError.textContent = "Email hoặc mật khẩu không đúng";
      }
    }
  });
});
