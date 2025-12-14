const BASE_URL = "https://56pkakyp2j.execute-api.us-east-2.amazonaws.com";
const PAGE_ID = "P1"; // this file is for the PersonalWishlist page (P1)

/**
 * Handles the Login Event on the Main Landing Page
 * 
 * AI Use: AI Assisted
 * @param {*} event Login event 
 */
function handleLogin(event) {
  //Prevent default behavior
  event.preventDefault();

  //Extract login information from webpage
  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");

  //Parse login information. Password not stored
  const username = (usernameEl?.value || "").trim().toLowerCase();
  const password = passwordEl?.value || ""; 

  if (!username){
     return alert("Please enter a username.");
    }

  //Log for debugging, !! ensures user put in password by turning it to boolean
  console.log("Simulated Login Attempt:", { username, passwordProvided: !!password });

  //Create user ID to help track user content later
  const userId = `u:${username}`;
  localStorage.setItem("userId", userId);

  //Return to Personal wishlist page
  window.location.href = "PersonalWishlist.html";
}


/**
 * Parses input for Money value
 * 
 * AI Use: AI Assisted
 * @param {*} raw 
 * @returns n -ie a validated number
 */
function parseMoney(raw) {
  //Parse raw input for monetary value. Ensure its not null or undefined.
  const cleaned = (raw || "").toString().replace("$", "").trim();
  const n = parseFloat(cleaned);
  //Ensures n is a finite number and not anything else.
  return Number.isFinite(n) ? n : null;
}

/**
 * Cleans and validates new/used input
 * 
 * AI Use: AI Assisted
 * @param {*} raw 
 * @returns s -ie the status for the selector or null
 */
function normalizeStatus(raw) {
  const s = (raw || "").trim().toLowerCase();
  if (s === "new" || s === "used") return s;
  return null;
}


/**
 * Method used to help parse select value
 * helps with future proofing.
 * 
 * AI Use: Ai Assisted
 * @param {*} v 
 * @returns  status, price, name - parsed value used to sort data
 */
function sortKeyFromSelectValue(v) {
  const s = (v || "").toLowerCase();
  if (s === "name" || s === "game name") return "name";
  if (s === "price") return "price";
  if (s === "status" || s === "usage") return "status";
  return "name";
}


/**
 * Function used to sort items depending on whats picked in dropdown.
 * 
 * AI Use: AI Assisted
 * @param {*} list 
 * @param {*} selectValue 
 * @returns sorted - list of sorted values, return value depends on sort key function
 */
function sortItems(list, selectValue) {
  //Extract value using previous function
  const key = sortKeyFromSelectValue(selectValue);
  const sorted = [...list];

  //Use sort method to sort values in place
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

/**
 * Returns the Users Budget based on ID. helps track individual budgets
 * 
 * AI Use: AI assisted
 * @param {*} userId 
 * @returns budget#userID 
 */
function budgetKey(userId) {
  return `budget#${userId}`;
}

/**
 * used to modify the budget based on users needs
 * 
 * AI Use: AI Assisted
 * @param {*} amount 
 * @returns only if no input is put into budget
 */
function setBudgetUI(amount) {
  const input = document.getElementById("budget-input");
  if (!input) return;

  input.dataset.budgetAmount = String(amount);
  input.placeholder = `$${Number(amount).toFixed(2)}`;
}

/**
 * Used to load and modify logged in users budget on webpage
 * 
 * AI Use: AI Assisted
 * @param {*} userId 
 * @returns 
 */
function loadBudgetBalance(userId) {
  const input = document.getElementById("budget-input");
  if (!input) return;

  const xhr = new XMLHttpRequest();
  //retrieves user budget from AWS
  xhr.open("GET", `${BASE_URL}/items/${encodeURIComponent(budgetKey(userId))}`);
  xhr.onload = () => {
    if (xhr.status !== 200) return; // no budget saved yet is fine

    //Parse response for desired data
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

/**
 * Saves budget to AWS, and updates ui
 * 
 * AI Use: AI Assisted
 * @param {*} userId 
 * @param {*} newAmount 
 * @param {*} onDone 
 */
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

/**
 * Enables front end modification of budget and leverages other methods
 * to update budget on backend.
 * 
 * @returns - only if user id or input are null
 */
function initBudgetUI() {
  const input = document.getElementById("budget-input");
  const btn = document.getElementById("budget-save");
  if (!input || !btn) return;

  btn.type = "button";

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

/**
 * Only runs on the Personal Wishlist Page. Renders operations related to user wishlist page
 * 
 * AI Use: AI Assisted
 * @returns - ON Error
 */
function initWishlistP1() {
  const PAGE_ID = "P1";

  const table = document.getElementById("item-table");
  const sendBtn = document.getElementById("send-data");
  const form = document.getElementById("formelement");

  const refreshBtn = document.getElementById("refresh-data");
  const sortSelect = document.getElementById("sortby");

  //Return if elements dont exist
  if (!table || !sendBtn) return;

  const userId = localStorage.getItem("userId");
  if (!userId) {
    window.location.href = "index.html";
    return;
  }

  let currentItems = [];

  //Clear existing rows
  function clearRows() {
    table.querySelectorAll("tr:not(:first-child)").forEach(r => r.remove());
  }

  /**
   * Renders new rows for table to update
   * 
   * AI Use: AI Assisted
   * @param {*} items 
   * @returns - on error
   */
  function render(items) {
    currentItems = Array.isArray(items) ? [...items] : [];
    clearRows();

    //If No items then set default value
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
        // img.style.maxWidth = "90px";
        // img.style.maxHeight = "90px";
        img.onerror = () => img.remove();
        imgCell.appendChild(img);
      }

      // Name
      row.insertCell(1).textContent = item.name || "";

      // Price
      row.insertCell(2).textContent =
        typeof item.price === "number" ? `$${item.price}` : (item.price ?? "");

      // Where to Buy, links url to location for user convience
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

  /**
   * Used to apply filter to sort items
   * 
   * AI Use: AI Assisted
   * @returns - On Error, invalid sort
   */
  function applySortIfSelected() {
    if (!sortSelect || !sortSelect.value) return;
    render(sortItems(currentItems, sortSelect.value));
  }

  /**
   * Retrieves users items from AWS and renders them on webpage 
   * 
   * AI Use: AI Assisted
   */
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

  /**
   * Deletes item from the table by removing its row, Also affects AWS backend.
   * Used when User actually deletes row on frontend.
   * 
   * AI Use: AI Assisted
   * @param {*} itemId 
   * @param {*} row 
   */
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

  /**
   * Used to deduct the price of an item from budget when delete is clicked on Personal
   * Wishlist
   * 
   * AI Use: AI Assisted
   * @param {*} item 
   * @param {*} row 
   * @returns 
   */
  function buyAndRemove(item, row) {
    //Helps ensure price can be extracted despite being a number or string
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

  // Add item 
  sendBtn.onclick = () => {
    const unique = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());

    //Ensures properties of game are set
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

    //Cleaned data to be sent to AWS
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

    //Send data to AWS
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


/**
 *Renders table items on Other Deals Page. Similar functionality to initWishlistP1()
 * 
 * AI Use: AI Assisted
 * @returns - on error
 */
function initDealsP2() {
  // expects "P2"
  const pageId = document.body?.dataset?.pageId; 
  const table = document.getElementById("user-table");
  const sendBtn = document.getElementById("send-data");
  const sortSelect = document.getElementById("sortby");

  if (pageId !== "P2") return;
  if (!table || !sendBtn) return;

  let currentItems = [];

  function clearRows() {
    table.querySelectorAll("tr:not(:first-child)").forEach(r => r.remove());
  }

    /**
   * Renders new rows for table to update
   * 
   * AI Use: AI Assisted
   * @param {*} items 
   * @returns - on error
   */
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
        // img.style.maxWidth = "90px";
        // img.style.maxHeight = "90px";
        img.onerror = () => img.remove();
        imgCell.appendChild(img);
      }

      // Name
      row.insertCell(1).textContent = item.name || "";

      // Price
      row.insertCell(2).textContent =
        typeof item.price === "number" ? `$${item.price}` : (item.price ?? "");

      // Where to Buy, links url to location for user convenience
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

  /**
   * Used to apply filter to sort items
   * 
   * AI Use: AI Assisted
   * @returns - on error, improper sort
   */
  function applySortIfSelected() {
    if (!sortSelect || !sortSelect.value) return;
    render(sortItems(currentItems, sortSelect.value));
  }


  /**
   * Retrieves users items from AWS and renders them on webpage
   * 
   * AI Use: AI Assisted
   */
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

  /**
   * Used to Add item to Personal Wishlist
   * 
   * AI Use: AI Assisted
   * @param {*} item 
   * @param {*} btn 
   * @returns - on error
   */
  function addToWishlist(item, btn) {
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("Please log in again.");

    const unique = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());

    //Data to be sent to AWS
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

    //Data to be sent to AWS
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

/**
 * Waits for webpage to load then renders content.
 * 
 * AI Use: AI Assisted
 */
document.addEventListener("DOMContentLoaded", () => {
  initBudgetUI();  
  initWishlistP1();
  initDealsP2();    
});