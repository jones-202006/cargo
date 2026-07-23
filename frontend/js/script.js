// =========================
// CargoIQ JavaScript
// =========================

const API_URL = "http://localhost:5000/api";

// ===== Authentication Check =====
const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
}

// Global Variables
var items = [];
var lastResult = null;
var deliveryStatus = {};
var STEPS = ['Queued', 'Dispatched', 'In Transit', 'Delivered'];
var BOX_COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#15803d', '#c026d3'];
var API_BASE = 'http://localhost:5000/api/cargo';
var SSE_ENABLED = false;

// =========================
// API Helpers
// =========================

async function apiFetch(url, opts) {
  // Merge provided options with JWT authorization header
  opts = opts || {};
  opts.headers = opts.headers || {};
  opts.headers["Authorization"] = "Bearer " + localStorage.getItem("token");
  
  var res = await fetch(url, opts);
  if (!res.ok) {
    var err = await res.json().catch(function () { return { message: res.statusText }; });
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

// =========================
// UI Helpers
// =========================

function showTab(id) {
  document.querySelectorAll('.tab-content').forEach(function (el) {
    el.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(function (el) {
    el.classList.remove('active');
  });
  document.getElementById('tab-' + id).classList.add('active');
  event.target.classList.add('active');
}

// Load sample items into backend
async function loadDefaults() {
  var samples = [
    { itemName: 'Electronics Crate', weight: 120, profit: 95, volume: 2.5, destination: 'Mumbai' },
    { itemName: 'Furniture Set', weight: 300, profit: 60, volume: 8.0, destination: 'Delhi' },
    { itemName: 'Medical Supplies', weight: 80, profit: 100, volume: 1.5, destination: 'Chennai' },
    { itemName: 'Auto Parts', weight: 200, profit: 75, volume: 4.0, destination: 'Pune' },
    { itemName: 'Food Packages', weight: 150, profit: 50, volume: 3.5, destination: 'Bangalore' },
    { itemName: 'Industrial Tools', weight: 250, profit: 70, volume: 5.0, destination: 'Hyderabad' },
    { itemName: 'Textiles', weight: 90, profit: 45, volume: 6.0, destination: 'Kolkata' },
    { itemName: 'Chemicals Safe', weight: 100, profit: 85, volume: 2.0, destination: 'Ahmedabad' }
  ];

  try {
    for (var i = 0; i < samples.length; i++) {
      await apiFetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(samples[i])
      });
    }
    await fetchItems();
    showToast('Sample data loaded!', 'success');
  } catch (e) {
    showToast('Failed to load samples: ' + e.message, 'error');
  }
}

async function addItem() {
  var itemName = document.getElementById('itemName').value.trim();
  var weight = parseFloat(document.getElementById('weight').value);
  var profit = parseFloat(document.getElementById('profit').value);
  var volume = parseFloat(document.getElementById('volume').value);
  var destination = document.getElementById('destination').value;
  var category = document.getElementById('category').value.trim() || 'General';

  if (!itemName || isNaN(weight) || isNaN(profit) || isNaN(volume) || weight <= 0 || profit <= 0 || volume <= 0) {
    showToast('Please fill all fields with valid positive numbers.', 'error');
    return;
  }

  var url = API_BASE;
  var method = 'POST';
  if (window.editingId) {
    url += '/' + window.editingId;
    method = 'PUT';
  }

  try {
    await apiFetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemName: itemName, weight: weight, profit: profit, volume: volume, destination: destination, category: category })
    });
    resetForm();
    window.editingId = null;
    document.getElementById('addBtn').textContent = 'Add Item';
    document.getElementById('cancelEditBtn').style.display = 'none';
    await fetchItems();
    showToast(window.editingId ? 'Item updated!' : 'Item added successfully!', 'success');
  } catch (e) {
    showToast('Failed: ' + e.message, 'error');
  }
}

function resetForm() {
  document.getElementById('itemName').value = '';
  document.getElementById('weight').value = '';
  document.getElementById('profit').value = '';
  document.getElementById('volume').value = '';
  document.getElementById('destination').value = 'Mumbai';
  document.getElementById('category').value = 'General';
}

async function removeItem(id) {
  if (!confirm('Delete this item?')) return;
  try {
    await apiFetch(API_BASE + '/' + id, { method: 'DELETE' });
    await fetchItems();
    showToast('Item deleted.', 'success');
  } catch (e) {
    showToast('Failed to delete: ' + e.message, 'error');
  }
}

async function editCargo(id) {
  try {
    var cargo = await apiFetch(API_BASE + '/' + id);
    document.getElementById('itemName').value = cargo.itemName;
    document.getElementById('weight').value = cargo.weight;
    document.getElementById('profit').value = cargo.profit;
    document.getElementById('volume').value = cargo.volume;
    document.getElementById('destination').value = cargo.destination;
    document.getElementById('category').value = cargo.category || 'General';
    window.editingId = id;
    document.getElementById('addBtn').textContent = 'Update Item';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
    showToast('Editing item. Update fields and click Update Item.', 'info');
  } catch (e) {
    showToast('Failed to fetch item: ' + e.message, 'error');
  }
}

function cancelEdit() {
  window.editingId = null;
  resetForm();
  document.getElementById('addBtn').textContent = 'Add Item';
  document.getElementById('cancelEditBtn').style.display = 'none';
  showToast('Edit cancelled.', 'info');
}

// =========================
// fetchItems — GET all from backend
// =========================

async function fetchItems() {
  try {
    var data = await apiFetch(API_BASE);
    items = data;
    renderItemsTable();
    updateQuickStats();
    updateDashboard(data);
  } catch (e) {
    showToast('Failed to fetch items: ' + e.message, 'error');
  }
}

// =========================
// Toast notifications
// =========================

function showToast(msg, type) {
  var existing = document.querySelector('.toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '24px', right: '24px',
    padding: '12px 20px', borderRadius: '8px', fontSize: '13px',
    fontWeight: '600', zIndex: '9999', maxWidth: '360px',
    background: type === 'error' ? '#450a0a' : type === 'success' ? '#14532d' : '#1e3a5f',
    color: type === 'error' ? '#fca5a5' : type === 'success' ? '#86efac' : '#93c5fd',
    border: '1px solid ' + (type === 'error' ? '#ef444455' : type === 'success' ? '#22c55e55' : '#2563eb55'),
    boxShadow: '0 4px 16px rgba(0,0,0,.4)',
    animation: 'boxIn .3s ease'
  });
  document.body.appendChild(toast);
  setTimeout(function () { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(function () { toast.remove(); }, 300); }, 3000);
}

// =========================
// Table / Stats
// =========================

function renderItemsTable() {
  var tb = document.getElementById('items-tbody');
  if (items.length === 0) {
    tb.innerHTML = '<tr><td colspan="8" class="empty-state">No items added yet.</td></tr>';
    return;
  }

  var html = '';
  items.forEach(function (it, i) {
    var sel = lastResult && lastResult.selectedIds && lastResult.selectedIds.indexOf(it._id) !== -1;
    html += '<tr class="' + (sel ? 'selected-row' : '') + '">';
    html += '<td>' + (i + 1) + '</td>';
    html += '<td><strong>' + (it.itemName || it.name) + '</strong></td>';
    html += '<td>' + it.weight + ' kg</td>';
    html += '<td>' + (it.profit || it.value) + '</td>';
    html += '<td>' + it.volume + ' m³</td>';
    html += '<td>' + (it.destination || it.dest) + '</td>';

    html += '<td>';
    if (!lastResult) {
      html += '<span class="badge badge-gray">Pending</span>';
    } else if (sel) {
      html += '<span class="badge badge-green">Loaded</span>';
    } else {
      html += '<span class="badge badge-red">Rejected</span>';
    }
    html += '</td>';

    html += '<td>';
    html += '<button class="btn btn-amber btn-sm" onclick="editCargo(\'' + it._id + '\')" style="margin-right:4px">Edit</button>';
    html += '<button class="btn btn-danger btn-sm" onclick="removeItem(\'' + it._id + '\')">Delete</button>';
    html += '</td>';
    html += '</tr>';
  });

  tb.innerHTML = html;
}

function updateQuickStats() {
  document.getElementById('q-total').textContent = items.length;
  var tw = 0, tv = 0, tvol = 0;
  items.forEach(function (it) {
    tw += it.weight;
    tv += it.profit || it.value;
    tvol += it.volume;
  });
  document.getElementById('q-tw').textContent = tw + ' kg';
  document.getElementById('q-tv').textContent = tv;
  document.getElementById('q-tv2').textContent = tvol.toFixed(1) + ' m³';
}

// =========================
// Knapsack Optimization (Backend)
// =========================

async function runKnapsack() {
  if (items.length === 0) { showToast('No items! Please add cargo items first.', 'error'); return; }

  var maxW = parseInt(document.getElementById('maxWeight').value);
  var maxV = parseFloat(document.getElementById('maxVolume').value);
  if (isNaN(maxW) || maxW < 1 || isNaN(maxV) || maxV < 1) { showToast('Set valid capacity values.', 'error'); return; }

  try {
    var result = await apiFetch(API_BASE + '/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxWeight: maxW, maxVolume: maxV })
    });

    lastResult = result;

    document.getElementById('s-loaded').textContent = result.selectedItems.length;
    document.getElementById('s-weight').textContent = result.totalWeight + ' kg';
    document.getElementById('s-value').textContent = result.totalProfit;
    document.getElementById('s-rejected').textContent = result.rejectedItems.length;

    var wPct = Math.min(100, Math.round((result.totalWeight / maxW) * 100));
    var vPct = Math.min(100, Math.round((result.totalVolume / maxV) * 100));

    document.getElementById('wlabel').textContent = result.totalWeight + ' / ' + maxW + ' kg';
    document.getElementById('vlabel').textContent = result.totalVolume.toFixed(1) + ' / ' + maxV + ' m³';
    document.getElementById('wbar').style.width = wPct + '%';
    document.getElementById('vbar').style.width = vPct + '%';
    document.getElementById('wbar').style.background = wPct > 85 ? '#ef4444' : wPct > 60 ? '#f59e0b' : '#22c55e';
    document.getElementById('vbar').style.background = vPct > 85 ? '#ef4444' : vPct > 60 ? '#f59e0b' : '#3b82f6';

    document.getElementById('ring-pct').textContent = result.efficiency + '%';
    var offset = 339 - (339 * result.efficiency / 100);
    document.getElementById('ring-circle').style.strokeDashoffset = offset;

    document.getElementById('result-summary').innerHTML =
      '<span class="text-green">Profit loaded: <strong>' + result.totalProfit + '</strong></span> &nbsp;|&nbsp; ' +
      '<span>Weight used: <strong>' + wPct + '%</strong></span> &nbsp;|&nbsp; ' +
      '<span>Volume used: <strong>' + vPct + '%</strong></span>';

    renderDashboardTable(result.selectedItems);
    renderTruck(result.selectedItems, result.rejectedItems);
    renderDelivery(result.selectedItems);
    renderItemsTable();
    updateDashboard(items, result);
    document.getElementById('dp-ops').textContent = (result.dpOps || items.length * maxW).toLocaleString();

    var wrap = document.getElementById('dp-table-wrap');
    wrap.innerHTML = '<div class="empty-state">DP table computed server-side. Max profit: <strong>' + result.totalProfit + '</strong></div>';

    // Viz lists
    var ll = document.getElementById('viz-loaded-list');
    var rl = document.getElementById('viz-rejected-list');
    var lhtml = '', rhtml = '';
    result.selectedItems.forEach(function (it) {
      lhtml += '<div style="padding:5px 0;border-bottom:1px solid #2a305044;"><strong>' + it.itemName + '</strong> <span style="color:#64748b;font-size:11px">' + it.weight + 'kg · ' + it.destination + '</span></div>';
    });
    result.rejectedItems.forEach(function (it) {
      rhtml += '<div style="padding:5px 0;border-bottom:1px solid #2a305044;color:#64748b;"><strong>' + it.itemName + '</strong> <span style="font-size:11px">' + it.weight + 'kg · not selected</span></div>';
    });
    ll.innerHTML = lhtml || '<span style="color:var(--muted)">None loaded.</span>';
    rl.innerHTML = rhtml || '<span style="color:var(--muted)">No rejections!</span>';

    showToast('Optimization complete!', 'success');
    drawCharts(items, result);
  } catch (e) {
    showToast('Optimization failed: ' + e.message, 'error');
  }
}

function renderDashboardTable(loadedItems) {
  var wrap = document.getElementById('loaded-table-wrap');
  if (!loadedItems || loadedItems.length === 0) {
    wrap.innerHTML = '<div class="empty-state">No items fit in the truck.</div>';
    return;
  }

  var html = '<div class="tbl-wrap"><table><thead><tr><th>Item</th><th>Weight</th><th>Profit</th><th>Volume</th><th>Destination</th></tr></thead><tbody>';
  loadedItems.forEach(function (it) {
    html += '<tr>';
    html += '<td><strong>' + it.itemName + '</strong></td>';
    html += '<td>' + it.weight + ' kg</td>';
    html += '<td><span class="badge badge-green">' + it.profit + '</span></td>';
    html += '<td>' + (it.volume || 1) + ' m³</td>';
    html += '<td><span class="badge badge-blue">' + it.destination + '</span></td>';
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  wrap.innerHTML = html;
}

function renderTruck(loadedItems, rejectedItems) {
  var boxesG = document.getElementById('cargo-boxes');
  var rejectedG = document.getElementById('rejected-items');
  boxesG.innerHTML = '';
  rejectedG.innerHTML = '';

  var bayX = 20, bayY = 58, bayW = 614, bayH = 132;
  var cols = Math.ceil(Math.sqrt(loadedItems.length)) || 1;
  var rows = Math.ceil(loadedItems.length / cols) || 1;
  var bw = Math.min(90, Math.floor((bayW - 8) / cols) - 4);
  var bh = Math.min(50, Math.floor((bayH - 8) / rows) - 4);

  loadedItems.forEach(function (it, k) {
    var col = k % cols;
    var row = Math.floor(k / cols);
    var x = bayX + 4 + col * (bw + 4);
    var y = bayY + 4 + row * (bh + 4);
    var color = BOX_COLORS[k % BOX_COLORS.length];

    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', bw);
    rect.setAttribute('height', bh);
    rect.setAttribute('rx', '4');
    rect.setAttribute('fill', color);
    rect.setAttribute('opacity', '0.85');
    rect.style.animation = 'boxIn 0.4s ' + (k * 0.07) + 's both';

    var txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', x + bw / 2);
    txt.setAttribute('y', y + bh / 2 - 5);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('dominant-baseline', 'central');
    txt.setAttribute('fill', '#fff');
    txt.setAttribute('font-size', '9');
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('font-family', 'Segoe UI,sans-serif');

    var short = it.itemName.length > 12 ? it.itemName.substring(0, 11) + '…' : it.itemName;
    txt.textContent = short;

    var wt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    wt.setAttribute('x', x + bw / 2);
    wt.setAttribute('y', y + bh / 2 + 8);
    wt.setAttribute('text-anchor', 'middle');
    wt.setAttribute('fill', '#ffffff99');
    wt.setAttribute('font-size', '8');
    wt.setAttribute('font-family', 'Segoe UI,sans-serif');
    wt.textContent = it.weight + 'kg';

    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.appendChild(rect);
    g.appendChild(txt);
    g.appendChild(wt);
    boxesG.appendChild(g);
  });

  rejectedItems.forEach(function (it, k) {
    var x = 650;
    var y = 10 + k * 22;
    if (y + 16 > 50) return;

    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '18');
    rect.setAttribute('rx', '4');
    rect.setAttribute('fill', '#334155');

    var txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', x + 8);
    txt.setAttribute('y', y + 12);
    txt.setAttribute('fill', '#64748b');
    txt.setAttribute('font-size', '8');
    txt.setAttribute('font-family', 'Segoe UI,sans-serif');
    txt.textContent = '✕ ' + (it.itemName.length > 11 ? it.itemName.substring(0, 10) + '…' : it.itemName);

    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.appendChild(rect);
    g.appendChild(txt);
    rejectedG.appendChild(g);
  });
}

function renderDelivery(loadedItems) {
  var list = document.getElementById('delivery-list');
  if (!loadedItems || loadedItems.length === 0) {
    list.innerHTML = '<div class="empty-state">No items loaded.</div>';
    return;
  }

  loadedItems.forEach(function (it) {
    if (deliveryStatus[it._id] === undefined) deliveryStatus[it._id] = 0;
  });

  var html = '';
  loadedItems.forEach(function (it) {
    var step = deliveryStatus[it._id] || 0;
    html += '<div class="delivery-item" id="del-' + it._id + '">';
    html += '<div><div class="delivery-name">' + it.itemName + '</div><div class="delivery-dest">Destination: ' + it.destination + '</div></div>';
    html += '<div class="steps-bar">';

    STEPS.forEach(function (s, si) {
      html += '<div class="step">';
      var cls = si < step ? 'done' : si === step ? 'active' : '';
      html += '<div class="step-circle ' + cls + '">' + (si < step ? '✓' : (si + 1)) + '</div>';
      html += '<div class="step-label">' + s + '</div>';
      if (si < STEPS.length - 1) html += '<div class="step-line ' + (si < step ? 'done' : '') + '"></div>';
      html += '</div>';
    });

    html += '</div>';

    if (step < STEPS.length - 1) {
      html += '<button class="btn btn-outline btn-sm advance-btn" onclick="advanceDelivery(\'' + it._id + '\')">Advance →</button>';
    } else {
      html += '<span class="badge badge-green" style="margin-left:auto">Delivered!</span>';
    }

    html += '</div>';
  });

  list.innerHTML = html;

  var counts = [0, 0, 0, 0];
  loadedItems.forEach(function (it) { counts[deliveryStatus[it._id] || 0]++; });
  document.getElementById('d-queued').textContent = counts[0];
  document.getElementById('d-dispatched').textContent = counts[1];
  document.getElementById('d-transit').textContent = counts[2];
  document.getElementById('d-delivered').textContent = counts[3];
}

function advanceDelivery(id) {
  if (deliveryStatus[id] === undefined) deliveryStatus[id] = 0;
  if (deliveryStatus[id] < STEPS.length - 1) deliveryStatus[id]++;

  if (lastResult) {
    renderDelivery(lastResult.selectedItems);
  }
}

function renderDPTable(dp, its, maxW) {
  var wrap = document.getElementById('dp-table-wrap');
  if (!dp || !its) {
    wrap.innerHTML = '<div class="empty-state">Run optimization to see the DP table.</div>';
    return;
  }
  var step = Math.max(1, Math.floor(maxW / 20));
  var cols = [];

  for (var w = 0; w <= maxW; w += step) cols.push(w);
  if (cols[cols.length - 1] !== maxW) cols.push(maxW);

  var html = '<div style="font-size:12px;color:#94a3b8;margin-bottom:8px">Showing selected columns (step=' + step + '). Rows = items, Columns = weight capacity.</div>';
  html += '<table><thead><tr><th>Item \\ W</th>';
  cols.forEach(function (w) { html += '<th>' + w + '</th>'; });
  html += '</tr></thead><tbody>';

  for (var i = 0; i <= its.length; i++) {
    html += '<tr><td style="font-weight:700;color:#94a3b8">' + (i === 0 ? '(base)' : (its[i - 1].itemName || its[i - 1].name || '').substring(0, 12)) + '</td>';
    cols.forEach(function (w) {
      var val = dp[i][w];
      var cls = '';
      if (i > 0 && val > dp[i - 1][w]) cls = 'optimal';
      html += '<td class="' + cls + '">' + val + '</td>';
    });
    html += '</tr>';
  }

  html += '</tbody></table>';
  wrap.innerHTML = html;
}

function resetAll() {
  lastResult = null;
  deliveryStatus = {};

  document.getElementById('s-loaded').textContent = '0';
  document.getElementById('s-weight').textContent = '0 kg';
  document.getElementById('s-value').textContent = '0';
  document.getElementById('s-rejected').textContent = '0';

  document.getElementById('wbar').style.width = '0%';
  document.getElementById('vbar').style.width = '0%';
  document.getElementById('wlabel').textContent = '0 / 500 kg';
  document.getElementById('vlabel').textContent = '0 / 15 m³';

  document.getElementById('ring-pct').textContent = '0%';
  document.getElementById('ring-circle').style.strokeDashoffset = '339';

  document.getElementById('result-summary').textContent = 'Run optimization to see results';
  document.getElementById('loaded-table-wrap').innerHTML = '<div class="empty-state"><div class="big">📦</div>No items loaded yet.</div>';
  document.getElementById('cargo-boxes').innerHTML = '';
  document.getElementById('rejected-items').innerHTML = '';
  document.getElementById('delivery-list').innerHTML = '<div class="empty-state"><div class="big">🚚</div>No shipments yet.</div>';
  document.getElementById('dp-table-wrap').innerHTML = '<div class="empty-state">Run optimization first.</div>';
  document.getElementById('dp-ops').textContent = '—';

  renderItemsTable();
}

// =========================
// Dashboard Summary Cards
// =========================

function updateDashboard(cargoList, optimization = null) {

    document.getElementById("totalCargo").textContent = cargoList.length;

    const totalWeight = cargoList.reduce(
        (sum, item) => sum + Number(item.weight),
        0
    );

    document.getElementById("totalWeight").textContent =
        totalWeight + " Kg";

    const totalProfit = cargoList.reduce(
        (sum, item) => sum + Number(item.profit),
        0
    );

    document.getElementById("totalProfit").textContent =
        "₹" + totalProfit;

    if (optimization) {

        document.getElementById("selectedCargo").textContent =
            optimization.selectedItems.length;

        document.getElementById("rejectedCargo").textContent =
            optimization.rejectedItems.length;

        document.getElementById("efficiency").textContent =
            optimization.efficiency + "%";
    }
}

// =========================
// Chart.js Analytics
// =========================

let capacityChart;
let categoryChart;

function drawCharts(cargoList, result){

    // ---------- Doughnut Chart ----------

    const used = result.totalWeight;

    const remaining = Math.max(0, 100 - used);

    const ctx1=document
        .getElementById("capacityChart")
        .getContext("2d");

    if(capacityChart)
        capacityChart.destroy();

    capacityChart=new Chart(ctx1,{
        type:"doughnut",

        data:{
            labels:["Used","Remaining"],

            datasets:[{
                data:[used,remaining]
            }]
        }
    });

    // ---------- Category Chart ----------

    const categories={};

    cargoList.forEach(item=>{

        categories[item.category]=
            (categories[item.category]||0)+1;

    });

    const ctx2=document
        .getElementById("categoryChart")
        .getContext("2d");

    if(categoryChart)
        categoryChart.destroy();

    categoryChart=new Chart(ctx2,{
        type:"pie",

        data:{
            labels:Object.keys(categories),

            datasets:[{
                data:Object.values(categories)
            }]
        }
    });

}

// =========================
// Load Cargo from Backend
// =========================

async function loadCargo() {
    try {

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/cargo`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const cargo = await response.json();

        console.log(cargo);

    } catch (error) {

        console.log(error);

    }
}

loadCargo();


// =========================
// Search Cargo
// =========================

function searchCargo() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#cargoTable tbody tr");

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(input)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// Load Cargo from backend on page load
window.onload = function () {
  fetchItems();
};

// =========================
// Welcome User
// =========================

const user = JSON.parse(localStorage.getItem("user"));

if(user){
    document.getElementById("welcomeUser").innerHTML =
        `Welcome, <strong>${user.name}</strong>`;
}

// =========================
// Logout
// =========================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        const confirmLogout = confirm("Are you sure you want to logout?");

        if (!confirmLogout) return;

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        alert("Logged out successfully!");

        window.location.href = "login.html";

    });

}

