document.addEventListener("DOMContentLoaded", function () {
  // === DOM Elements ===
  // Sidebar & main elements
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const toggleBtn = document.getElementById("toggle-sidebar");

  // Task filter elements
  const categoryTabs = document.querySelectorAll(".category-tab");
  const taskSearch = document.getElementById("taskSearch");
  const taskSort = document.getElementById("taskSort");
  const taskAssignee = document.getElementById("taskAssignee");
  const taskTableBody = document.getElementById("taskTableBody");

  // Pagination elements
  const paginationNumbers = document.querySelectorAll(".pagination-number");
  const prevBtn = document.querySelector(".pagination-btn.prev");
  const nextBtn = document.querySelector(".pagination-btn.next");
  const currentItemsElement = document.getElementById("currentItems");
  const totalItemsElement = document.getElementById("totalItems");

  // Task modal elements
  const taskModal = document.getElementById("taskModal");
  const taskModalTitle = document.getElementById("taskModalTitle");
  const closeTaskModal = document.getElementById("closeTaskModal");
  const taskForm = document.getElementById("taskForm");
  const taskId = document.getElementById("taskId");
  const cancelTaskBtn = document.getElementById("cancelTaskBtn");
  const saveTaskBtn = document.getElementById("saveTaskBtn");
  const addTaskBtn = document.getElementById("addTaskBtn");

  // Delete task modal elements
  const deleteTaskModal = document.getElementById("deleteTaskModal");
  const closeDeleteTaskModal = document.getElementById("closeDeleteTaskModal");
  const deleteTaskName = document.getElementById("deleteTaskName");
  const cancelDeleteTaskBtn = document.getElementById("cancelDeleteTaskBtn");
  const confirmDeleteTaskBtn = document.getElementById("confirmDeleteTaskBtn");

  // Project modal elements
  const projectModal = document.getElementById("projectModal");
  const closeProjectModal = document.getElementById("closeProjectModal");
  const cancelProjectBtn = document.getElementById("cancelProjectBtn");
  const saveProjectBtn = document.getElementById("saveProjectBtn");
  const btnEditProject = document.querySelector(".btn-edit-project");

  // === State Variables ===
  let currentPage = 1;
  let itemsPerPage = 3;
  let currentTaskToDelete = null;
  let currentFilterStatus = "all";
  let currentSearchTerm = "";
  let currentAssigneeFilter = "all";
  let currentSortOption = "name";
  let tasks = [];

  // === Initialize App ===
  function initializeApp() {
    // Load initial tasks
    fetchTasks();
    // Update task counts
    updateTaskCounts();
    // Display filtered tasks
    filterAndDisplayTasks();
    // Set default dates for new tasks
    setDefaultDates();
  }

  // === Event Listeners ===
  // Sidebar toggle
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("show");
      if (window.innerWidth >= 992) {
        mainContent.classList.toggle("expanded");
      }
    });
  }

  // Category filter
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

  // Search
  if (taskSearch) {
    taskSearch.addEventListener("input", function () {
      currentSearchTerm = this.value.trim().toLowerCase();
      currentPage = 1;
      updateActivePaginationButton();
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        filterAndDisplayTasks();
      }, 300);
    });
  }

  // Sort
  if (taskSort) {
    taskSort.addEventListener("change", function () {
      currentSortOption = this.value;
      filterAndDisplayTasks();
    });
  }

  // Assignee filter
  if (taskAssignee) {
    taskAssignee.addEventListener("change", function () {
      currentAssigneeFilter = this.value;
      currentPage = 1;
      updateActivePaginationButton();
      filterAndDisplayTasks();
    });
  }

  // Pagination
  paginationNumbers.forEach((button) => {
    button.addEventListener("click", function () {
      currentPage = parseInt(this.textContent);
      updateActivePaginationButton();
      filterAndDisplayTasks();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        updateActivePaginationButton();
        filterAndDisplayTasks();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      const totalItems = tasks.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      if (currentPage < totalPages) {
        currentPage++;
        updateActivePaginationButton();
        filterAndDisplayTasks();
      }
    });
  }

  // Task status change
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

      // Update task in array
      const taskId = taskRow.dataset.taskId;
      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        updateTaskCounts();
      }
    }
  });

  // Add/Edit/Delete task buttons
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", openAddTaskModal);
  }

  if (taskTableBody) {
    taskTableBody.addEventListener("click", function (e) {
      if (e.target.closest(".action-btn.edit")) {
        const taskRow = e.target.closest("tr");
        openEditTaskModal(taskRow);
      } else if (e.target.closest(".action-btn.delete")) {
        const taskRow = e.target.closest("tr");
        openDeleteTaskModal(taskRow);
      }
    });
  }

  // Modal close buttons
  if (closeTaskModal)
    closeTaskModal.addEventListener("click", () => closeModal(taskModal));
  if (cancelTaskBtn)
    cancelTaskBtn.addEventListener("click", () => closeModal(taskModal));
  if (closeDeleteTaskModal)
    closeDeleteTaskModal.addEventListener("click", () =>
      closeModal(deleteTaskModal)
    );
  if (cancelDeleteTaskBtn)
    cancelDeleteTaskBtn.addEventListener("click", () =>
      closeModal(deleteTaskModal)
    );
  if (closeProjectModal)
    closeProjectModal.addEventListener("click", () => closeModal(projectModal));
  if (cancelProjectBtn)
    cancelProjectBtn.addEventListener("click", () => closeModal(projectModal));

  // Save/Delete buttons
  if (saveTaskBtn) saveTaskBtn.addEventListener("click", saveTask);
  if (confirmDeleteTaskBtn)
    confirmDeleteTaskBtn.addEventListener("click", deleteTask);
  if (saveProjectBtn) saveProjectBtn.addEventListener("click", saveProject);

  // Edit project button
  if (btnEditProject) {
    btnEditProject.addEventListener("click", () => openModal(projectModal));
  }

  // === Functions ===
  // Fetch tasks (demo data)
  function fetchTasks() {
    // Đầu tiên, lấy các task từ table hiện tại
    const existingTasks = Array.from(taskTableBody.querySelectorAll("tr")).map(
      (row) => {
        return {
          id: row.dataset.taskId,
          name: row.querySelector("td:first-child").textContent,
          assigneeId: row.dataset.assignee,
          assigneeName: row.querySelector(".task-assignee span").textContent,
          assigneeAvatar: row.querySelector(".task-assignee img").src,
          priority: row
            .querySelector(".task-priority")
            .className.includes("high")
            ? "high"
            : row.querySelector(".task-priority").className.includes("medium")
            ? "medium"
            : "low",
          startDate: row.querySelectorAll(".task-dates")[0].textContent,
          dueDate: row.querySelectorAll(".task-dates")[1].textContent,
          status: row.dataset.status,
        };
      }
    );

    // Bắt đầu với mảng tasks rỗng
    tasks = [];

    // Thêm các task hiện có
    tasks = tasks.concat(existingTasks);

    // Thêm task mẫu nếu chưa có đủ task
    if (tasks.length < 3) {
      // Thêm mẫu task đầu tiên nếu chưa có
      if (!tasks.some((t) => t.id === "1")) {
        tasks.push({
          id: "1",
          name: "Soạn thảo đề cương dự án",
          assigneeId: "1",
          assigneeName: "An Nguyen",
          assigneeAvatar: "https://i.pravatar.cc/150?img=1",
          priority: "high",
          startDate: "01/02/2024",
          dueDate: "15/02/2024",
          status: "todo",
        });
      }

      // Thêm mẫu task thứ hai nếu chưa có
      if (!tasks.some((t) => t.id === "2")) {
        tasks.push({
          id: "2",
          name: "Thiết kế giao diện trang chủ",
          assigneeId: "2",
          assigneeName: "Bình Nguyễn",
          assigneeAvatar: "https://i.pravatar.cc/150?img=2",
          priority: "medium",
          startDate: "05/03/2024",
          dueDate: "20/03/2024",
          status: "in-progress",
        });
      }

      // Thêm mẫu task thứ ba nếu chưa có
      if (!tasks.some((t) => t.id === "3")) {
        tasks.push({
          id: "3",
          name: "Cài đặt cơ sở dữ liệu",
          assigneeId: "3",
          assigneeName: "Cường Trần",
          assigneeAvatar: "https://i.pravatar.cc/150?img=3",
          priority: "high",
          startDate: "01/02/2024",
          dueDate: "10/02/2024",
          status: "done",
        });
      }
    }

    // Thêm thêm task mẫu cho phân trang
    for (let i = 4; i <= 12; i++) {
      if (!tasks.some((t) => t.id === i.toString())) {
        tasks.push({
          id: i.toString(),
          name: `Task Example ${i}`,
          assigneeId: ((i % 3) + 1).toString(),
          assigneeName: ["An Nguyen", "Bình Nguyễn", "Cường Trần"][i % 3],
          assigneeAvatar: `https://i.pravatar.cc/150?img=${(i % 3) + 1}`,
          priority: ["low", "medium", "high"][i % 3],
          startDate: "01/03/2024",
          dueDate: "15/03/2024",
          status: ["todo", "in-progress", "pending", "done"][i % 4],
        });
      }
    }
  }

  // Filter and display tasks
  function filterAndDisplayTasks() {
    // Lọc task theo các điều kiện
    let filteredTasks = tasks.filter((task) => {
      // Filter by status
      if (
        currentFilterStatus !== "all" &&
        task.status !== currentFilterStatus
      ) {
        return false;
      }

      // Filter by search term
      if (
        currentSearchTerm &&
        !task.name.toLowerCase().includes(currentSearchTerm)
      ) {
        return false;
      }

      // Filter by assignee
      if (
        currentAssigneeFilter !== "all" &&
        task.assigneeId !== currentAssigneeFilter
      ) {
        return false;
      }

      return true;
    });

    // Sắp xếp tasks
    filteredTasks.sort((a, b) => {
      switch (currentSortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "deadline":
          // Chuyển đổi format DD/MM/YY sang Date để so sánh
          const [dayA, monthA, yearA] = a.dueDate.split("/");
          const [dayB, monthB, yearB] = b.dueDate.split("/");
          return (
            new Date(`20${yearA}`, monthA - 1, dayA) -
            new Date(`20${yearB}`, monthB - 1, dayB)
          );
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

    // Tính toán tổng số trang
    const totalPages = Math.max(
      1,
      Math.ceil(filteredTasks.length / itemsPerPage)
    );

    // Đảm bảo trang hiện tại không vượt quá tổng số trang
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    // Phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredTasks.length);
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    // Cập nhật thông tin phân trang
    if (currentItemsElement) {
      currentItemsElement.textContent =
        filteredTasks.length > 0 ? `${startIndex + 1}-${endIndex}` : "0";
    }

    if (totalItemsElement) {
      totalItemsElement.textContent = filteredTasks.length;
    }

    // Cập nhật trạng thái của các nút phân trang
    if (prevBtn) {
      prevBtn.disabled = currentPage <= 1;
    }

    if (nextBtn) {
      nextBtn.disabled = currentPage >= totalPages;
    }

    // Cập nhật nút số trang
    paginationNumbers.forEach((button, index) => {
      if (index < totalPages) {
        button.style.display = "";
      } else {
        button.style.display = "none";
      }
    });

    // Xóa table hiện tại
    if (taskTableBody) {
      taskTableBody.innerHTML = "";

      // Hiển thị thông báo nếu không có task
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
      } else {
        // Hiển thị các task cho trang hiện tại
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
    }

    // Cập nhật nút phân trang active
    updateActivePaginationButton();
  }

  // Update task counts
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
      if (countSpan) {
        countSpan.textContent = counts[status] || 0;
      }
    });
  }

  // Update active pagination button
  function updateActivePaginationButton() {
    paginationNumbers.forEach((button) => {
      button.classList.remove("active");
      if (parseInt(button.textContent) === currentPage) {
        button.classList.add("active");
      }
    });
  }

  // Open/Close modal
  function openModal(modal) {
    if (modal) {
      modal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove("show");
      document.body.style.overflow = "";
    }
  }

  // Add task modal
  function openAddTaskModal() {
    if (taskForm) {
      taskForm.reset();
    }

    if (taskId) {
      taskId.value = "";
    }

    if (taskModalTitle) {
      taskModalTitle.textContent = "Thêm nhiệm vụ mới";
    }

    setDefaultDates();
    openModal(taskModal);
  }

  // Edit task modal
  function openEditTaskModal(taskRow) {
    if (!taskRow) return;

    const taskIdValue = taskRow.dataset.taskId;
    const task = tasks.find((t) => t.id === taskIdValue);

    if (!task) return;

    if (taskModalTitle) {
      taskModalTitle.textContent = "Sửa nhiệm vụ";
    }

    const taskIdField = document.getElementById("taskId");
    const taskNameField = document.getElementById("taskName");
    const taskDescField = document.getElementById("taskDescription");
    const taskStartDateField = document.getElementById("taskStartDate");
    const taskDueDateField = document.getElementById("taskDueDate");
    const taskAssigneeField = document.getElementById("taskAssigneeSelect");
    const taskPriorityField = document.getElementById("taskPriority");
    const taskStatusField = document.getElementById("taskStatus");

    if (taskIdField) taskIdField.value = task.id;
    if (taskNameField) taskNameField.value = task.name;
    if (taskDescField)
      taskDescField.value = "Mô tả chi tiết về nhiệm vụ này...";

    // Xử lý dữ liệu ngày tháng
    if (taskStartDateField && taskDueDateField) {
      const startParts = task.startDate.split("/");
      const dueParts = task.dueDate.split("/");

      if (startParts.length === 3 && dueParts.length === 3) {
        taskStartDateField.value = `20${startParts[2]}-${startParts[1]}-${startParts[0]}`;
        taskDueDateField.value = `20${dueParts[2]}-${dueParts[1]}-${dueParts[0]}`;
      }
    }

    if (taskAssigneeField) taskAssigneeField.value = task.assigneeId;
    if (taskPriorityField) taskPriorityField.value = task.priority;
    if (taskStatusField) taskStatusField.value = task.status;

    openModal(taskModal);
  }

  // Delete task modal
  function openDeleteTaskModal(taskRow) {
    if (!taskRow) return;

    const taskIdValue = taskRow.dataset.taskId;
    const taskNameText = taskRow.querySelector("td:first-child").textContent;

    currentTaskToDelete = taskIdValue;

    if (deleteTaskName) {
      deleteTaskName.textContent = taskNameText;
    }

    openModal(deleteTaskModal);
  }

  // Save task
  function saveTask() {
    if (!validateTaskForm()) {
      return;
    }

    const taskIdField = document.getElementById("taskId");
    const taskNameField = document.getElementById("taskName");
    const taskAssigneeField = document.getElementById("taskAssigneeSelect");
    const taskPriorityField = document.getElementById("taskPriority");
    const taskStatusField = document.getElementById("taskStatus");
    const taskStartDateField = document.getElementById("taskStartDate");
    const taskDueDateField = document.getElementById("taskDueDate");

    if (
      !taskIdField ||
      !taskNameField ||
      !taskAssigneeField ||
      !taskPriorityField ||
      !taskStatusField ||
      !taskStartDateField ||
      !taskDueDateField
    ) {
      return;
    }

    const taskIdValue = taskIdField.value;
    const isNewTask = !taskIdValue;

    let assigneeName = "";
    let assigneeIndex = taskAssigneeField.selectedIndex;

    if (assigneeIndex >= 0) {
      assigneeName = taskAssigneeField.options[assigneeIndex].text;
    }

    const taskData = {
      id: isNewTask ? (tasks.length + 1).toString() : taskIdValue,
      name: taskNameField.value,
      assigneeId: taskAssigneeField.value,
      assigneeName: assigneeName,
      assigneeAvatar: `https://i.pravatar.cc/150?img=${taskAssigneeField.value}`,
      priority: taskPriorityField.value,
      status: taskStatusField.value,
      startDate: formatDateForDisplay(taskStartDateField.value),
      dueDate: formatDateForDisplay(taskDueDateField.value),
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

  // Delete task
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

  // Save project
  function saveProject() {
    if (!validateProjectForm()) {
      return;
    }

    const projectNameField = document.getElementById("projectName");
    const projectDescField = document.getElementById("projectDescription");

    if (!projectNameField || !projectDescField) {
      return;
    }

    const projectTitle = document.querySelector(".project-header h1");
    const projectDesc = document.querySelector(".project-description p");
    const breadcrumb = document.querySelector(".breadcrumb li.active");

    if (projectTitle) {
      projectTitle.textContent = projectNameField.value;
    }

    if (projectDesc) {
      projectDesc.textContent = projectDescField.value;
    }

    if (breadcrumb) {
      breadcrumb.textContent = projectNameField.value;
    }

    closeModal(projectModal);

    alert("Đã cập nhật dự án thành công!");
  }

  // Validate forms
  function validateTaskForm() {
    let isValid = true;
    const name = document.getElementById("taskName");
    const startDate = document.getElementById("taskStartDate");
    const dueDate = document.getElementById("taskDueDate");
    const assignee = document.getElementById("taskAssigneeSelect");

    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
    });

    if (name && !name.value.trim()) {
      showError("taskNameError", "Vui lòng nhập tên nhiệm vụ");
      isValid = false;
    }

    if (startDate && !startDate.value) {
      showError("taskStartDateError", "Vui lòng chọn ngày bắt đầu");
      isValid = false;
    }

    if (dueDate && !dueDate.value) {
      showError("taskDueDateError", "Vui lòng chọn deadline");
      isValid = false;
    } else if (
      startDate &&
      dueDate &&
      new Date(dueDate.value) < new Date(startDate.value)
    ) {
      showError("taskDueDateError", "Deadline phải sau ngày bắt đầu");
      isValid = false;
    }

    if (assignee && !assignee.value) {
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

    if (name && !name.value.trim()) {
      showError("projectNameError", "Vui lòng nhập tên dự án");
      isValid = false;
    }

    if (description && !description.value.trim()) {
      showError("projectDescriptionError", "Vui lòng nhập mô tả dự án");
      isValid = false;
    }

    if (startDate && !startDate.value) {
      showError("projectStartDateError", "Vui lòng chọn ngày bắt đầu");
      isValid = false;
    }

    if (endDate && !endDate.value) {
      showError("projectEndDateError", "Vui lòng chọn ngày kết thúc dự kiến");
      isValid = false;
    } else if (
      startDate &&
      endDate &&
      new Date(endDate.value) <= new Date(startDate.value)
    ) {
      showError("projectEndDateError", "Ngày kết thúc phải sau ngày bắt đầu");
      isValid = false;
    }

    return isValid;
  }

  // Helper functions
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

    const taskStartDate = document.getElementById("taskStartDate");
    const taskDueDate = document.getElementById("taskDueDate");

    if (taskStartDate) {
      taskStartDate.value = todayFormatted;
    }

    if (taskDueDate) {
      taskDueDate.value = nextWeekFormatted;
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

  // Check screen size and adjust sidebar
  function checkScreenSize() {
    if (window.innerWidth < 992) {
      sidebar.classList.remove("collapsed");
      mainContent.classList.remove("expanded");
    }
  }

  window.addEventListener("resize", checkScreenSize);

  // Initialize app
  initializeApp();
  checkScreenSize();
});
