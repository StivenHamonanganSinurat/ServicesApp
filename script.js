// 1. Inisialisasi Supabase
const SUPABASE_URL = "https://tbfjzfernuvfnptbphuu.supabase.co";
const SUPABASE_KEY = "sb_publishable_8W1g9Qw3wUHJdwIypWye9Q_WvFO_Eqh"; 
const GEMINI_API_KEY = "AIzaSyBErXSa25OohDhjl3OUz5n-eA0w21g_LjE";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Daftarkan fungsi ke window agar tombol onclick di HTML bisa melihatnya
window.showPage = function(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
};

window.loadListKendaraan = async function() {
    const tbody = document.getElementById('table-body-kendaraan');
    tbody.innerHTML = "<tr><td colspan='5'>Memuat...</td></tr>";
    
    const { data, error } = await _supabase.from('kendaraan').select('*');
    if (error) return alert(error.message);
    
    tbody.innerHTML = "";
    data.forEach(k => {
        tbody.innerHTML += `<tr><td>${k.plat_nomor}</td><td>${k.jenis_kendaraan}</td><td>${k.tahun}</td><td>${k.warna}</td><td><button onclick="deleteKendaraan('${k.id}')">Hapus</button></td></tr>`;
    });
};

window.loadDropdownKendaraan = async function(selectId) {
    const select = document.getElementById(selectId);
    const { data } = await _supabase.from('kendaraan').select('id, plat_nomor, jenis_kendaraan');
    select.innerHTML = '<option value="">Pilih Kendaraan</option>';
    data.forEach(k => {
        select.innerHTML += `<option value="${k.id}" data-jenis="${k.jenis_kendaraan}">${k.plat_nomor}</option>`;
    });
};

window.calcTotal = function() {
    const liter = document.getElementById('bbm-liter').value || 0;
    const harga = document.getElementById('bbm-harga').value || 0;
    document.getElementById('bbm-total').value = liter * harga;
};

window.askGemini = async function() {
    const select = document.getElementById('service-select');
    const km = document.getElementById('service-km').value;
    const resBox = document.getElementById('ai-response');
    if (!select.value || !km) return alert("Pilih kendaraan & isi KM!");
    
    resBox.innerText = "Menghubungi AI...";
    const modelName = "gemini-2.0-flash-lite-preview"; 
    const URL_API = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

    const res = await fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Saran service ${select.options[select.selectedIndex].text} km ${km}` }] }] })
    });
    const json = await res.json();
    resBox.innerText = json.candidates[0].content.parts[0].text;
};

// Event Listener (Tidak perlu window karena bukan onclick di HTML)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('form-kendaraan').addEventListener('submit', async (e) => {
        e.preventDefault();
        const { error } = await _supabase.from('kendaraan').insert([{
            plat_nomor: document.getElementById('plat').value,
            jenis_kendaraan: document.getElementById('jenis').value,
            tahun: document.getElementById('tahun').value,
            warna: document.getElementById('warna').value
        }]);
        if (error) alert(error.message); else { alert("Berhasil!"); window.showPage('home-page'); }
    });
});