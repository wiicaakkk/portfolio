# 🤖 LinkedIn Easy Apply Automation Agent (OpenClaw)

Bot otomatisasi pencari kerja LinkedIn Easy Apply berbasis **Playwright (Python)**. Bot ini akan men-scan lowongan pekerjaan (misal: *Java Spring Boot, Backend Engineer*), memfilter khusus posisi yang memiliki badge **Easy Apply**, serta mengisikan form data pribadi, jawaban screening experience, dan upload CV ATS (`Bagus_Wicaksono_Nurjayanto_CV.pdf`) secara otomatis.

---

## 🚀 Fitur Utama

- **Persistent Login Session**: Anda hanya perlu login ke akun LinkedIn sekali saja di jendela browser yang terbuka. Sesi login akan tersimpan permanen di folder `./browser_user_data`.
- **Easy Apply Filter (`f_AL=true`)**: Hanya menargetkan pekerjaan dengan opsi melamar cepat.
- **Smart Form Auto-Fill**: Mengisi nomor HP, email, jawaban pengalaman kerja (Java, Spring Boot, SQL), ekspektasi gaji, dan upload file CV PDF secara otomatis.
- **Applied Jobs History**: Setiap lamaran yang berhasil dikirim akan dicatat secara otomatis di `applied_jobs.json` agar tidak melamar ulang posisi yang sama.

---

## 🛠️ Cara Menggunakan Bot

### 1. Masuk ke Folder Project
```bash
cd "/home/michella/Media/Home Lab/projects/linkedin-easy-apply-agent"
```

### 2. Jalankan Bot
```bash
./venv/bin/python easy_apply_bot.py
```

### 3. Login LinkedIn (Pertama Kali Saja)
1. Browser Chromium akan terbuka secara otomatis.
2. Jika belum login, masukkan email & password LinkedIn Anda di browser.
3. Setelah masuk ke halaman Feed LinkedIn, tekan **[ENTER]** di terminal.
4. Bot akan langsung bekerja melamar pekerjaan Easy Apply secara otomatis! 🚀

---

## ⚙️ Kustomisasi (`config.json`)

Anda bisa mengubah kata kunci pekerjaan, lokasi, dan data pribadi di file `config.json`:

```json
{
  "search_settings": {
    "keywords": ["Java Spring Boot", "Backend Engineer", "Software Engineer"],
    "location": "Indonesia",
    "easy_apply_only": true,
    "max_applications_per_run": 10
  },
  "user_profile": {
    "full_name": "Bagus Wicaksono Nurjayanto",
    "phone": "+6282223259114",
    "email": "bagus.wicak@outlook.com",
    "portfolio": "https://wicak.cloud/",
    "github": "https://github.com/wiicaakkk",
    "cv_file_path": "/home/michella/Media/Home Lab/assets/Bagus_Wicaksono_Nurjayanto_CV.pdf",
    "answers": {
      "java": "2",
      "spring": "2",
      "salary": "10000000"
    }
  }
}
```
