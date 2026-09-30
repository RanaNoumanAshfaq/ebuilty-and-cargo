const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

const fs = require('fs');

let client = null;
let isReady = false;
let latestQr = null;
let clientStatus = 'disconnected'; // 'disconnected' | 'initializing' | 'qr_ready' | 'authenticated' | 'ready' | 'error'
let ioInstance = null;

const findChromeExecutable = () => {
  const candidatePaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
};

/**
 * Normalizes phone numbers (supports Pakistani 03XX-XXXXXXX, +923XX, 923XX, international)
 * Returns WhatsApp chat ID (e.g., '923001234567@c.us')
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  let cleaned = String(phone).replace(/\D/g, ''); // strip spaces, hyphens, plus signs
  if (!cleaned) return null;

  // Pakistani numbers:
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.slice(1);
  } else if (!cleaned.startsWith('92') && (cleaned.startsWith('3') && cleaned.length >= 9)) {
    cleaned = '92' + cleaned;
  }

  if (cleaned.length < 10) return null;
  return `${cleaned}@c.us`;
};

/**
 * Extracts and deduplicates all recipients from cargo object
 */
const extractRecipients = (cargo, extra = []) => {
  const list = [];
  const add = (r) => {
    if (!r) return;
    const phone = r.phone || r.contactPhone || r.mobile || r.contact;
    const name = r.name || r.fullName || r.contactName || 'Consignee / Receiver';
    const address = r.address || r.streetAddress || cargo?.destination || 'Destination Warehouse';
    if (phone && !list.some(existing => existing.phone === phone)) {
      list.push({ name, phone, address });
    }
  };

  if (Array.isArray(extra)) extra.forEach(add);
  else if (extra && typeof extra === 'object') add(extra);

  if (cargo) {
    let recs = cargo.recipients;
    if (typeof recs === 'string') {
      try { recs = JSON.parse(recs); } catch (e) { recs = []; }
    }
    if (Array.isArray(recs)) recs.forEach(add);
    else if (recs && typeof recs === 'object') add(recs);
  }

  return list;
};


/**
 * Initializes the self-hosted WhatsApp Web client
 */
const initWhatsApp = (io = null) => {
  if (io) ioInstance = io;
  if (client) return;

  clientStatus = 'initializing';
  const chromePath = findChromeExecutable();
  console.log(`📱 Initializing WhatsApp Web Client... (Browser: ${chromePath || 'Bundled Chromium'})`);

  try {
    const puppeteerConfig = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    };
    if (chromePath) {
      puppeteerConfig.executablePath = chromePath;
    }

    client = new Client({
      authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, '../.wwebjs_auth')
      }),
      puppeteer: puppeteerConfig
    });


    client.on('qr', (qr) => {
      latestQr = qr;
      clientStatus = 'qr_ready';
      console.log('\n================== WHATSAPP LOGIN QR CODE ==================');
      console.log('Scan this QR code using WhatsApp on your phone (Linked Devices):');
      qrcode.generate(qr, { small: true });
      console.log('============================================================\n');

      if (ioInstance) {
        ioInstance.emit('whatsapp_qr', { qr, status: 'qr_ready' });
      }
    });

    client.on('authenticated', () => {
      clientStatus = 'authenticated';
      latestQr = null;
      console.log('✅ WhatsApp Web Client Authenticated');
      if (ioInstance) {
        ioInstance.emit('whatsapp_status', { status: 'authenticated' });
      }
    });

    client.on('auth_failure', (msg) => {
      clientStatus = 'error';
      console.error('❌ WhatsApp Web Authentication Failed:', msg);
      if (ioInstance) {
        ioInstance.emit('whatsapp_status', { status: 'auth_failure', error: msg });
      }
    });

    client.on('ready', () => {
      isReady = true;
      clientStatus = 'ready';
      latestQr = null;
      const myNum = client?.info?.wid?.user || 'Unknown';
      console.log(`🚀 WhatsApp Web Client is READY! Messages will be sent automatically. (Logged in as: ${myNum})`);
      if (ioInstance) {
        ioInstance.emit('whatsapp_status', { status: 'ready', myNumber: myNum });
      }
    });

    client.on('disconnected', (reason) => {
      isReady = false;
      clientStatus = 'disconnected';
      console.warn('⚠️ WhatsApp Web Client Disconnected:', reason);
      if (ioInstance) {
        ioInstance.emit('whatsapp_status', { status: 'disconnected', reason });
      }
    });

    client.initialize().catch((err) => {
      clientStatus = 'error';
      console.warn('⚠️ WhatsApp Web failed to start headless browser:', err.message);
    });
  } catch (error) {
    clientStatus = 'error';
    console.warn('⚠️ Error during WhatsApp initialization:', error.message);
  }
};

/**
 * Core function to send a text message via WhatsApp
 */
const sendWhatsAppMessage = async (rawPhone, messageText) => {
  if (!isReady || !client) {
    console.log(`[WhatsApp Pending/Offline] Client not ready yet. Skipped WhatsApp to: ${rawPhone}`);
    return { success: false, reason: 'client_not_ready' };
  }

  const rawCleaned = (rawPhone || '').toString().replace(/[^0-9]/g, '');
  let cleaned = rawCleaned;
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.slice(1);
  } else if (!cleaned.startsWith('92') && (cleaned.startsWith('3') && cleaned.length >= 9)) {
    cleaned = '92' + cleaned;
  }

  if (cleaned.length < 10) {
    console.warn(`[WhatsApp] Invalid phone number provided: ${rawPhone}`);
    return { success: false, reason: 'invalid_phone' };
  }

  let targetChatId = `${cleaned}@c.us`;

  try {
    // Verify with WhatsApp server if number is registered
    try {
      const numberDetails = await client.getNumberId(cleaned);
      if (numberDetails && numberDetails._serialized) {
        targetChatId = numberDetails._serialized;
      } else {
        console.warn(`⚠️ [WhatsApp Warning] ${rawPhone} (${cleaned}) is NOT registered on WhatsApp or not recognized!`);
      }
    } catch (lookupErr) {
      // fallback to targetChatId
    }

    await client.sendMessage(targetChatId, messageText);
    console.log(`📨 [WhatsApp Sent] to ${rawPhone} (${targetChatId})`);
    return { success: true, targetChatId };
  } catch (err) {
    console.error(`❌ [WhatsApp Send Error] to ${rawPhone} (${targetChatId}):`, err.message);
    return { success: false, reason: err.message };
  }
};

// ─── Specialized Logistics Notification Triggers ─────────────────────────────

/**
 * 1. Sent when a new shipment is posted
 */
const notifyCargoCreated = async (cargo, shipper, recipients = []) => {
  const origin = cargo.origin || 'Depot';
  const destination = cargo.destination || 'Delivery Location';
  const title = cargo.title || 'General Cargo';
  const weight = cargo.weight || 'N/A';

  // Alert to Business Owner (Shipper)
  if (shipper && shipper.phone) {
    const shipperMsg =
      `📦 *E-CARGO-BILTY: SHIPMENT LISTED*\n\n` +
      `Hello *${shipper.businessName || shipper.name}*,\n` +
      `Your shipment request has been successfully created:\n` +
      `• *Consignment:* ${title}\n` +
      `• *Weight:* ${weight} Tons\n` +
      `• *Route:* ${origin} ➔ ${destination}\n` +
      `• *Status:* Listing Active\n\n` +
      `Transporters are currently matching available trucks. You will receive an update once a truck is assigned.`;
    await sendWhatsAppMessage(shipper.phone, shipperMsg);
  }

  // Alert to Consignees / Recipients
  const recipientList = extractRecipients(cargo, recipients);
  console.log(`[WhatsApp notifyCargoCreated] Found ${recipientList.length} recipient(s) to notify.`);
  for (const r of recipientList) {
    if (r.phone) {
      const recipientMsg =
        `📦 *E-CARGO-BILTY: INCOMING SHIPMENT NOTICE*\n\n` +
        `Hello *${r.name || 'Valued Customer'}*,\n` +
        `A shipment has been scheduled for delivery to your location by *${shipper?.businessName || shipper?.name || 'Shipper'}*:\n` +
        `• *Cargo:* ${title} (${weight} Tons)\n` +
        `• *From:* ${origin} ➔ *To:* ${r.address || destination}\n\n` +
        `You will receive driver details and your *Secret Delivery Code* once the vehicle departs.`;
      await sendWhatsAppMessage(r.phone, recipientMsg);
    }
  }
};

/**
 * 2. Sent when a Transporter sends a Booking Offer to a Truck Driver / Owner
 */
const notifyBookingOffer = async (booking, truck, cargo, transporter) => {
  const targetPhone = truck.driverMobile || truck.owner?.phone;
  if (!targetPhone) return;

  const msg =
    `🚛 *E-CARGO-BILTY: NEW TRIP OFFER*\n\n` +
    `Hello *${truck.driverName || 'Truck Owner'}*,\n` +
    `You have received a new trip booking offer for Truck *${truck.plateNumber}*:\n` +
    `• *Cargo:* ${booking.cargoTitle || cargo?.title || 'Consignment'}\n` +
    `• *Route:* ${cargo?.origin || 'Origin'} ➔ ${cargo?.destination || 'Destination'}\n` +
    `• *Offered Fare:* PKR ${booking.price}\n` +
    `• *Transporter:* ${booking.transporterName || transporter?.name || 'Fleet Broker'}\n\n` +
    `👉 Open your Truck Owner Dashboard to Accept or Submit a Counter-Offer.`;

  await sendWhatsAppMessage(targetPhone, msg);
};

/**
 * 3. Sent on booking transit updates (Accepted, Loaded, In Transit)
 */
const notifyBookingStatusUpdate = async ({ booking, status, cargo, truck, shipper, transporter, recipients = [], receiverPhone }) => {
  const cargoTitle = booking.cargoTitle || cargo?.title || 'Shipment';
  const truckPlate = booking.truckPlate || truck?.plateNumber || 'Assigned Truck';
  const driverName = truck?.driverName || 'Assigned Driver';
  const driverMobile = truck?.driverMobile || 'N/A';
  const recipientList = extractRecipients(cargo, receiverPhone ? [{ phone: receiverPhone }] : recipients);

  console.log(`[WhatsApp Transit Notification] Status: ${status}, Found ${recipientList.length} recipient(s) to notify.`);

  if (status === 'Accepted') {
    // Notify Transporter
    if (transporter && transporter.phone) {
      const msg =
        `✅ *E-CARGO-BILTY: BOOKING ACCEPTED*\n\n` +
        `The truck owner has accepted your trip offer for *"${cargoTitle}"*!\n` +
        `• *Truck:* ${truckPlate}\n` +
        `• *Agreed Freight:* PKR ${booking.price}\n` +
        `• *Driver:* ${driverName} (${driverMobile})\n\n` +
        `Trip is confirmed and ready for loading.`;
      await sendWhatsAppMessage(transporter.phone, msg);
    }
    // Notify Shipper
    if (shipper && shipper.phone) {
      const msg =
        `✅ *E-CARGO-BILTY: TRUCK ASSIGNED*\n\n` +
        `Good news! Truck *${truckPlate}* has been assigned to your shipment *"${cargoTitle}"*.\n` +
        `• *Driver:* ${driverName} (${driverMobile})\n` +
        `• *Route:* ${cargo?.origin} ➔ ${cargo?.destination}`;
      await sendWhatsAppMessage(shipper.phone, msg);
    }
  }

  if (status === 'Loaded') {
    // Notify Shipper
    if (shipper && shipper.phone) {
      const msg =
        `📦 *E-CARGO-BILTY: CARGO LOADED*\n\n` +
        `Your goods *"${cargoTitle}"* have been safely loaded onto Truck *${truckPlate}* at ${cargo?.origin || 'Pickup Location'}.\n` +
        `The vehicle will depart shortly.`;
      await sendWhatsAppMessage(shipper.phone, msg);
    }

    // Notify ALL Recipients / Consignees
    for (const r of recipientList) {
      const recipientMsg =
        `📦 *E-CARGO-BILTY: SHIPMENT LOADED FOR DEPARTURE*\n\n` +
        `Hello *${r.name}*,\n` +
        `Your consignment *"${cargoTitle}"* has been loaded onto Truck *${truckPlate}* at ${cargo?.origin || 'Depot'} and will begin transit towards *${r.address || cargo?.destination}* shortly.\n\n` +
        `• *Assigned Driver:* ${driverName} (${driverMobile})`;
      await sendWhatsAppMessage(r.phone, recipientMsg);
    }
  }

  if (status === 'In Transit') {
    // Notify Shipper
    if (shipper && shipper.phone) {
      const msg =
        `🚛 *E-CARGO-BILTY: SHIPMENT IN TRANSIT*\n\n` +
        `Truck *${truckPlate}* carrying *"${cargoTitle}"* is now on the highway towards *${cargo?.destination}*.\n` +
        `• *Driver Contact:* ${driverName} (${driverMobile})\n` +
        `Track live location on your dashboard map.`;
      await sendWhatsAppMessage(shipper.phone, msg);
    }

    // Notify ALL Recipients / Consignees with SECRET DELIVERY CODE (OTP)
    const deliveryCode = booking.deliveryCode || 'N/A';
    for (const r of recipientList) {
      const msg =
        `🚚 *E-CARGO-BILTY: SHIPMENT IN TRANSIT TO YOUR DESTINATION*\n\n` +
        `Hello *${r.name}*,\n` +
        `Your delivery of *"${cargoTitle}"* is now on the highway and on its way to your destination (*${r.address || cargo?.destination}*) on Truck *${truckPlate}*!\n\n` +
        `• *Driver Name:* ${driverName}\n` +
        `• *Driver Mobile:* ${driverMobile}\n` +
        `• *From:* ${cargo?.origin || 'Origin'} ➔ *To:* ${r.address || cargo?.destination}\n\n` +
        `🔒 *YOUR SECRET DELIVERY CODE (OTP):* *${deliveryCode}*\n\n` +
        `⚠️ *IMPORTANT:* Please give this 4-digit verification code (*${deliveryCode}*) to the driver ONLY when the truck arrives at your gate and goods have been physically checked.`;
      await sendWhatsAppMessage(r.phone, msg);
    }
  }
};

/**
 * 4. Sent when delivery is completed & verified
 */
const notifyDeliveryCompleted = async (booking, cargo, shipper, recipients = []) => {
  const cargoTitle = booking.cargoTitle || cargo?.title || 'Shipment';
  const biltyNo = `BLT-${String(booking.id).padStart(6, '0')}`;
  const recipientList = extractRecipients(cargo, recipients);

  if (shipper && shipper.phone) {
    const msg =
      `🎉 *E-CARGO-BILTY: SHIPMENT DELIVERED & VERIFIED*\n\n` +
      `Your consignment *"${cargoTitle}"* has arrived safely at *${cargo?.destination || 'destination'}*.\n` +
      `• *Official Bilty:* ${biltyNo}\n` +
      `• *Condition:* ${booking.conditionStatus || 'Good Condition'}\n` +
      `• *Receiver Verification:* Code & Digital Signature Verified\n\n` +
      `📄 You can now download your official stamped E-Bilty PDF from the portal.`;

    await sendWhatsAppMessage(shipper.phone, msg);
  }

  // Notify ALL Recipients that delivery has closed
  for (const r of recipientList) {
    const msg =
      `🎉 *E-CARGO-BILTY: DELIVERY COMPLETED*\n\n` +
      `Hello *${r.name}*,\n` +
      `Consignment *"${cargoTitle}"* has been successfully delivered and verified.\n` +
      `• *Official Bilty:* ${biltyNo}\n` +
      `• *Condition Status:* ${booking.conditionStatus || 'Good Condition'}\n\n` +
      `Thank you for using E-Cargo-Bilty!`;
    await sendWhatsAppMessage(r.phone, msg);
  }
};

module.exports = {
  initWhatsApp,
  sendWhatsAppMessage,
  formatPhoneNumber,
  notifyCargoCreated,
  notifyBookingOffer,
  notifyBookingStatusUpdate,
  notifyDeliveryCompleted,
  getWhatsAppStatus: () => ({
    status: clientStatus,
    isReady,
    hasQr: Boolean(latestQr),
    qr: latestQr,
    myNumber: client?.info?.wid?.user || null
  })
};
