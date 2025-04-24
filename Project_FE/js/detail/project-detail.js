document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const toggleBtn = document.getElementById("toggle-sidebar");

  // Sửa các đường dẫn trong sidebar
  const dashboardLink = document.querySelector(
    '.sidebar-menu li a[href="index.html"]'
  );
  if (dashboardLink) {
    // Thay đổi đường dẫn dashboard từ index.html sang đường dẫn chính xác
    dashboardLink.href = "../dashboard/index.html";

    // Log để debug
    console.log("Đã cập nhật đường dẫn dashboard");
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

  // Kiểm tra kích thước màn hình
  window.addEventListener("resize", checkScreenSize);
  checkScreenSize();

  function checkScreenSize() {
    if (window.innerWidth < 992) {
      sidebar.classList.remove("collapsed");
      mainContent.classList.remove("expanded");
    }
  }

  // Thêm hiệu ứng hover cho các thẻ
  addHoverEffects();

  // Xử lý chức năng status dropdown
  setupStatusDropdowns();

  // Xử lý sự kiện nút thêm nhiệm vụ
  const addTaskBtn = document.querySelector(".btn-primary");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", function () {
      console.log("Mở form thêm nhiệm vụ");
      // Thêm mã mở modal thêm nhiệm vụ ở đây
    });
  }

  // Xử lý sự kiện nút thêm thành viên
  const addMemberBtn = document.querySelector(".btn-outline");
  if (addMemberBtn) {
    addMemberBtn.addEventListener("click", function () {
      console.log("Mở form thêm thành viên");
      // Thêm mã mở modal thêm thành viên ở đây
    });
  }

  // Xử lý sự kiện nút edit và delete
  setupActionButtons();
});

// Thêm hiệu ứng hover
function addHoverEffects() {
  // Hiệu ứng hover cho member card
  const memberCards = document.querySelectorAll(".member-card");
  memberCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
      this.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.1)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "";
    });
  });

  // Hiệu ứng hover cho các tab
  const categoryTabs = document.querySelectorAll(".category-tab");
  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Xóa trạng thái active của tất cả các tab
      categoryTabs.forEach((t) => t.classList.remove("active"));
      // Thêm trạng thái active cho tab được click
      this.classList.add("active");
    });
  });
}

// Thiết lập các dropdown trạng thái
function setupStatusDropdowns() {
  const statusDropdowns = document.querySelectorAll(".status-dropdown");

  statusDropdowns.forEach((dropdown) => {
    const status = dropdown.querySelector(".task-status");
    const content = dropdown.querySelector(".status-dropdown-content");

    // Hiển thị dropdown khi hover
    dropdown.addEventListener("mouseenter", function () {
      content.style.display = "block";
    });

    dropdown.addEventListener("mouseleave", function () {
      content.style.display = "none";
    });

    // Xử lý khi chọn trạng thái
    const statusOptions = content.querySelectorAll("a");
    statusOptions.forEach((option) => {
      option.addEventListener("click", function (e) {
        e.preventDefault();

        // Lấy text của option
        const newStatus = this.textContent;
        status.textContent = newStatus;

        // Xóa tất cả class status
        status.classList.remove(
          "status-new",
          "status-in-progress",
          "status-completed",
          "status-pending"
        );

        // Thêm class tương ứng với trạng thái mới
        switch (newStatus.trim()) {
          case "Mới":
            status.classList.add("status-new");
            break;
          case "Đang tiến hành":
            status.classList.add("status-in-progress");
            break;
          case "Đã hoàn thành":
            status.classList.add("status-completed");
            break;
          case "Tạm dừng":
            status.classList.add("status-pending");
            break;
        }

        // Ẩn dropdown
        content.style.display = "none";
      });
    });
  });
}

// Thiết lập các nút hành động
function setupActionButtons() {
  // Nút sửa nhiệm vụ
  const editButtons = document.querySelectorAll(".action-btn.edit");
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const taskRow = this.closest("tr");
      const taskName = taskRow.querySelector("td").textContent;
      console.log("Sửa nhiệm vụ:", taskName);
      // Thêm code mở modal sửa nhiệm vụ ở đây
    });
  });

  // Nút xóa nhiệm vụ
  const deleteButtons = document.querySelectorAll(".action-btn.delete");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const taskRow = this.closest("tr");
      const taskName = taskRow.querySelector("td").textContent;

      if (confirm(`Bạn có chắc chắn muốn xóa nhiệm vụ "${taskName}"?`)) {
        console.log("Xóa nhiệm vụ:", taskName);
        taskRow.remove();
        // Cập nhật số lượng nhiệm vụ trên các tab
        updateTaskCount();
      }
    });
  });
}

// Cập nhật số lượng nhiệm vụ
function updateTaskCount() {
  const todoCount = document.querySelector(
    ".category-tab:nth-child(1) .task-count"
  );
  if (todoCount) {
    // Giảm số lượng đi 1
    const currentCount = parseInt(todoCount.textContent);
    todoCount.textContent = currentCount - 1;
  }
}
