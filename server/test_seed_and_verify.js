const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const sequelize = require('./db');
const User = require('./models/User');
const { Truck, Cargo, Booking, BookingMessage, Notification, Complaint } = require('./models/Logistics');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { sendWhatsAppMessage } = require('./services/whatsapp');

const API_BASE = 'http://localhost:5000/api';
const TARGET_PHONE = '03145600028';

async function runTestAndSeed() {
  console.log('================================================================');
  console.log('🚀 STARTING COMPREHENSIVE E-CARGO-BILTY SEED & FLOW TEST');
  console.log(`📱 Target Phone for WhatsApp & SMS: ${TARGET_PHONE}`);
  console.log('================================================================\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    // ─── 1. DATA OF 10 PEOPLE (USERS) ─────────────────────────────────────────
    console.log('\n--- 1. SEEDING / VERIFYING 10 USERS WITH ALL SYSTEM ROLES ---');
    const PEOPLE = [
      {
        name: 'System Administrator',
        email: 'admin@ecargo.com',
        password: 'password123',
        role: 'admin',
        status: 'active',
        phone: '0300-0000000',
        cnic: '37405-0000000-0',
        businessName: 'E-CARGO-BILTY HQ',
        businessRegNumber: 'GOV-PK-001'
      },
      {
        name: 'Al-Rehman Cotton & Textiles',
        email: 'business@ecargo.com',
        password: 'password123',
        role: 'business',
        status: 'active',
        phone: TARGET_PHONE, // 03145600028
        cnic: '37405-1234567-1',
        businessName: 'Al-Rehman Enterprises',
        businessRegNumber: 'REG-PK-88421'
      },
      {
        name: 'Shan Foods Logistics Division',
        email: 'shan.foods@ecargo.com',
        password: 'password123',
        role: 'business',
        status: 'active',
        phone: '0322-4412389',
        cnic: '42101-3829102-3',
        businessName: 'Shan Foods Pvt Ltd',
        businessRegNumber: 'NTN-8932014-9'
      },
      {
        name: 'Fast Track Freight Brokers',
        email: 'transporter@ecargo.com',
        password: 'password123',
        role: 'transporter',
        status: 'active',
        phone: TARGET_PHONE, // 03145600028
        cnic: '37405-2345678-2',
        businessName: 'Fast Track Logistics',
        businessRegNumber: 'FT-LOG-5421'
      },
      {
        name: 'Silk Route Express',
        email: 'silkroute.logistics@ecargo.com',
        password: 'password123',
        role: 'transporter',
        status: 'active',
        phone: '0303-7766554',
        cnic: '17301-5544332-1',
        businessName: 'Silk Route Highway Cargo',
        businessRegNumber: 'SR-EXP-9921'
      },
      {
        name: 'Tariq Mehmood Fleet',
        email: 'truckowner@ecargo.com',
        password: 'password123',
        role: 'truck_owner',
        status: 'active',
        phone: TARGET_PHONE, // 03145600028
        cnic: '37405-3456789-3',
        businessName: 'Mehmood Fleet Services',
        businessRegNumber: 'MFS-0091'
      },
      {
        name: 'Haji Noor Khan',
        email: 'khan.brothers@ecargo.com',
        password: 'password123',
        role: 'truck_owner',
        status: 'active',
        phone: '0304-5544332',
        cnic: '17301-9988776-5',
        businessName: 'Khan Brothers Haulage',
        businessRegNumber: 'KBH-7781'
      },
      {
        name: 'Chaudhry Akram Gujjar',
        email: 'gujjar.transport@ecargo.com',
        password: 'password123',
        role: 'truck_owner',
        status: 'active',
        phone: '0306-3322114',
        cnic: '34101-4455667-9',
        businessName: 'Gujjar Heavy Movers',
        businessRegNumber: 'GHM-FSD-102'
      },
      {
        name: 'Muhammad Rasheed (Captain)',
        email: 'driver@ecargo.com',
        password: 'password123',
        role: 'truck_owner',
        status: 'active',
        phone: TARGET_PHONE, // 03145600028
        cnic: '37405-9988776-1',
        businessName: 'Prime Logistics Fleet Unit',
        businessRegNumber: 'DRV-PK-881'
      },
      {
        name: 'Ustad Gulzar Ahmed',
        email: 'gulzar.driver@ecargo.com',
        password: 'password123',
        role: 'truck_owner',
        status: 'active',
        phone: '0333-5551234',
        cnic: '38403-1122334-5',
        businessName: 'Northern Highway Transport',
        businessRegNumber: 'NHT-ISB-492'
      }
    ];

    const usersMap = {};
    for (const p of PEOPLE) {
      let user = await User.findOne({ where: { email: p.email } });
      if (!user) {
        user = await User.create(p);
        console.log(`  ➕ Created: ${p.name} (${p.email}) - Role: [${p.role}] Phone: ${p.phone}`);
      } else {
        await user.update({
          name: p.name,
          phone: p.phone,
          status: 'active',
          role: p.role,
          businessName: p.businessName,
          businessRegNumber: p.businessRegNumber
        });
        console.log(`  🔄 Updated: ${p.name} (${p.email}) - Role: [${p.role}] Phone: ${p.phone}`);
      }
      usersMap[p.email] = user;
    }

    // ─── 2. FLEET TRUCKS & CARGO SETUP ────────────────────────────────────────
    console.log('\n--- 2. CREATING / ENSURING FLEET TRUCKS & CARGO ---');
    const truckOwner = usersMap['truckowner@ecargo.com'];
    const businessUser = usersMap['business@ecargo.com'];
    const transporterUser = usersMap['transporter@ecargo.com'];

    // Ensure dedicated test truck
    let testTruck = await Truck.findOne({ where: { plateNumber: 'ISB-2028' } });
    if (!testTruck) {
      testTruck = await Truck.create({
        plateNumber: 'ISB-2028',
        capacity: '32 Tons',
        loc: 'Islamabad / Rawalpindi',
        ownerId: truckOwner.id,
        status: 'Available',
        truckType: '22-Wheeler Heavy Trailer',
        driverName: 'Muhammad Rasheed',
        driverMobile: TARGET_PHONE,
        lat: 33.6844,
        lng: 73.0479,
        fitnessDoc: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7',
        insuranceDoc: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d'
      });
      console.log(`  🚛 Created Fleet Truck: ISB-2028 (Driver mobile: ${TARGET_PHONE})`);
    } else {
      await testTruck.update({
        driverMobile: TARGET_PHONE,
        ownerId: truckOwner.id,
        status: 'Available'
      });
      console.log(`  🚛 Updated Fleet Truck: ISB-2028 (Driver mobile: ${TARGET_PHONE})`);
    }

    // Ensure cargo with 03145600028 recipient
    let testCargo = await Cargo.findOne({ where: { title: 'Premium Export Cotton Bales & Fabric' } });
    const cargoData = {
      title: 'Premium Export Cotton Bales & Fabric',
      weight: '28 Tons',
      origin: 'Faisalabad Industrial Estate',
      destination: 'Port Qasim Terminal, Karachi',
      businessOwnerId: businessUser.id,
      transporterId: transporterUser.id,
      status: 'Pending',
      products: [
        { name: '100% Combed Cotton Yarn 30/1', qty: '450 Bales', weight: '18 Tons', description: 'Export Grade Yarn' },
        { name: 'Dyed Twill Cotton Fabric Rolls', qty: '320 Rolls', weight: '10 Tons', description: 'Sealed moisture-proof' }
      ],
      pickupDetails: {
        address: 'Gate 4, Nishat Textile Complex, Sheikhupura Road, Faisalabad',
        contactName: 'Chaudhry Tariq (Warehouse Head)',
        contactPhone: TARGET_PHONE,
        readyDate: '2026-10-16'
      },
      recipients: [
        {
          name: 'Haji Asif & Sons Clearing Agency',
          phone: TARGET_PHONE, // 03145600028
          address: 'Warehouse #14, East Wharf, Port Qasim, Karachi',
          city: 'Karachi'
        }
      ],
      packagingType: 'Heavy Tarpaulin Wrapped Bales',
      dimensions: { length: '40 ft', width: '8 ft', height: '8.5 ft' },
      specialHandling: ['Keep Dry', 'No Direct Sunlight', 'Tarpaulin Tied Required'],
      declaredValue: 'PKR 14,500,000',
      paymentTerms: 'To-Pay on Delivery',
      senderNTN: '0981245-8',
      deliveryNotes: 'Urgent vessel departure scheduled for Dubai port. Handle with care.',
      baseFare: 210000,
      fuelSurcharge: 25000,
      taxAmount: 11750,
      totalFare: 246750
    };

    if (!testCargo) {
      testCargo = await Cargo.create(cargoData);
      console.log(`  📦 Created Cargo: ${testCargo.title} (Recipient Phone: ${TARGET_PHONE})`);
    } else {
      await testCargo.update(cargoData);
      console.log(`  📦 Updated Cargo: ${testCargo.title} (Recipient Phone: ${TARGET_PHONE})`);
    }

    // ─── 3. BOOK FLEET (CREATE BOOKING OFFER) ─────────────────────────────────
    console.log('\n--- 3. BOOKING FLEET TRUCK (BOOK FLEET) ---');
    let booking = await Booking.findOne({ where: { cargoId: testCargo.id, truckId: testTruck.id } });
    if (!booking) {
      booking = await Booking.create({
        truckId: testTruck.id,
        truckPlate: testTruck.plateNumber,
        truckOwnerId: truckOwner.id,
        cargoId: testCargo.id,
        cargoTitle: testCargo.title,
        transporterId: transporterUser.id,
        transporterName: transporterUser.businessName || transporterUser.name,
        price: 'PKR 246,750',
        status: 'Pending',
        deliveryCode: 'BLTY-8028',
        eta: '24 Hours (Direct N-5 Highway Route)'
      });
      console.log(`  ✅ Booking Created: Booking #${booking.id} - Status: [Pending Offer]`);
    } else {
      await booking.update({ status: 'Pending', price: 'PKR 246,750' });
      console.log(`  ✅ Reset Booking #${booking.id} to Status: [Pending Offer]`);
    }

    // ─── 4. ACCEPT FLEET (ACCEPT BOOKING OFFER) ───────────────────────────────
    console.log('\n--- 4. ACCEPTING FLEET BOOKING (ACCEPT FLEET) ---');
    await booking.update({
      status: 'Accepted',
      eta: 'Oct 17, 2026 - 08:00 AM'
    });
    await testCargo.update({ status: 'Accepted', assignedTruck: testTruck.plateNumber });
    await testTruck.update({ status: 'In Transit' });
    console.log(`  ✅ Booking #${booking.id} ACCEPTED by Truck Owner! Status: [Accepted]`);
    console.log(`  🚛 Cargo #${testCargo.id} marked as Accepted with assigned truck: ${testTruck.plateNumber}`);

    // Create Notification in system
    await Notification.create({
      userId: transporterUser.id,
      message: `✅ Truck owner accepted your booking for "${testCargo.title}" (Truck: ${testTruck.plateNumber}).`
    });
    await Notification.create({
      userId: businessUser.id,
      message: `🚛 Fleet Assigned! Truck ${testTruck.plateNumber} scheduled for pickup of "${testCargo.title}".`
    });

    // ─── 5. SEND MESSAGES ON BOOKING CONVERSATION ────────────────────────────
    console.log('\n--- 5. SENDING CHAT MESSAGES ON BOOKING THREAD ---');
    const messages = [
      {
        bookingId: booking.id,
        sender: 'Fast Track Logistics',
        text: `Aslam o Alaikum! We have confirmed booking for ${testCargo.title}. Driver Muhammad Rasheed (${TARGET_PHONE}) should arrive at Gate 4 Faisalabad.`
      },
      {
        bookingId: booking.id,
        sender: 'Tariq Mehmood Fleet',
        text: `Walaikum Assalam. Rasheed is en route with truck ${testTruck.plateNumber}. Fuel is full and tarpaulin is ready. ETA at warehouse: 45 mins.`
      },
      {
        bookingId: booking.id,
        sender: 'Fast Track Logistics',
        text: `Excellent. Bilty BLTY-8028 generated. Secret delivery code is BLTY-8028. Receiver phone is ${TARGET_PHONE}. Safe journey!`
      }
    ];

    for (const msg of messages) {
      await BookingMessage.create(msg);
      console.log(`  💬 [${msg.sender}]: "${msg.text}"`);
    }

    // ─── 6. TRIGGER WHATSAPP TEST MESSAGE TO 03145600028 ─────────────────────
    console.log(`\n--- 6. TRIGGERING DIRECT WHATSAPP MESSAGE TO ${TARGET_PHONE} ---`);
    const waPayload = 
      `🚛 *E-CARGO-BILTY SYSTEM DISPATCH ALERT*\n\n` +
      `Assalam-o-Alaikum,\n` +
      `Your commercial fleet booking has been *ACCEPTED*:\n` +
      `• *Consignment:* ${testCargo.title}\n` +
      `• *Truck Plate:* ${testTruck.plateNumber} (${testTruck.truckType})\n` +
      `• *Driver:* Muhammad Rasheed (${TARGET_PHONE})\n` +
      `• *Route:* Faisalabad ➔ Karachi Port Qasim\n` +
      `• *Bilty Delivery Code:* BLTY-8028\n` +
      `• *Fare:* PKR 246,750\n\n` +
      `Live tracking & E-Bilty documentation active on E-Cargo-Bilty Portal.`;

    const waResult = await sendWhatsAppMessage(TARGET_PHONE, waPayload);
    console.log('  📱 WhatsApp Dispatch Result:', waResult);

    // ─── 7. AUTOMATED END-TO-END WEBSITE & API AUDIT ──────────────────────────
    console.log('\n--- 7. TESTING ALL WEBSITE BACKEND ENDPOINTS & PORTALS ---');

    // Test Login for 4 Core Roles
    const ROLES_TO_TEST = [
      { role: 'Admin', email: 'admin@ecargo.com', pass: 'password123' },
      { role: 'Business / Shipper', email: 'business@ecargo.com', pass: 'password123' },
      { role: 'Transporter', email: 'transporter@ecargo.com', pass: 'password123' },
      { role: 'Truck Owner', email: 'truckowner@ecargo.com', pass: 'password123' }
    ];

    const tokens = {};
    for (const acc of ROLES_TO_TEST) {
      try {
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email: acc.email,
          password: acc.pass
        });
        tokens[acc.role] = res.data.token;
        console.log(`  🔑 [${acc.role}] Login: SUCCESS (User ID: ${res.data.user.id}, Token Verified)`);
      } catch (err) {
        console.error(`  ❌ [${acc.role}] Login FAILED:`, err.response?.data?.message || err.message);
      }
    }

    const adminHeaders = { headers: { Authorization: `Bearer ${tokens['Admin']}` } };
    const transporterHeaders = { headers: { Authorization: `Bearer ${tokens['Transporter']}` } };

    // Test API: Admin Stats
    try {
      const statsRes = await axios.get(`${API_BASE}/admin/stats`, adminHeaders);
      console.log('  📊 /api/admin/stats:', statsRes.data);
    } catch (e) {
      console.error('  ❌ Stats error:', e.message);
    }

    // Test API: Trucks List
    try {
      const trucksRes = await axios.get(`${API_BASE}/trucks`, transporterHeaders);
      console.log(`  🚛 /api/trucks: ${trucksRes.data.length} trucks available`);
    } catch (e) {
      console.error('  ❌ Trucks error:', e.message);
    }

    // Test API: Cargo List
    try {
      const cargoRes = await axios.get(`${API_BASE}/cargo`, transporterHeaders);
      console.log(`  📦 /api/cargo: ${cargoRes.data.length} cargo shipments listed`);
    } catch (e) {
      console.error('  ❌ Cargo error:', e.message);
    }

    // Test API: Bookings List
    try {
      const bookingsRes = await axios.get(`${API_BASE}/bookings`, transporterHeaders);
      console.log(`  📋 /api/bookings: ${bookingsRes.data.length} bookings on record`);
      const testB = bookingsRes.data.find(b => b.id === booking.id);
      if (testB) {
        console.log(`    -> Verified Target Booking #${testB.id} is Status: [${testB.status}] with ${testB.messages?.length || 0} messages`);
      }
    } catch (e) {
      console.error('  ❌ Bookings error:', e.message);
    }

    // Test API: Complaints
    try {
      const complaintsRes = await axios.get(`${API_BASE}/complaints`, adminHeaders);
      console.log(`  📝 /api/complaints: ${complaintsRes.data.length} complaints loaded`);
    } catch (e) {
      console.error('  ❌ Complaints error:', e.message);
    }

    // Test API: WhatsApp Status
    try {
      const waStatusRes = await axios.get(`${API_BASE}/whatsapp/status`, adminHeaders);
      console.log('  📱 /api/whatsapp/status:', waStatusRes.data);
    } catch (e) {
      console.error('  ❌ WhatsApp status error:', e.message);
    }

    console.log('\n================================================================');
    console.log('🎉 COMPREHENSIVE SEED, FLEET BOOKING, ACCEPTANCE & AUDIT COMPLETE!');
    console.log('================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Fatal execution error:', err);
    process.exit(1);
  }
}

runTestAndSeed();
