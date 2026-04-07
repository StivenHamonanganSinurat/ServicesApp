// CONFIGURATION
const SUPABASE_URL = "https://tbfjzfernuvfnptbphuu.supabase.co";
const SUPABASE_KEY = "sb_publishable_8W1g9Qw3wUHJdwIypWye9Q_WvFO_Eqh"; 
const GEMINI_API_KEY = "AIzaSyAI8ANdm-wtP9GzIHQaIDwNhIykCACDMVs";

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

async function loadListKendaraan() {
    const { data, error } = await _supabase.from('kendaraan').select('*').order('created_at', { ascending: false });
    const tbody = document.getElementById('table-body-kendaraan');
    tbody.innerHTML = "<tr><td colspan='5'>Memuat data...</td></tr>";

    if (data) {
        tbody.innerHTML = "";
        data.forEach(k => {
            tbody.innerHTML += `
                <tr>
                    <td><b>${k.plat_nomor}</b></td>
                    <td>${k.jenis_kendaraan}</td>
                    <td>${k.tahun}</td>
                    <td>${k.warna}</td>
                    <td><button onclick="deleteKendaraan('${k.id}')" style="color:red; background:none; border:none; cursor:pointer">Hapus</button></td>
                </tr>
            `;
        });
    }
}

async function deleteKendaraan(id) {
    if (confirm("Hapus kendaraan ini? Semua data BBM terkait juga akan hilang.")) {
        await _supabase.from('kendaraan').delete().eq('id', id);
        loadListKendaraan();
    }
}

// --- FITUR BAHAN BAKAR ---
async function loadDropdownKendaraan(selectId) {
    const { data } = await _supabase.from('kendaraan').select('id, plat_nomor, jenis_kendaraan');
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">-- Pilih Kendaraan --</option>';
    if (data) {
        data.forEach(k => {
            const opt = document.createElement('option');
            opt.value = k.id;
            opt.text = `${k.plat_nomor} (${k.jenis_kendaraan})`;
            opt.dataset.jenis = k.jenis_kendaraan;
            select.appendChild(opt);
        });
    }
}

function calcTotal() {
    const liter = document.getElementById('bbm-liter').value || 0;
    const harga = document.getElementById('bbm-harga').value || 0;
    document.getElementById('bbm-total').value = liter * harga;
}

document.getElementById('form-bbm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        kendaraan_id: document.getElementById('bbm-select').value,
        tanggal: document.getElementById('bbm-tanggal').value,
        nama_pom: document.getElementById('bbm-pom').value,
        jumlah_liter: parseFloat(document.getElementById('bbm-liter').value),
        harga_perliter: parseFloat(document.getElementById('bbm-harga').value),
        total_harga: parseFloat(document.getElementById('bbm-total').value)
    };

    const { error } = await _supabase.from('bahan_bakar').insert([payload]);
    if (error) alert(error.message);
    else {
        alert("Data BBM Berhasil Dicatat!");
        showPage('home-page');
        e.target.reset();
    }
});

// --- FITUR AI (GEMINI) ---
async function askGemini() {
    const select = document.getElementById('service-select');
    const km = document.getElementById('service-km').value;
    const resBox = document.getElementById('ai-response');
    
    // Validasi input
    if (!select.value || !km) {
        alert("Silakan pilih kendaraan dan isi kilometer!");
        return;
    }

    // Mengambil jenis kendaraan dari teks option yang dipilih
    // Contoh: "B 1234 ABC (Mobil)" -> kita ambil "Mobil"
    const selectedText = select.options[select.selectedIndex].text;
    const jenis = selectedText.includes("Mobil") ? "Mobil" : 
                  selectedText.includes("Motor") ? "Motor" : 
                  selectedText.includes("Truk") ? "Truk" : "Kendaraan";

    resBox.innerHTML = "<i>AI sedang menganalisa data... Mohon tunggu sebentar.</i>";

    // Format data untuk dikirim ke Google
    const promptText = `Saya memiliki kendaraan jenis ${jenis} dengan kilometer saat ini ${km}. Berikan rekomendasi jadwal service rutin apa saja yang harus dilakukan dan perkiraan biayanya dalam mata uang Rupiah secara singkat.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const result = await response.json();

        // Cek jika ada error dari Google API
        if (result.error) {
            console.error("Error dari Google:", result.error);
            resBox.innerHTML = `<b style="color:red">Google API Error:</b> ${result.error.message}`;
            return;
        }

        // Tampilkan hasil jika sukses
        if (result.candidates && result.candidates[0].content) {
            const rawText = result.candidates[0].content.parts[0].text;
            // Menampilkan teks dengan format yang rapi
            resBox.innerText = rawText;
        } else {
            resBox.innerText = "Maaf, AI tidak memberikan respon. Coba ulangi.";
        }

    } catch (err) {
        console.error("Gagal Fetch:", err);
        resBox.innerText = "Terjadi gangguan koneksi ke server AI.";
    }
}
