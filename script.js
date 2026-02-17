// --- Firebase Config (သင့် Key များဖြင့် အစားထိုးပါ) ---
const firebaseConfig = {
  apiKey: "AIzaSyAG11xNPfNi6QJ5QUfAl1FxyE9DMyM-6mE",
  authDomain: "mymomery-bbdc2.firebaseapp.com",
  projectId: "mymomery-bbdc2",
  storageBucket: "mymomery-bbdc2.firebasestorage.app",
  messagingSenderId: "684314074443",
  appId: "1:684314074443:web:426967527b687019ba5cce"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// --- Authentication Logic ---
function login() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    auth.signInWithEmailAndPassword(email, pass)
        .then(() => window.location.href = "index.html")
        .catch(err => alert("Login မှားနေပါသည်- " + err.message));
}

function signUp() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    auth.createUserWithEmailAndPassword(email, pass)
        .then(() => alert("အကောင့်ဖွင့်ပြီးပါပြီ။ Login ဝင်နိုင်ပါပြီ။"))
        .catch(err => alert(err.message));
}

function logout() {
    auth.signOut().then(() => window.location.href = "login.html");
}

// Login စစ်ဆေးခြင်း
auth.onAuthStateChanged((user) => {
    const path = window.location.pathname;
    if (!user && !path.includes("login.html")) {
        window.location.href = "login.html";
    }
});

// --- App Logic ---
let memories = JSON.parse(localStorage.getItem('myMemories')) || [];
let categories = JSON.parse(localStorage.getItem('myCategories')) || ['ခရီးသွား', 'သူငယ်ချင်း', 'မိသားစု'];

function updateCategoryUI() {
    const catSelect = document.getElementById('categorySelect');
    const catList = document.getElementById('categoryList');
    const catContainer = document.getElementById('categoryContainer');

    if (catSelect) catSelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    if (catList) catList.innerHTML = categories.map(c => `<span class="tag">${c} <span onclick="deleteCategory('${c}')" style="cursor:pointer; color:red;">×</span></span>`).join('');
    if (catContainer) {
        catContainer.innerHTML = `<button class="btn active" onclick="filterImages('all')">အားလုံး</button>` + 
            categories.map(c => `<button class="btn" onclick="filterImages('${c}')">${c}</button>`).join('') +
            `<a href="manage.html" class="btn add-btn" style="margin-left:10px;">⚙️</a>`;
    }
}

function addCategory() {
    const val = document.getElementById('newCategoryInput').value.trim();
    if (val && !categories.includes(val)) {
        categories.push(val);
        localStorage.setItem('myCategories', JSON.stringify(categories));
        updateCategoryUI();
    }
}

function deleteCategory(name) {
    categories = categories.filter(c => c !== name);
    localStorage.setItem('myCategories', JSON.stringify(categories));
    updateCategoryUI();
}

function saveBulkMemories() {
    const links = document.getElementById('bulkImageLinks').value.trim().split(/\s+/);
    const caption = document.getElementById('bulkCaption').value || "အမှတ်တရ";
    const category = document.getElementById('categorySelect').value;

    links.forEach(url => {
        if (url.startsWith('http')) {
            memories.push({ id: Date.now() + Math.random(), image: url, caption: caption, category: category });
        }
    });
    localStorage.setItem('myMemories', JSON.stringify(memories));
    location.reload();
}

function displayMemories(cat = 'all') {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    gallery.innerHTML = '';
    const data = cat === 'all' ? memories : memories.filter(m => m.category === cat);
    data.forEach(m => {
        gallery.innerHTML += `<div class="photo-item"><img src="${m.image}" onclick="openModal('${m.image}', '${m.caption}')"><p>${m.caption}</p></div>`;
    });
}

function displayManage() {
    const list = document.getElementById('manageList');
    if (!list) return;
    list.innerHTML = memories.map(m => `
        <div class="photo-item" style="transform:none;">
            <img src="${m.image}" style="height:80px;">
            <button class="delete-btn" onclick="deletePhoto(${m.id})">ဖျက်မည်</button>
        </div>`).join('');
}

function deletePhoto(id) {
    memories = memories.filter(m => m.id !== id);
    localStorage.setItem('myMemories', JSON.stringify(memories));
    displayManage();
}

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

window.onload = () => {
    updateCategoryUI();
    displayMemories();
    displayManage();
};