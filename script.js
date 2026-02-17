// --- Firebase Config (သင့် Project မှ Key များဖြင့် သေချာစွာ အစားထိုးပါ) ---
const firebaseConfig = {
  apiKey: "AIzaSyAG11xNPfNi6QJ5QUfAl1FxyE9DMyM-6mE",
  authDomain: "mymomery-bbdc2.firebaseapp.com",
  projectId: "mymomery-bbdc2",
  storageBucket: "mymomery-bbdc2.firebasestorage.app",
  messagingSenderId: "684314074443",
  appId: "1:684314074443:web:426967527b687019ba5cce"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.database();

// --- Authentication (Login/Sign Up) ---
function login() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    auth.signInWithEmailAndPassword(email, pass)
        .then(() => window.location.href = "index.html")
        .catch(err => alert("Email သို့မဟုတ် Password မှားနေပါသည်"));
}

function signUp() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    auth.createUserWithEmailAndPassword(email, pass)
        .then(() => alert("အကောင့်ဖွင့်ပြီးပါပြီ။ Login ပြန်ဝင်ပေးပါ။"))
        .catch(err => alert(err.message));
}

function logout() {
    auth.signOut().then(() => window.location.href = "login.html");
}

// အကောင့်ဝင်မဝင် အမြဲစောင့်ကြည့်စစ်ဆေးခြင်း
auth.onAuthStateChanged((user) => {
    const path = window.location.pathname;
    if (!user && !path.includes("login.html")) {
        window.location.href = "login.html";
    } else if (user) {
        // User ရှိလျှင် UI များကို Update လုပ်မည်
        updateCategoryUI();
        if (document.getElementById('gallery')) displayMemories();
        if (document.getElementById('manageList')) displayManage();
    }
});

// --- Category စီမံခြင်း (Localstorage အစား Database သုံးနိုင်သော်လည်း လတ်တလော UI အတွက်သာ ထားထားပါသည်) ---
let categories = JSON.parse(localStorage.getItem('myCategories')) || ['ခရီးသွား', 'သူငယ်ချင်း', 'မိသားစု'];

function updateCategoryUI() {
    const catSelect = document.getElementById('categorySelect');
    const catList = document.getElementById('categoryList');
    const catContainer = document.getElementById('categoryContainer');

    if (catSelect) catSelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    if (catList) catList.innerHTML = categories.map(c => `<span class="tag">${c} <span onclick="deleteCategory('${c}')" style="cursor:pointer; color:red; font-weight:bold; margin-left:5px;">×</span></span>`).join('');
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
        document.getElementById('newCategoryInput').value = '';
    }
}

function deleteCategory(name) {
    if(confirm(name + " အမျိုးအစားကို ဖျက်မှာလား?")) {
        categories = categories.filter(c => c !== name);
        localStorage.setItem('myCategories', JSON.stringify(categories));
        updateCategoryUI();
    }
}

// --- Photo/Memory Logic (Cloud Database သုံး၍ အကောင့်အလိုက်ခွဲခြားခြင်း) ---

function saveBulkMemories() {
    const user = auth.currentUser;
    const linksText = document.getElementById('bulkImageLinks').value.trim();
    const caption = document.getElementById('bulkCaption').value || "အမှတ်တရ";
    const category = document.getElementById('categorySelect').value;

    if (!linksText) return alert("Link များ ထည့်ပေးပါဦး");

    const links = linksText.split(/\s+/);
    let count = 0;

    links.forEach(url => {
        if (url.startsWith('http')) {
            // users/UID/memories ဆိုသည့်နေရာတွင် သိမ်းပါမည်
            db.ref('users/' + user.uid + '/memories').push({
                image: url,
                caption: caption,
                category: category,
                date: new Date().toLocaleDateString()
            });
            count++;
        }
    });

    if (count > 0) {
        alert(count + " ပုံ သိမ်းဆည်းပြီးပါပြီ ✨");
        document.getElementById('bulkImageLinks').value = '';
        location.href = "index.html";
    }
}

function displayMemories(cat = 'all') {
    const gallery = document.getElementById('gallery');
    const user = auth.currentUser;
    if (!gallery || !user) return;

    // Database မှ User ၏ ပုံများကို နားထောင်ခြင်း
    db.ref('users/' + user.uid + '/memories').on('value', (snapshot) => {
        gallery.innerHTML = '';
        const data = snapshot.val();
        if (!data) {
            gallery.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>ပုံများ မရှိသေးပါ</p>";
            return;
        }

        // Object ကို Array ပြောင်း၍ ပြသခြင်း
        Object.keys(data).forEach(key => {
            const m = data[key];
            if (cat === 'all' || m.category === cat) {
                gallery.innerHTML += `
                    <div class="photo-item">
                        <img src="${m.image}" onclick="openModal('${m.image}', '${m.caption}')" onerror="this.src='https://via.placeholder.com/200?text=Invalid+Link'">
                        <p class="caption">${m.caption}</p>
                    </div>`;
            }
        });
    });
}

function displayManage() {
    const list = document.getElementById('manageList');
    const user = auth.currentUser;
    if (!list || !user) return;

    db.ref('users/' + user.uid + '/memories').on('value', (snapshot) => {
        list.innerHTML = '';
        const data = snapshot.val();
        if (!data) return;

        Object.keys(data).forEach(key => {
            const m = data[key];
            list.innerHTML += `
                <div class="photo-item" style="transform:none; padding:10px;">
                    <img src="${m.image}" style="height:80px; border-radius:5px;">
                    <button class="delete-btn" onclick="deletePhoto('${key}')">ဖျက်မည် 🗑️</button>
                </div>`;
        });
    });
}

function deletePhoto(photoKey) {
    const user = auth.currentUser;
    if (confirm("ဤပုံကို ဖျက်မှာ သေချာပါသလား?")) {
        db.ref('users/' + user.uid + '/memories/' + photoKey).remove()
            .then(() => alert("ဖျက်ပြီးပါပြီ"));
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
