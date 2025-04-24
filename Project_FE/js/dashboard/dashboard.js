document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const toggleBtn = document.getElementById("toggle-sidebar");

  // Sử dụng ID cụ thể để lấy liên kết Dự án
  const duAnLink = document.getElementById("duAnLink");

  if (duAnLink) {
    console.log("Đã tìm thấy liên kết dự án");

    // Để kiểm tra nếu liên kết hoạt động, in ra thông báo khi hover
    duAnLink.addEventListener("mouseenter", function () {
      console.log("Hover trên liên kết dự án");
    });

    // Thêm sự kiện click cho liên kết dự án
    duAnLink.addEventListener("click", function (e) {
      console.log("Đã nhấp vào liên kết dự án");
      // Không cần e.preventDefault() vì chúng ta đã thêm href vào thẻ a
    });
  } else {
    console.log("Không tìm thấy liên kết dự án với ID 'duAnLink'");
  }

  // Sự kiện toggle sidebar
  toggleBtn.addEventListener("click", function () {
    if (window.innerWidth < 992) {
      sidebar.classList.toggle("show");
    } else {
      sidebar.classList.toggle("collapsed");
      mainContent.classList.toggle("expanded");
    }
  });

  window.addEventListener("resize", checkScreenSize);
  checkScreenSize();

  function checkScreenSize() {
    if (window.innerWidth < 992) {
      sidebar.classList.remove("collapsed");
      mainContent.classList.remove("expanded");
    }
  }

  // Hover effect
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
