let memories = JSON.parse(localStorage.getItem('myMemories')) || [];
let categories = JSON.parse(localStorage.getItem('myCategories')) || ['ခရီးသွား', 'သူငယ်ချင်း', 'မိသားစု'];

// UI Update လုပ်ခြင်း
function updateCategoryUI() {
    const catSelect = document.getElementById('categorySelect');
    const catList = document.getElementById('categoryList');
    const catContainer = document.getElementById('categoryContainer');

    if (catSelect) catSelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    
    if (catList) {
        catList.innerHTML = categories.map(c => `
            <span class="tag">${c} <span onclick="deleteCategory('${c}')" style="cursor:pointer; font-weight:bold; margin-left:8px; color:#ff4d4d;">×</span></span>
        `).join('');
    }

    if (catContainer) {
        catContainer.innerHTML = `<button class="btn active" onclick="filterImages('all')">အားလုံး</button>`;
        categories.forEach(c => {
            catContainer.innerHTML += `<button class="btn" onclick="filterImages('${c}')">${c}</button>`;
        });
        catContainer.innerHTML += `<a href="manage.html" class="btn add-btn" style="margin-left:10px;">Edit ⚙️</a>`;
    }
}

// Category တိုးခြင်း/ဖျက်ခြင်း
function addCategory() {
    const val = document.getElementById('newCategoryInput').value.trim();
    if (val && !categories.includes(val)) {
        categories.push(val);
        localStorage.setItem('myCategories', JSON.stringify(categories));
        document.getElementById('newCategoryInput').value = '';
        updateCategoryUI();
    }
}

function deleteCategory(name) {
    if (confirm(`"${name}" အမျိုးအစားကို ဖျက်မှာလား? (မှတ်ချက် - ၎င်းထဲရှိ ပုံများပါ ပျောက်သွားနိုင်သည်)`)) {
        categories = categories.filter(c => c !== name);
        memories = memories.filter(m => m.category !== name);
        localStorage.setItem('myCategories', JSON.stringify(categories));
        localStorage.setItem('myMemories', JSON.stringify(memories));
        updateCategoryUI();
        if(document.getElementById('manageList')) displayManage();
    }
}

// ပုံများ အစုလိုက်သိမ်းခြင်း (Bulk Save)
function saveBulkMemories() {
    const bulkLinks = document.getElementById('bulkImageLinks').value.trim();
    const caption = document.getElementById('bulkCaption').value.trim() || "အမှတ်တရ";
    const category = document.getElementById('categorySelect').value;

    if (!bulkLinks) return alert("ပုံ Link များ ထည့်ပေးပါဦး!");

    // Space, Tab သို့မဟုတ် စာကြောင်းအသစ်များမှ Link ကို ခွဲထုတ်ခြင်း
    const links = bulkLinks.split(/\s+/);
    let count = 0;

    links.forEach((url) => {
        if (url.startsWith('http')) {
            memories.push({
                id: Date.now() + Math.random(), // Unique ID ဖြစ်အောင် random ထည့်ထားသည်
                image: url,
                caption: caption,
                category: category
            });
            count++;
        }
    });

    if (count > 0) {
        localStorage.setItem('myMemories', JSON.stringify(memories));
        alert(`${count} ပုံကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ! ✨`);
        location.reload();
    } else {
        alert("မှန်ကန်သော Link များ မတွေ့ပါ!");
    }
}

// Gallery ပြသခြင်း
function displayMemories(cat = 'all') {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    gallery.innerHTML = '';

    const data = cat === 'all' ? memories : memories.filter(m => m.category === cat);
    
    if (data.length === 0) {
        gallery.innerHTML = `<p style="text-align:center; color:#888; grid-column: 1/-1;">ပုံများ မရှိသေးပါ...</p>`;
        return;
    }

    data.forEach(m => {
        const item = document.createElement('div');
        item.className = 'photo-item';
        item.innerHTML = `
            <img src="${m.image}" onclick="openModal('${m.image}', '${m.caption}')" onerror="this.src='https://via.placeholder.com/300x200?text=Invalid+Link'">
            <p class="caption">${m.caption}</p>
        `;
        gallery.appendChild(item);
    });
}

// Manage List ပြခြင်း
function displayManage() {
    const list = document.getElementById('manageList');
    if (!list) return;
    if (memories.length === 0) { list.innerHTML = "ဖျက်ရန် ပုံမရှိသေးပါ"; return; }

    list.innerHTML = memories.map(m => `
        <div class="photo-item" style="transform:none; padding:10px;">
            <img src="${m.image}" style="height:100px; border-radius:5px;">
            <p style="font-size:10px; margin:5px 0;">${m.caption}</p>
            <button class="delete-btn" onclick="deletePhoto(${m.id})">ဖျက်မည် 🗑️</button>
        </div>
    `).join('');
}

function deletePhoto(id) {
    if (confirm("ဤပုံကို ဖျက်မှာ သေချာပါသလား?")) {
        memories = memories.filter(m => m.id !== id);
        localStorage.setItem('myMemories', JSON.stringify(memories));
        displayManage();
    }
}

// Modal Functions
function openModal(src, cap) {
    document.getElementById('photoModal').style.display = "block";
    document.getElementById('fullImage').src = src;
    document.getElementById('modalCaption').innerText = cap;
}
function closeModal() { document.getElementById('photoModal').style.display = "none"; }

function filterImages(cat) {
    displayMemories(cat);
    document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
    if(event) event.target.classList.add('active');
}

// Initial Load
window.onload = () => {
    updateCategoryUI();
    displayMemories();
    displayManage();
};