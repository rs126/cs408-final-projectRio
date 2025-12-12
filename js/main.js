

// /**
//  * AI Use: AI Assisted
//  * @param {*} event Login event 
//  */
// function handleLogin(event) {
//     //Prevent page reload
//     event.preventDefault(); 
    
//     // Retrieve values
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;
    
//     console.log("Simulated Login Attempt:");
//     console.log("Username:", username);
//     console.log("Password:", password);

//     //Perform the redirection
//     window.location.href = 'PersonalWishlist.html'; 
// }


/////////////////////////////////////////////////////////////////////
// function handleLogin(event) {
//   event.preventDefault();

//   const username = document.getElementById("username").value.trim().toLowerCase();
//   // DON'T store password anywhere
//   if (!username) return alert("Enter a username");

//   const userId = `u:${username}`;
//   localStorage.setItem("userId", userId);

//   window.location.href = "PersonalWishlist.html";
// }





//  const BASE_URL = "https://56pkakyp2j.execute-api.us-east-2.amazonaws.com";
// const PAGE_ID = "P1";

// document.addEventListener("DOMContentLoaded", () => {
//   const table = document.getElementById("item-table");
//   const sendBtn = document.getElementById("send-data");

//   // Not the wishlist page? quietly do nothing.
//   if (!table || !sendBtn) return;

//   function clearTableRows() {
//     table.querySelectorAll("tr:not(:first-child)").forEach(row => row.remove());
//   }

//   function normalizeStatus(raw) {
//     const s = (raw || "").trim().toLowerCase();
//     if (s === "new" || s === "used") return s;
//     return null;
//   }

//   function parsePrice(raw) {
//     const cleaned = (raw || "").replace("$", "").trim();
//     const n = parseFloat(cleaned);
//     return Number.isFinite(n) ? n : null;
//   }

//   function deleteItem(id, row) {
//     const xhr = new XMLHttpRequest();
//     xhr.open("DELETE", `${BASE_URL}/items/${id}`);
//     xhr.setRequestHeader("Content-Type", "application/json");
//     xhr.onload = () => {
//       if (xhr.status === 200) row.remove();
//       else alert("Delete failed");
//     };
//     xhr.send();
//   }

//   function renderItems(items) {
//     clearTableRows();

//     items.forEach(item => {
//       const row = table.insertRow();

//       const imgCell = row.insertCell(0);
//       if (item.image) {
//         const img = document.createElement("img");
//         img.src = item.image;
//         img.alt = item.name || "game image";
//         img.loading = "lazy";
//         img.style.maxWidth = "90px";
//         img.style.maxHeight = "90px";
//         img.onerror = () => img.remove();
//         imgCell.appendChild(img);
//       }

//       row.insertCell(1).textContent = item.name || "";

//       row.insertCell(2).textContent =
//         typeof item.price === "number" ? `$${item.price}` : "";

//       const whereCell = row.insertCell(3);
//       if (item.location && item.link) {
//         const a = document.createElement("a");
//         a.href = item.link;
//         a.textContent = item.location;
//         a.target = "_blank";
//         a.rel = "noopener noreferrer";
//         whereCell.appendChild(a);
//       } else if (item.location) {
//         whereCell.textContent = item.location;
//       } else if (item.link) {
//         const a = document.createElement("a");
//         a.href = item.link;
//         a.textContent = "Open";
//         a.target = "_blank";
//         a.rel = "noopener noreferrer";
//         whereCell.appendChild(a);
//       }

//       row.insertCell(4).textContent = item.status || "";
//       row.insertCell(5).textContent = item.notes || "";

//       const actionCell = row.insertCell(6);
//       const btn = document.createElement("button");
//       btn.textContent = "Delete";
//       btn.onclick = () => deleteItem(item.id, row);
//       actionCell.appendChild(btn);
//     });
//   }

//   function loadItems() {
//     const xhr = new XMLHttpRequest();
//     xhr.open("GET", `${BASE_URL}/items`);
//     xhr.onload = () => {
//       if (xhr.status !== 200) {
//         console.error("Load failed:", xhr.status, xhr.responseText);
//         return;
//       }

//       const data = JSON.parse(xhr.responseText);
//       const list = Array.isArray(data) ? data : [];
//       const pageItems = list.filter(item => item.pageId === PAGE_ID);
//       renderItems(pageItems);
//     };
//     xhr.send();
//   }

//   sendBtn.onclick = () => {
//     const unique = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());

//     const payload = {
//       id: `${PAGE_ID}-${unique}`,
//       pageId: PAGE_ID,
//       name: document.getElementById("GameName").value.trim(),
//       image: document.getElementById("Picture").value.trim(),
//       price: parsePrice(document.getElementById("Price").value),
//       location: document.getElementById("WheretoBuy").value.trim(),
//       status: normalizeStatus(document.getElementById("UsedNew").value),
//       notes: document.getElementById("AdditionalNotes").value.trim()
//     };

//     const link = document.getElementById("link").value.trim();
//     if (link) payload.link = link;

//     if (!payload.name) return alert("Game Name is required");
//     if (!payload.image) return alert("Image URL is required");
//     if (payload.price === null) return alert("Invalid price");
//     if (!payload.status) return alert("Status must be 'new' or 'used'");

//     const xhr = new XMLHttpRequest();
//     xhr.open("PUT", `${BASE_URL}/items`);
//     xhr.setRequestHeader("Content-Type", "application/json");
//     xhr.onload = () => {
//       if (xhr.status === 200) {
//         document.getElementById("formelement").reset();
//         loadItems();
//       } else {
//         alert("Submit failed");
//         console.error(xhr.responseText);
//       }
//     };
//     xhr.send(JSON.stringify(payload));
//   };

//   // Auto-load on page open
//   loadItems();
// });








const BASE_URL = "https://56pkakyp2j.execute-api.us-east-2.amazonaws.com";
const PAGE_ID = "P1"; // this file is for the PersonalWishlist page (P1)

/**
 * Fake login (personal project)
 * Stores userId derived from username ONLY (never store password).
 */
function handleLogin(event) {
  event.preventDefault();

  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");

  const username = (usernameEl?.value || "").trim().toLowerCase();
  const password = passwordEl?.value || ""; // not used, not stored

  if (!username) {
    alert("Please enter a username.");
    return;
  }

  console.log("Simulated Login Attempt:");
  console.log("Username:", username);
  console.log("Password provided:", password ? "(yes)" : "(no)");

  // Safer "unique identifier": derived from username only
  const userId = `u:${username}`;
  localStorage.setItem("userId", userId);

  // Go to wishlist page
  window.location.href = "PersonalWishlist.html";
}

/**
 * Wishlist logic (runs ONLY on pages that have the wishlist elements)
 */
document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("item-table");
  const sendBtn = document.getElementById("send-data");
  const form = document.getElementById("formelement");

  // Not the wishlist page? quietly do nothing.
  if (!table || !sendBtn) return;

  // Must have a logged-in userId (from the login page)
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.warn("No userId found. Redirecting to login page.");
    // If you prefer, you can just "return;" instead of redirecting.
    window.location.href = "index.html";
    return;
  }

  function clearTableRows() {
    table.querySelectorAll("tr:not(:first-child)").forEach(row => row.remove());
  }

  function normalizeStatus(raw) {
    const s = (raw || "").trim().toLowerCase();
    if (s === "new" || s === "used") return s;
    return null;
  }

  function parsePrice(raw) {
    const cleaned = (raw || "").toString().replace("$", "").trim();
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  function deleteItem(id, row) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `${BASE_URL}/items/${id}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      if (xhr.status === 200) {
        row.remove();
      } else {
        console.error("Delete failed:", xhr.status, xhr.responseText);
        alert("Delete failed. See console.");
      }
    };
    xhr.send();
  }

  function renderItems(items) {
    clearTableRows();

    // Optional: empty state message
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

      // Where to Buy (location becomes clickable if link exists)
      const whereCell = row.insertCell(3);
      if (item.location && item.link) {
        const a = document.createElement("a");
        a.href = item.link;
        a.textContent = item.location; // e.g., "Amazon"
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

      // Action (Delete)
      const actionCell = row.insertCell(6);
      const btn = document.createElement("button");
      btn.textContent = "Delete";
      btn.onclick = () => deleteItem(item.id, row);
      actionCell.appendChild(btn);
    });
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

      // Filter by BOTH pageId and userId
      const filtered = list.filter(item =>
        item.pageId === PAGE_ID && item.userId === userId
      );

      renderItems(filtered);
    };
    xhr.send();
  }

  sendBtn.onclick = () => {
    const unique = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());

    const name = document.getElementById("GameName").value.trim();
    const image = document.getElementById("Picture").value.trim();
    const price = parsePrice(document.getElementById("Price").value);
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
      userId: userId, // 👈 ties this item to the logged-in user
      name,
      price,
      location,
      status,
      image,
      notes
    };

    // link is optional
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

  // Auto-load on page open
  loadItems();
});









//Other Deals Page Logic


document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "https://56pkakyp2j.execute-api.us-east-2.amazonaws.com";

  // Page decides its own pageId via <body data-page-id="P2">
  const PAGE_ID = document.body.dataset.pageId;

  // Only the SECOND table (user generated)
  const table = document.getElementById("user-table");
  const sendBtn = document.getElementById("send-data");

  // If this page doesn't have the user table, do nothing.
  if (!PAGE_ID || !table || !sendBtn) return;

  function clearUserRows() {
    table.querySelectorAll("tr:not(:first-child)").forEach(row => row.remove());
  }

  function parsePrice(raw) {
    const cleaned = (raw || "").toString().replace("$", "").trim();
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  function renderItems(items) {
    clearUserRows();

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

      // Where to Buy: make location clickable if link exists
      const whereCell = row.insertCell(3);
      if (item.location && item.link) {
        const a = document.createElement("a");
        a.href = item.link;
        a.textContent = item.location;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        whereCell.appendChild(a);
      } else {
        whereCell.textContent = item.location || "";
      }

      // Used/New
      row.insertCell(4).textContent = item.status || "";

      // Notes
      row.insertCell(5).textContent = item.notes || "";

      // "Add to Wishlist" button (placeholder for later)
      const actionCell = row.insertCell(6);
      const btn = document.createElement("button");
      btn.textContent = "Add";
      btn.onclick = () => {
  const unique = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Please log in again.");
    return;
  }

  const payload = {
    id: `P1-${unique}`,
    pageId: "P1",
    userId: userId,        // 👈 ties it to THIS user
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
      alert("Failed to add to wishlist");
      console.error(xhr.responseText);
    }
  };
  xhr.send(JSON.stringify(payload));
};
      actionCell.appendChild(btn);
    });
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

      // KEY PART: only show items for this page
      const pageItems = list.filter(item => item.pageId === PAGE_ID);
      renderItems(pageItems);
    };
    xhr.send();
  }

  sendBtn.onclick = () => {
    const unique = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const price = parsePrice(document.getElementById("Price").value);

    const payload = {
      id: `${PAGE_ID}-${unique}`,
      pageId: PAGE_ID, // KEY PART: tag items as P2
      name: document.getElementById("GameName").value.trim(),
      image: document.getElementById("Picture").value.trim(),
      price: price,
      location: document.getElementById("WheretoBuy").value.trim(),
      status: document.getElementById("UsedNew").value.trim(),
      notes: document.getElementById("AdditionalNotes").value.trim(),
    };

    const link = document.getElementById("link").value.trim();
    if (link) payload.link = link;

    if (!payload.name) return alert("Game Name is required");
    if (!payload.image) return alert("Image URL is required");
    if (payload.price === null) return alert("Invalid price");
    if (!payload.status) return alert("Pick new or used");

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `${BASE_URL}/items`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      if (xhr.status === 200) {
        document.getElementById("formelement").reset();
        loadItems();
      } else {
        console.error("Submit failed:", xhr.status, xhr.responseText);
        alert("Submit failed. Check console.");
      }
    };
    xhr.send(JSON.stringify(payload));
  };

  // Auto-load on page open
  loadItems();
});