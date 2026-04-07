const SUPABASE_URL = "https://tbfjzfernuvfnptbphuu.supabase.co";
const SUPABASE_KEY = "sb_publishable_8W1g9Qw3wUHJdwIypWye9Q_WvFO_Eqh"; 
const GEMINI_API_KEY = "AIzaSyBErXSa25OohDhjl3OUz5n-eA0w21g_LjE";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Semua fungsi wajib didaftarkan ke window agar HTML bisa mengenalinya
window.showPage = function(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
};

window.askGemini = async function() {
    const select = document.getElementById('service-select');
    const km = document.getElementById('service-km').value;
    const resBox = document.getElementById('ai-response');
    
    if (!select.value || !km) return alert("Pilih kendaraan dan isi KM!");

    const selectedText = select.options[select.selectedIndex].text;
    resBox.innerHTML = "<i>Menghubungi AI...</i>";

    const modelName = "gemini-2.0-flash-lite-preview"; 
    const URL_API = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(URL_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Rekomendasi service untuk ${selectedText} km ${km}.` }] }]
            })
        });
        const result = await response.json();
        if (result.error) {
            resBox.innerHTML = `<div style="color:red">Error: ${result.error.message}</div>`;
        } else {
            resBox.innerText = result.candidates[0].content.parts[0].text;
        }
    } catch (err) {
        resBox.innerText = "Gagal koneksi.";
    }
};

// Tambahkan fungsi lainnya di sini dengan awalan window.
window.loadListKendaraan = async function() { /* ... kode anda ... */ };
window.loadDropdownKendaraan = async function(id) { /* ... kode anda ... */ };
window.calcTotal = function() { /* ... kode anda ... */ };

// Event Listener tetap bisa tanpa window.
document.getElementById('form-kendaraan').addEventListener('submit', async (e) => {
    // ... isi kode submit kendaraan ...
});