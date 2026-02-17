// ၁။ Firebase Config ထဲမှာ DatabaseURL ပါရပါမယ် (ဒါမပါရင် ပုံသိမ်းလို့ မရပါဘူး)
const firebaseConfig ={ 
  apiKey:"AIzaSyAG11xNPfNi6QJ5QUfAl1FxyE9DMyM-6mE", 
  authDomain:"mymomery-bbdc2.firebaseapp.com", 
  projectId:"mymomery-bbdc2", 
  storageBucket:"mymomery-bbdc2.firebasestorage.app", 
  messagingSenderId:"684314074443", 
  appId:"1:684314074443:web:426967527b687019ba5cce" 
};

// ၂။ ပုံသိမ်းတဲ့ Function ကို ပိုစိတ်ချရအောင် ပြန်ပြင်ထားပါတယ်
function saveBulkMemories() {
    const user = auth.currentUser;
    if (!user) {
        alert("Login အရင်ဝင်ပေးပါ!");
        window.location.href = "login.html";
        return;
    }

    const linksText = document.getElementById('bulkImageLinks').value.trim();
    const caption = document.getElementById('bulkCaption').value || "အမှတ်တရ";
    const category = document.getElementById('categorySelect').value;

    if (!linksText) return alert("ပုံ Link များ ထည့်ပေးပါဦး");

    const links = linksText.split(/\s+/);
    let count = 0;

    links.forEach(url => {
        if (url.startsWith('http')) {
            // Database ထဲသို့ ပုံကို သိမ်းဆည်းခြင်း
            db.ref('users/' + user.uid + '/memories').push({
                image: url,
                caption: caption,
                category: category,
                date: new Date().toISOString() // သိမ်းတဲ့အချိန်ကိုပါ မှတ်ထားမယ်
            }).then(() => {
                console.log("Success: ပုံသိမ်းပြီးပါပြီ");
            }).catch((error) => {
                console.error("Error: သိမ်းလို့မရပါ - ", error);
            });
            count++;
        }
    });

    if (count > 0) {
        alert(count + " ပုံကို Cloud ပေါ်သို့ သိမ်းဆည်းပြီးပါပြီ! ✨");
        document.getElementById('bulkImageLinks').value = '';
        // သိမ်းပြီးရင် Home ကို ပြန်သွားပြီး ပုံတွေချက်ချင်းပေါ်အောင်လုပ်မယ်
        window.location.href = "index.html";
    }
}

