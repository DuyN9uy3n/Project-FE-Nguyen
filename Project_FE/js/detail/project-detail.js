document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const toggleBtn = document.getElementById("toggle-sidebar");

  const notificationBell = document.querySelector(".notification-bell");
  const notificationDropdown = document.querySelector(".notification-dropdown");
  const headerUser = document.querySelector(".header-user");
  const userDropdown = document.querySelector(".user-dropdown");

  const categoryTabs = document.querySelectorAll(".category-tab");
  const taskSearch = document.getElementById("taskSearch");
  const taskSort = document.getElementById("taskSort");
  const taskAssignee = document.getElementById("taskAssignee");
  const taskTableBody = document.getElementById("taskTableBody");
  const paginationNumbers = document.querySelectorAll(".pagination-number");
  const prevBtn = document.querySelector(".pagination-btn.prev");
  const nextBtn = document.querySelector(".pagination-btn.next");

  const taskModal = document.getElementById("taskModal");
  const taskModalTitle = document.getElementById("taskModalTitle");
  const closeTaskModal = document.getElementById("closeTaskModal");
  const taskForm = document.getElementById("taskForm");
  const taskId = document.getElementById("taskId");
  const taskName = document.getElementById("taskName");
  const taskDescription = document.getElementById("taskDescription");
  const taskStartDate = document.getElementById("taskStartDate");
  const taskDueDate = document.getElementById("taskDueDate");
  const taskAssigneeSelect = document.getElementById("taskAssigneeSelect");
  const taskPriority = document.getElementById("taskPriority");
  const taskStatus = document.getElementById("taskStatus");
  const cancelTaskBtn = document.getElementById("cancelTaskBtn");
  const saveTaskBtn = document.getElementById("saveTaskBtn");
  const addTaskBtn = document.getElementById("addTaskBtn");

  const deleteTaskModal = document.getElementById("deleteTaskModal");
  const closeDeleteTaskModal = document.getElementById("closeDeleteTaskModal");
  const deleteTaskName = document.getElementById("deleteTaskName");
  const cancelDeleteTaskBtn = document.getElementById("cancelDeleteTaskBtn");
  const confirmDeleteTaskBtn = document.getElementById("confirmDeleteTaskBtn");

  const memberModal = document.getElementById("memberModal");
  const closeMemberModal = document.getElementById("closeMemberModal");
  const cancelMemberBtn = document.getElementById("cancelMemberBtn");
  const saveMemberBtn = document.getElementById("saveMemberBtn");
  const addMemberBtn = document.getElementById("addMemberBtn");

  const projectModal = document.getElementById("projectModal");
  const closeProjectModal = document.getElementById("closeProjectModal");
  const cancelProjectBtn = document.getElementById("cancelProjectBtn");
  const saveProjectBtn = document.getElementById("saveProjectBtn");
  const btnEditProject = document.querySelector(".btn-edit-project");

  const deleteProjectModal = document.getElementById("deleteProjectModal");
  const closeDeleteProjectModal = document.getElementById(
    "closeDeleteProjectModal"
  );
  const cancelDeleteProjectBtn = document.getElementById(
    "cancelDeleteProjectBtn"
  );
  const confirmDeleteProjectBtn = document.getElementById(
    "confirmDeleteProjectBtn"
  );

  let currentPage = 1;
  let itemsPerPage = 3;
  let totalPages = 4;
  let currentTaskToDelete = null;
  let currentFilterStatus = "all";
  let currentSearchTerm = "";
  let currentAssigneeFilter = "all";
  let currentSortOption = "name";
  let tasks = [];

  initializeApp();

  toggleBtn.addEventListener("click", toggleSidebar);

  notificationBell.addEventListener("click", function (e) {
    e.stopPropagation();
    notificationDropdown.classList.toggle("show");
    userDropdown.classList.remove("show");
  });

  headerUser.addEventListener("click", function (e) {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
    notificationDropdown.classList.remove("show");
  });

  document.addEventListener("click", function () {
    notificationDropdown.classList.remove("show");
    userDropdown.classList.remove("show");
  });

  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      categoryTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      currentFilterStatus = this.dataset.status;
      currentPage = 1;
      updateActivePaginationButton();

      filterAndDisplayTasks();
    });
  });

  taskSearch.addEventListener("input", function () {
    currentSearchTerm = this.value.trim().toLowerCase();
    currentPage = 1;
    updateActivePaginationButton();

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      filterAndDisplayTasks();
    }, 300);
  });

  taskSort.addEventListener("change", function () {
    currentSortOption = this.value;
    filterAndDisplayTasks();
  });

  taskAssignee.addEventListener("change", function () {
    currentAssigneeFilter = this.value;
    currentPage = 1;
    updateActivePaginationButton();

    filterAndDisplayTasks();
  });

  paginationNumbers.forEach((button) => {
    button.addEventListener("click", function () {
      currentPage = parseInt(this.textContent);
      updateActivePaginationButton();
      filterAndDisplayTasks();
    });
  });

  prevBtn.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      updateActivePaginationButton();
      filterAndDisplayTasks();
    }
  });

  nextBtn.addEventListener("click", function () {
    if (currentPage < totalPages) {
      currentPage++;
      updateActivePaginationButton();
      filterAndDisplayTasks();
    }
  });

  document.addEventListener("click", function (e) {
    if (
      e.target.tagName === "A" &&
      e.target.parentNode.classList.contains("status-dropdown-content")
    ) {
      e.preventDefault();
      const statusCell = e.target.closest("td");
      const taskRow = e.target.closest("tr");
      const statusSpan = statusCell.querySelector(".task-status");
      const newStatus = e.target.dataset.status;

      statusSpan.className = `task-status status-${newStatus}`;
      statusSpan.textContent = getStatusText(newStatus);

      taskRow.dataset.status = newStatus;

      updateTaskCounts();
    }
  });

  addTaskBtn.addEventListener("click", openAddTaskModal);

  closeTaskModal.addEventListener("click", closeModal.bind(null, taskModal));
  cancelTaskBtn.addEventListener("click", closeModal.bind(null, taskModal));

  saveTaskBtn.addEventListener("click", saveTask);

  taskTableBody.addEventListener("click", function (e) {
    if (e.target.closest(".action-btn.edit")) {
      const taskRow = e.target.closest("tr");
      openEditTaskModal(taskRow);
    }
  });

  taskTableBody.addEventListener("click", function (e) {
    if (e.target.closest(".action-btn.delete")) {
      const taskRow = e.target.closest("tr");
      openDeleteTaskModal(taskRow);
    }
  });

  closeDeleteTaskModal.addEventListener(
    "click",
    closeModal.bind(null, deleteTaskModal)
  );
  cancelDeleteTaskBtn.addEventListener(
    "click",
    closeModal.bind(null, deleteTaskModal)
  );

  confirmDeleteTaskBtn.addEventListener("click", deleteTask);

  addMemberBtn.addEventListener("click", openModal.bind(null, memberModal));

  closeMemberModal.addEventListener(
    "click",
    closeModal.bind(null, memberModal)
  );
  cancelMemberBtn.addEventListener("click", closeModal.bind(null, memberModal));

  btnEditProject.addEventListener("click", openModal.bind(null, projectModal));

  closeProjectModal.addEventListener(
    "click",
    closeModal.bind(null, projectModal)
  );
  cancelProjectBtn.addEventListener(
    "click",
    closeModal.bind(null, projectModal)
  );

  saveProjectBtn.addEventListener("click", saveProject);

  closeDeleteProjectModal.addEventListener(
    "click",
    closeModal.bind(null, deleteProjectModal)
  );
  cancelDeleteProjectBtn.addEventListener(
    "click",
    closeModal.bind(null, deleteProjectModal)
  );

  function initializeApp() {
    fetchTasks();
    updateTaskCounts();
    filterAndDisplayTasks();
    updateActivePaginationButton();

    setDefaultDates();
  }

  function toggleSidebar() {
    if (window.innerWidth < 992) {
      sidebar.classList.toggle("show");
    } else {
      sidebar.classList.toggle("collapsed");
      mainContent.classList.toggle("expanded");
    }
  }

  function fetchTasks() {
    tasks = Array.from(taskTableBody.querySelectorAll("tr")).map((row) => {
      return {
        id: row.dataset.taskId,
        name: row.querySelector("td:first-child").textContent,
        assigneeId: row.dataset.assignee,
        assigneeName: row.querySelector(".task-assignee span").textContent,
        assigneeAvatar: row.querySelector(".task-assignee img").src,
        priority: row.querySelector(".task-priority").className.includes("high")
          ? "high"
          : row.querySelector(".task-priority").className.includes("medium")
          ? "medium"
          : "low",
        startDate: row.querySelectorAll(".task-dates")[0].textContent,
        dueDate: row.querySelectorAll(".task-dates")[1].textContent,
        status: row.dataset.status,
      };
    });

    for (let i = 4; i <= 12; i++) {
      tasks.push({
        id: i.toString(),
        name: `Task Example ${i}`,
        assigneeId: ((i % 5) + 1).toString(),
        assigneeName: [
          "An Nguyen",
          "Bình Nguyễn",
          "Cường Trần",
          "Dương Lê",
          "Hải Phạm",
        ][i % 5],
        assigneeAvatar: `https://i.pravatar.cc/150?img=${(i % 5) + 1}`,
        priority: ["low", "medium", "high"][i % 3],
        startDate: "01/03/2024",
        dueDate: "15/03/2024",
        status: ["todo", "in-progress", "pending", "done"][i % 4],
      });
    }
  }

  function filterAndDisplayTasks() {
    let filteredTasks = tasks.filter((task) => {
      if (
        currentFilterStatus !== "all" &&
        task.status !== currentFilterStatus
      ) {
        return false;
      }

      if (
        currentSearchTerm &&
        !task.name.toLowerCase().includes(currentSearchTerm)
      ) {
        return false;
      }

      if (
        currentAssigneeFilter !== "all" &&
        task.assigneeId !== currentAssigneeFilter
      ) {
        return false;
      }

      return true;
    });

    filteredTasks.sort((a, b) => {
      switch (currentSortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "deadline":
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "status":
          const statusOrder = {
            todo: 0,
            "in-progress": 1,
            pending: 2,
            done: 3,
          };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    document.getElementById("currentItems").textContent =
      filteredTasks.length > 0
        ? `${startIndex + 1}-${Math.min(endIndex, filteredTasks.length)}`
        : "0";
    document.getElementById("totalItems").textContent = filteredTasks.length;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled =
      currentPage >= Math.ceil(filteredTasks.length / itemsPerPage);

    taskTableBody.innerHTML = "";

    if (paginatedTasks.length === 0) {
      const noTasksRow = document.createElement("tr");
      noTasksRow.innerHTML = `
          <td colspan="7" class="text-center">
            <div class="no-data">
              <i class="fas fa-search"></i>
              <p>Không tìm thấy nhiệm vụ nào phù hợp với bộ lọc</p>
            </div>
          </td>
        `;
      taskTableBody.appendChild(noTasksRow);
      return;
    }

    paginatedTasks.forEach((task) => {
      const row = document.createElement("tr");
      row.dataset.taskId = task.id;
      row.dataset.status = task.status;
      row.dataset.assignee = task.assigneeId;

      row.innerHTML = `
          <td>${task.name}</td>
          <td>
            <div class="task-assignee">
              <img src="${task.assigneeAvatar}" alt="${task.assigneeName}" />
              <span>${task.assigneeName}</span>
            </div>
          </td>
          <td>
            <span class="task-priority priority-${task.priority}">
              ${getPriorityText(task.priority)}
            </span>
          </td>
          <td class="task-dates">${task.startDate}</td>
          <td class="task-dates">${task.dueDate}</td>
          <td>
            <div class="status-dropdown">
              <span class="task-status status-${task.status}">${getStatusText(
        task.status
      )}</span>
              <div class="status-dropdown-content">
                <a href="#" data-status="todo">To do</a>
                <a href="#" data-status="in-progress">In Progress</a>
                <a href="#" data-status="pending">Pending</a>
                <a href="#" data-status="done">Done</a>
              </div>
            </div>
          </td>
          <td>
            <div class="action-buttons">
              <button class="action-btn edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        `;

      taskTableBody.appendChild(row);
    });
  }

  function updateActivePaginationButton() {
    paginationNumbers.forEach((button) => {
      button.classList.remove("active");
      if (parseInt(button.textContent) === currentPage) {
        button.classList.add("active");
      }
    });
  }

  function updateTaskCounts() {
    const counts = {
      all: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      "in-progress": tasks.filter((task) => task.status === "in-progress")
        .length,
      pending: tasks.filter((task) => task.status === "pending").length,
      done: tasks.filter((task) => task.status === "done").length,
    };

    categoryTabs.forEach((tab) => {
      const status = tab.dataset.status;
      const countSpan = tab.querySelector(".task-count");
      countSpan.textContent = counts[status] || 0;
    });
  }

  function openModal(modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }

  function openAddTaskModal() {
    taskForm.reset();
    taskId.value = "";

    taskModalTitle.textContent = "Thêm nhiệm vụ mới";

    setDefaultDates();

    openModal(taskModal);
  }

  function openEditTaskModal(taskRow) {
    const taskId = taskRow.dataset.taskId;
    const task = tasks.find((t) => t.id === taskId);

    if (!task) return;

    taskModalTitle.textContent = "Sửa nhiệm vụ";

    document.getElementById("taskId").value = task.id;
    document.getElementById("taskName").value = task.name;
    document.getElementById("taskDescription").value =
      "Mô tả chi tiết về nhiệm vụ này...";

    const startParts = task.startDate.split("/");
    const dueParts = task.dueDate.split("/");

    document.getElementById(
      "taskStartDate"
    ).value = `20${startParts[2]}-${startParts[1]}-${startParts[0]}`;
    document.getElementById(
      "taskDueDate"
    ).value = `20${dueParts[2]}-${startParts[1]}-${dueParts[0]}`;

    document.getElementById("taskAssigneeSelect").value = task.assigneeId;
    document.getElementById("taskPriority").value = task.priority;
    document.getElementById("taskStatus").value = task.status;

    openModal(taskModal);
  }

  function openDeleteTaskModal(taskRow) {
    const taskId = taskRow.dataset.taskId;
    const taskNameText = taskRow.querySelector("td:first-child").textContent;

    currentTaskToDelete = taskId;

    deleteTaskName.textContent = taskNameText;

    openModal(deleteTaskModal);
  }

  function saveTask() {
    if (!validateTaskForm()) {
      return;
    }

    const taskIdValue = document.getElementById("taskId").value;
    const isNewTask = !taskIdValue;

    const taskData = {
      id: isNewTask ? (tasks.length + 1).toString() : taskIdValue,
      name: document.getElementById("taskName").value,
      assigneeId: document.getElementById("taskAssigneeSelect").value,
      assigneeName:
        document.getElementById("taskAssigneeSelect").options[
          document.getElementById("taskAssigneeSelect").selectedIndex
        ].text,
      assigneeAvatar: `https://i.pravatar.cc/150?img=${
        document.getElementById("taskAssigneeSelect").value
      }`,
      priority: document.getElementById("taskPriority").value,
      status: document.getElementById("taskStatus").value,
      startDate: formatDateForDisplay(
        document.getElementById("taskStartDate").value
      ),
      dueDate: formatDateForDisplay(
        document.getElementById("taskDueDate").value
      ),
    };

    if (isNewTask) {
      tasks.push(taskData);
    } else {
      const index = tasks.findIndex((task) => task.id === taskIdValue);
      if (index !== -1) {
        tasks[index] = taskData;
      }
    }

    updateTaskCounts();
    filterAndDisplayTasks();

    closeModal(taskModal);

    alert(
      isNewTask
        ? "Đã thêm nhiệm vụ mới thành công!"
        : "Đã cập nhật nhiệm vụ thành công!"
    );
  }

  function deleteTask() {
    if (!currentTaskToDelete) return;

    const index = tasks.findIndex((task) => task.id === currentTaskToDelete);
    if (index !== -1) {
      tasks.splice(index, 1);
    }

    updateTaskCounts();
    filterAndDisplayTasks();

    closeModal(deleteTaskModal);

    currentTaskToDelete = null;

    alert("Đã xóa nhiệm vụ thành công!");
  }

  function saveProject() {
    if (!validateProjectForm()) {
      return;
    }

    document.querySelector(".project-title").textContent =
      document.getElementById("projectName").value;
    document.querySelector(".project-description p").textContent =
      document.getElementById("projectDescription").value;

    document.querySelector(".breadcrumb li.active").textContent =
      document.getElementById("projectName").value;

    closeModal(projectModal);

    alert("Đã cập nhật dự án thành công!");
  }

  function validateTaskForm() {
    let isValid = true;
    const name = document.getElementById("taskName");
    const startDate = document.getElementById("taskStartDate");
    const dueDate = document.getElementById("taskDueDate");
    const assignee = document.getElementById("taskAssigneeSelect");

    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
    });

    if (!name.value.trim()) {
      showError("taskNameError", "Vui lòng nhập tên nhiệm vụ");
      isValid = false;
    } else if (name.value.trim().length < 3 || name.value.trim().length > 100) {
      showError("taskNameError", "Tên nhiệm vụ phải từ 3 đến 100 ký tự");
      isValid = false;
    }

    if (!startDate.value) {
      showError("taskStartDateError", "Vui lòng chọn ngày bắt đầu");
      isValid = false;
    }

    if (!dueDate.value) {
      showError("taskDueDateError", "Vui lòng chọn deadline");
      isValid = false;
    } else if (new Date(dueDate.value) < new Date(startDate.value)) {
      showError("taskDueDateError", "Deadline phải sau ngày bắt đầu");
      isValid = false;
    }

    if (!assignee.value) {
      showError("taskAssigneeError", "Vui lòng chọn người phụ trách");
      isValid = false;
    }

    return isValid;
  }

  function validateProjectForm() {
    let isValid = true;
    const name = document.getElementById("projectName");
    const description = document.getElementById("projectDescription");
    const startDate = document.getElementById("projectStartDate");
    const endDate = document.getElementById("projectEndDate");

    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
    });

    if (!name.value.trim()) {
      showError("projectNameError", "Vui lòng nhập tên dự án");
      isValid = false;
    } else if (name.value.trim().length < 5 || name.value.trim().length > 100) {
      showError("projectNameError", "Tên dự án phải từ 5 đến 100 ký tự");
      isValid = false;
    }

    if (!description.value.trim()) {
      showError("projectDescriptionError", "Vui lòng nhập mô tả dự án");
      isValid = false;
    } else if (
      description.value.trim().length < 10 ||
      description.value.trim().length > 500
    ) {
      showError(
        "projectDescriptionError",
        "Mô tả dự án phải từ 10 đến 500 ký tự"
      );
      isValid = false;
    }

    if (!startDate.value) {
      showError("projectStartDateError", "Vui lòng chọn ngày bắt đầu");
      isValid = false;
    }

    if (!endDate.value) {
      showError("projectEndDateError", "Vui lòng chọn ngày kết thúc dự kiến");
      isValid = false;
    } else if (new Date(endDate.value) <= new Date(startDate.value)) {
      showError("projectEndDateError", "Ngày kết thúc phải sau ngày bắt đầu");
      isValid = false;
    }

    return isValid;
  }

  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  function setDefaultDates() {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const todayFormatted = today.toISOString().split("T")[0];
    const nextWeekFormatted = nextWeek.toISOString().split("T")[0];

    if (document.getElementById("taskStartDate")) {
      document.getElementById("taskStartDate").value = todayFormatted;
    }

    if (document.getElementById("taskDueDate")) {
      document.getElementById("taskDueDate").value = nextWeekFormatted;
    }
  }

  function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(2);
    return `${day}/${month}/${year}`;
  }

  function getStatusText(status) {
    switch (status) {
      case "todo":
        return "To do";
      case "in-progress":
        return "In Progress";
      case "pending":
        return "Pending";
      case "done":
        return "Done";
      default:
        return "Unknown";
    }
  }

  function getPriorityText(priority) {
    switch (priority) {
      case "high":
        return "Ưu tiên cao";
      case "medium":
        return "Ưu tiên trung bình";
      case "low":
        return "Ưu tiên thấp";
      default:
        return "Unknown";
    }
  }

  function checkScreenSize() {
    if (window.innerWidth < 992) {
      sidebar.classList.remove("collapsed");
      mainContent.classList.remove("expanded");
    }
  }

  window.addEventListener("resize", checkScreenSize);

  checkScreenSize();
  // ===== BIẾN TOÀN CỤC =====
  // Dữ liệu dự án (giả lập)
  let currentProject = {
    id: "1",
    name: "Xây dựng website thương mại điện tử",
    description:
      "Dự án nhằm phát triển một nền tảng thương mại điện tử với các tính năng phong phú giỏ hàng, thanh toán và quản lý sản phẩm. Giao diện người dùng sẽ được tối ưu hóa cho cả máy tính và thiết bị di động, với trải nghiệm mua sắm trực tuyến liền mạch.",
    status: "in-progress",
    startDate: "15/01/2024",
    endDate: "30/06/2024",
    ownerId: "1",
  };

  // Dữ liệu thành viên (giả lập)
  let members = [
    {
      id: "1",
      name: "An Nguyen",
      email: "an.nguyen@example.com",
      role: "Project Owner",
      avatar: "https://i.pravatar.cc/150?img=1",
      badge: "PM",
    },
    {
      id: "2",
      name: "Bình Nguyễn",
      email: "binh.nguyen@example.com",
      role: "Frontend Developer",
      avatar: "https://i.pravatar.cc/150?img=2",
      badge: "DEV",
    },
    {
      id: "3",
      name: "Cường Trần",
      email: "cuong.tran@example.com",
      role: "Backend Developer",
      avatar: "https://i.pravatar.cc/150?img=3",
      badge: "DEV",
    },
  ];

  // ===== HOÀN THIỆN CHỨC NĂNG HIỂN THỊ CHI TIẾT DỰ ÁN =====
  function loadProjectDetails() {
    // Cập nhật tiêu đề trang
    document.title = `${currentProject.name} | Hệ Thống Quản Lý Dự Án`;

    // Cập nhật breadcrumb
    const projectBreadcrumb = document.querySelector(".breadcrumb li.active");
    if (projectBreadcrumb) {
      projectBreadcrumb.textContent = currentProject.name;
    }

    // Cập nhật thông tin dự án
    const projectTitle = document.querySelector(".project-header h1");
    if (projectTitle) {
      projectTitle.textContent = currentProject.name;
    }

    const projectDesc = document.querySelector(".project-description p");
    if (projectDesc) {
      projectDesc.textContent = currentProject.description;
    }

    // Cập nhật số liệu thống kê
    updateProjectStats();
  }

  function updateProjectStats() {
    // Cập nhật thống kê nhiệm vụ
    const totalTasks = document.getElementById("totalTasks");
    const completedTasks = document.getElementById("completedTasks");
    const inProgressTasks = document.getElementById("inProgressTasks");
    const totalMembers = document.getElementById("totalMembers");

    if (totalTasks) totalTasks.textContent = tasks.length;
    if (completedTasks)
      completedTasks.textContent = tasks.filter(
        (t) => t.status === "done"
      ).length;
    if (inProgressTasks)
      inProgressTasks.textContent = tasks.filter(
        (t) => t.status === "in-progress"
      ).length;
    if (totalMembers) totalMembers.textContent = members.length;
  }

  // ===== HOÀN THIỆN CHỨC NĂNG QUẢN LÝ THÀNH VIÊN =====
  function displayMembers() {
    const membersList = document.getElementById("membersList");
    if (!membersList) return;

    membersList.innerHTML = "";

    if (members.length === 0) {
      membersList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-users"></i>
        <p>Chưa có thành viên nào trong dự án này</p>
        <button class="btn btn-primary" id="emptyAddMemberBtn">
          <i class="fas fa-user-plus"></i> Thêm thành viên
        </button>
      </div>
    `;

      // Kết nối nút thêm thành viên
      const emptyAddMemberBtn = document.getElementById("emptyAddMemberBtn");
      if (emptyAddMemberBtn) {
        emptyAddMemberBtn.addEventListener("click", function () {
          openModal(memberModal);
        });
      }

      return;
    }

    // Hiển thị danh sách thành viên
    members.forEach((member) => {
      const memberCard = document.createElement("div");
      memberCard.className = "member-card";
      memberCard.innerHTML = `
      <div class="member-avatar">
        <img src="${member.avatar}" alt="${member.name}" />
      </div>
      <div class="member-info">
        <h4>${member.name}</h4>
        <p>${member.role}</p>
      </div>
      <span class="badge badge-${member.id === "1" ? "primary" : "success"}">${
        member.badge
      }</span>
      ${
        member.id !== "1"
          ? `
        <button class="btn btn-sm btn-danger remove-member" data-id="${member.id}" style="margin-left: 10px;">
          <i class="fas fa-times"></i>
        </button>
      `
          : ""
      }
    `;

      membersList.appendChild(memberCard);
    });

    // Kết nối sự kiện xóa thành viên
    const removeButtons = document.querySelectorAll(".remove-member");
    removeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const memberId = this.getAttribute("data-id");
        if (confirm(`Bạn có chắc chắn muốn xóa thành viên này khỏi dự án?`)) {
          removeMember(memberId);
        }
      });
    });
  }

  // Xóa thành viên
  function removeMember(memberId) {
    // Xóa thành viên
    members = members.filter((m) => m.id !== memberId);

    // Cập nhật hiển thị
    displayMembers();
    updateProjectStats();

    // Cập nhật danh sách người thực hiện trong dropdown
    updateAssigneeDropdowns();

    // Thông báo
    alert("Đã xóa thành viên khỏi dự án");
  }

  // Cập nhật dropdown người thực hiện
  function updateAssigneeDropdowns() {
    // Cập nhật danh sách người thực hiện trong dropdown filter
    const taskAssignee = document.getElementById("taskAssignee");
    if (taskAssignee) {
      // Lưu lại giá trị hiện tại
      const currentValue = taskAssignee.value;

      // Xóa tất cả các option cũ
      while (taskAssignee.options.length > 1) {
        taskAssignee.remove(1);
      }

      // Thêm lại từ danh sách members
      members.forEach((member) => {
        const option = document.createElement("option");
        option.value = member.id;
        option.textContent = member.name;
        taskAssignee.appendChild(option);
      });

      // Khôi phục giá trị
      if (members.some((m) => m.id === currentValue)) {
        taskAssignee.value = currentValue;
      } else {
        taskAssignee.value = "all";
      }
    }

    // Cập nhật danh sách người thực hiện trong modal task
    const taskAssigneeSelect = document.getElementById("taskAssigneeSelect");
    if (taskAssigneeSelect) {
      // Lưu lại giá trị hiện tại
      const currentValue = taskAssigneeSelect.value;

      // Xóa tất cả các option cũ (trừ option rỗng đầu tiên)
      while (taskAssigneeSelect.options.length > 1) {
        taskAssigneeSelect.remove(1);
      }

      // Thêm lại từ danh sách members
      members.forEach((member) => {
        const option = document.createElement("option");
        option.value = member.id;
        option.textContent = member.name;
        taskAssigneeSelect.appendChild(option);
      });

      // Khôi phục giá trị
      if (members.some((m) => m.id === currentValue)) {
        taskAssigneeSelect.value = currentValue;
      } else {
        taskAssigneeSelect.value = "";
      }
    }
  }

  // ===== NÂNG CAO CHỨC NĂNG QUẢN LÝ NHIỆM VỤ =====
  function enhanceTaskManagement() {
    // Thêm hỗ trợ highlight khi tìm kiếm
    setupTaskStatusSearch();

    // Thêm tooltip cho các nút action
    addTooltips();

    // Thêm xác nhận khi xóa nhiệm vụ quan trọng
    enhanceTaskDelete();
  }

  function setupTaskStatusSearch() {
    // Thêm style cho highlight
    const style = document.createElement("style");
    style.textContent = `
    .highlight {
      background-color: #fff3cd;
      padding: 2px;
      border-radius: 2px;
    }
  `;
    document.head.appendChild(style);

    // Tăng cường chức năng tìm kiếm với highlight
    const originalTaskSearch = taskSearch.oninput;
    taskSearch.oninput = function () {
      const searchTerm = this.value.trim().toLowerCase();

      // Gọi sự kiện gốc
      if (originalTaskSearch) {
        originalTaskSearch.call(this);
      }

      // Thêm highlight
      setTimeout(() => {
        if (searchTerm.length > 0) {
          const taskCells = document.querySelectorAll(
            "#taskTableBody tr td:first-child"
          );
          taskCells.forEach((cell) => {
            const text = cell.textContent;
            const regex = new RegExp(`(${searchTerm})`, "gi");
            cell.innerHTML = text.replace(
              regex,
              '<span class="highlight">$1</span>'
            );
          });
        }
      }, 100);
    };
  }

  function addTooltips() {
    // Thêm tiêu đề cho các nút
    const tooltipStyle = document.createElement("style");
    tooltipStyle.textContent = `
    [data-tooltip] {
      position: relative;
    }
    [data-tooltip]:before {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0,0,0,0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      visibility: hidden;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 10;
    }
    [data-tooltip]:hover:before {
      visibility: visible;
      opacity: 1;
    }
  `;
    document.head.appendChild(tooltipStyle);

    // Áp dụng tooltip cho các nút edit và delete
    document.addEventListener("mouseover", function (e) {
      const target = e.target.closest(".action-btn");
      if (target) {
        if (
          target.classList.contains("edit") &&
          !target.hasAttribute("data-tooltip")
        ) {
          target.setAttribute("data-tooltip", "Chỉnh sửa nhiệm vụ");
        } else if (
          target.classList.contains("delete") &&
          !target.hasAttribute("data-tooltip")
        ) {
          target.setAttribute("data-tooltip", "Xóa nhiệm vụ");
        }
      }
    });
  }

  function enhanceTaskDelete() {
    // Đảm bảo có xác nhận khi xóa task quan trọng
    document.addEventListener("click", function (e) {
      const deleteBtn = e.target.closest(".action-btn.delete");
      if (deleteBtn) {
        const taskRow = deleteBtn.closest("tr");
        const priorityEl = taskRow.querySelector(".task-priority");

        if (priorityEl && priorityEl.classList.contains("priority-high")) {
          // Thêm class vào modal
          deleteTaskModal.classList.add("important-task");

          // Thêm cảnh báo nếu chưa có
          setTimeout(() => {
            const modalBody = deleteTaskModal.querySelector(".modal-body");
            if (!modalBody.querySelector(".important-warning")) {
              const warning = document.createElement("p");
              warning.className = "text-danger important-warning";
              warning.innerHTML =
                "<strong>Cảnh báo:</strong> Đây là nhiệm vụ ưu tiên cao!";
              modalBody.appendChild(warning);
            }
          }, 10);
        } else {
          // Xóa class và cảnh báo nếu có
          deleteTaskModal.classList.remove("important-task");
          setTimeout(() => {
            const warningEl =
              deleteTaskModal.querySelector(".important-warning");
            if (warningEl) warningEl.remove();
          }, 10);
        }
      }
    });
  }

  // ===== KHỞI TẠO VÀ KẾT NỐI CHỨC NĂNG =====
  function setupMemberModal() {
    // Sample data cho tìm kiếm thành viên
    const potentialMembers = [
      {
        id: "4",
        name: "Giang Trần",
        email: "giang.tran@example.com",
        avatar: "https://i.pravatar.cc/150?img=10",
      },
      {
        id: "5",
        name: "Hương Nguyễn",
        email: "huong.nguyen@example.com",
        avatar: "https://i.pravatar.cc/150?img=11",
      },
      {
        id: "6",
        name: "Khánh Lê",
        email: "khanh.le@example.com",
        avatar: "https://i.pravatar.cc/150?img=12",
      },
      {
        id: "7",
        name: "Minh Đặng",
        email: "minh.dang@example.com",
        avatar: "https://i.pravatar.cc/150?img=13",
      },
    ];

    // Kết nối chức năng tìm kiếm thành viên
    const searchMemberInput = document.getElementById("searchMember");
    const searchMemberBtn = document.querySelector("#memberModal .btn-primary");
    const memberSearchResults = document.getElementById("memberSearchResults");

    if (searchMemberBtn && searchMemberInput && memberSearchResults) {
      searchMemberBtn.addEventListener("click", function () {
        const searchTerm = searchMemberInput.value.trim().toLowerCase();
        if (searchTerm.length < 2) {
          alert("Vui lòng nhập ít nhất 2 ký tự để tìm kiếm");
          return;
        }

        // Lọc kết quả
        const filteredMembers = potentialMembers.filter(
          (member) =>
            (member.name.toLowerCase().includes(searchTerm) ||
              member.email.toLowerCase().includes(searchTerm)) &&
            !members.some((m) => m.id === member.id)
        );

        // Hiển thị kết quả
        memberSearchResults.innerHTML = "";

        if (filteredMembers.length === 0) {
          memberSearchResults.innerHTML = `
          <div class="text-center p-3">
            <p>Không tìm thấy thành viên phù hợp</p>
          </div>
        `;
          return;
        }

        filteredMembers.forEach((member) => {
          const memberItem = document.createElement("div");
          memberItem.className = "member-search-item";
          memberItem.innerHTML = `
          <div class="member-avatar">
            <img src="${member.avatar}" alt="${member.name}" />
          </div>
          <div class="member-info">
            <h4>${member.name}</h4>
            <p>${member.email}</p>
          </div>
          <button class="btn btn-sm btn-primary add-member-btn" data-id="${member.id}" data-name="${member.name}">
            Thêm
          </button>
        `;

          memberSearchResults.appendChild(memberItem);
        });

        // Kết nối các nút thêm thành viên
        const addButtons =
          memberSearchResults.querySelectorAll(".add-member-btn");
        addButtons.forEach((button) => {
          button.addEventListener("click", function () {
            const memberId = this.getAttribute("data-id");
            const memberName = this.getAttribute("data-name");

            // Tìm thông tin thành viên
            const member = potentialMembers.find((m) => m.id === memberId);
            if (member) {
              // Thêm thành viên vào dự án
              members.push({
                id: member.id,
                name: member.name,
                email: member.email,
                role: "Team Member",
                avatar: member.avatar,
                badge: "DEV",
              });

              // Cập nhật hiển thị
              displayMembers();
              updateProjectStats();
              updateAssigneeDropdowns();

              // Thông báo
              alert(`Đã thêm ${member.name} vào dự án`);

              // Xóa item khỏi kết quả tìm kiếm
              this.closest(".member-search-item").remove();
            }
          });
        });
      });

      // Thêm hỗ trợ Enter để tìm kiếm
      searchMemberInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          searchMemberBtn.click();
        }
      });
    }
  }

  // Khởi tạo các chức năng mở rộng
  function initializeExtendedFeatures() {
    // Tải dữ liệu dự án
    loadProjectDetails();

    // Hiển thị danh sách thành viên
    displayMembers();

    // Cập nhật dropdown người thực hiện
    updateAssigneeDropdowns();

    // Nâng cao chức năng nhiệm vụ
    enhanceTaskManagement();

    // Kết nối modal thêm thành viên
    setupMemberModal();
  }

  // Gọi hàm khởi tạo
  initializeExtendedFeatures();
});
