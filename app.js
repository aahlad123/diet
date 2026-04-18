const CLIENT_SESSION_KEY = "diet-session-token-v1";

const defaultGoals = {
  calories: 2200,
  protein: 150,
  carbs: 220,
  fat: 70,
};

const authScreen = document.querySelector("#auth-screen");
const appShell = document.querySelector("#app-shell");
const loginForm = document.querySelector("#login-form");
const signupForm = document.querySelector("#signup-form");
const showLoginBtn = document.querySelector("#show-login-btn");
const showSignupBtn = document.querySelector("#show-signup-btn");
const loginEmail = document.querySelector("#login-email");
const loginPassword = document.querySelector("#login-password");
const signupEmail = document.querySelector("#signup-email");
const signupPassword = document.querySelector("#signup-password");
const signupConfirmPassword = document.querySelector("#signup-confirm-password");
const loginFeedback = document.querySelector("#login-feedback");
const signupFeedback = document.querySelector("#signup-feedback");
const logoutBtn = document.querySelector("#logout-btn");
const currentUserCopy = document.querySelector("#current-user-copy");
const adminPanel = document.querySelector("#admin-panel");
const adminMailCopy = document.querySelector("#admin-mail-copy");
const notificationList = document.querySelector("#notification-list");
const auditLogList = document.querySelector("#audit-log-list");
const goalForm = document.querySelector("#goal-form");
const mealForm = document.querySelector("#meal-form");
const macroSummary = document.querySelector("#macro-summary");
const mealList = document.querySelector("#meal-list");
const summaryStatus = document.querySelector("#summary-status");
const dayStatusCopy = document.querySelector("#day-status-copy");
const mealTemplate = document.querySelector("#meal-item-template");
const analyzeMealBtn = document.querySelector("#analyze-meal-btn");
const ingredientPreview = document.querySelector("#ingredient-preview");
const analysisFeedback = document.querySelector("#analysis-feedback");
const selectedDateInput = document.querySelector("#selected-date");
const jumpTodayBtn = document.querySelector("#jump-today-btn");
const selectedDateCopy = document.querySelector("#selected-date-copy");
const dateModePill = document.querySelector("#date-mode-pill");
const historyList = document.querySelector("#history-list");
const mealSectionCopy = document.querySelector("#meal-section-copy");

const foodDatabase = [
  createFood("Chicken Breast", ["chicken breast", "chicken"], 165, 31, 0, 3.6, {
    piece: 120,
    serving: 150,
  }),
  createFood("Cooked Rice", ["cooked rice", "rice"], 130, 2.7, 28.2, 0.3, {
    cup: 158,
    bowl: 150,
    katori: 150,
    plate: 300,
  }),
  createFood("Egg", ["egg", "eggs"], 143, 12.6, 0.7, 9.5, {
    piece: 50,
    unit: 50,
  }),
  createFood("Oats", ["oats", "rolled oats"], 389, 16.9, 66.3, 6.9, {
    cup: 80,
    tbsp: 5,
  }),
  createFood("Banana", ["banana", "bananas"], 89, 1.1, 22.8, 0.3, {
    piece: 118,
    unit: 118,
  }),
  createFood("Milk", ["milk"], 61, 3.2, 4.8, 3.3, {
    cup: 240,
    glass: 250,
  }),
  createFood("Curd", ["curd", "yogurt", "yoghurt"], 61, 3.5, 4.7, 3.3, {
    cup: 245,
    bowl: 200,
    katori: 150,
  }),
  createFood("Greek Yogurt", ["greek yogurt", "greek yoghurt"], 59, 10.3, 3.6, 0.4, {
    cup: 245,
    bowl: 200,
  }),
  createFood("Paneer", ["paneer"], 265, 18.3, 1.2, 20.8, {
    cup: 160,
    serving: 100,
  }),
  createFood("Tofu", ["tofu"], 76, 8, 1.9, 4.8, {
    cup: 124,
    piece: 85,
  }),
  createFood("Dal", ["dal", "lentils", "cooked lentils"], 116, 9, 20.1, 0.4, {
    cup: 200,
    bowl: 180,
    katori: 150,
  }),
  createFood("Roti", ["roti", "rotis", "chapati", "chapatis"], 297, 9.6, 49.4, 7.5, {
    piece: 40,
    unit: 40,
  }),
  createFood("Olive Oil", ["olive oil"], 884, 0, 0, 100, {
    tbsp: 13.5,
    tsp: 4.5,
  }),
  createFood("Almonds", ["almonds", "almond"], 579, 21.2, 21.6, 49.9, {
    tbsp: 9,
    handful: 28,
    piece: 1.2,
  }),
  createFood("Peanut Butter", ["peanut butter"], 588, 25, 20, 50, {
    tbsp: 16,
    tsp: 5,
  }),
  createFood("Apple", ["apple", "apples"], 52, 0.3, 13.8, 0.2, {
    piece: 182,
    unit: 182,
  }),
  createFood("Potato", ["potato", "potatoes", "boiled potato"], 87, 1.9, 20.1, 0.1, {
    piece: 173,
    unit: 173,
  }),
  createFood("Salmon", ["salmon"], 208, 20, 0, 13, {
    piece: 154,
    serving: 120,
  }),
];

const numberWords = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  half: 0.5,
  quarter: 0.25,
};

const state = {
  currentUser: null,
  goals: { ...defaultGoals },
  meals: [],
  history: [],
  adminNotifications: [],
  adminAuditEvents: [],
  selectedDate: getTodayDateKey(),
  plan: null,
  activeSection: "dashboard",
};

const IS_DASHBOARD_PAGE = !!document.getElementById('app-shell');

if (selectedDateInput) selectedDateInput.value = state.selectedDate;
if (!IS_DASHBOARD_PAGE) updateAuthMode("login");
if (IS_DASHBOARD_PAGE) clearAnalysisUi();
bootstrap();

analyzeMealBtn?.addEventListener("click", () => {
  analyzeDescriptionIntoForm();
});

showLoginBtn?.addEventListener("click", () => {
  updateAuthMode("login");
});

showSignupBtn?.addEventListener("click", () => {
  updateAuthMode("signup");
});

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginFeedback.textContent = "";
  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value;

  try {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email, password, timeZone: getClientTimeZone() },
    });
    setSessionToken(response.token);
    if (window.triggerPageTransition) {
      window.triggerPageTransition(() => { window.location.href = '/dashboard'; });
    } else {
      window.location.href = '/dashboard';
    }
  } catch (error) {
    loginFeedback.textContent = error.message;
  }
});

signupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  signupFeedback.textContent = "";
  const email = signupEmail.value.trim().toLowerCase();
  const password = signupPassword.value;
  const confirmPassword = signupConfirmPassword.value;

  if (password !== confirmPassword) {
    signupFeedback.textContent = "Passwords do not match.";
    return;
  }

  try {
    await apiRequest("/api/auth/signup", {
      method: "POST",
      body: { email, password, timeZone: getClientTimeZone() },
    });
    signupFeedback.textContent = "Account created. Please log in now.";
    loginEmail.value = email;
    signupForm.reset();
    updateAuthMode("login");
  } catch (error) {
    signupFeedback.textContent = error.message;
  }
});

logoutBtn?.addEventListener("click", async () => {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore — still clear local session
  }

  clearSessionToken();
  resetClientState();
  window.location.href = '/';
});

selectedDateInput?.addEventListener("change", async (event) => {
  state.selectedDate = event.target.value || getTodayDateKey();
  await loadMealsForSelectedDate();
  render();
});

jumpTodayBtn?.addEventListener("click", async () => {
  state.selectedDate = getTodayDateKey();
  selectedDateInput.value = state.selectedDate;
  await loadMealsForSelectedDate();
  render();
});

goalForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.currentUser) {
    return;
  }

  const nextGoals = {
    calories: readNumber("#goal-calories"),
    protein: readNumber("#goal-protein"),
    carbs: readNumber("#goal-carbs"),
    fat: readNumber("#goal-fat"),
  };

  try {
    const response = await apiRequest("/api/goals", {
      method: "PUT",
      body: nextGoals,
    });
    state.goals = response.goals;
    await loadHistory();
    render();
    showToast("Goals saved.");
  } catch (error) {
    dayStatusCopy.textContent = error.message;
  }
});

mealForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.currentUser || !isEditableDate(state.selectedDate)) {
    return;
  }

  const analysis = analyzeMealText(document.querySelector("#meal-description").value);

  const payload = {
    date: state.selectedDate,
    name: document.querySelector("#meal-name").value.trim(),
    type: document.querySelector("#meal-type").value,
    description: document.querySelector("#meal-description").value.trim(),
    calories: readNumber("#meal-calories"),
    protein: readNumber("#meal-protein"),
    carbs: readNumber("#meal-carbs"),
    fat: readNumber("#meal-fat"),
    ingredients: analysis.items,
  };

  try {
    await apiRequest("/api/meals", {
      method: "POST",
      body: payload,
    });
    mealForm.reset();
    document.querySelector("#meal-type").value = "Breakfast";
    clearAnalysisUi();
    await loadDashboardData();
    render();
    triggerHaptic([20]);
    showToast("Meal added to your log.");
  } catch (error) {
    analysisFeedback.textContent = error.message;
  }
});

mealList?.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-btn");
  if (!button || button.disabled) return;

  const mealId = button.dataset.mealId;
  const card = button.closest(".meal-card");

  card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  card.style.opacity = "0";
  card.style.transform = "translateX(20px)";
  button.disabled = true;

  let undone = false;

  showUndoToast("Meal deleted.", () => {
    undone = true;
    card.style.opacity = "";
    card.style.transform = "";
    button.disabled = false;
  });

  setTimeout(async () => {
    if (undone) return;
    try {
      await apiRequest(`/api/meals/${mealId}`, { method: "DELETE" });
      await loadDashboardData();
      render();
    } catch (error) {
      card.style.opacity = "";
      card.style.transform = "";
      button.disabled = false;
      showToast("Could not delete meal.");
    }
  }, 3500);
});

async function bootstrap() {
  const token = getSessionToken();

  if (IS_DASHBOARD_PAGE) {
    if (!token) { window.location.href = '/'; return; }
    renderSkeletons();
    try {
      const response = await apiRequest("/api/auth/session");
      state.currentUser = response.user;
      await loadDashboardData();
      renderAuthenticatedApp();
      initPlanWizard();
    } catch {
      clearSessionToken();
      window.location.href = '/';
    }
    return;
  }

  // Auth page
  if (token) {
    try {
      await apiRequest("/api/auth/session");
      window.location.href = '/dashboard';
      return;
    } catch {
      clearSessionToken();
    }
  }
  renderLoggedOut();
}

async function loadDashboardData() {
  if (!state.currentUser) {
    return;
  }

  await Promise.all([loadGoals(), loadHistory(), loadMealsForSelectedDate(), loadAdminData()]);
}

async function loadGoals() {
  const response = await apiRequest("/api/goals");
  state.goals = response.goals;
  hydrateGoalForm();
}

async function loadMealsForSelectedDate() {
  const response = await apiRequest(`/api/meals?date=${encodeURIComponent(state.selectedDate)}`);
  state.meals = response.meals;
}

async function loadHistory() {
  const response = await apiRequest("/api/history");
  state.history = response.days;
}

async function loadAdminData() {
  if (!state.currentUser?.isAdmin) {
    state.adminNotifications = [];
    state.adminAuditEvents = [];
    return;
  }

  const [notificationsResponse, auditResponse] = await Promise.all([
    apiRequest("/api/admin/notifications"),
    apiRequest("/api/admin/audit"),
  ]);

  state.adminNotifications = notificationsResponse.notifications;
  state.adminAuditEvents = auditResponse.events;
}

function renderAuthenticatedApp() {
  authScreen?.classList.add("app-hidden");
  appShell?.classList.remove("app-hidden");
  if (loginFeedback) loginFeedback.textContent = "";
  if (signupFeedback) signupFeedback.textContent = "";
  if (selectedDateInput) selectedDateInput.value = state.selectedDate;
  loadAndApplyPlan();
  showSection("dashboard");
  render();
  setTimeout(typeHero, 200);
  initPullToRefresh();
}

function renderLoggedOut() {
  authScreen?.classList.remove("app-hidden");
  appShell?.classList.add("app-hidden");
  updateAuthMode("login");
  loginForm?.reset();
  signupForm?.reset();
  if (loginFeedback) loginFeedback.textContent = "";
  if (signupFeedback) signupFeedback.textContent = "";
}

function resetClientState() {
  state.currentUser = null;
  state.goals = { ...defaultGoals };
  state.meals = [];
  state.history = [];
  state.adminNotifications = [];
  state.adminAuditEvents = [];
  state.selectedDate = getTodayDateKey();
  selectedDateInput.value = state.selectedDate;
}

function render() {
  if (!state.currentUser) return;

  renderAdminPanel();
  renderDateUi();
  renderSummary(calculateTotals());
  renderMeals();
  renderHistory();
  renderPlanSummaryCard();
  renderQuickMacros();
  renderActivePlanDisplay();
  renderStreakWidget();
  renderWeeklyChart();
}

function renderAdminPanel() {
  const isAdmin = Boolean(state.currentUser?.isAdmin);
  adminPanel.classList.toggle("app-hidden", !isAdmin);

  if (!isAdmin) {
    return;
  }

  adminMailCopy.textContent = "Owner activity view";
  notificationList.innerHTML = "";
  auditLogList.innerHTML = "";

  if (state.adminNotifications.length === 0) {
    notificationList.innerHTML = '<p class="empty-state">No registration alerts yet.</p>';
  } else {
    state.adminNotifications.forEach((notification) => {
      const card = document.createElement("article");
      card.className = "admin-card";
      card.innerHTML = `
        <strong>${notification.message}</strong>
        <p class="admin-meta">${formatDateTime(notification.timestamp)}</p>
        <p class="admin-meta">Delivery status: ${notification.status}</p>
      `;
      notificationList.appendChild(card);
    });
  }

  if (state.adminAuditEvents.length === 0) {
    auditLogList.innerHTML = '<p class="empty-state">No auth activity yet.</p>';
  } else {
    state.adminAuditEvents.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "admin-card";
      card.innerHTML = `
        <strong>${formatAuditTitle(entry.type)}</strong>
        <p class="admin-meta">${entry.email || "Unknown user"}</p>
        <p class="admin-meta">${formatDateTime(entry.timestamp)}</p>
      `;
      auditLogList.appendChild(card);
    });
  }
}

function renderDateUi() {
  currentUserCopy.textContent = state.currentUser.email;
  const avatar = document.querySelector("#user-avatar");
  if (avatar && state.currentUser?.email) {
    avatar.textContent = state.currentUser.email[0].toUpperCase();
  }
  const editable = isEditableDate(state.selectedDate);
  const isToday = state.selectedDate === getTodayDateKey();
  const prettyDate = formatDate(state.selectedDate);

  selectedDateCopy.textContent = isToday
    ? `Viewing ${prettyDate}.`
    : `Viewing ${prettyDate}. Past days are locked.`;

  mealSectionCopy.textContent = isToday
    ? "Your saved meals stay in the database so each day is easy to review."
    : "You can review previous days here, but changes are locked.";

  dateModePill.textContent = editable ? "Editable" : "Read only";
  dateModePill.className = `status-pill ${editable ? "good" : "neutral"}`;

  mealForm.querySelectorAll("input, select, textarea, button").forEach((element) => {
    element.disabled = !editable;
  });
  mealForm.classList.toggle("locked-panel", !editable);
  syncLockedOverlay();
}

function renderSummary(totals) {
  const selectedGoals = getSelectedGoals();
  const metrics = [
    {
      label: "Calories", unit: "",
      total: totals.calories, goal: selectedGoals.calories,
      good: totals.calories <= selectedGoals.calories,
      copy: totals.calories <= selectedGoals.calories
        ? `${formatNumber(selectedGoals.calories - totals.calories)} left`
        : `${formatNumber(totals.calories - selectedGoals.calories)} over`,
    },
    {
      label: "Protein", unit: "g",
      total: totals.protein, goal: selectedGoals.protein,
      good: totals.protein >= selectedGoals.protein,
      copy: totals.protein >= selectedGoals.protein
        ? `${formatNumber(totals.protein - selectedGoals.protein)}g above`
        : `${formatNumber(selectedGoals.protein - totals.protein)}g to go`,
    },
    {
      label: "Carbs", unit: "g",
      total: totals.carbs, goal: selectedGoals.carbs,
      good: totals.carbs <= selectedGoals.carbs,
      copy: totals.carbs <= selectedGoals.carbs
        ? `${formatNumber(selectedGoals.carbs - totals.carbs)}g left`
        : `${formatNumber(totals.carbs - selectedGoals.carbs)}g over`,
    },
    {
      label: "Fat", unit: "g",
      total: totals.fat, goal: selectedGoals.fat,
      good: totals.fat <= selectedGoals.fat,
      copy: totals.fat <= selectedGoals.fat
        ? `${formatNumber(selectedGoals.fat - totals.fat)}g left`
        : `${formatNumber(totals.fat - selectedGoals.fat)}g over`,
    },
  ];

  const hadMeals = state.meals.length > 0;
  const allOnTrack = metrics.every((m) => m.good);
  summaryStatus.textContent = !hadMeals ? "Waiting for meals" : allOnTrack ? "On limit" : "Off limit";
  summaryStatus.className = `status-pill ${!hadMeals ? "neutral" : allOnTrack ? "good" : "bad"}`;

  if (!hadMeals) {
    dayStatusCopy.textContent = "Add meals to calculate your daily result.";
  } else if (allOnTrack) {
    dayStatusCopy.textContent = isEditableDate(state.selectedDate)
      ? "Your day is aligned with your goal."
      : "This saved day stayed within goal.";
  } else {
    dayStatusCopy.textContent = isEditableDate(state.selectedDate)
      ? "One or more targets are outside your goal for today."
      : "This saved day went outside goal.";
  }

  macroSummary.innerHTML = "";
  const CIRC = 201.06; // 2π × 32

  metrics.forEach((metric) => {
    const progress = metric.goal === 0 ? 0 : (metric.total / metric.goal) * 100;
    const dashVal = Math.min(progress, 100) * (CIRC / 100);

    const card = document.createElement("section");
    card.className = "metric-card";
    card.innerHTML = `
      <div class="ring-wrap">
        <svg class="metric-ring" viewBox="0 0 80 80" aria-hidden="true">
          <circle class="ring-track" cx="40" cy="40" r="32"/>
          <circle class="ring-fill ${metric.good ? "" : "ring-over"}" cx="40" cy="40" r="32"/>
        </svg>
        <div class="ring-center-text">
          <p class="ring-val">0${metric.unit}</p>
        </div>
      </div>
      <div class="metric-info">
        <p class="metric-label-text">${metric.label}</p>
        <p class="metric-goal-text">goal: ${formatNumber(metric.goal)}${metric.unit}</p>
        <p class="metric-subcopy ${metric.good ? "" : "subcopy-bad"}">${metric.copy}</p>
      </div>
    `;
    macroSummary.appendChild(card);

    const fill = card.querySelector(".ring-fill");
    const valEl = card.querySelector(".ring-val");
    const isClose = metric.goal > 0 && progress >= 85 && progress < 100;
    fill.classList.toggle("ring-close", isClose);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.strokeDasharray = `${dashVal} ${CIRC}`;
    }));

    if (valEl) animateCounter(valEl, metric.total, metric.unit);
  });

  // Confetti when all goals met for today (once per day per session)
  if (hadMeals && allOnTrack && isEditableDate(state.selectedDate)) {
    const key = `confetti-${getTodayDateKey()}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      setTimeout(triggerConfetti, 500);
      triggerHaptic([50, 30, 50, 30, 80]);
    }
  }
}

function renderMeals() {
  mealList.innerHTML = "";
  const editable = isEditableDate(state.selectedDate);

  if (!editable) {
    mealList.innerHTML = '<p class="locked-note">Previous days are read-only so your log stays trustworthy. Switch back to today to add or delete meals.</p>';
  }

  if (state.meals.length === 0) {
    const svg = editable
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/><circle cx="12" cy="12" r="9.5"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;
    mealList.insertAdjacentHTML("beforeend", `
      <div class="empty-state-rich">
        <div class="empty-icon">${svg}</div>
        <h3>${editable ? "No meals logged yet" : "Nothing logged this day"}</h3>
        <p>${editable ? "Add your first meal to start tracking today's nutrition." : "No meals were recorded on this date."}</p>
        ${editable ? `<button class="primary-btn" onclick="showSection('add-meal')" type="button" style="margin-top:0.5rem;font-size:0.9rem;padding:0.7rem 1.4rem">Log a meal</button>` : ""}
      </div>
    `);
    return;
  }

  const mealEmoji = { Breakfast: '🌅', Lunch: '🥗', Dinner: '🌙', Snack: '🍎', Custom: '⭐' };

  state.meals.forEach((meal, index) => {
    const fragment = mealTemplate.content.cloneNode(true);
    const typeEl = fragment.querySelector(".meal-type");
    typeEl.textContent = `${mealEmoji[meal.type] || ''} ${meal.type}`;
    typeEl.classList.add(`meal-type-${meal.type.toLowerCase()}`);
    fragment.querySelector(".meal-name").textContent = meal.name;
    fragment.querySelector(".meal-description").textContent = meal.description || "";

    const macros = [
      `Cal ${formatNumber(meal.calories)}`,
      `P ${formatNumber(meal.protein)}g`,
      `C ${formatNumber(meal.carbs)}g`,
      `F ${formatNumber(meal.fat)}g`,
    ];
    const macroContainer = fragment.querySelector(".meal-macros");
    macros.forEach((macro) => {
      const chip = document.createElement("span");
      chip.className = "meal-macro-chip";
      chip.textContent = macro;
      macroContainer.appendChild(chip);
    });

    const reuseBtn = fragment.querySelector(".reuse-btn");
    if (reuseBtn) {
      reuseBtn.addEventListener("click", () => {
        document.querySelector("#meal-name").value = meal.name;
        document.querySelector("#meal-type").value = meal.type;
        document.querySelector("#meal-description").value = meal.description || "";
        document.querySelector("#meal-calories").value = meal.calories;
        document.querySelector("#meal-protein").value = meal.protein;
        document.querySelector("#meal-carbs").value = meal.carbs;
        document.querySelector("#meal-fat").value = meal.fat;
        showSection("add-meal");
        showToast("Meal loaded — edit and submit to re-add.");
      });
    }

    const deleteButton = fragment.querySelector(".delete-btn");
    deleteButton.dataset.mealId = meal.id;
    deleteButton.disabled = !editable;
    deleteButton.textContent = editable ? "Delete" : "Locked";

    const card = fragment.querySelector(".meal-card");
    card.classList.add("animate-in");
    card.style.animationDelay = `${index * 55}ms`;
    mealList.appendChild(fragment);

    const appendedCard = mealList.lastElementChild;
    if (appendedCard && editable) {
      addSwipeToDelete(appendedCard, () => {
        appendedCard.querySelector(".delete-btn")?.click();
      });
    }
  });
}

function renderHistory() {
  historyList.innerHTML = "";

  if (state.history.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state-rich">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <h3>No history yet</h3>
        <p>Log meals over multiple days and your history will appear here.</p>
      </div>
    `;
    return;
  }

  state.history.forEach((day) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `history-card ${day.date === state.selectedDate ? "active" : ""}`;
    button.innerHTML = `
      <span class="history-card-date">${formatHistoryLabel(day.date)}</span>
      <span class="history-card-copy">${day.mealCount} meal${day.mealCount === 1 ? "" : "s"} • ${formatNumber(day.totals.calories)} cal</span>
      <span class="history-card-status">${day.status}</span>
    `;
    button.addEventListener("click", async () => {
      state.selectedDate = day.date;
      selectedDateInput.value = state.selectedDate;
      await loadMealsForSelectedDate();
      render();
      showSection("dashboard");
    });
    historyList.appendChild(button);
  });
}

function calculateTotals() {
  return state.meals.reduce(
    (totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fat: totals.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function getSelectedGoals() {
  const planGoals = getActivePlanGoals();
  if (planGoals) return planGoals;

  const selectedDay = state.history.find((day) => day.date === state.selectedDate);
  if (selectedDay?.goals) {
    return selectedDay.goals;
  }

  return state.goals;
}

function hydrateGoalForm() {
  document.querySelector("#goal-calories").value = state.goals.calories;
  document.querySelector("#goal-protein").value = state.goals.protein;
  document.querySelector("#goal-carbs").value = state.goals.carbs;
  document.querySelector("#goal-fat").value = state.goals.fat;
}

function analyzeMealText(description) {
  const normalizedInput = description
    .toLowerCase()
    .replace(/\n/g, ",")
    .replace(/\s+with\s+/g, ", ")
    .replace(/\s+and\s+/g, ", ")
    .replace(/\b(a|an|one|two|three|four|five|six|seven|eight|nine|ten|half|quarter)\b/g, (word) => String(numberWords[word]))
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const items = [];
  const unknownItems = [];

  normalizedInput.forEach((entry) => {
    const parsedEntry = parseFoodEntry(entry);
    if (!parsedEntry) {
      unknownItems.push(entry);
      return;
    }

    const { amount, unit, foodText } = parsedEntry;
    const food = foodDatabase.find((item) =>
      item.aliases.some((alias) => foodText.toLowerCase().includes(alias))
    );

    if (!food) {
      unknownItems.push(entry);
      return;
    }

    const grams = convertToGrams(amount, unit, food);
    if (Number.isNaN(grams)) {
      unknownItems.push(entry);
      return;
    }

    const factor = grams / 100;
    items.push({
      input: entry,
      food: food.name,
      grams,
      displayAmount: amount,
      displayUnit: normalizeUnitLabel(unit),
      calories: roundToOne(food.calories * factor),
      protein: roundToOne(food.protein * factor),
      carbs: roundToOne(food.carbs * factor),
      fat: roundToOne(food.fat * factor),
    });
  });

  const totals = items.reduce(
    (accumulator, item) => ({
      calories: accumulator.calories + item.calories,
      protein: accumulator.protein + item.protein,
      carbs: accumulator.carbs + item.carbs,
      fat: accumulator.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    items,
    unknownItems,
    totals: {
      calories: roundToOne(totals.calories),
      protein: roundToOne(totals.protein),
      carbs: roundToOne(totals.carbs),
      fat: roundToOne(totals.fat),
    },
  };
}

function analyzeDescriptionIntoForm() {
  const description = document.querySelector("#meal-description").value.trim();

  if (!description) {
    analysisFeedback.textContent = "Add a food description first, for example: 200g chicken breast, 150g cooked rice.";
    ingredientPreview.innerHTML = "";
    return;
  }

  const origText = analyzeMealBtn.textContent;
  analyzeMealBtn.textContent = "Analyzing…";
  analyzeMealBtn.classList.add("btn-loading");

  setTimeout(() => {
    analyzeMealBtn.textContent = origText;
    analyzeMealBtn.classList.remove("btn-loading");
  const analysis = analyzeMealText(description);

  if (analysis.items.length === 0) {
    analysisFeedback.textContent = "I could not match those foods yet. Try one item per comma with grams, like 100g oats, 250g milk.";
    ingredientPreview.innerHTML = "";
    return;
  }

  document.querySelector("#meal-calories").value = Math.round(analysis.totals.calories);
  document.querySelector("#meal-protein").value = analysis.totals.protein;
  document.querySelector("#meal-carbs").value = analysis.totals.carbs;
  document.querySelector("#meal-fat").value = analysis.totals.fat;

  const unknownCopy = analysis.unknownItems.length
    ? ` Could not match: ${analysis.unknownItems.join(", ")}.`
    : "";
  analysisFeedback.textContent = `Calculated ${analysis.items.length} food item${analysis.items.length > 1 ? "s" : ""} from your description.${unknownCopy}`;

  ingredientPreview.innerHTML = "";
  analysis.items.forEach((item) => {
    const card = document.createElement("section");
    card.className = "ingredient-card";
    card.innerHTML = `
      <strong>${item.food} • ${formatNumber(item.displayAmount)}${item.displayUnit}</strong>
      <p class="ingredient-meta">${formatNumber(item.calories)} cal • P ${formatNumber(item.protein)}g • C ${formatNumber(item.carbs)}g • F ${formatNumber(item.fat)}g</p>
    `;
    ingredientPreview.appendChild(card);
  });
  }, 160);
}

function clearAnalysisUi() {
  if (ingredientPreview) ingredientPreview.innerHTML = "";
  if (analysisFeedback) analysisFeedback.textContent =
    "Try grams, ml, cups, bowls, tbsp, tsp, pieces, glasses, or counts like eggs, bananas, and rotis.";
}

function updateAuthMode(mode) {
  if (!loginForm) return;
  const loginMode = mode === "login";
  loginForm.classList.toggle("auth-form-hidden", !loginMode);
  signupForm.classList.toggle("auth-form-hidden", loginMode);
  showLoginBtn.className = loginMode ? "primary-btn" : "ghost-btn";
  showSignupBtn.className = loginMode ? "ghost-btn" : "primary-btn";
}

async function apiRequest(path, options = {}) {
  const config = {
    method: options.method || "GET",
    headers: {},
  };

  const token = getSessionToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (options.body) {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(path, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

function getSessionToken() {
  // localStorage survives full-page navigations; sessionStorage is fallback for old tokens
  return localStorage.getItem(CLIENT_SESSION_KEY) || sessionStorage.getItem(CLIENT_SESSION_KEY);
}

function setSessionToken(token) {
  // Must use localStorage — sessionStorage does NOT reliably survive window.location.href navigations
  localStorage.setItem(CLIENT_SESSION_KEY, token);
  sessionStorage.removeItem(CLIENT_SESSION_KEY);
}

function clearSessionToken() {
  localStorage.removeItem(CLIENT_SESSION_KEY);
  sessionStorage.removeItem(CLIENT_SESSION_KEY);
}

function readNumber(selector) {
  return Number(document.querySelector(selector).value) || 0;
}

function formatAuditTitle(type) {
  const titles = {
    signup: "New user registered",
    login: "User logged in",
    logout: "User logged out",
    login_failed: "Failed login attempt",
  };

  return titles[type] || type;
}

function formatDate(dateKey) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatHistoryLabel(dateKey) {
  if (dateKey === getTodayDateKey()) {
    return "Today";
  }

  return new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatNumber(value) {
  return Number(value).toFixed(value % 1 === 0 ? 0 : 1);
}

function roundToOne(value) {
  return Math.round(value * 10) / 10;
}

function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getClientTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function isEditableDate(dateKey) {
  return dateKey === getTodayDateKey();
}

function createFood(name, aliases, calories, protein, carbs, fat, units = {}) {
  return { name, aliases, calories, protein, carbs, fat, units };
}

function convertToGrams(amount, unit, food) {
  if (["g", "gm", "gms", "gram", "grams", "grm", "grms", "ml"].includes(unit)) {
    return amount;
  }

  if (["kg", "liter", "l"].includes(unit)) {
    return amount * 1000;
  }

  if (food.units[unit]) {
    return amount * food.units[unit];
  }

  return amount;
}

function normalizeUnitLabel(unit) {
  if (["ml", "g", "kg", "l"].includes(unit)) {
    return unit;
  }

  return ` ${unit}`;
}

function parseFoodEntry(entry) {
  const unitPattern =
    "(g|gm|gms|gram|grams|grm|grms|kg|kilogram|kilograms|ml|l|liter|liters|litre|litres|cup|cups|glass|glasses|bowl|bowls|katori|katoris|plate|plates|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|piece|pieces|pc|pcs|slice|slices|serving|servings|handful|handfuls|unit|units)";
  const amountFirstMatch = entry.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${unitPattern}\\s+(?:of\\s+)?(.+)`, "i"));
  const foodFirstMatch = entry.match(new RegExp(`(.+?)\\s+(\\d+(?:\\.\\d+)?)\\s*${unitPattern}`, "i"));
  const countOnlyMatch = entry.match(/(\d+(?:\.\d+)?)\s+(?:of\s+)?(.+)/i);

  if (amountFirstMatch) {
    return {
      amount: Number(amountFirstMatch[1]),
      unit: normalizeUnit(amountFirstMatch[2]),
      foodText: amountFirstMatch[3].replace(/\s+/g, " ").trim(),
    };
  }

  if (foodFirstMatch) {
    return {
      amount: Number(foodFirstMatch[2]),
      unit: normalizeUnit(foodFirstMatch[3]),
      foodText: foodFirstMatch[1].replace(/\s+/g, " ").trim(),
    };
  }

  if (countOnlyMatch) {
    return {
      amount: Number(countOnlyMatch[1]),
      unit: "piece",
      foodText: countOnlyMatch[2].replace(/\s+/g, " ").trim(),
    };
  }

  return null;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.innerHTML = message;
  toast.classList.add("visible");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => { if (toast.innerHTML === message) toast.innerHTML = ""; }, 450);
  }, 3000);
}

function showUndoToast(message, onUndo) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.innerHTML = `${message} <button class="toast-undo-btn" type="button">Undo</button>`;
  toast.classList.add("visible");
  clearTimeout(toast._timer);

  let done = false;
  toast.querySelector(".toast-undo-btn").addEventListener("click", () => {
    if (done) return;
    done = true;
    onUndo && onUndo();
    toast.classList.remove("visible");
    clearTimeout(toast._timer);
  });

  toast._timer = setTimeout(() => {
    done = true;
    toast.classList.remove("visible");
    setTimeout(() => { toast.innerHTML = ""; }, 450);
  }, 3500);
}

function normalizeUnit(unit) {
  const normalized = unit.toLowerCase();
  const aliases = {
    cups: "cup",
    glasses: "glass",
    bowls: "bowl",
    katoris: "katori",
    plates: "plate",
    tablespoon: "tbsp",
    tablespoons: "tbsp",
    teaspoon: "tsp",
    teaspoons: "tsp",
    pieces: "piece",
    pc: "piece",
    pcs: "piece",
    slices: "slice",
    servings: "serving",
    handfuls: "handful",
    grams: "g",
    gram: "g",
    gm: "g",
    gms: "g",
    grm: "g",
    grms: "g",
    kilograms: "kg",
    kilogram: "kg",
    liters: "liter",
    litre: "liter",
    litres: "liter",
    milliliter: "ml",
    milliliters: "ml",
    units: "unit",
  };

  return aliases[normalized] || normalized;
}

// ═══════════════════════════════════════════════════════════════════
// SECTION NAVIGATION
// ═══════════════════════════════════════════════════════════════════

function showSection(name) {
  if (state.activeSection === name) return;

  const prev = document.getElementById("section-" + state.activeSection);
  const next = document.getElementById("section-" + name);
  if (!next) return;

  state.activeSection = name;

  if (name === "add-meal") {
    const mealTypeEl = document.querySelector("#meal-type");
    if (mealTypeEl && !mealTypeEl._userSet) {
      mealTypeEl.value = getSmartMealType();
    }
  }

  // GSAP transition if available, fallback to instant switch
  if (typeof gsap !== "undefined" && prev && prev !== next) {
    gsap.to(prev, {
      opacity: 0, y: -6, duration: 0.18, ease: "power2.in",
      onComplete: () => {
        prev.classList.remove("active");
        next.classList.add("active");
        gsap.fromTo(next, { opacity: 0, y: 8 }, {
          opacity: 1, y: 0, duration: 0.26, ease: "power2.out",
          clearProps: "opacity,transform",
        });
      },
    });
  } else {
    prev?.classList.remove("active");
    next.classList.add("active");
  }

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.section === name);
  });
}

// Wire up nav buttons
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => showSection(btn.dataset.section));
});

// ═══════════════════════════════════════════════════════════════════
// DIET PLAN — load, apply, render
// ═══════════════════════════════════════════════════════════════════

function loadAndApplyPlan() {
  if (typeof window.Planner === "undefined") return;
  const plan = window.Planner.load();
  state.plan = window.Planner.isActive(plan) ? plan : null;
  syncPlanToGoalForm();
}

function syncPlanToGoalForm() {
  const badge = document.querySelector("#goals-plan-badge");
  if (!state.plan) {
    badge?.classList.add("app-hidden");
    return;
  }
  const c = state.plan.calculated;
  if (!c) return;

  // Pre-fill goal form from plan (visual hint)
  const setVal = (id, v) => { const el = document.querySelector(id); if (el) el.value = v; };
  setVal("#goal-calories", c.targetCalories);
  setVal("#goal-protein",  c.targetProtein);
  setVal("#goal-carbs",    c.targetCarbs);
  setVal("#goal-fat",      c.targetFat);
  badge?.classList.remove("app-hidden");
}

function getActivePlanGoals() {
  if (!state.plan?.calculated) return null;
  const c = state.plan.calculated;
  return {
    calories: c.targetCalories,
    protein:  c.targetProtein,
    carbs:    c.targetCarbs,
    fat:      c.targetFat,
  };
}

// ── Plan form pre-fill ──────────────────────────────────────────────
function hydratePlanForm() {
  if (!state.plan) return;
  const p = state.plan;
  const setVal = (id, v) => { const el = document.querySelector(id); if (el && v != null) el.value = v; };
  setVal("#plan-current-weight", p.currentWeight);
  setVal("#plan-target-weight",  p.targetWeight);
  setVal("#plan-height",         p.heightCm);
  setVal("#plan-age",            p.age);
  setVal("#plan-gender",         p.gender);
  setVal("#plan-goal",           p.goal);
  setVal("#plan-activity",       p.activityLevel);
  setVal("#plan-duration",       p.durationWeeks);
  setVal("#plan-start-date",     p.startDate);
}

// ── Plan form submit ─────────────────────────────────────────────────
const planForm = document.querySelector("#plan-form");
const resetPlanBtn = document.querySelector("#reset-plan-btn");
const planPreview = document.querySelector("#plan-preview");

if (planForm) {
  planForm.addEventListener("input", () => {
    // Live preview whenever fields change
    const inputs = readPlanFormInputs();
    if (!inputs) return;
    const result = window.Planner.calcPlan(inputs);
    showPlanPreview(result);
  });

  planForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (typeof window.Planner === "undefined") return;

    const inputs = readPlanFormInputs();
    if (!inputs) return;

    const calculated = window.Planner.calcPlan(inputs);
    const plan = { ...inputs, calculated, createdAt: new Date().toISOString() };

    window.Planner.save(plan);
    state.plan = plan;
    syncPlanToGoalForm();
    render();
    showToast("Diet plan applied.");
  });
}

if (resetPlanBtn) {
  resetPlanBtn.addEventListener("click", () => {
    if (typeof window.Planner === "undefined") return;
    window.Planner.clear();
    state.plan = null;
    render();
    document.querySelector("#goals-plan-badge")?.classList.add("app-hidden");
    if (planPreview) planPreview.classList.add("app-hidden");
    showToast("Plan cleared.");
  });
}

function readPlanFormInputs() {
  const n = (id) => parseFloat(document.querySelector(id)?.value) || 0;
  const s = (id) => document.querySelector(id)?.value || "";

  const currentWeight = n("#plan-current-weight");
  const targetWeight  = n("#plan-target-weight");
  const heightCm      = n("#plan-height");
  const age           = n("#plan-age");

  if (!currentWeight || !heightCm || !age) return null;

  const startDate = s("#plan-start-date") || new Date().toISOString().slice(0, 10);
  const durationWeeks = n("#plan-duration") || 12;
  const endDate = new Date(new Date(startDate).getTime() + durationWeeks * 7 * 864e5)
    .toISOString().slice(0, 10);

  return {
    currentWeight,
    targetWeight:  targetWeight || currentWeight,
    heightCm,
    age,
    gender:        s("#plan-gender") || "male",
    goal:          s("#plan-goal") || "maintenance",
    activityLevel: s("#plan-activity") || "moderately_active",
    durationWeeks,
    startDate,
    endDate,
  };
}

function showPlanPreview(result) {
  if (!planPreview) return;
  planPreview.classList.remove("app-hidden");

  const goalLabels = { cutting: "Cutting", bulking: "Bulking", maintenance: "Maintenance" };
  const planGoal = document.querySelector("#plan-goal")?.value || "maintenance";

  planPreview.innerHTML = `
    <p class="plan-preview-title">Projected results</p>
    <div class="plan-preview-grid">
      <div class="plan-preview-stat">
        <p class="pps-val">${formatNumber(result.bmr)}</p>
        <p class="pps-label">BMR</p>
      </div>
      <div class="plan-preview-stat">
        <p class="pps-val">${formatNumber(result.tdee)}</p>
        <p class="pps-label">TDEE</p>
      </div>
      <div class="plan-preview-stat">
        <p class="pps-val">${formatNumber(result.targetCalories)}</p>
        <p class="pps-label">Target cal</p>
      </div>
      <div class="plan-preview-stat">
        <p class="pps-val">${formatNumber(result.targetProtein)}g</p>
        <p class="pps-label">Protein</p>
      </div>
      <div class="plan-preview-stat">
        <p class="pps-val">${formatNumber(result.targetCarbs)}g</p>
        <p class="pps-label">Carbs</p>
      </div>
      <div class="plan-preview-stat">
        <p class="pps-val">${formatNumber(result.targetFat)}g</p>
        <p class="pps-label">Fat</p>
      </div>
    </div>
    ${result.warning ? `<div class="plan-warning">⚠ ${result.warning}</div>` : ""}
  `;
}

// ── Render plan summary card in Dashboard ───────────────────────────
function renderPlanSummaryCard() {
  const card = document.querySelector("#plan-summary-card");
  if (!card) return;

  if (!state.plan?.calculated) {
    card.classList.add("app-hidden");
    return;
  }

  card.classList.remove("app-hidden");
  const p  = state.plan;
  const c  = p.calculated;
  const goalLabel = { cutting: "Cutting", bulking: "Bulking", maintenance: "Maintenance" }[p.goal] || p.goal;
  const goalClass = `plan-goal-${p.goal}`;
  const changeSign = c.weeklyChange > 0 ? "+" : "";
  const changeLabel = p.goal === "maintenance" ? "Stable" : `${changeSign}${c.weeklyChange} kg/wk`;

  card.innerHTML = `
    <div class="plan-card-header">
      <div class="plan-card-title">
        <h3>Active Plan</h3>
        <span class="plan-goal-badge ${goalClass}">${goalLabel}</span>
      </div>
      <button type="button" class="ghost-btn" style="font-size:0.82rem;padding:0.4rem 0.8rem" onclick="showSection('diet-plan')">Edit</button>
    </div>
    <div class="plan-stats-grid">
      <div class="plan-stat">
        <p class="plan-stat-label">BMR</p>
        <p class="plan-stat-value">${formatNumber(c.bmr)}</p>
        <p class="plan-stat-sub">kcal/day</p>
      </div>
      <div class="plan-stat">
        <p class="plan-stat-label">TDEE</p>
        <p class="plan-stat-value">${formatNumber(c.tdee)}</p>
        <p class="plan-stat-sub">kcal/day</p>
      </div>
      <div class="plan-stat">
        <p class="plan-stat-label">Target</p>
        <p class="plan-stat-value">${formatNumber(c.targetCalories)}</p>
        <p class="plan-stat-sub">kcal/day</p>
      </div>
      <div class="plan-stat">
        <p class="plan-stat-label">Weekly pace</p>
        <p class="plan-stat-value">${changeLabel}</p>
        <p class="plan-stat-sub">expected</p>
      </div>
    </div>
    ${c.warning ? `<div class="plan-warning">⚠ ${c.warning}</div>` : ""}
  `;
}

// ── Render active plan in Diet Plan section ──────────────────────────
function renderActivePlanDisplay() {
  const display = document.querySelector("#active-plan-display");
  if (!display) return;

  if (!state.plan?.calculated) {
    display.classList.add("app-hidden");
    return;
  }

  display.classList.remove("app-hidden");
  const p = state.plan;
  const c = p.calculated;
  const goalLabel = { cutting: "Cutting", bulking: "Bulking", maintenance: "Maintenance" }[p.goal] || p.goal;

  display.innerHTML = `
    <div class="active-plan-card">
      <div class="active-plan-header">
        <h3>Plan: ${goalLabel} · ${p.currentWeight} → ${p.targetWeight} kg</h3>
        <span class="plan-goal-badge plan-goal-${p.goal}">${goalLabel}</span>
      </div>
      <div class="plan-stats-grid">
        <div class="plan-stat"><p class="plan-stat-label">Target calories</p><p class="plan-stat-value">${c.targetCalories}</p></div>
        <div class="plan-stat"><p class="plan-stat-label">Protein</p><p class="plan-stat-value">${c.targetProtein}g</p></div>
        <div class="plan-stat"><p class="plan-stat-label">Carbs</p><p class="plan-stat-value">${c.targetCarbs}g</p></div>
        <div class="plan-stat"><p class="plan-stat-label">Fat</p><p class="plan-stat-value">${c.targetFat}g</p></div>
      </div>
      <p style="font-size:0.85rem;color:var(--muted);margin:0">Ends: ${p.endDate || "No end date"}</p>
    </div>
  `;
  // Pre-fill plan form
  hydratePlanForm();
}

// ── Quick macros bar in Add Meal ─────────────────────────────────────
function renderQuickMacros() {
  const totals  = calculateTotals();
  const goals   = getSelectedGoals();

  const set = (id, val, unit, over) => {
    const el = document.querySelector(id);
    if (!el) return;
    el.textContent = `${formatNumber(Math.abs(val))}${unit}${over && val < 0 ? " over" : ""}`;
    el.classList.toggle("qm-over", over && val < 0);
  };

  set("#qm-calories", goals.calories - totals.calories, "", true);
  set("#qm-protein",  goals.protein  - totals.protein,  "g", false);
  set("#qm-carbs",    goals.carbs    - totals.carbs,     "g", true);
  set("#qm-fat",      goals.fat      - totals.fat,       "g", true);
}

// ═══════════════════════════════════════════════════════════════════
// STREAK WIDGET
// ═══════════════════════════════════════════════════════════════════

function getPrevDateKey(dateKey) {
  const d = new Date(`${dateKey}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function calculateStreak() {
  if (!state.history || state.history.length === 0) return 0;
  const sorted = [...state.history].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let expected = getTodayDateKey();
  for (const day of sorted) {
    if ((day.date === expected || day.date === getPrevDateKey(expected)) && day.mealCount > 0) {
      streak++;
      expected = getPrevDateKey(day.date);
    } else if (day.date < expected) {
      break;
    }
  }
  return streak;
}

function renderStreakWidget() {
  const el = document.querySelector("#streak-widget");
  if (!el) return;
  const streak = calculateStreak();
  const flameSvg = `<svg class="streak-flame" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/></svg>`;

  const todayHasMeals = state.history.find((d) => d.date === getTodayDateKey())?.mealCount > 0;

  if (streak < 2) {
    if (!todayHasMeals) { el.classList.add("app-hidden"); return; }
    el.classList.remove("app-hidden");
    el.classList.add("streak-day1");
    el.innerHTML = `
      ${flameSvg}
      <div class="streak-info">
        <p class="streak-count">Day 1 — great start!</p>
        <p class="streak-sub">Log meals every day to build a streak.</p>
      </div>
    `;
    return;
  }

  el.classList.remove("app-hidden");
  el.classList.remove("streak-day1");
  el.innerHTML = `
    ${flameSvg}
    <div class="streak-info">
      <p class="streak-count">${streak} day streak</p>
      <p class="streak-sub">Keep going — log today's meals to extend it!</p>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════
// WEEKLY CHART
// ═══════════════════════════════════════════════════════════════════

function renderWeeklyChart() {
  const el = document.querySelector("#weekly-chart");
  if (!el) return;

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const histDay = state.history.find((h) => h.date === key);
    days.push({
      key,
      label: i === 0 ? "Today" : ["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()],
      calories: histDay?.totals?.calories || 0,
      isToday: i === 0,
    });
  }

  const goal = getSelectedGoals().calories;
  const maxVal = Math.max(...days.map((d) => d.calories), goal, 1);
  const chartH = 90;

  // Trend: compare this week avg vs previous 7 days
  const thisWeekAvg = days.reduce((s, d) => s + d.calories, 0) / 7;
  const prevDays = [];
  for (let i = 13; i >= 7; i--) {
    const pd = new Date();
    pd.setDate(pd.getDate() - i);
    const pk = `${pd.getFullYear()}-${String(pd.getMonth()+1).padStart(2,"0")}-${String(pd.getDate()).padStart(2,"0")}`;
    const ph = state.history.find((h) => h.date === pk);
    prevDays.push(ph?.totals?.calories || 0);
  }
  const prevWeekAvg = prevDays.reduce((s, v) => s + v, 0) / 7;
  const trendPct = prevWeekAvg > 10 ? Math.round(((thisWeekAvg - prevWeekAvg) / prevWeekAvg) * 100) : null;
  const daysOnTrack = days.filter((d) => d.calories > 0 && d.calories <= goal).length;
  const daysLogged = days.filter((d) => d.calories > 0).length;

  const bars = days.map((day) => {
    const barH = day.calories > 0 ? Math.max((day.calories / maxVal) * chartH, 3) : 0;
    const goalH = Math.round((goal / maxVal) * chartH);
    const over = day.calories > goal && day.calories > 0;
    return `
      <div class="chart-col">
        <div class="chart-bar-wrap"${day.calories > 0 ? ` data-cal="${Math.round(day.calories)}"` : ""}>
          <div class="chart-goal-line" style="bottom:${goalH}px"></div>
          <div class="chart-bar ${over ? "bar-over" : ""}" style="height:0" data-h="${barH}"></div>
        </div>
        <p class="chart-label ${day.isToday ? "chart-label-today" : ""}">${day.label}</p>
        ${day.calories > 0 ? `<p class="chart-val">${Math.round(day.calories)}</p>` : ""}
      </div>
    `;
  }).join("");

  let trendHtml = '';
  if (trendPct !== null) {
    const cls = trendPct > 3 ? 'trend-up' : trendPct < -3 ? 'trend-down' : 'trend-flat';
    const arrow = trendPct > 3 ? '↑' : trendPct < -3 ? '↓' : '→';
    trendHtml = `<span class="trend-badge ${cls}">${arrow} ${Math.abs(trendPct)}% vs last week</span>`;
  }

  let summaryText = '';
  if (daysLogged === 0) summaryText = 'Start logging to see your summary.';
  else if (daysOnTrack === 7) summaryText = '🏆 Perfect week — every day on track!';
  else if (daysOnTrack >= 5) summaryText = `✅ ${daysOnTrack}/7 days on track this week`;
  else if (daysLogged > 0) summaryText = `${daysLogged} day${daysLogged > 1 ? 's' : ''} logged — keep building the habit!`;

  el.innerHTML = `
    <div class="panel-heading">
      <div><h2>Weekly Calories ${trendHtml}</h2><p>Last 7 days vs goal (${formatNumber(goal)} kcal)</p></div>
    </div>
    <div class="chart-bars">${bars}</div>
    ${summaryText ? `<div class="weekly-summary-badge">${summaryText}</div>` : ''}
    <div class="chart-legend">
      <span><span class="legend-dot" style="background:var(--highlight)"></span>Calories</span>
      <span><span class="legend-dot" style="background:rgba(255,255,255,0.22)"></span>Goal line</span>
      <span><span class="legend-dot" style="background:#fb7185"></span>Over goal</span>
    </div>
  `;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.querySelectorAll(".chart-bar").forEach((bar) => {
      const h = bar.dataset.h;
      bar.style.transition = "height 0.85s cubic-bezier(0.25,1,0.4,1)";
      bar.style.height = `${h}px`;
    });
  }));
}

// ═══════════════════════════════════════════════════════════════════
// SMART MEAL TIME DEFAULT
// ═══════════════════════════════════════════════════════════════════

function getSmartMealType() {
  const h = new Date().getHours();
  if (h >= 5  && h < 11) return "Breakfast";
  if (h >= 11 && h < 15) return "Lunch";
  if (h >= 15 && h < 18) return "Snack";
  if (h >= 18 && h < 22) return "Dinner";
  return "Snack";
}

// ═══════════════════════════════════════════════════════════════════
// CONFETTI
// ═══════════════════════════════════════════════════════════════════

function triggerConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
  const colors = ["#a855f7","#ec4899","#4ade80","#fbbf24","#60a5fa","#c084fc","#fb923c"];
  const particles = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 80,
    vx: (Math.random() - 0.5) * 5,
    vy: Math.random() * 3 + 2,
    rot: Math.random() * 360,
    rotSpd: (Math.random() - 0.5) * 9,
    color: colors[Math.floor(Math.random() * colors.length)],
    w: Math.random() * 9 + 5,
    h: Math.random() * 5 + 3,
  }));
  let frame;
  const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach((p) => {
      if (p.y > canvas.height + 30) return;
      alive = true;
      p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.rot += p.rotSpd;
      const opacity = Math.max(0, 1 - p.y / (canvas.height * 1.1));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (alive) frame = requestAnimationFrame(loop);
    else canvas.remove();
  };
  frame = requestAnimationFrame(loop);
  setTimeout(() => { cancelAnimationFrame(frame); canvas.remove(); }, 4500);
}

// ═══════════════════════════════════════════════════════════════════
// PLAN WIZARD
// ═══════════════════════════════════════════════════════════════════

function initPlanWizard() {
  const form = document.querySelector("#plan-form");
  if (!form) return;
  const fieldsets = Array.from(form.querySelectorAll(".plan-fieldset"));
  if (fieldsets.length < 2) return;

  let step = 0;
  const labels = fieldsets.map((fs) => fs.querySelector("legend")?.textContent || "Step");

  const header = document.createElement("div");
  header.className = "wizard-header";
  header.innerHTML = labels.map((label, i) => `
    ${i > 0 ? `<div class="wizard-conn ${i <= step ? "wz-done-conn" : ""}"></div>` : ""}
    <div class="wizard-step ${i === step ? "wz-active" : i < step ? "wz-done" : ""}">
      <div class="wizard-dot">${i < step ? "✓" : i + 1}</div>
      <span class="wizard-step-label">${label}</span>
    </div>
  `).join("");
  form.prepend(header);

  // Add Next / Back row
  const navRow = document.createElement("div");
  navRow.className = "wizard-nav-row";
  const backBtn = document.createElement("button");
  backBtn.type = "button"; backBtn.className = "ghost-btn"; backBtn.textContent = "Back";
  const nextBtn = document.createElement("button");
  nextBtn.type = "button"; nextBtn.className = "primary-btn"; nextBtn.textContent = "Next";
  navRow.append(backBtn, nextBtn);

  const actionsDiv = form.querySelector(".plan-actions");
  if (actionsDiv) form.insertBefore(navRow, actionsDiv);

  function updateWizard() {
    fieldsets.forEach((fs, i) => { fs.style.display = i === step ? "" : "none"; });
    const submitBtn = form.querySelector('[type="submit"]');
    navRow.style.display = step === fieldsets.length - 1 ? "none" : "";
    if (submitBtn) actionsDiv.style.display = step === fieldsets.length - 1 ? "" : "none";
    backBtn.style.visibility = step === 0 ? "hidden" : "visible";

    header.querySelectorAll(".wizard-step").forEach((el, i) => {
      el.className = `wizard-step ${i === step ? "wz-active" : i < step ? "wz-done" : ""}`;
      el.querySelector(".wizard-dot").textContent = i < step ? "✓" : i + 1;
    });
    header.querySelectorAll(".wizard-conn").forEach((el, i) => {
      el.className = `wizard-conn ${i < step ? "wz-done-conn" : ""}`;
    });
  }

  nextBtn.addEventListener("click", () => { if (step < fieldsets.length - 1) { step++; updateWizard(); } });
  backBtn.addEventListener("click", () => { if (step > 0) { step--; updateWizard(); } });

  updateWizard();
}

// ═══════════════════════════════════════════════════════════════════
// ANIMATED NUMBER COUNTER
// ═══════════════════════════════════════════════════════════════════

function animateCounter(el, target, unit = '') {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = (Number.isInteger(target) ? Math.round(target) : target.toFixed(1)) + unit;
    return;
  }
  const decimals = Number.isInteger(target) ? 0 : 1;
  const duration = 560;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const val = target * ease;
    el.textContent = (decimals === 0 ? Math.round(val) : val.toFixed(1)) + unit;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ═══════════════════════════════════════════════════════════════════
// HAPTIC FEEDBACK
// ═══════════════════════════════════════════════════════════════════

function triggerHaptic(pattern = [15]) {
  navigator.vibrate?.(pattern);
}

// ═══════════════════════════════════════════════════════════════════
// TYPING HERO ANIMATION
// ═══════════════════════════════════════════════════════════════════

function typeHero() {
  const h1 = document.querySelector('#section-dashboard .hero h1');
  if (!h1 || h1.dataset.typed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  h1.dataset.typed = '1';
  const text = h1.textContent.trim();
  h1.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  h1.appendChild(cursor);
  let i = 0;
  const iv = setInterval(() => {
    if (i >= text.length) {
      clearInterval(iv);
      setTimeout(() => cursor.remove(), 1800);
      return;
    }
    h1.insertBefore(document.createTextNode(text[i]), cursor);
    i++;
  }, 36);
}

// ═══════════════════════════════════════════════════════════════════
// PULL-TO-REFRESH
// ═══════════════════════════════════════════════════════════════════

function initPullToRefresh() {
  if (!IS_DASHBOARD_PAGE) return;
  const indicator = document.createElement('div');
  indicator.className = 'ptr-indicator';
  indicator.innerHTML = '<div class="ptr-spinner"></div><span>Release to refresh</span>';
  document.body.prepend(indicator);

  let startY = 0, pulling = false, triggered = false;
  const THRESHOLD = 70;

  document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0 && state.activeSection === 'dashboard') {
      startY = e.touches[0].clientY;
      pulling = true; triggered = false;
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) {
      indicator.style.height = Math.min(dy * 0.5, 42) + 'px';
      indicator.style.opacity = String(Math.min(dy / THRESHOLD, 1));
      triggered = dy >= THRESHOLD;
    }
  }, { passive: true });

  document.addEventListener('touchend', async () => {
    if (!pulling) return;
    pulling = false;
    indicator.style.transition = 'height 0.28s ease, opacity 0.28s ease';
    indicator.style.height = '0';
    indicator.style.opacity = '0';
    setTimeout(() => { indicator.style.transition = ''; }, 320);
    if (triggered) {
      triggerHaptic([20]);
      await loadDashboardData();
      render();
      showToast('Refreshed.');
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// LOCKED FORM OVERLAY
// ═══════════════════════════════════════════════════════════════════

function syncLockedOverlay() {
  const panel = mealForm?.closest('.panel');
  if (!panel) return;
  let overlay = panel.querySelector('.locked-overlay');
  if (isEditableDate(state.selectedDate)) {
    overlay?.remove();
  } else {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'locked-overlay';
      overlay.addEventListener('click', () => {
        showToast('Past dates are read-only — jump to today to add meals.');
        panel.classList.add('motion-shake');
        setTimeout(() => panel.classList.remove('motion-shake'), 500);
      });
      panel.appendChild(overlay);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// SWIPE-TO-DELETE (mobile)
// ═══════════════════════════════════════════════════════════════════

function addSwipeToDelete(card, onDelete) {
  if (!window.matchMedia('(pointer: coarse)').matches) return;
  let startX = 0, dx = 0, dragging = false;
  card.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    dx = 0; dragging = true;
    card.style.transition = 'none';
  }, { passive: true });
  card.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    dx = e.touches[0].clientX - startX;
    if (dx < 0) card.style.transform = `translateX(${Math.max(dx, -88)}px)`;
  }, { passive: true });
  card.addEventListener('touchend', () => {
    dragging = false;
    card.style.transition = 'transform 0.32s cubic-bezier(0.25,1,0.4,1)';
    if (dx < -55) { triggerHaptic([12, 40, 12]); onDelete(); }
    else card.style.transform = '';
  });
}

// ═══════════════════════════════════════════════════════════════════
// SKELETON LOADING STATE
// ═══════════════════════════════════════════════════════════════════

function renderSkeletons() {
  if (macroSummary) {
    macroSummary.innerHTML = [0,1,2,3].map(() =>
      `<div class="skeleton-card" style="border-radius:16px;height:90px"></div>`
    ).join("");
  }
  if (mealList) {
    mealList.innerHTML = [0,1].map(() =>
      `<div class="skeleton-card skeleton-meal"></div>`
    ).join("");
  }
}
