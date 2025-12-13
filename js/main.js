const BASE_URL = "https://56pkakyp2j.execute-api.us-east-2.amazonaws.com";
const PAGE_ID = "P1"; // this file is for the PersonalWishlist page (P1)

/**
 * AI Use: AI Assisted
 * @param {*} event Login event 
 */
function handleLogin(event) {
  event.preventDefault();

  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");

  const username = (usernameEl?.value || "").trim().toLowerCase();
  const password = passwordEl?.value || ""; // not used, not stored

  if (!username) return alert("Please enter a username.");

  console.log("Simulated Login Attempt:", { username, passwordProvided: !!password });

  const userId = `u:${username}`;
  localStorage.setItem("userId", userId);

  window.location.href = "PersonalWishlist.html";
}

// =====================
// Shared helpers
// =====================
function parseMoney(raw) {
  const cleaned = (raw || "").toString().replace("$", "").trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function normalizeStatus(raw) {
  const s = (raw || "").trim().toLowerCase();
  if (s === "new" || s === "used") return s;
  return null;
}

function sortKeyFromSelectValue(v) {
  const s = (v || "").toLowerCase();
  if (s === "name" || s === "game name") return "name";
  if (s === "price") return "price";
  if (s === "status" || s === "usage") return "status";
  return "name";
}

function sortItems(list, selectValue) {
  const key = sortKeyFromSelectValue(selectValue);
  const sorted = [...list];

  sorted.sort((a, b) => {
    if (key === "price") {
      const ap = typeof a.price === "number" ? a.price : parseFloat(a.price);
      const bp = typeof b.price === "number" ? b.price : parseFloat(b.price);
      return (Number.isFinite(ap) ? ap : 0) - (Number.isFinite(bp) ? bp : 0);
    }
    return String(a[key] ?? "").toLowerCase()
      .localeCompare(String(b[key] ?? "").toLowerCase());
  });

  return sorted;
}

// =====================
// Budget (shared across pages)
// Stored as ONE item per user:
// { id: "budget#u:username", type:"budget", userId:"u:username", amount:Number }
// =====================
function budgetKey(userId) {
  return `budget#${userId}`;
}

function setBudgetUI(amount) {
  const input = document.getElementById("budget-input");
  if (!input) return;

  input.dataset.budgetAmount = String(amount);
  input.placeholder = `$${Number(amount).toFixed(2)}`;
}

function loadBudgetBalance(userId) {
  const input = document.getElementById("budget-input");
  if (!input) return;

  const xhr = new XMLHttpRequest();
  xhr.open("GET", `${BASE_URL}/items/${encodeURIComponent(budgetKey(userId))}`);
  xhr.onload = () => {
    if (xhr.status !== 200) return; // no budget saved yet is fine

    let item;
    try {
      item = JSON.parse(xhr.responseText);
    } catch {
      console.error("Budget GET returned non-JSON:", xhr.responseText);
      return;
    }

    if (item && item.type === "budget" && typeof item.amount === "number") {
      setBudgetUI(item.amount);
    }
  };
  xhr.send();
}

function saveBudgetBalance(userId, newAmount, onDone) {
  const payload = {
    id: budgetKey(userId),
    type: "budget",
    userId,
    amount: newAmount
  };

  const xhr = new XMLHttpRequest();
  xhr.open("PUT", `${BASE_URL}/items`);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = () => {
    if (xhr.status === 200) {
      setBudgetUI(newAmount);
      if (typeof onDone === "function") onDone();
    } else {
      console.error("Budget PUT failed:", xhr.status, xhr.responseText);
      alert("Failed to save budget. Check console.");
    }
  };
  xhr.send(JSON.stringify(payload));
}

function initBudgetUI() {
  const input = document.getElementById("budget-input");
  const btn = document.getElementById("budget-save");
  if (!input || !btn) return;

  btn.type = "button"; // prevent form submits / refresh

  const userId = localStorage.getItem("userId");
  if (!userId) return;

  btn.onclick = () => {
    const amount = parseMoney(input.value);
    if (amount === null) return alert("Enter a valid number, like 45 or $45.");

    saveBudgetBalance(userId, amount, () => {
      input.value = "";
    });
  };

  loadBudgetBalance(userId);
}

// =====================
// Personal Wishlist (P1)
// Budget only deducts on DELETE
// =====================
function initWishlistP1() {
  const PAGE_ID = "P1";

  const table = document.getElementById("item-table");
  const sendBtn = document.getElementById("send-data");
  const form = document.getElementById("formelement");

  const refreshBtn = document.getElementById("refresh-data");
  const sortSelect = document.getElementById("sortby");

  if (!table || !sendBtn) return; // not on P1 page

  const userId = localStorage.getItem("userId");
  if (!userId) {
    window.location.href = "index.html";
    return;
  }

  let currentItems = [];

  function clearRows() {
    table.querySelectorAll("tr:not(:first-child)").forEach(r => r.remove());
  }

  function render(items) {
    currentItems = Array.isArray(items) ? [...items] : [];
    clearRows();

    if (!items || items.length === 0) {
      const row = table.insertRow();
      const cell = row.insertCell(0);
      cell.colSpan = 7;
      cell.textContent = "No items yet. Add one!";
      return;
    }

    items.forEach(item => {
      const row = table.insertRow();

      // Image
      const imgCell = row.insertCell(0);
      if (item.image) {
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name || "game image";
        img.loading = "lazy";
        img.style.maxWidth = "90px";
        img.style.maxHeight = "90px";
        img.onerror = () => img.remove();
        imgCell.appendChild(img);
      }

      // Name
      row.insertCell(1).textContent = item.name || "";

      // Price
      row.insertCell(2).textContent =
        typeof item.price === "number" ? `$${item.price}` : (item.price ?? "");

      // Where to Buy
      const whereCell = row.insertCell(3);
      if (item.location && item.link) {
        const a = document.createElement("a");
        a.href = item.link;
        a.textContent = item.location;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        whereCell.appendChild(a);
      } else if (item.location) {
        whereCell.textContent = item.location;
      } else if (item.link) {
        const a = document.createElement("a");
        a.href = item.link;
        a.textContent = "Open";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        whereCell.appendChild(a);
      }

      // Status / Notes
      row.insertCell(4).textContent = item.status || "";
      row.insertCell(5).textContent = item.notes || "";

      // Delete = deduct budget THEN delete
      const actionCell = row.insertCell(6);
      const btn = document.createElement("button");
      btn.textContent = "Delete";
      btn.onclick = () => buyAndRemove(item, row);
      actionCell.appendChild(btn);
    });
  }

  function applySortIfSelected() {
    if (!sortSelect || !sortSelect.value) return;
    render(sortItems(currentItems, sortSelect.value));
  }

  function loadItems() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${BASE_URL}/items`);
    xhr.onload = () => {
      if (xhr.status !== 200) {
        console.error("Load failed:", xhr.status, xhr.responseText);
        return;
      }

      const data = JSON.parse(xhr.responseText);
      const list = Array.isArray(data) ? data : [];

      // show ONLY this user's P1 games (ignore budget item)
      const filtered = list.filter(item =>
        item.pageId === PAGE_ID &&
        item.userId === userId &&
        item.type === "game"
      );

      render(filtered);
      applySortIfSelected();
    };
    xhr.send();
  }

  function deleteItemOnly(itemId, row) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `${BASE_URL}/items/${encodeURIComponent(itemId)}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      if (xhr.status === 200) row.remove();
      else {
        console.error("Delete failed:", xhr.status, xhr.responseText);
        alert("Delete failed. See console.");
      }
    };
    xhr.send();
  }

  function buyAndRemove(item, row) {
    const price = typeof item.price === "number" ? item.price : parseFloat(item.price);
    if (!Number.isFinite(price)) return alert("Invalid price. Cannot deduct budget.");

    const budgetInput = document.getElementById("budget-input");
    const current = budgetInput ? parseMoney(budgetInput.dataset.budgetAmount) : null;

    if (current === null) {
      loadBudgetBalance(userId);
      return alert("Budget not loaded yet. Try again in a second.");
    }

    const newBalance = current - price;

    // 1) deduct budget
    saveBudgetBalance(userId, newBalance, () => {
      // 2) delete item
      deleteItemOnly(item.id, row);
    });
  }

  // Add item (NO budget change)
  sendBtn.onclick = () => {
    const unique = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());

    const name = document.getElementById("GameName").value.trim();
    const image = document.getElementById("Picture").value.trim();
    const price = parseMoney(document.getElementById("Price").value);
    const location = document.getElementById("WheretoBuy").value.trim();
    const status = normalizeStatus(document.getElementById("UsedNew").value);
    const link = document.getElementById("link").value.trim();
    const notes = document.getElementById("AdditionalNotes").value.trim();

    if (!name) return alert("Game Name is required");
    if (!image) return alert("Image URL is required");
    if (price === null) return alert("Invalid price");
    if (!status) return alert("Status must be 'new' or 'used'");

    const payload = {
      id: `${PAGE_ID}-${unique}`,
      pageId: PAGE_ID,
      userId,
      type: "game",
      name,
      image,
      price,
      location,
      status,
      notes
    };

    if (link) payload.link = link;

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `${BASE_URL}/items`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      if (xhr.status === 200) {
        if (form) form.reset();
        loadItems();
      } else {
        console.error("Submit failed:", xhr.status, xhr.responseText);
        alert("Submit failed. See console.");
      }
    };
    xhr.send(JSON.stringify(payload));
  };

  if (refreshBtn) refreshBtn.onclick = loadItems;

  if (sortSelect) {
    sortSelect.onchange = () => render(sortItems(currentItems, sortSelect.value));
  }

  loadItems();
}

// =====================
// Other Deals (P2) user-generated table only
// - Loads P2 games into #user-table
// - "Add" copies item to P1 for THIS user
// =====================
function initDealsP2() {
  const pageId = document.body?.dataset?.pageId; // expect "P2"
  const table = document.getElementById("user-table");
  const sendBtn = document.getElementById("send-data");
  const sortSelect = document.getElementById("sortby");

  if (pageId !== "P2") return;
  if (!table || !sendBtn) return;

  let currentItems = [];

  function clearRows() {
    table.querySelectorAll("tr:not(:first-child)").forEach(r => r.remove());
  }

  function render(items) {
    currentItems = Array.isArray(items) ? [...items] : [];
    clearRows();

    items.forEach(item => {
      const row = table.insertRow();

      // Image
      const imgCell = row.insertCell(0);
      if (item.image) {
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name || "deal image";
        img.loading = "lazy";
        img.style.maxWidth = "90px";
        img.style.maxHeight = "90px";
        img.onerror = () => img.remove();
        imgCell.appendChild(img);
      }

      // Name
      row.insertCell(1).textContent = item.name || "";

      // Price
      row.insertCell(2).textContent =
        typeof item.price === "number" ? `$${item.price}` : (item.price ?? "");

      // Where to Buy
      const whereCell = row.insertCell(3);
      if (item.location && item.link) {
        const a = document.createElement("a");
        a.href = item.link;
        a.textContent = item.location;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        whereCell.appendChild(a);
      } else if (item.location) {
        whereCell.textContent = item.location;
      } else if (item.link) {
        const a = document.createElement("a");
        a.href = item.link;
        a.textContent = "Open";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        whereCell.appendChild(a);
      }

      // Status / Notes
      row.insertCell(4).textContent = item.status || "";
      row.insertCell(5).textContent = item.notes || "";

      // Add to wishlist (P1) for THIS user
      const actionCell = row.insertCell(6);
      const btn = document.createElement("button");
      btn.textContent = "Add";
      btn.onclick = () => addToWishlist(item, btn);
      actionCell.appendChild(btn);
    });
  }

  function applySortIfSelected() {
    if (!sortSelect || !sortSelect.value) return;
    render(sortItems(currentItems, sortSelect.value));
  }

  function loadItems() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${BASE_URL}/items`);
    xhr.onload = () => {
      if (xhr.status !== 200) {
        console.error("Load failed:", xhr.status, xhr.responseText);
        return;
      }

      const data = JSON.parse(xhr.responseText);
      const list = Array.isArray(data) ? data : [];

      // only P2 games
      const filtered = list.filter(item =>
        item.pageId === "P2" && item.type === "game"
      );

      render(filtered);
      applySortIfSelected();
    };
    xhr.send();
  }

  function addToWishlist(item, btn) {
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("Please log in again.");

    const unique = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());

    const payload = {
      id: `P1-${unique}`,
      pageId: "P1",
      userId,
      type: "game",
      name: item.name,
      image: item.image,
      price: item.price,
      location: item.location,
      status: item.status,
      notes: item.notes
    };

    if (item.link) payload.link = item.link;

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `${BASE_URL}/items`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      if (xhr.status === 200) {
        btn.textContent = "Added";
        btn.disabled = true;
      } else {
        console.error("Add to wishlist failed:", xhr.status, xhr.responseText);
        alert("Failed to add to wishlist.");
      }
    };
    xhr.send(JSON.stringify(payload));
  }

  // Submit a NEW P2 deal (no userId required, it’s community deals)
  sendBtn.onclick = () => {
    const unique = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());

    const name = document.getElementById("GameName").value.trim();
    const image = document.getElementById("Picture").value.trim();
    const price = parseMoney(document.getElementById("Price").value);
    const location = document.getElementById("WheretoBuy").value.trim();
    const status = normalizeStatus(document.getElementById("UsedNew").value);
    const link = document.getElementById("link").value.trim();
    const notes = document.getElementById("AdditionalNotes").value.trim();

    if (!name) return alert("Game Name is required");
    if (!image) return alert("Image URL is required");
    if (price === null) return alert("Invalid price");
    if (!status) return alert("Pick new or used");

    const payload = {
      id: `P2-${unique}`,
      pageId: "P2",
      type: "game",
      name,
      image,
      price,
      location,
      status,
      notes
    };

    if (link) payload.link = link;

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `${BASE_URL}/items`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      if (xhr.status === 200) {
        const form = document.getElementById("formelement");
        if (form) form.reset();
        loadItems();
      } else {
        console.error("Submit failed:", xhr.status, xhr.responseText);
        alert("Submit failed. Check console.");
      }
    };
    xhr.send(JSON.stringify(payload));
  };

  if (sortSelect) {
    sortSelect.onchange = () => render(sortItems(currentItems, sortSelect.value));
  }

  loadItems();
}

// =====================
// Bootstrapping
// =====================
document.addEventListener("DOMContentLoaded", () => {
  initBudgetUI();   // works on ANY page with budget elements
  initWishlistP1(); // runs only on P1 page (based on DOM)
  initDealsP2();    // runs only on P2 page (based on body data-page-id)
});