document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") {
    window.location.href = "../../pages/auth/login.html";
    return;
  }

  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const toggleBtn = document.getElementById("toggle-sidebar");
  const duAnLink = document.getElementById("duAnLink");
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("isLoggedIn");
      window.location.href = "../../pages/auth/login.html";
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      if (window.innerWidth < 992) {
        sidebar.classList.toggle("show");
      } else {
        sidebar.classList.toggle("collapsed");
        mainContent.classList.toggle("expanded");
      }
    });
  }

  window.addEventListener("resize", checkScreenSize);
  checkScreenSize();

  function checkScreenSize() {
    if (window.innerWidth < 992) {
      sidebar.classList.remove("collapsed");
      mainContent.classList.remove("expanded");
    }
  }

  if (duAnLink) {
    console.log("Đã tìm thấy liên kết dự án");

    duAnLink.addEventListener("mouseenter", function () {
      console.log("Hover trên liên kết dự án");
    });

    duAnLink.addEventListener("click", function (e) {
      console.log("Đã nhấp vào liên kết dự án");
    });
  } else {
    console.log("Không tìm thấy liên kết dự án với ID 'duAnLink'");
  }

  const statCards = document.querySelectorAll(".stat-card");
  statCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
    });
    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  const projectCards = document.querySelectorAll(".project-card");
  projectCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.1)";
    });
    card.addEventListener("mouseleave", function () {
      this.style.boxShadow = "";
    });
  });
});
