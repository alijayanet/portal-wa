const { getSetting } = require('./settingsManager');
const { sendMessage, formatMessageWithHeaderFooter } = require('./sendMessage');
const { findDeviceByTag } = require('./addWAN');
const axios = require('axios');

// Cache untuk tracking notifikasi per device
const notificationCache = {};

// Helper untuk mendapatkan parameter RX Power
function getParameterWithPaths(device, paths) {
  for (const path of paths) {
    const parts = path.split('.');
    let value = device;
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
        if (value && value._value !== undefined) value = value._value;
      } else {
        value = undefined;
        break;
      }
    }
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return 'N/A';
}

// Parameter paths untuk RX Power
const parameterPaths = {
  rxPower: [
    'VirtualParameters.RXPower',
    'VirtualParameters.redaman',
    'InternetGatewayDevice.WANDevice.1.WANPONInterfaceConfig.RXPower'
  ]
};

// Fungsi untuk mengecek RX Power dan mengirim notifikasi
async function checkRXPowerAndNotify() {
  // Cek apakah notifikasi RX Power diaktifkan
  const notificationEnabled = getSetting('rx_power_notification_enable', true);
  if (!notificationEnabled) {
    console.log('📊 RX Power notification is DISABLED in settings');
    return;
  }

  try {
    console.log('📊 Checking RX Power for all devices...');
    
    // Ambil semua device dari GenieACS
    const genieacsUrl = getSetting('genieacs_url', 'http://localhost:7557');
    const username = getSetting('genieacs_username', '');
    const password = getSetting('genieacs_password', '');
    
    // Gunakan axios sebagai pengganti fetch
    const response = await axios.get(`${genieacsUrl}/devices`, {
      auth: {
        username: username,
        password: password
      },
      timeout: 10000 // 10 detik timeout
    });
    
    const devices = response.data;
    
    // Ambil threshold dari settings
    const warningThreshold = getSetting('rx_power_warning', -25);
    const criticalThreshold = getSetting('rx_power_critical', -27);
    
    console.log(`📊 Checking ${devices.length} devices with thresholds: Warning=${warningThreshold}dBm, Critical=${criticalThreshold}dBm`);
    
    // Cek setiap device
    for (const device of devices) {
      try {
        const deviceId = device._id;
        const rxPower = getParameterWithPaths(device, parameterPaths.rxPower);
        
        // Skip jika RX Power tidak tersedia
        if (rxPower === 'N/A' || rxPower === null || rxPower === undefined) {
          continue;
        }
        
        const rxPowerValue = parseFloat(rxPower);
        
        // Cek apakah RX Power melebihi threshold
        if (rxPowerValue <= criticalThreshold) {
          await sendCriticalNotification(device, rxPowerValue, criticalThreshold);
        } else if (rxPowerValue <= warningThreshold) {
          await sendWarningNotification(device, rxPowerValue, warningThreshold);
        }
      } catch (deviceError) {
        console.error(`❌ Error processing device ${device._id}:`, deviceError.message);
        continue; // Lanjut ke device berikutnya
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking RX Power:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 GenieACS server tidak dapat diakses. Pastikan server berjalan.');
    }
  }
}

// Fungsi untuk mengirim notifikasi critical
async function sendCriticalNotification(device, rxPowerValue, threshold) {
  const deviceId = device._id;
  const cacheKey = `${deviceId}_critical`;
  const now = Date.now();
  const interval = getSetting('rx_power_notification_interval', 300000); // 5 menit
  
  // Cek apakah sudah pernah notifikasi dalam interval waktu
  if (notificationCache[cacheKey] && (now - notificationCache[cacheKey]) < interval) {
    return;
  }
  
  // Update cache
  notificationCache[cacheKey] = now;
  
  // Ambil info device
  const serialNumber = device?.DeviceID?.SerialNumber || device?._id || 'Unknown';
  const tags = device?.Tags || [];
  const phoneNumber = tags.find(tag => /^08\d{8,13}$/.test(tag)) || 'Unknown';
  
  // Buat pesan notifikasi
  const message = `🚨 *RX POWER CRITICAL ALERT*\n\n` +
    `Device: ${serialNumber}\n` +
    `Phone: ${phoneNumber}\n` +
    `RX Power: ${rxPowerValue} dBm\n` +
    `Threshold: ${threshold} dBm\n\n` +
    `⚠️ RX Power sudah melewati batas kritis!\n` +
    `Segera lakukan pengecekan dan perbaikan.`;
  
  // Format pesan dengan header dan footer
  const formattedMessage = formatMessageWithHeaderFooter(message);
  
  // Kirim ke teknisi
  await sendToTechnicians(formattedMessage, 'high');
  
  console.log(`🚨 Critical RX Power alert sent for device ${serialNumber} (${rxPowerValue} dBm)`);
}

// Fungsi untuk mengirim notifikasi warning
async function sendWarningNotification(device, rxPowerValue, threshold) {
  const deviceId = device._id;
  const cacheKey = `${deviceId}_warning`;
  const now = Date.now();
  const interval = getSetting('rx_power_notification_interval', 300000); // 5 menit
  
  // Cek apakah sudah pernah notifikasi dalam interval waktu
  if (notificationCache[cacheKey] && (now - notificationCache[cacheKey]) < interval) {
    return;
  }
  
  // Update cache
  notificationCache[cacheKey] = now;
  
  // Ambil info device
  const serialNumber = device?.DeviceID?.SerialNumber || device?._id || 'Unknown';
  const tags = device?.Tags || [];
  const phoneNumber = tags.find(tag => /^08\d{8,13}$/.test(tag)) || 'Unknown';
  
  // Buat pesan notifikasi
  const message = `⚠️ *RX POWER WARNING*\n\n` +
    `Device: ${serialNumber}\n` +
    `Phone: ${phoneNumber}\n` +
    `RX Power: ${rxPowerValue} dBm\n` +
    `Threshold: ${threshold} dBm\n\n` +
    `📊 RX Power mendekati batas peringatan.\n` +
    `Monitor dan siapkan tindakan jika diperlukan.`;
  
  // Format pesan dengan header dan footer
  const formattedMessage = formatMessageWithHeaderFooter(message);
  
  // Kirim ke teknisi
  await sendToTechnicians(formattedMessage, 'normal');
  
  console.log(`⚠️ Warning RX Power alert sent for device ${serialNumber} (${rxPowerValue} dBm)`);
}

// Fungsi untuk mengirim pesan ke teknisi
async function sendToTechnicians(message, priority = 'normal') {
  try {
    const technicianNumbers = getSetting('technician_numbers', []);
    const technicianGroupId = getSetting('technician_group_id', '');
    
    // Tambahkan prefix prioritas (tanpa header karena sudah diformat)
    let priorityMessage = message;
    if (priority === 'high') {
      // Tambahkan prefix PENTING di awal pesan (setelah header)
      const lines = message.split('\n');
      if (lines.length > 2) {
        lines.splice(2, 0, '🚨 *PENTING*');
        priorityMessage = lines.join('\n');
      } else {
        priorityMessage = '🚨 *PENTING*\n' + message;
      }
    }
    
    // Kirim ke grup teknisi jika ada
    if (technicianGroupId) {
      try {
        await sendMessage(technicianGroupId, priorityMessage);
        console.log(`📤 Message sent to technician group`);
      } catch (e) {
        console.error('❌ Failed to send to technician group:', e.message);
      }
    }
    
    // Kirim ke nomor teknisi individual
    if (technicianNumbers && technicianNumbers.length > 0) {
      for (const number of technicianNumbers) {
        try {
          const cleanNumber = number.replace(/\D/g, '');
          if (cleanNumber) {
            const waJid = cleanNumber.replace(/^0/, '62') + '@s.whatsapp.net';
            await sendMessage(waJid, priorityMessage);
            console.log(`📤 Message sent to technician ${cleanNumber}`);
          }
        } catch (e) {
          console.error(`❌ Failed to send to technician ${number}:`, e.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error sending to technicians:', error.message);
  }
}

// Fungsi untuk memulai monitoring RX Power
function startRXPowerMonitoring() {
  const notificationEnabled = getSetting('rx_power_notification_enable', true);
  const interval = getSetting('rx_power_notification_interval', 300000); // 5 menit
  
  if (!notificationEnabled) {
    console.log('📊 RX Power monitoring is DISABLED in settings');
    return;
  }
  
  console.log(`📊 Starting RX Power monitoring (interval: ${interval/1000}s)`);
  
  // Jalankan pengecekan pertama dengan delay
  setTimeout(() => {
    checkRXPowerAndNotify().catch(err => {
      console.error('❌ Error in initial RX Power check:', err.message);
    });
  }, 10000); // Delay 10 detik setelah startup
  
  // Set interval untuk pengecekan berkala
  setInterval(() => {
    checkRXPowerAndNotify().catch(err => {
      console.error('❌ Error in periodic RX Power check:', err.message);
    });
  }, interval);
}

module.exports = {
  checkRXPowerAndNotify,
  startRXPowerMonitoring,
  sendToTechnicians
}; 