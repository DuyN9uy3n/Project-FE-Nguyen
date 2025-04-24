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
});
