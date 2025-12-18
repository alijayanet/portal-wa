const express = require('express');
const router = express.Router();
const { getSetting, setSetting } = require('../config/settingsManager');
const { getMikrotikConnection, getActivePPPoEConnections, getInactivePPPoEUsers, getActiveHotspotUsers, getRouterResources, restartRouter, getInterfaceDetail, getInterfaces, addInterface, deleteInterface, addPPPoESecret, deletePPPoESecret, setPPPoEProfile } = require('../config/mikrotik');
const { getDeviceByNumber, getAllDevices, getDeviceStatus, refreshDevice, handleChangeSSID, handleChangePassword } = require('../config/whatsapp');
const { isValidCustomer } = require('./customerPortal');
const { decryptAdminNumber } = require('../config/whatsapp');
const { logger } = require('../config/logger');
const bcrypt = require('bcryptjs');

// Helper untuk mendapatkan setting
const getSettings = () => {
    return {
        genieacs: {
            url: getSetting('genieacs_url'),
            username: getSetting('genieacs_username'),
            password: getSetting('genieacs_password')
        },
        mikrotik: {
            host: getSetting('mikrotik_host'),
            port: getSetting('mikrotik_port'),
            username: getSetting('mikrotik_user'),
            password: getSetting('mikrotik_password'),
            mainInterface: getSetting('main_interface')
        },
        pppoe: {
            monitorEnable: getSetting('pppoe_monitor_enable'),
            interval: getSetting('pppoe_monitor_interval')
        },
        rxPower: {
            warning: getSetting('rx_power_warning'),
            critical: getSetting('rx_power_critical'),
            notificationEnable: getSetting('rx_power_notification_enable'),
            notificationInterval: getSetting('rx_power_notification_interval')
        }
    };
};

// Middleware untuk autentikasi admin
const authenticateAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const adminNumber = decryptAdminNumber(token);
        if (!adminNumber) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        req.adminNumber = adminNumber;
        next();
    } catch (error) {
        logger.error('Admin authentication error:', error);
        return res.status(401).json({ message: 'Authentication error' });
    }
};

// Middleware untuk cek admin
const checkAdmin = async (req, res, next) => {
    const settings = getSettingsWithCache();
    const adminNumber = req.body.phone.replace(/^0/, '62');
    const adminNumbers = settings.admin_numbers || [];
    
    if (!adminNumbers.includes(adminNumber)) {
        return res.status(401).json({ message: 'Unauthorized: Not an admin number' });
    }
    
    const storedHash = settings.admin_password_hash;
    if (!storedHash) {
        return res.status(500).json({ message: 'Admin password not set' });
    }
    
    const isValid = await bcrypt.compare(req.body.password, storedHash);
    if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = await encryptAdminNumber(adminNumber);
    res.json({ success: true, token });
};

// Dashboard Admin
router.get('/dashboard', authenticateAdmin, async (req, res) => {
    try {
        // Get statistics
        const [activePPPoE, inactivePPPoE, activeHotspot, resources, devices] = await Promise.all([
            getActivePPPoEConnections(),
            getInactivePPPoEUsers(),
            getActiveHotspotUsers(),
            getRouterResources(),
            getAllDevices()
        ]);

        const onlineDevices = devices.filter(d => d._lastInform).length;
        const offlineDevices = devices.length - onlineDevices;

        res.render('admin/adminDashboard', {
            stats: {
                totalDevices: devices.length,
                onlineDevices,
                offlineDevices,
                pppoeActive: activePPPoE.length,
                hotspotActive: activeHotspot.length,
                cpu: resources.cpu,
                memory: resources.memory
            }
        });
    } catch (error) {
        logger.error('Admin dashboard error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
});

// Dashboard Data API
router.get('/dashboard/data', authenticateAdmin, async (req, res) => {
    try {
        const [activePPPoE, inactivePPPoE, activeHotspot, resources, devices] = await Promise.all([
            getActivePPPoEConnections(),
            getInactivePPPoEUsers(),
            getActiveHotspotUsers(),
            getRouterResources(),
            getAllDevices()
        ]);

        const onlineDevices = devices.filter(d => d._lastInform).length;
        const offlineDevices = devices.length - onlineDevices;

        res.json({
            success: true,
            stats: {
                totalDevices: devices.length,
                onlineDevices,
                offlineDevices,
                pppoeActive: activePPPoE.length,
                hotspotActive: activeHotspot.length,
                cpu: resources.cpu,
                memory: resources.memory
            }
        });
    } catch (error) {
        logger.error('Admin dashboard data error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
});

// Manajemen Pelanggan
router.get('/customers', authenticateAdmin, async (req, res) => {
    try {
        const devices = await getAllDevices();
        res.json({ success: true, data: devices });
    } catch (error) {
        logger.error('Customer management error:', error);
        res.status(500).json({ message: 'Failed to fetch customer data' });
    }
});

// Detail Pelanggan
router.get('/customer/:phone', authenticateAdmin, async (req, res) => {
    try {
        const { phone } = req.params;
        const device = await getDeviceByNumber(phone);
        
        if (!device) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json({ success: true, data: device });
    } catch (error) {
        logger.error('Customer detail error:', error);
        res.status(500).json({ message: 'Failed to fetch customer detail' });
    }
});

// Update SSID
router.put('/customer/:phone/ssid', authenticateAdmin, async (req, res) => {
    try {
        const { phone } = req.params;
        const { newSSID } = req.body;

        if (!isValidCustomer(phone)) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await updateSSID(phone, newSSID);
        res.json({ success: true, message: 'SSID updated successfully' });
    } catch (error) {
        logger.error('Update SSID error:', error);
        res.status(500).json({ message: 'Failed to update SSID' });
    }
});

// Update Password
router.put('/customer/:phone/password', authenticateAdmin, async (req, res) => {
    try {
        const { phone } = req.params;
        const { newPassword } = req.body;

        if (!isValidCustomer(phone)) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await updatePassword(phone, newPassword);
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        logger.error('Update password error:', error);
        res.status(500).json({ message: 'Failed to update password' });
    }
});

// GenieACS Management
router.get('/genieacs', authenticateAdmin, async (req, res) => {
    try {
        const devices = await getAllDevices();
        res.render('admin/genieacs', { devices });
    } catch (error) {
        logger.error('GenieACS management error:', error);
        res.status(500).json({ message: 'Failed to fetch GenieACS data' });
    }
});

// GenieACS Device Search
router.get('/genieacs/devices', authenticateAdmin, async (req, res) => {
    try {
        const { search, status } = req.query;
        let devices = await getAllDevices();
        
        if (search) {
            devices = devices.filter(device => 
                device.deviceId?.includes(search) || 
                device.deviceName?.includes(search) ||
                device.tags?.includes(search)
            );
        }
        
        if (status === 'online') {
            devices = devices.filter(device => device._lastInform);
        } else if (status === 'offline') {
            devices = devices.filter(device => !device._lastInform);
        }

        res.json({ success: true, devices });
    } catch (error) {
        logger.error('GenieACS device search error:', error);
        res.status(500).json({ message: 'Failed to search devices' });
    }
});

// GenieACS Device Details
router.get('/genieacs/device/:deviceId', authenticateAdmin, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const device = await getDeviceByNumber(deviceId);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }
        res.json({ success: true, device });
    } catch (error) {
        logger.error('GenieACS device details error:', error);
        res.status(500).json({ message: 'Failed to fetch device details' });
    }
});

// GenieACS Device Refresh
router.post('/genieacs/device/:deviceId/refresh', authenticateAdmin, async (req, res) => {
    try {
        const { deviceId } = req.params;
        await refreshDevice(deviceId);
        res.json({ success: true, message: 'Device refreshed successfully' });
    } catch (error) {
        logger.error('GenieACS device refresh error:', error);
        res.status(500).json({ message: 'Failed to refresh device' });
    }
});

// GenieACS Change SSID
router.post('/genieacs/device/:deviceId/ssid', authenticateAdmin, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { newSSID } = req.body;
        await handleChangeSSID(deviceId, newSSID);
        res.json({ success: true, message: 'SSID updated successfully' });
    } catch (error) {
        logger.error('GenieACS change SSID error:', error);
        res.status(500).json({ message: 'Failed to update SSID' });
    }
});

// GenieACS Change Password
router.post('/genieacs/device/:deviceId/password', authenticateAdmin, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { newPassword } = req.body;
        await handleChangePassword(deviceId, newPassword);
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        logger.error('GenieACS change password error:', error);
        res.status(500).json({ message: 'Failed to update password' });
    }
});

// Mikrotik Management
router.get('/mikrotik', authenticateAdmin, async (req, res) => {
    try {
        const [interfaces, pppoe, resources] = await Promise.all([
            getInterfaces(),
            getActivePPPoEConnections(),
            getRouterResources()
        ]);
        res.render('admin/mikrotik', {
            interfaces,
            pppoe,
            resources
        });
    } catch (error) {
        logger.error('Mikrotik management error:', error);
        res.status(500).json({ message: 'Failed to fetch Mikrotik data' });
    }
});

// Login Admin
router.get('/login', (req, res) => {
    res.render('admin/login', { error: null });
});

router.post('/login', async (req, res) => {
    try {
        await checkAdmin(req, res);
    } catch (error) {
        logger.error('Admin login error:', error);
        res.status(401).json({ message: 'Login failed' });
    }
});

// Dashboard Admin
router.get('/dashboard', authenticateAdmin, async (req, res) => {
    try {
        const [devices, activePPPoE, inactivePPPoE, activeHotspot, resources] = await Promise.all([
            getGenieACSDevices(),
            getActivePPPoEConnections(),
            getInactivePPPoEUsers(),
            getActiveHotspotUsers(),
            getRouterResources()
        ]);
        res.render('admin/adminDashboard', {
            devices,
            activePPPoE,
            inactivePPPoE,
            activeHotspot,
            resources
        });
    } catch (error) {
        logger.error('Dashboard error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
});

// Mikrotik Network Status
router.get('/mikrotik/status', authenticateAdmin, async (req, res) => {
    try {
        const [pppoe, hotspot, resources] = await Promise.all([
            getActivePPPoEConnections(),
            getActiveHotspotUsers(),
            getRouterResources()
        ]);
        res.json({
            success: true,
            activeConnections: pppoe.length,
            activeUsers: hotspot.length,
            cpu: resources.cpu,
            memory: resources.memory
        });
    } catch (error) {
        logger.error('Mikrotik status error:', error);
        res.status(500).json({ message: 'Failed to fetch network status' });
    }
});

// Mikrotik Interfaces
router.get('/mikrotik/interfaces', authenticateAdmin, async (req, res) => {
    try {
        const interfaces = await getInterfaces();
        res.json({ success: true, interfaces });
    } catch (error) {
        logger.error('Mikrotik interfaces error:', error);
        res.status(500).json({ message: 'Failed to fetch interfaces' });
    }
});

// Add Interface
router.post('/mikrotik/interfaces', authenticateAdmin, async (req, res) => {
    try {
        const { name, type, ipAddress } = req.body;
        await addInterface(name, type, ipAddress);
        res.json({ success: true, message: 'Interface added successfully' });
    } catch (error) {
        logger.error('Mikrotik add interface error:', error);
        res.status(500).json({ message: 'Failed to add interface' });
    }
});

// Delete Interface
router.delete('/mikrotik/interfaces/:name', authenticateAdmin, async (req, res) => {
    try {
        const { name } = req.params;
        await deleteInterface(name);
        res.json({ success: true, message: 'Interface deleted successfully' });
    } catch (error) {
        logger.error('Mikrotik delete interface error:', error);
        res.status(500).json({ message: 'Failed to delete interface' });
    }
});

// PPPoE Management
router.get('/mikrotik/pppoe', authenticateAdmin, async (req, res) => {
    try {
        const pppoe = await getActivePPPoEConnections();
        res.json({ success: true, pppoe });
    } catch (error) {
        logger.error('Mikrotik PPPoE error:', error);
        res.status(500).json({ message: 'Failed to fetch PPPoE data' });
    }
});

// Add PPPoE Secret
router.post('/mikrotik/pppoe', authenticateAdmin, async (req, res) => {
    try {
        const { username, password, profile } = req.body;
        await addPPPoESecret(username, password, profile);
        res.json({ success: true, message: 'PPPoE secret added successfully' });
    } catch (error) {
        logger.error('Mikrotik add PPPoE error:', error);
        res.status(500).json({ message: 'Failed to add PPPoE secret' });
    }
});

// Delete PPPoE Secret
router.delete('/mikrotik/pppoe/:username', authenticateAdmin, async (req, res) => {
    try {
        const { username } = req.params;
        await deletePPPoESecret(username);
        res.json({ success: true, message: 'PPPoE secret deleted successfully' });
    } catch (error) {
        logger.error('Mikrotik delete PPPoE error:', error);
        res.status(500).json({ message: 'Failed to delete PPPoE secret' });
    }
});

// Helper functions for GenieACS
async function getGenieACSDevices() {
    try {
        const settings = getSettings();
        const devices = await getAllDevices();
        return devices.map(device => ({
            deviceId: device._id,
            phone: device.Tags?.[0] || '-',
            ssid: device?.InternetGatewayDevice?.LANDevice?.['1']?.WLANConfiguration?.['1']?.SSID?._value || '-',
            status: device?._lastInform ? 'Online' : 'Offline',
            lastInform: device?._lastInform ? new Date(device._lastInform).toLocaleString('id-ID') : '-',
            rxPower: getParameterWithPaths(device, parameterPaths.rxPower),
            pppoeIP: getParameterWithPaths(device, parameterPaths.pppoeIP),
            pppoeUsername: getParameterWithPaths(device, parameterPaths.pppoeUsername),
            serialNumber: device?.DeviceID?.SerialNumber || device?.InternetGatewayDevice?.DeviceInfo?.SerialNumber?._value || '-',
            productClass: device?.DeviceID?.ProductClass || device?.InternetGatewayDevice?.DeviceInfo?.ProductClass?._value || '-',
            lokasi: Array.isArray(device.Tags) ? device.Tags.join(', ') : device.Tags || '-',
            softwareVersion: device?.InternetGatewayDevice?.DeviceInfo?.SoftwareVersion?._value || '-',
            model: device?.InternetGatewayDevice?.DeviceInfo?.ModelName?._value || '-',
            uptime: getParameterWithPaths(device, parameterPaths.uptime),
            totalAssociations: getParameterWithPaths(device, parameterPaths.userConnected)
        }));
    } catch (error) {
        logger.error('Error getting GenieACS devices:', error);
        return [];
    }
}

async function getDeviceStatusById(deviceId) {
    try {
        const settings = getSettings();
        const device = await getDeviceByNumber(deviceId);
        return {
            deviceId: device?._id,
            phone: device.Tags?.[0] || '-',
            ssid: device?.InternetGatewayDevice?.LANDevice?.['1']?.WLANConfiguration?.['1']?.SSID?._value || '-',
            status: device?._lastInform ? 'Online' : 'Offline',
            lastInform: device?._lastInform ? new Date(device._lastInform).toLocaleString('id-ID') : '-',
            rxPower: getParameterWithPaths(device, parameterPaths.rxPower),
            pppoeIP: getParameterWithPaths(device, parameterPaths.pppoeIP),
            pppoeUsername: getParameterWithPaths(device, parameterPaths.pppoeUsername),
            serialNumber: device?.DeviceID?.SerialNumber || device?.InternetGatewayDevice?.DeviceInfo?.SerialNumber?._value || '-',
            productClass: device?.DeviceID?.ProductClass || device?.InternetGatewayDevice?.DeviceInfo?.ProductClass?._value || '-',
            lokasi: Array.isArray(device.Tags) ? device.Tags.join(', ') : device.Tags || '-',
            softwareVersion: device?.InternetGatewayDevice?.DeviceInfo?.SoftwareVersion?._value || '-',
            model: device?.InternetGatewayDevice?.DeviceInfo?.ModelName?._value || '-',
            uptime: getParameterWithPaths(device, parameterPaths.uptime),
            totalAssociations: getParameterWithPaths(device, parameterPaths.userConnected)
        };
    } catch (error) {
        logger.error('Error getting device status:', error);
        return null;
    }
}

async function refreshGenieACSDevice(deviceId) {
    try {
        const settings = getSettings();
        await refreshDevice(deviceId);
        return true;
    } catch (error) {
        logger.error('Error refreshing device:', error);
        return false;
    }
}

// Helper functions for Mikrotik
async function getRouterResources() {
    try {
        const settings = getSettings();
        const conn = await getMikrotikConnection();
        const resources = await conn.write('/system/resource/print');
        return resources[0];
    } catch (error) {
        logger.error('Error getting router resources:', error);
        return null;
    }
}

async function getActivePPPoEConnections() {
    try {
        const settings = getSettings();
        const conn = await getMikrotikConnection();
        const connections = await conn.write('/ppp/active/print');
        return connections;
    } catch (error) {
        logger.error('Error getting PPPoE connections:', error);
        return [];
    }
}

async function getInactivePPPoEUsers() {
    try {
        const settings = getSettings();
        const conn = await getMikrotikConnection();
        const users = await conn.write('/ppp/secret/print', { inactive: true });
        return users;
    } catch (error) {
        logger.error('Error getting inactive PPPoE users:', error);
        return [];
    }
}

async function getInterfaceDetail(interfaceName) {
    try {
        const settings = getSettings();
        const conn = await getMikrotikConnection();
        const interfaces = await conn.write('/interface/print', { where: { name: interfaceName } });
        return interfaces[0];
    } catch (error) {
        logger.error('Error getting interface detail:', error);
        return null;
    }
}

async function restartRouter() {
    try {
        const settings = getSettings();
        const conn = await getMikrotikConnection();
        await conn.write('/system/reboot');
        return true;
    } catch (error) {
        logger.error('Error restarting router:', error);
        return false;
    }
}

// Helper functions for Hotspot
async function getHotspotProfiles() {
    try {
        const settings = getSettings();
        const conn = await getMikrotikConnection();
        const profiles = await conn.write('/ip/hotspot/user/profile/print');
        return profiles;
    } catch (error) {
        logger.error('Error getting hotspot profiles:', error);
        return [];
    }
}

async function getRouterUptime() {
    try {
        const settings = getSettings();
        const conn = await getMikrotikConnection();
        const uptime = await conn.write('/system/resource/print');
        return uptime[0]?.uptime || '0s';
    } catch (error) {
        logger.error('Error getting router uptime:', error);
        return '0s';
    }
}

function formatUptime(uptime) {
    if (!uptime) return '0s';
    
    const parts = uptime.match(/(\d+d)?\s*(\d+h)?\s*(\d+m)?\s*(\d+s)?/);
    const days = parts[1] ? parseInt(parts[1]) : 0;
    const hours = parts[2] ? parseInt(parts[2]) : 0;
    const minutes = parts[3] ? parseInt(parts[3]) : 0;
    const seconds = parts[4] ? parseInt(parts[4]) : 0;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

async function getTotalHotspotUsers() {
    try {
        const settings = getSettings();
        const conn = await getMikrotikConnection();
        const users = await conn.write('/ip/hotspot/user/print');
        return users.length;
    } catch (error) {
        logger.error('Error getting total hotspot users:', error);
        return 0;
    }
}

async function addHotspotUser(username, password, profile) {
    try {
        const settings = getSettings();
        const conn = await getMikrotikConnection();
        await conn.write('/ip/hotspot/user/add', {
            name: username,
            password: password,
            profile: profile
        });
    } catch (error) {
        logger.error('Error adding hotspot user:', error);
        throw error;
    }
}

async function addHotspotProfile(name, rateLimit, idleTimeout) {
    try {
        const settings = getSettings();
        const conn = await getMikrotikConnection();
        await conn.write('/ip/hotspot/user/profile/add', {
            name: name,
            rate_limit: rateLimit,
            idle_timeout: `${idleTimeout}m`
        });
    } catch (error) {
        logger.error('Error adding hotspot profile:', error);
        throw error;
    }
}

// Parameter paths untuk mengambil data dari GenieACS
const parameterPaths = {
    rxPower: [
        'VirtualParameters.RXPower',
        'VirtualParameters.redaman',
        'InternetGatewayDevice.WANDevice.1.WANPONInterfaceConfig.RXPower'
    ],
    pppoeIP: [
        'VirtualParameters.pppoeIP',
        'VirtualParameters.pppIP',
        'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.ExternalIPAddress'
    ],
    pppUsername: [
        'VirtualParameters.pppoeUsername',
        'VirtualParameters.pppUsername',
        'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANPPPConnection.1.Username'
    ],
    uptime: [
        'VirtualParameters.getdeviceuptime',
        'InternetGatewayDevice.DeviceInfo.UpTime'
    ],
    userConnected: [
        'InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.TotalAssociations'
    ]
};

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

// Helper functions for Mikrotik
async function getRouterResources() {
    try {
        const conn = await getMikrotikConnection();
        const resources = await conn.write('/system/resource/print');
        return resources[0];
    } catch (error) {
        logger.error('Error getting router resources:', error);
        return null;
    }
}

async function getActivePPPoEConnections() {
    try {
        const conn = await getMikrotikConnection();
        const connections = await conn.write('/ppp/active/print');
        return connections;
    } catch (error) {
        logger.error('Error getting PPPoE connections:', error);
        return [];
    }
}

async function getInactivePPPoEUsers() {
    try {
        const conn = await getMikrotikConnection();
        const users = await conn.write('/ppp/secret/print', { inactive: true });
        return users;
    } catch (error) {
        logger.error('Error getting inactive PPPoE users:', error);
        return [];
    }
}

async function getInterfaceDetail(interfaceName) {
    try {
        const conn = await getMikrotikConnection();
        const interfaces = await conn.write('/interface/print', { where: { name: interfaceName } });
        return interfaces[0];
    } catch (error) {
        logger.error('Error getting interface detail:', error);
        return null;
    }
}

// Helper functions for Hotspot
async function getHotspotProfiles() {
    try {
        const conn = await getMikrotikConnection();
        const profiles = await conn.write('/ip/hotspot/user/profile/print');
        return profiles;
    } catch (error) {
        logger.error('Error getting hotspot profiles:', error);
        return [];
    }
}

async function getRouterUptime() {
    try {
        const conn = await getMikrotikConnection();
        const uptime = await conn.write('/system/resource/print');
        return uptime[0]?.uptime || '0s';
    } catch (error) {
        logger.error('Error getting router uptime:', error);
        return '0s';
    }
}

function formatUptime(uptime) {
    if (!uptime) return '0s';
    
    const parts = uptime.match(/(\d+d)?\s*(\d+h)?\s*(\d+m)?\s*(\d+s)?/);
    const days = parts[1] ? parseInt(parts[1]) : 0;
    const hours = parts[2] ? parseInt(parts[2]) : 0;
    const minutes = parts[3] ? parseInt(parts[3]) : 0;
    const seconds = parts[4] ? parseInt(parts[4]) : 0;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

async function getTotalHotspotUsers() {
    try {
        const conn = await getMikrotikConnection();
        const users = await conn.write('/ip/hotspot/user/print');
        return users.length;
    } catch (error) {
        logger.error('Error getting total hotspot users:', error);
        return 0;
    }
}

async function addHotspotUser(username, password, profile) {
    try {
        const conn = await getMikrotikConnection();
        await conn.write('/ip/hotspot/user/add', {
            name: username,
            password: password,
            profile: profile
        });
    } catch (error) {
        logger.error('Error adding hotspot user:', error);
        throw error;
    }
}

async function addHotspotProfile(name, rateLimit, idleTimeout) {
    try {
        const conn = await getMikrotikConnection();
        await conn.write('/ip/hotspot/user/profile/add', {
            name: name,
            rate_limit: rateLimit,
            idle_timeout: `${idleTimeout}m`
        });
    } catch (error) {
        logger.error('Error adding hotspot profile:', error);
        throw error;
    }
}

// Hotspot Management
router.get('/hotspot', authenticateAdmin, async (req, res) => {
    try {
        const [users, profiles] = await Promise.all([
            getActiveHotspotUsers(),
            getHotspotProfiles()
        ]);
        res.render('admin/hotspot', {
            users,
            profiles
        });
    } catch (error) {
        logger.error('Hotspot management error:', error);
        res.status(500).json({ message: 'Failed to fetch Hotspot data' });
    }
});

// Hotspot Statistics
router.get('/hotspot/stats', authenticateAdmin, async (req, res) => {
    try {
        const users = await getActiveHotspotUsers();
        const uptime = await getRouterUptime();
        res.json({
            success: true,
            activeUsers: users.length,
            totalUsers: await getTotalHotspotUsers(),
            uptime: formatUptime(uptime)
        });
    } catch (error) {
        logger.error('Hotspot stats error:', error);
        res.status(500).json({ message: 'Failed to fetch hotspot stats' });
    }
});

// Hotspot Users
router.get('/hotspot/users', authenticateAdmin, async (req, res) => {
    try {
        const users = await getActiveHotspotUsers();
        res.json({ success: true, users });
    } catch (error) {
        logger.error('Hotspot users error:', error);
        res.status(500).json({ message: 'Failed to fetch hotspot users' });
    }
});

// Hotspot Profiles
router.get('/hotspot/profiles', authenticateAdmin, async (req, res) => {
    try {
        const profiles = await getHotspotProfiles();
        res.json({ success: true, profiles });
    } catch (error) {
        logger.error('Hotspot profiles error:', error);
        res.status(500).json({ message: 'Failed to fetch hotspot profiles' });
    }
});

// Add Hotspot User
router.post('/hotspot/users', authenticateAdmin, async (req, res) => {
    try {
        const { username, password, profile } = req.body;
        await addHotspotUser(username, password, profile);
        res.json({ success: true, message: 'User added successfully' });
    } catch (error) {
        logger.error('Hotspot add user error:', error);
        res.status(500).json({ message: 'Failed to add hotspot user' });
    }
});

// Add Hotspot Profile
router.post('/hotspot/profiles', authenticateAdmin, async (req, res) => {
    try {
        const { name, rateLimit, idleTimeout } = req.body;
        await addHotspotProfile(name, rateLimit, idleTimeout);
        res.json({ success: true, message: 'Profile added successfully' });
    } catch (error) {
        logger.error('Hotspot add profile error:', error);
        res.status(500).json({ message: 'Failed to add hotspot profile' });
    }
});

// Settings Management
router.get('/settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = await getSetting();
        res.render('admin/settings', { settings });
    } catch (error) {
        logger.error('Settings error:', error);
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
});

// Update Settings
router.put('/settings', authenticateAdmin, async (req, res) => {
    try {
        const { settings } = req.body;
        await setSetting(settings);
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        logger.error('Settings update error:', error);
        res.status(500).json({ message: 'Failed to update settings' });
    }
});

module.exports = router;
