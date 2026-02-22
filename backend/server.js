const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Firebase Admin SDK
let admin;
let firebaseInitialized = false;
try {
    admin = require('firebase-admin');
    // Initialize Firebase Admin with environment-based config or service account
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        firebaseInitialized = true;
        console.log('🔥 Firebase Admin SDK initialized with service account');
    } else if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
        firebaseInitialized = true;
        console.log('🔥 Firebase Admin SDK initialized with project ID');
    } else {
        // Try default credentials (for Cloud environments)
        try {
            admin.initializeApp();
            firebaseInitialized = true;
            console.log('🔥 Firebase Admin SDK initialized with default credentials');
        } catch {
            console.log('⚠️  Firebase Admin SDK not configured — running in local-only mode');
            console.log('   Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID to enable Firebase Auth');
        }
    }
} catch (err) {
    console.log('⚠️  Firebase Admin SDK not available — running in local-only mode');
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'smart-mobility-secret-key-2026';

// Middleware
app.use(cors());
app.use(express.json());

// ============== IN-MEMORY DATA STORE ==============
const users = [
    { id: '1', email: 'admin@smartcity.gov', password: bcrypt.hashSync('admin123', 10), name: 'City Admin', role: 'admin', avatar: 'CA' },
    { id: '2', email: 'fleet@transport.com', password: bcrypt.hashSync('fleet123', 10), name: 'Fleet Manager', role: 'fleet_manager', avatar: 'FM' },
    { id: '3', email: 'citizen@email.com', password: bcrypt.hashSync('citizen123', 10), name: 'John Citizen', role: 'citizen', avatar: 'JC' },
];

// City coordinates (simulating a smart city grid)
const CITY_ZONES = [
    { id: 'z1', name: 'Downtown Core', lat: 28.6139, lng: 77.2090, type: 'commercial' },
    { id: 'z2', name: 'Tech District', lat: 28.6292, lng: 77.2194, type: 'tech' },
    { id: 'z3', name: 'Industrial Zone', lat: 28.5986, lng: 77.2322, type: 'industrial' },
    { id: 'z4', name: 'Residential North', lat: 28.6448, lng: 77.2167, type: 'residential' },
    { id: 'z5', name: 'Green Belt', lat: 28.6095, lng: 77.1855, type: 'park' },
    { id: 'z6', name: 'Airport Hub', lat: 28.5562, lng: 77.1000, type: 'transport' },
    { id: 'z7', name: 'University Area', lat: 28.6353, lng: 77.1935, type: 'education' },
    { id: 'z8', name: 'Market District', lat: 28.6507, lng: 77.2334, type: 'commercial' },
    { id: 'z9', name: 'Harbor Zone', lat: 28.5833, lng: 77.2500, type: 'industrial' },
    { id: 'z10', name: 'Suburban West', lat: 28.6200, lng: 77.1600, type: 'residential' },
];

// ============== TRAFFIC DATA GENERATOR ==============
function generateTrafficData() {
    const hour = new Date().getHours();
    const isRushHour = (hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 19);
    const isMidDay = hour >= 11 && hour <= 15;

    return CITY_ZONES.map(zone => {
        let baseCongestion;
        if (zone.type === 'commercial') baseCongestion = isRushHour ? 85 : isMidDay ? 60 : 30;
        else if (zone.type === 'industrial') baseCongestion = isRushHour ? 70 : isMidDay ? 50 : 20;
        else if (zone.type === 'residential') baseCongestion = isRushHour ? 75 : isMidDay ? 35 : 25;
        else if (zone.type === 'transport') baseCongestion = isRushHour ? 80 : 45;
        else baseCongestion = isRushHour ? 40 : 20;

        const congestion = Math.min(100, Math.max(0, baseCongestion + Math.floor(Math.random() * 20 - 10)));
        const speed = Math.max(5, 60 - congestion * 0.5 + Math.floor(Math.random() * 10));
        const vehicleCount = Math.floor(congestion * 15 + Math.random() * 200);
        const incidents = congestion > 70 ? Math.floor(Math.random() * 3) : 0;

        return {
            zoneId: zone.id,
            zoneName: zone.name,
            lat: zone.lat + (Math.random() - 0.5) * 0.005,
            lng: zone.lng + (Math.random() - 0.5) * 0.005,
            congestionLevel: congestion,
            congestionCategory: congestion > 70 ? 'High' : congestion > 40 ? 'Medium' : 'Low',
            averageSpeed: speed,
            vehicleCount,
            incidents,
            timestamp: new Date().toISOString(),
        };
    });
}

// ============== EMISSION DATA GENERATOR ==============
function generateEmissionData() {
    const zones = generateTrafficData();
    return zones.map(zone => {
        const baseCO2 = zone.vehicleCount * 0.12 * (1 + zone.congestionLevel / 100);
        const co2 = Math.round(baseCO2 * 100) / 100;
        const nox = Math.round(co2 * 0.015 * 100) / 100;
        const pm25 = Math.round(co2 * 0.008 * 100) / 100;

        return {
            zoneId: zone.zoneId,
            zoneName: zone.zoneName,
            lat: zone.lat,
            lng: zone.lng,
            co2Emission: co2,
            noxEmission: nox,
            pm25Level: pm25,
            airQualityIndex: Math.min(500, Math.floor(co2 * 2 + Math.random() * 30)),
            vehicleCount: zone.vehicleCount,
            congestionLevel: zone.congestionLevel,
            timestamp: new Date().toISOString(),
        };
    });
}

// ============== HISTORICAL DATA GENERATOR ==============
function generateHistoricalData(days = 30) {
    const data = [];
    const now = new Date();

    for (let d = days; d >= 0; d--) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split('T')[0];

        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const baseTraffic = isWeekend ? 40 : 65;
        const baseCO2 = isWeekend ? 120 : 220;

        data.push({
            date: dateStr,
            avgCongestion: Math.floor(baseTraffic + Math.random() * 20 - 10),
            totalVehicles: Math.floor((isWeekend ? 8000 : 15000) + Math.random() * 3000),
            co2Emissions: Math.round((baseCO2 + Math.random() * 40 - 20) * 100) / 100,
            noxEmissions: Math.round((baseCO2 * 0.015 + Math.random() * 2) * 100) / 100,
            fuelConsumed: Math.round((baseCO2 * 0.45 + Math.random() * 10) * 100) / 100,
            avgSpeed: Math.floor((isWeekend ? 45 : 30) + Math.random() * 10),
            incidents: Math.floor(Math.random() * (isWeekend ? 3 : 8)),
            peakHour: isWeekend ? '11:00-13:00' : '08:00-10:00',
        });
    }
    return data;
}

function generateHourlyData() {
    const data = [];
    for (let h = 0; h < 24; h++) {
        const isRush = (h >= 7 && h <= 10) || (h >= 16 && h <= 19);
        const isMid = h >= 11 && h <= 15;
        const isNight = h >= 22 || h <= 5;

        data.push({
            hour: `${h.toString().padStart(2, '0')}:00`,
            congestion: isNight ? Math.floor(10 + Math.random() * 15) : isRush ? Math.floor(65 + Math.random() * 25) : isMid ? Math.floor(40 + Math.random() * 15) : Math.floor(25 + Math.random() * 15),
            vehicles: isNight ? Math.floor(200 + Math.random() * 300) : isRush ? Math.floor(1200 + Math.random() * 500) : Math.floor(600 + Math.random() * 300),
            co2: isNight ? Math.round((5 + Math.random() * 5) * 100) / 100 : isRush ? Math.round((25 + Math.random() * 10) * 100) / 100 : Math.round((12 + Math.random() * 8) * 100) / 100,
            speed: isNight ? Math.floor(50 + Math.random() * 10) : isRush ? Math.floor(15 + Math.random() * 15) : Math.floor(35 + Math.random() * 10),
        });
    }
    return data;
}

// ============== ROUTE OPTIMIZER (Simulated A* / Dijkstra) ==============
function optimizeRoute(origin, destination) {
    const distance = Math.sqrt(Math.pow(destination.lat - origin.lat, 2) + Math.pow(destination.lng - origin.lng, 2)) * 111;
    const baseTime = distance / 30 * 60; // minutes at 30 km/h avg

    const routes = [
        {
            id: uuidv4(),
            name: 'Fastest Route',
            type: 'fastest',
            distance: Math.round(distance * 100) / 100,
            estimatedTime: Math.round(baseTime),
            congestionLevel: Math.floor(20 + Math.random() * 30),
            co2Emission: Math.round(distance * 0.21 * 100) / 100,
            fuelConsumption: Math.round(distance * 0.08 * 100) / 100,
            emissionSaved: 0,
            waypoints: generateWaypoints(origin, destination, 5),
            color: '#3B82F6',
        },
        {
            id: uuidv4(),
            name: 'Eco-Friendly Route',
            type: 'eco',
            distance: Math.round(distance * 1.15 * 100) / 100,
            estimatedTime: Math.round(baseTime * 1.2),
            congestionLevel: Math.floor(10 + Math.random() * 20),
            co2Emission: Math.round(distance * 0.15 * 100) / 100,
            fuelConsumption: Math.round(distance * 0.06 * 100) / 100,
            emissionSaved: Math.round(distance * 0.06 * 100) / 100,
            waypoints: generateWaypoints(origin, destination, 6),
            color: '#10B981',
        },
        {
            id: uuidv4(),
            name: 'Balanced Route',
            type: 'balanced',
            distance: Math.round(distance * 1.08 * 100) / 100,
            estimatedTime: Math.round(baseTime * 1.1),
            congestionLevel: Math.floor(15 + Math.random() * 25),
            co2Emission: Math.round(distance * 0.18 * 100) / 100,
            fuelConsumption: Math.round(distance * 0.07 * 100) / 100,
            emissionSaved: Math.round(distance * 0.03 * 100) / 100,
            waypoints: generateWaypoints(origin, destination, 5),
            color: '#F59E0B',
        },
    ];

    return routes;
}

function generateWaypoints(origin, destination, count) {
    const waypoints = [origin];
    for (let i = 1; i < count - 1; i++) {
        const ratio = i / (count - 1);
        waypoints.push({
            lat: origin.lat + (destination.lat - origin.lat) * ratio + (Math.random() - 0.5) * 0.01,
            lng: origin.lng + (destination.lng - origin.lng) * ratio + (Math.random() - 0.5) * 0.01,
        });
    }
    waypoints.push(destination);
    return waypoints;
}

// ============== ALERTS GENERATOR ==============
function generateAlerts() {
    const alertTypes = [
        { type: 'congestion', severity: 'high', icon: '🚗', title: 'Heavy Congestion Detected' },
        { type: 'accident', severity: 'critical', icon: '⚠️', title: 'Traffic Accident Reported' },
        { type: 'emission', severity: 'warning', icon: '🌫️', title: 'High Emission Zone Alert' },
        { type: 'roadwork', severity: 'info', icon: '🚧', title: 'Road Construction Ahead' },
        { type: 'diversion', severity: 'medium', icon: '↩️', title: 'Route Diversion Active' },
        { type: 'weather', severity: 'warning', icon: '🌧️', title: 'Weather Advisory' },
    ];

    const alerts = [];
    const count = Math.floor(Math.random() * 4) + 3;
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const alertTemplate = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const zone = CITY_ZONES[Math.floor(Math.random() * CITY_ZONES.length)];
        const minutesAgo = Math.floor(Math.random() * 120);

        alerts.push({
            id: uuidv4(),
            ...alertTemplate,
            zone: zone.name,
            lat: zone.lat,
            lng: zone.lng,
            message: `${alertTemplate.title} near ${zone.name}. Please consider alternative routes.`,
            timestamp: new Date(now - minutesAgo * 60000).toISOString(),
            isRead: Math.random() > 0.5,
        });
    }

    return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// ============== AUTH MIDDLEWARE (supports both JWT and Firebase tokens) ==============
async function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    // 1. Try local JWT first
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (jwtErr) {
        // JWT failed, try Firebase
    }

    // 2. Try Firebase ID token verification
    if (firebaseInitialized && admin) {
        try {
            const decodedFirebase = await admin.auth().verifyIdToken(token);
            req.user = {
                id: decodedFirebase.uid,
                email: decodedFirebase.email || '',
                name: decodedFirebase.name || decodedFirebase.email?.split('@')[0] || 'User',
                role: 'citizen', // Default; can be looked up from database
                avatar: (decodedFirebase.name || 'U').substring(0, 2).toUpperCase(),
                provider: decodedFirebase.firebase?.sign_in_provider || 'firebase',
            };

            // Check if user exists in our local store, use their role
            const existingUser = users.find(u => u.email === decodedFirebase.email);
            if (existingUser) {
                req.user.role = existingUser.role;
                req.user.avatar = existingUser.avatar;
                req.user.name = existingUser.name;
            }

            return next();
        } catch (firebaseErr) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    }

    return res.status(401).json({ error: 'Invalid token' });
}

// ============== AUTH ROUTES ==============
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
    });
});

// ============== FIREBASE AUTH LOGIN ==============
app.post('/api/auth/firebase-login', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { uid, email, name, photoURL, provider } = req.body;

    // Verify Firebase token if Firebase Admin is available
    if (firebaseInitialized && admin && token) {
        try {
            const decoded = await admin.auth().verifyIdToken(token);
            if (decoded.uid !== uid) {
                return res.status(401).json({ error: 'Token mismatch' });
            }
        } catch (err) {
            // If Firebase verification fails, still allow with a warning
            console.log('⚠️ Firebase token verification failed, proceeding with provided data');
        }
    }

    // Check if user already exists
    let user = users.find(u => u.email === email);

    if (!user) {
        // Create new user from Firebase auth
        const displayName = name || email?.split('@')[0] || 'User';
        const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

        user = {
            id: uid || uuidv4(),
            email: email,
            password: null, // Firebase users don't have local passwords
            name: displayName,
            role: 'citizen', // Default role for new Firebase users
            avatar: initials,
            photoURL: photoURL || null,
            provider: provider || 'firebase',
            emailVerified: true,
            createdAt: new Date().toISOString(),
        };
        users.push(user);
        console.log(`✅ New Firebase user registered: ${email} (${provider})`);
    } else {
        // Update existing user with Firebase info
        if (photoURL) user.photoURL = photoURL;
        if (provider) user.provider = provider;
    }

    // Generate a local JWT for API access
    const jwtToken = jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            photoURL: user.photoURL,
            provider: user.provider,
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        token: jwtToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            photoURL: user.photoURL,
            provider: user.provider,
            emailVerified: user.emailVerified,
        },
    });
});

// ============== USER REGISTRATION (local mode) ==============
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existing = users.find(u => u.email === email);
    if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const newUser = {
        id: uuidv4(),
        email,
        password: bcrypt.hashSync(password, 10),
        name,
        role: 'citizen',
        avatar: initials,
        provider: 'email',
        emailVerified: false,
        createdAt: new Date().toISOString(),
    };
    users.push(newUser);

    console.log(`✅ New local user registered: ${email}`);

    res.status(201).json({
        message: 'Account created successfully',
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            avatar: newUser.avatar,
        },
    });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

// ============== TRAFFIC ROUTES ==============
app.get('/api/traffic/realtime', authMiddleware, (req, res) => {
    res.json({ data: generateTrafficData(), timestamp: new Date().toISOString() });
});

app.get('/api/traffic/heatmap', authMiddleware, (req, res) => {
    const trafficData = generateTrafficData();
    const heatmapPoints = trafficData.map(t => ({
        lat: t.lat,
        lng: t.lng,
        intensity: t.congestionLevel / 100,
        zoneName: t.zoneName,
        congestion: t.congestionCategory,
        vehicles: t.vehicleCount,
    }));
    res.json({ data: heatmapPoints });
});

app.get('/api/traffic/hourly', authMiddleware, (req, res) => {
    res.json({ data: generateHourlyData() });
});

// ============== EMISSION ROUTES ==============
app.get('/api/emissions/realtime', authMiddleware, (req, res) => {
    res.json({ data: generateEmissionData(), timestamp: new Date().toISOString() });
});

app.get('/api/emissions/trends', authMiddleware, (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const historicalData = generateHistoricalData(days);
    const trends = historicalData.map(d => ({
        date: d.date,
        co2: d.co2Emissions,
        nox: d.noxEmissions,
        fuel: d.fuelConsumed,
        vehicles: d.totalVehicles,
    }));
    res.json({ data: trends });
});

app.post('/api/emissions/calculate', authMiddleware, (req, res) => {
    const { distance, vehicleType = 'car', speed = 40 } = req.body;

    const emissionFactors = {
        car: 0.21,
        suv: 0.28,
        truck: 0.45,
        bus: 0.89,
        motorcycle: 0.11,
        electric: 0.05,
    };

    const factor = emissionFactors[vehicleType] || emissionFactors.car;
    const speedFactor = speed < 20 ? 1.5 : speed > 60 ? 1.2 : 1.0;
    const co2 = Math.round(distance * factor * speedFactor * 100) / 100;
    const fuelUsed = Math.round(distance * factor * 0.38 * 100) / 100;
    const treesNeeded = Math.ceil(co2 / 21.77);

    res.json({
        co2Emission: co2,
        fuelConsumption: fuelUsed,
        treesNeeded,
        vehicleType,
        distance,
        equivalentWalking: Math.round(distance * 12),
        emissionCategory: co2 > 5 ? 'High' : co2 > 2 ? 'Medium' : 'Low',
    });
});

// ============== ROUTE OPTIMIZATION ROUTES ==============
app.post('/api/routes/optimize', authMiddleware, (req, res) => {
    const { origin, destination } = req.body;
    if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination required' });
    }
    const routes = optimizeRoute(origin, destination);
    res.json({ routes, timestamp: new Date().toISOString() });
});

// ============== ANALYTICS ROUTES ==============
app.get('/api/analytics/overview', authMiddleware, (req, res) => {
    const trafficData = generateTrafficData();
    const emissionData = generateEmissionData();

    const avgCongestion = Math.round(trafficData.reduce((a, b) => a + b.congestionLevel, 0) / trafficData.length);
    const totalVehicles = trafficData.reduce((a, b) => a + b.vehicleCount, 0);
    const totalCO2 = Math.round(emissionData.reduce((a, b) => a + b.co2Emission, 0) * 100) / 100;
    const avgSpeed = Math.round(trafficData.reduce((a, b) => a + b.averageSpeed, 0) / trafficData.length);
    const totalIncidents = trafficData.reduce((a, b) => a + b.incidents, 0);

    res.json({
        overview: {
            avgCongestion,
            totalVehicles,
            totalCO2,
            avgSpeed,
            totalIncidents,
            activeZones: CITY_ZONES.length,
            congestionTrend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
            emissionTrend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        },
        trafficByZone: trafficData,
        emissionByZone: emissionData,
    });
});

app.get('/api/analytics/historical', authMiddleware, (req, res) => {
    const days = parseInt(req.query.days) || 30;
    res.json({ data: generateHistoricalData(days) });
});

app.get('/api/analytics/peak-hours', authMiddleware, (req, res) => {
    res.json({ data: generateHourlyData() });
});

// ============== ALERTS ROUTES ==============
app.get('/api/alerts', authMiddleware, (req, res) => {
    res.json({ alerts: generateAlerts() });
});

// ============== ZONES ROUTES ==============
app.get('/api/zones', authMiddleware, (req, res) => {
    res.json({ zones: CITY_ZONES });
});

// ============== SETTINGS ROUTES ==============
let settings = {
    dataSources: { gps: true, iot: true, publicApi: true, historical: true },
    emissionThresholds: { low: 50, medium: 150, high: 300 },
    refreshInterval: 30,
    mapStyle: 'dark',
    notifications: { congestion: true, accidents: true, emissions: true, roadwork: true },
    unit: 'metric',
};

app.get('/api/settings', authMiddleware, (req, res) => {
    res.json({ settings });
});

app.put('/api/settings', authMiddleware, (req, res) => {
    settings = { ...settings, ...req.body };
    res.json({ settings, message: 'Settings updated successfully' });
});

// ============== WEBSOCKET FOR REAL-TIME UPDATES ==============
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'traffic_update',
                data: generateTrafficData(),
                timestamp: new Date().toISOString(),
            }));
        }
    }, 5000);

    const emissionInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'emission_update',
                data: generateEmissionData(),
                timestamp: new Date().toISOString(),
            }));
        }
    }, 10000);

    const alertInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            const shouldSendAlert = Math.random() > 0.7;
            if (shouldSendAlert) {
                const alerts = generateAlerts();
                ws.send(JSON.stringify({
                    type: 'alert',
                    data: alerts[0],
                    timestamp: new Date().toISOString(),
                }));
            }
        }
    }, 15000);

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        clearInterval(interval);
        clearInterval(emissionInterval);
        clearInterval(alertInterval);
    });
});

// ============== START SERVER ==============
server.listen(PORT, () => {
    console.log(`\n🚀 Smart Urban Mobility Backend running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket available at ws://localhost:${PORT}/ws`);
    console.log(`🔐 Auth Mode: ${firebaseInitialized ? 'Firebase + Local JWT' : 'Local JWT only'}`);
    console.log('\n📋 Test Credentials (Local Auth):');
    console.log('   Admin:   admin@smartcity.gov / admin123');
    console.log('   Fleet:   fleet@transport.com / fleet123');
    console.log('   Citizen: citizen@email.com / citizen123');
    if (firebaseInitialized) {
        console.log('\n🔥 Firebase Auth: Enabled');
        console.log('   Google Sign-In: Available');
        console.log('   GitHub Sign-In: Available');
        console.log('   Email/Password: Available');
    } else {
        console.log('\n💡 To enable Firebase Auth, set environment variables:');
        console.log('   FIREBASE_PROJECT_ID=your-project-id');
        console.log('   or FIREBASE_SERVICE_ACCOUNT={...json...}');
    }
    console.log('');
});
