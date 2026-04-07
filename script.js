// CONFIGURATION
const SUPABASE_URL = "https://tbfjzfernuvfnptbphuu.supabase.co";
const SUPABASE_KEY = "sb_publishable_8W1g9Qw3wUHJdwIypWye9Q_WvFO_Eqh"; 
const GEMINI_API_KEY = "AIzaSyBErXSa25OohDhjl3OUz5n-eA0w21g_LjE";

// Inisialisasi Client Supabase
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Navigasi Halaman
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

// --- FITUR KENDARAAN ---
document.getElementById('form-kendaraan').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Menyimpan...";
    
    const payload = {
        plat_nomor: document.getElementById('plat').value,
        jenis_kendaraan: document.getElementById('jenis').value,
        tahun: parseInt(document.getElementById('tahun').value),
        warna: document.getElementById('warna').value
    };

    const { error } = await _supabase.from('kendaraan').insert([payload]);
    
    if (error) {
        alert("Gagal: " + error.message);
    } else {
        alert("Kendaraan Berhasil Disimpan!");
        e.target.reset();
        showPage('home-page');
    }
    btn.innerText = "Simpan Kendaraan";
});

async function askGemini() {
    const select = document.getElementById('service-select');
    const km = document.getElementById('service-km').value;
    const resBox = document.getElementById('ai-response');
    
    if (!select.value || !km) return alert("Pilih kendaraan dan isi KM!");

    const selectedText = select.options[select.selectedIndex].text;
    resBox.innerHTML = "<i>Menghubungi AI...</i>";

    // MENGGUNAKAN MODEL ANDA
    const modelName = "gemini-3.1-flash-lite-preview"; 
    const URL_API = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

   // Ganti bagian ini di dalam fungsi askGemini
try {
    const response = await fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ 
                parts: [{ 
                    text: `Berikan rekomendasi service untuk ${selectedText} kilometer ${km}.` 
                }] 
            }]
        })
    });

    const result = await response.json();

    // Jika error "Busy" atau "503", kita beritahu user untuk tunggu 5 detik
    if (result.error && (result.error.code === 503 || result.error.status === 'UNAVAILABLE')) {
        resBox.innerText = "Server Google sedang sibuk. Tunggu 5 detik lalu klik lagi.";
    } else if (result.error) {
        resBox.innerText = "Error: " + result.error.message;
    } else {
        resBox.innerText = result.candidates[0].content.parts[0].text;
    }

} catch (err) {
    resBox.innerText = "Koneksi gagal. Silakan coba 5 detik lagi.";
}
}