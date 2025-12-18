# 🤝 Contributing to WhatsApp Bot

Terima kasih atas minat Anda untuk berkontribusi! 🎉

## 📋 Cara Berkontribusi

### 1️⃣ **Fork Repository**
Fork repository ini ke akun GitHub Anda.

### 2️⃣ **Clone Fork Anda**
```bash
git clone https://github.com/your-username/portal-wa.git
cd portal-wa
```

### 3️⃣ **Buat Branch Baru**
```bash
git checkout -b feature/nama-fitur-anda
```

### 4️⃣ **Lakukan Perubahan**
- Edit code Anda
- Test dengan baik
- Pastikan code style konsisten

### 5️⃣ **Commit Changes**
```bash
git add .
git commit -m "feat: tambah fitur xyz"
```

**Format Commit Message:**
- `feat:` - Fitur baru
- `fix:` - Bug fix
- `docs:` - Update dokumentasi
- `style:` - Format code
- `refactor:` - Refactor code
- `test:` - Tambah test
- `chore:` - Maintenance

### 6️⃣ **Push ke Fork**
```bash
git push origin feature/nama-fitur-anda
```

### 7️⃣ **Buat Pull Request**
Buka Pull Request ke repository utama dengan deskripsi yang jelas.

---

## 🐛 Melaporkan Bug

Gunakan [GitHub Issues](https://github.com/alijayanet/portal-wa/issues) dengan template:

**Judul:** [BUG] Deskripsi singkat

**Konten:**
- **Deskripsi**: Jelaskan bug secara detail
- **Langkah Reproduksi**: 
  1. Langkah 1
  2. Langkah 2
  3. ...
- **Expected Behavior**: Apa yang seharusnya terjadi
- **Actual Behavior**: Apa yang terjadi
- **Environment**:
  - OS: Windows/Linux/Mac
  - Node.js: v18.x.x
  - Baileys: v7.0.0-rc.6
- **Screenshots**: Jika ada

---

## 💡 Request Feature

Gunakan [GitHub Issues](https://github.com/alijayanet/portal-wa/issues) dengan label `enhancement`:

**Judul:** [FEATURE] Nama fitur

**Konten:**
- **Deskripsi**: Jelaskan fitur yang diinginkan
- **Use Case**: Kapan fitur ini berguna
- **Alternatif**: Solusi alternatif yang Anda pikirkan

---

## 📝 Code Style

### JavaScript
- Gunakan `const` untuk variabel yang tidak berubah
- Gunakan `let` untuk variabel yang berubah
- Hindari `var`
- Gunakan template literals (\`\`) untuk string
- Gunakan arrow functions
- Tambahkan comments untuk code yang kompleks

**Contoh:**
```javascript
// Good ✅
const getUserData = async (userId) => {
    try {
        const data = await fetchData(userId);
        return data;
    } catch (error) {
        logger.error('Error fetching user data:', error);
        throw error;
    }
};

// Bad ❌
var getUserData = function(userId) {
    var data = fetchData(userId);
    return data;
}
```

---

## 🧪 Testing

Sebelum submit PR, pastikan:
- ✅ Code berjalan tanpa error
- ✅ Fitur baru sudah di-test
- ✅ Tidak ada breaking changes (kecuali major update)
- ✅ Dokumentasi sudah diupdate

---

## 📞 Kontak

**Questions?** Join komunitas:
- 💬 Telegram Group: [t.me/alijayaNetAcs](https://t.me/alijayaNetAcs)
- 📱 WhatsApp: 081947215703

---

**Terima kasih telah berkontribusi! 🙏**
