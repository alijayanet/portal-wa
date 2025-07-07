# WhatsAppBot Webportal Pelanggan Saja
Rekening Donasi Untuk Pembanguanan Masjid
# 4206 0101 2214 534 BRI an DKM BAITUR ROHMAN <br>
Info 08194215703 ALIJAYA
link group tele : https://t.me/alijayaNetAcs
link chanell tele : https://t.me/alijayaNetwork

# WhatsAppBot Webportal Pelanggan Saja

Versi ringan dari Botlokal yang hanya menggunakan fitur WhatsApp webportal pelanggan saja

## Persyaratan

- Node.js v20+ (direkomendasikan v16+)
- npm atau yarn
- Akses ke GenieACS API
- Akses ke Mikrotik API (opsional)

## Cara Instalasi
```
apt install git curl -y
```
```
git clone https://github.com/alijayanet/portal-wa
```
```
cd portal-wa
```
### 1. Install Dependensi

```bash
npm install
```

### 2. Konfigurasi Environment Variables

Salin file `.env.example` menjadi `.env` dan sesuaikan:

```bash
cp env-example .env
```

Edit file `.env` dengan pengaturan yang sesuai:

```
# Konfigurasi Server
PORT=4500 (jika sudah dipake ganti)
HOST=localhost

# Konfigurasi Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password

# Konfigurasi GenieACS
GENIEACS_URL=http://192.168.8.xx:7557
GENIEACS_USERNAME=username
GENIEACS_PASSWORD=password

# Konfigurasi Mikrotik (opsional)
MIKROTIK_HOST=192.168.1.1
MIKROTIK_PORT=8728
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=password

# Konfigurasi WhatsApp
ADMIN_NUMBER=6281234567890
TECHNICIAN_NUMBERS=6281234567890,6287654321098
WHATSAPP_SESSION_PATH=./whatsapp-session
WHATSAPP_KEEP_ALIVE=true
WHATSAPP_RESTART_ON_ERROR=true
```

### 3. Menjalankan Aplikasi

```bash
node app-whatsapp-only.js
```

Scan QR code yang muncul di terminal untuk login WhatsApp.<br>
setelah di scan tinggal jalankan dengan PM2
```bash
pm2 start app-whatsapp-only.js
```

## Perintah WhatsApp

### Perintah untuk Pelanggan
- `menu` - Menampilkan menu bantuan
- `status` - Cek status perangkat
- `refresh` - Refresh data perangkat
- `gantiwifi [nama]` - Ganti nama WiFi
- `gantipass [password]` - Ganti password WiFi

### Perintah untuk Admin
- Semua perintah pelanggan
- `admin` - Menampilkan menu admin
- `cek [nomor]` - Cek status ONU pelanggan
- `list` - Daftar semua ONU
- `cekall` - Cek status semua ONU
- `editssid [nomor] [ssid]` - Edit SSID pelanggan
- `editpass [nomor] [password]` - Edit password WiFi pelanggan
- `addhotspot [user] [pass] [profile]` - Tambah user hotspot
- `delhotspot [user]` - Hapus user hotspot
- `hotspot` - Lihat user hotspot aktif
- `addpppoe [user] [pass] [profile] [ip]` - Tambah secret PPPoE
- `delpppoe [user]` - Hapus secret PPPoE
- `setprofile [user] [profile]` - Ubah profile PPPoE
- `pppoe` - Lihat koneksi PPPoE aktif
- `offline` - Lihat user PPPoE offline
- `resource` - Info resource router
- `addwan [nomor] [tipe] [mode]` - Tambah konfigurasi WAN
- `addtag [device_id] [nomor]` - Tambahkan nomor pelanggan ke perangkat
- `addpppoe_tag [pppoe_username] [nomor]` - Tambahkan nomor pelanggan berdasarkan PPPoE
### Jangan lupa untuk mengkonfigurasi file .env terlebih dahulu!
