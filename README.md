# 🤖 WhatsApp Bot - GenieACS & MikroTik Manager

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Baileys](https://img.shields.io/badge/baileys-v7.0.0--rc.6-green.svg)
![License](https://img.shields.io/badge/license-ISC-orange.svg)

**Bot WhatsApp All-in-One untuk Manajemen ISP** 🚀

[Features](#-features) • [Install](#-instalasi) • [Usage](#-penggunaan) • [Commands](#-perintah-whatsapp) • [Support](#-support)

</div>

---

## 📋 Deskripsi

**WhatsApp Bot GenieACS & MikroTik Manager** adalah solusi manajemen ISP yang powerful dan user-friendly. Bot ini memungkinkan Anda untuk:

- 🌐 **Kelola ONU/ONT** via GenieACS
- 🔧 **Kontrol MikroTik** (PPPoE, Hotspot, Interface, dll)
- 📱 **Portal Pelanggan** dengan sistem OTP
- 📶 **Monitoring Real-time** (RX Power, PPPoE Connection)
- 💬 **WhatsApp Interface** yang mudah digunakan
- 🔐 **Multi-Admin** dengan role management

---

## ✨ Features

### 🌟 **GenieACS Management**
- ✅ Monitoring status ONU/ONT
- ✅ Ganti WiFi SSID & Password
- ✅ Restart & Factory Reset device
- ✅ Detail device information
- ✅ Connected devices monitoring
- ✅ RX Power monitoring dengan alert
- ✅ Customer tagging system

### 🔧 **MikroTik Management**
- ✅ PPPoE Management (Add/Delete/Profile)
- ✅ Hotspot Management (Add/Delete User)
- ✅ Interface Control (Enable/Disable)
- ✅ IP Address & Route Management
- ✅ DHCP Leases Monitoring
- ✅ Firewall Rules Management
- ✅ System Resource Monitoring
- ✅ Ping & Network Tools

### 📊 **Monitoring & Notifications**
- ✅ PPPoE Connection Monitor (Login/Logout alerts)
- ✅ RX Power Alert (Warning & Critical levels)
- ✅ Offline Users Detection
- ✅ Real-time Device Status
- ✅ Connection History

### 👥 **Customer Portal**
- ✅ Portal login pelanggan
- ✅ OTP Authentication system
- ✅ Device status view
- ✅ Self-service WiFi management

---

## 🚀 Instalasi

### **Prasyarat**

Pastikan Anda sudah install:
- ✅ **Node.js** v18.0.0 atau lebih tinggi ([Download](https://nodejs.org/))
- ✅ **npm** atau **yarn**
- ✅ **Git** ([Download](https://git-scm.com/))
- ✅ **GenieACS** server (opsional)
- ✅ **MikroTik Router** dengan API enabled (opsional)

---

### **📥 Step 1: Clone Repository**

```bash
# Clone repository
git clone https://github.com/alijayanet/portal-wa.git

# Masuk ke folder project
cd portal-wa
```

---

### **📦 Step 2: Install Dependencies**

```bash
# Install semua package yang diperlukan
npm install
```

**Package yang terinstall:**
- `@whiskeysockets/baileys` - WhatsApp Web API
- `express` - Web server untuk portal
- `axios` - HTTP client
- `node-routeros` - MikroTik API client
- Dan lainnya...

---

### **⚙️ Step 3: Konfigurasi Environment**

#### **A. Copy File Environment**

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

#### **B. Edit File `.env`**

Buka file `.env` dan sesuaikan dengan konfigurasi Anda:

```bash
# Konfigurasi Server
PORT=4555                    # Port untuk portal pelanggan
HOST=localhost

# Konfigurasi Admin
ADMIN_USERNAME=admin         # Username admin portal
ADMIN_PASSWORD=admin         # Password admin portal

# Konfigurasi GenieACS
GENIEACS_URL=http://192.168.8.89:7557
GENIEACS_USERNAME=admin
GENIEACS_PASSWORD=yourpassword

# Konfigurasi MikroTik (opsional)
MIKROTIK_HOST=192.168.8.1
MIKROTIK_PORT=8728
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=yourpassword

# Konfigurasi WhatsApp
ADMIN_NUMBER=6281234567890              # Nomor admin (format: 628xxx)
TECHNICIAN_NUMBERS=6281234567890        # Nomor teknisi (pisahkan dengan koma)
WHATSAPP_SESSION_PATH=./whatsapp-session
WHATSAPP_KEEP_ALIVE=true
WHATSAPP_RESTART_ON_ERROR=true

# Monitoring
PPPOE_MONITOR_INTERVAL=60000            # Interval monitoring (ms)
RX_POWER_WARNING=-27                    # RX Power warning threshold (dBm)
RX_POWER_CRITICAL=-30                   # RX Power critical threshold (dBm)

# Company Info
COMPANY_HEADER=ISP ANDA                 # Header pesan bot
FOOTER_INFO=Internet Tanpa Batas        # Footer pesan bot
```

---

### **📝 Step 4: Konfigurasi Settings.json**

Edit file `settings.json` dan sesuaikan:

```json
{
  "admins": [
    "6281947215703"                      // Nomor admin (tambahkan lebih banyak jika perlu)
  ],
  "admin_enabled": true,
  "genieacs_url": "http://192.168.8.89:7557",
  "genieacs_username": "admin",
  "genieacs_password": "yourpassword",
  "mikrotik_host": "192.168.8.1",
  "mikrotik_port": "8728",
  "mikrotik_user": "admin",
  "mikrotik_password": "yourpassword",
  "technician_numbers": [
    "6283807665697"                      // Nomor teknisi
  ],
  "company_header": "ISP ANDA",
  "footer_info": "Internet Tanpa Batas",
  "customerPortalOtp": false,            // true untuk aktifkan OTP
  "rx_power_warning": -27,
  "rx_power_critical": -30,
  "server_port": 3001
}
```

---

### **🎯 Step 5: Jalankan Aplikasi**

#### **A. Mode Development**

```bash
npm start
```

#### **B. Scan QR Code WhatsApp**

Setelah aplikasi berjalan:

1. **QR Code akan muncul** di terminal
2. Buka **WhatsApp di HP** Anda
3. Pilih **Settings** → **Linked Devices**
4. Tap **Link a Device**
5. **Scan QR Code** yang muncul

```
========================================
📱 QR CODE TERSEDIA!
========================================
Silakan scan QR Code di bawah ini:
```

6. Tunggu hingga status **"WhatsApp terhubung!"**

---

### **🚀 Step 6: Production Deployment dengan PM2**

Untuk production, gunakan PM2 agar bot berjalan 24/7:

```bash
# Install PM2 globally
npm install -g pm2

# Start aplikasi dengan PM2
pm2 start app-whatsapp-only.js --name "whatsapp-bot"

# Save PM2 configuration
pm2 save

# Setup PM2 startup (agar auto start saat reboot)
pm2 startup

# Monitor logs
pm2 logs whatsapp-bot

# Stop/Restart
pm2 stop whatsapp-bot
pm2 restart whatsapp-bot
```

---

## 💬 Penggunaan

### **🎯 Untuk Pelanggan**

Setelah WhatsApp tersambung, pelanggan dapat menggunakan perintah:

```
menu          - Tampilkan menu bantuan
status        - Cek status perangkat Anda
refresh       - Refresh data perangkat
gantiwifi     - Ganti nama WiFi
gantipass     - Ganti password WiFi
devices       - Lihat perangkat terhubung
speedtest     - Info bandwidth
```

**Contoh:**
```
gantiwifi WifiRumah123
gantipass Password@2024
```

---

### **👨‍💼 Untuk Admin**

Admin memiliki akses penuh ke semua fitur:

```
admin         - Menu admin lengkap
cek 08123     - Cek status ONU pelanggan
list          - Daftar semua ONU
cekall        - Cek status semua ONU
editssid      - Edit SSID pelanggan
editpass      - Edit password pelanggan
pppoe         - Lihat koneksi PPPoE aktif
hotspot       - Lihat user hotspot aktif
resource      - Info resource router
```

📖 **[Lihat Daftar Lengkap Perintah](#-perintah-whatsapp)**

---

## 📱 Perintah WhatsApp

### **🔹 Perintah Umum (Pelanggan)**

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `menu` | Menampilkan menu bantuan | `menu` |
| `status` | Cek status perangkat Anda | `status` |
| `refresh` | Refresh data perangkat | `refresh` |
| `gantiwifi [nama]` | Ganti nama WiFi | `gantiwifi WifiKu` |
| `gantipass [password]` | Ganti password WiFi | `gantipass Pass123` |
| `devices` | Lihat perangkat terhubung | `devices` |
| `speedtest` | Info bandwidth perangkat | `speedtest` |
| `restart` | Restart perangkat (konfirmasi) | `restart` |

---

### **🔸 Perintah Admin - GenieACS**

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `admin` | Menu admin lengkap | `admin` |
| `cek [nomor]` | Cek status ONU pelanggan | `cek 081234567890` |
| `detail [nomor]` | Detail lengkap perangkat | `detail 081234567890` |
| `list` | Daftar semua ONU | `list` |
| `cekall` | Cek status semua ONU | `cekall` |
| `editssid [nomor] [ssid]` | Edit SSID pelanggan | `editssid 08123 WifiNew` |
| `editpass [nomor] [pass]` | Edit password WiFi | `editpass 08123 Pass123` |
| `adminrestart [nomor]` | Restart perangkat pelanggan | `adminrestart 08123` |
| `adminfactory [nomor]` | Factory reset perangkat | `adminfactory 08123` |

---

### **🔸 Perintah Admin - MikroTik PPPoE**

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `pppoe` | Lihat koneksi PPPoE aktif | `pppoe` |
| `offline` | Lihat user PPPoE offline | `offline` |
| `addpppoe [user] [pass] [profile] [ip]` | Tambah secret PPPoE | `addpppoe user1 pass1 10M` |
| `delpppoe [user]` | Hapus secret PPPoE | `delpppoe user1` |
| `setprofile [user] [profile]` | Ubah profile PPPoE | `setprofile user1 20M` |

---

### **🔸 Perintah Admin - MikroTik Hotspot**

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `hotspot` | Lihat user hotspot aktif | `hotspot` |
| `addhotspot [user] [pass] [profile]` | Tambah user hotspot | `addhotspot user1 pass1 1h` |
| `delhotspot [user]` | Hapus user hotspot | `delhotspot user1` |

---

### **🔸 Perintah Admin - Interface & Network**

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `interfaces` | Daftar semua interface | `interfaces` |
| `interface [nama]` | Detail interface tertentu | `interface ether1` |
| `enableif [nama]` | Aktifkan interface | `enableif ether2` |
| `disableif [nama]` | Nonaktifkan interface | `disableif ether2` |
| `ipaddress` | Daftar IP address | `ipaddress` |
| `routes` | Daftar routing table | `routes` |
| `dhcp` | Daftar DHCP leases | `dhcp` |

---

### **🔸 Perintah Admin - System & Tools**

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `resource` | Info resource router | `resource` |
| `ping [host] [count]` | Ping ke host | `ping 8.8.8.8 5` |
| `logs [topics] [count]` | System logs | `logs system 20` |
| `clock` | Waktu router | `clock` |
| `reboot` | Restart router (konfirmasi) | `reboot` |

---

### **🔸 Perintah Admin - Monitoring**

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `pppoe on` | Aktifkan notifikasi PPPoE | `pppoe on` |
| `pppoe off` | Nonaktifkan notifikasi | `pppoe off` |
| `pppoe status` | Status notifikasi | `pppoe status` |
| `pppoe test` | Test notifikasi | `pppoe test` |
| `otp on` | Aktifkan OTP portal | `otp on` |
| `otp off` | Nonaktifkan OTP portal | `otp off` |
| `otp status` | Status OTP | `otp status` |

---

## 🌐 Portal Pelanggan

### **Akses Portal**

Buka browser dan akses:
```
http://your-server-ip:3001
```

### **Fitur Portal:**
- ✅ Login dengan nomor HP
- ✅ OTP Authentication (opsional)
- ✅ Lihat status device
- ✅ Ganti WiFi SSID & Password
- ✅ Lihat connected devices
- ✅ Informasi bandwidth

---

## 🔧 Troubleshooting

### **❓ QR Code Tidak Muncul**

**Solusi:**
1. Hapus folder `whatsapp-session`
2. Restart aplikasi
3. Tunggu 5-10 menit
4. Pastikan internet stabil

```bash
Remove-Item -Path "whatsapp-session" -Recurse -Force
npm start
```

📖 **[Lihat Panduan Lengkap](TROUBLESHOOTING_QR.md)**

---

### **❓ Error Connection Failure**

**Penyebab:**
- Rate limiting dari WhatsApp
- IP blocked

**Solusi:**
1. Tunggu 2-4 jam
2. Hapus session lama
3. Gunakan VPN (optional)

---

### **❓ GenieACS Tidak Terhubung**

```bash
# Test koneksi
curl http://192.168.8.89:7557/devices

# Pastikan GenieACS berjalan
sudo systemctl status genieacs-cwmp
```

---

### **❓ MikroTik API Error**

**Checklist:**
- ✅ API Service enabled di MikroTik
- ✅ Port 8728 terbuka
- ✅ User punya permission API
- ✅ IP server di allow list

---

## 📁 Struktur Project

```
portal-wa/
├── app-whatsapp-only.js       # Main application
├── package.json               # Dependencies
├── .env                       # Environment config
├── settings.json              # Settings config
│
├── config/                    # Configuration files
│   ├── whatsapp.js           # WhatsApp handler (main)
│   ├── genieacs.js           # GenieACS API
│   ├── mikrotik.js           # MikroTik API
│   ├── genieacs-commands.js  # GenieACS commands
│   ├── mikrotik-commands.js  # MikroTik commands
│   ├── pppoe-monitor.js      # PPPoE monitoring
│   ├── rxPowerMonitor.js     # RX Power monitoring
│   └── logger.js             # Logging system
│
├── routes/                    # Express routes
│   └── customerPortal.js     # Customer portal routes
│
├── views/                     # EJS templates
│   ├── login.ejs             # Login page
│   ├── dashboard.ejs         # Customer dashboard
│   └── otp.ejs               # OTP page
│
├── public/                    # Static files
│   └── css/                  # Stylesheets
│
├── logs/                      # Log files
│   ├── combined.log
│   └── error.log
│
└── whatsapp-session/          # WhatsApp session data
```

---

## 🔄 Update

### **Check for Updates**

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart aplikasi
pm2 restart whatsapp-bot
```

---

## 📚 Dokumentasi Tambahan

- 📖 [GenieACS Commands](GENIEACS_COMMANDS.md)
- 📖 [MikroTik Commands](MIKROTIK_COMMANDS.md)
- 📖 [PPPoE Notifications](PPPOE_NOTIFICATIONS.md)
- 📖 [OTP Commands](README_OTP_COMMANDS.md)
- 📖 [Troubleshooting](TROUBLESHOOTING.md)
- 📖 [Baileys v7 Config](CONFIG_BAILEYS_V7.md)
- 📖 [Update Report](UPDATE_REPORT.md)
- 📖 [Changelog](CHANGELOG.md)

---

## 🤝 Support

### **💰 Donasi Pengembangan**

Jika aplikasi ini bermanfaat, dukung pengembangan lebih lanjut:

**Untuk Pembangunan Masjid:**
```
BRI: 4206 0101 2214 534
A.n: DKM BAITUR ROHMAN
```

**Untuk Developer:**
```
E-WALLET: 081947215703
BRI: 420601003953531
A.n: WARJAYA
```

---

### **📞 Kontak & Komunitas**

- 📱 **WhatsApp**: 081947215703 (ALIJAYA)
- 💬 **Telegram Group**: [t.me/alijayaNetAcs](https://t.me/alijayaNetAcs)
- 📢 **Telegram Channel**: [t.me/alijayaNetwork](https://t.me/alijayaNetwork)
- 🎥 **YouTube Demo**: [Watch Demo](https://www.youtube.com/shorts/qYJFQY7egFw)
- 🐙 **GitHub**: [alijayanet/portal-wa](https://github.com/alijayanet/portal-wa)

---

### **🐛 Report Issues**

Temukan bug atau punya saran? [Open an issue](https://github.com/alijayanet/portal-wa/issues)

---

## 📝 License

ISC License - Free to use for personal and commercial projects.

---

## 🙏 Credits

**Developed by:**
- **ALIJAYA DIGITAL NETWORK**
- **Telegram**: @alijayaNetwork

**Powered by:**
- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [GenieACS](https://genieacs.com/) - TR-069 ACS
- [MikroTik](https://mikrotik.com/) - Network Equipment
- [Node.js](https://nodejs.org/) - Runtime Environment

---

## ⚠️ Disclaimer

Aplikasi ini dibuat untuk keperluan manajemen ISP. Gunakan dengan bijak dan patuhi Terms of Service WhatsApp. Developer tidak bertanggung jawab atas penyalahgunaan aplikasi.

---

<div align="center">

**Made with ❤️ by ALIJAYA DIGITAL NETWORK**

⭐ Star this repo if you find it useful!

[⬆ Back to Top](#-whatsapp-bot---genieacs--mikrotik-manager)

</div>
