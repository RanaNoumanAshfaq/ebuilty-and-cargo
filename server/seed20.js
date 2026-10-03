const sequelize = require('./db');
const User = require('./models/User');
const { Truck, Cargo, Booking, BookingMessage, Notification, Complaint } = require('./models/Logistics');

const USERS_DATA = [
  // 1. Admin
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
  // 2-7. Business Shippers (6 users)
  {
    name: 'Al-Rehman Cotton & Textiles',
    email: 'business@ecargo.com',
    password: 'password123',
    role: 'business',
    status: 'active',
    phone: '0321-5554321',
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
    name: 'Nishat Textile Mills Ltd',
    email: 'nishat.mills@ecargo.com',
    password: 'password123',
    role: 'business',
    status: 'active',
    phone: '0333-8901234',
    cnic: '35202-9182301-5',
    businessName: 'Nishat Mills Cargo Unit',
    businessRegNumber: 'NTN-0294812-3'
  },
  {
    name: 'Pak Suzuki Parts Supply',
    email: 'pak.suzuki@ecargo.com',
    password: 'password123',
    role: 'business',
    status: 'active',
    phone: '0345-2198734',
    cnic: '42201-7123904-7',
    businessName: 'Pak Suzuki Motor Co.',
    businessRegNumber: 'REG-KHI-44910'
  },
  {
    name: 'Fauji Fertilizer Logistics',
    email: 'fauji.fertilizer@ecargo.com',
    password: 'password123',
    role: 'business',
    status: 'active',
    phone: '0301-4455667',
    cnic: '37405-8822334-9',
    businessName: 'FFC Agri Distribution',
    businessRegNumber: 'NTN-1192834-5'
  },
  {
    name: 'Sitara Chemicals Industry',
    email: 'sitara.chem@ecargo.com',
    password: 'password123',
    role: 'business',
    status: 'active',
    phone: '0312-9988776',
    cnic: '33100-6677889-1',
    businessName: 'Sitara Chemical Industries',
    businessRegNumber: 'REG-FSD-33921'
  },
  // 8-12. Transporters (5 users)
  {
    name: 'Fast Track Freight Brokers',
    email: 'transporter@ecargo.com',
    password: 'password123',
    role: 'transporter',
    status: 'active',
    phone: '0300-8889999',
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
    name: 'Bilal Goods & Cargo Movers',
    email: 'bilal.cargo@ecargo.com',
    password: 'password123',
    role: 'transporter',
    status: 'active',
    phone: '0305-6677889',
    cnic: '35201-4433221-5',
    businessName: 'Bilal Goods Transport Agency',
    businessRegNumber: 'BG-LHR-2281'
  },
  {
    name: 'Khyber Freight Network',
    email: 'khyber.freight@ecargo.com',
    password: 'password123',
    role: 'transporter',
    status: 'active',
    phone: '0315-1122334',
    cnic: '17101-7788990-3',
    businessName: 'Khyber Pakhtunkhwa Transit',
    businessRegNumber: 'KFN-RWP-771'
  },
  {
    name: 'Indus Transit Systems',
    email: 'indus.transit@ecargo.com',
    password: 'password123',
    role: 'transporter',
    status: 'active',
    phone: '0323-9900112',
    cnic: '42301-2233445-7',
    businessName: 'Indus Port Link Logistics',
    businessRegNumber: 'IPL-KHI-8890'
  },
  // 13-18. Fleet Owners (6 users)
  {
    name: 'Tariq Mehmood',
    email: 'truckowner@ecargo.com',
    password: 'password123',
    role: 'truck_owner',
    status: 'active',
    phone: '0301-7776655',
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
    businessName: 'Khan & Brothers Transport',
    businessRegNumber: 'KBT-PESH-102'
  },
  {
    name: 'Chaudhry Akram Gujjar',
    email: 'gujjar.transport@ecargo.com',
    password: 'password123',
    role: 'truck_owner',
    status: 'active',
    phone: '0306-3322114',
    cnic: '34101-8877665-3',
    businessName: 'Gujjar Heavy Logistics',
    businessRegNumber: 'GHL-GUJ-551'
  },
  {
    name: 'Malik Jahangir',
    email: 'malik.heavy@ecargo.com',
    password: 'password123',
    role: 'truck_owner',
    status: 'active',
    phone: '0308-4455661',
    cnic: '36302-1122334-9',
    businessName: 'Malik Multan Haulage',
    businessRegNumber: 'MMH-MUL-442'
  },
  {
    name: 'Mir Sardar Baloch',
    email: 'baloch.logistics@ecargo.com',
    password: 'password123',
    role: 'truck_owner',
    status: 'active',
    phone: '0309-8877665',
    cnic: '54400-5566778-1',
    businessName: 'Quetta-Chaman Fleet',
    businessRegNumber: 'QCF-QUE-993'
  },
  {
    name: 'Mian Aslam Sialkoti',
    email: 'chaudhry.fleet@ecargo.com',
    password: 'password123',
    role: 'truck_owner',
    status: 'active',
    phone: '0310-7766554',
    cnic: '34201-9900112-7',
    businessName: 'Sialkot Export Carriers',
    businessRegNumber: 'SEC-SKT-331'
  },
  // 19-22. Drivers / Operators (4 users)
  {
    name: 'Muhammad Rasheed (Driver)',
    email: 'driver@ecargo.com',
    password: 'password123',
    role: 'truck_owner',
    status: 'active',
    phone: '0302-1239876',
    cnic: '37405-9988776-1',
    businessName: 'Rasheed Driver Services'
  },
  {
    name: 'Ustad Gulzar Ahmed',
    email: 'gulzar.driver@ecargo.com',
    password: 'password123',
    role: 'truck_owner',
    status: 'active',
    phone: '0333-5551234',
    cnic: '37405-4455667-2',
    businessName: 'Gulzar Long-Route Operations'
  },
  {
    name: 'Sher Khan Afridi',
    email: 'sherkhan.driver@ecargo.com',
    password: 'password123',
    role: 'truck_owner',
    status: 'active',
    phone: '0342-9911223',
    cnic: '17201-3322119-8',
    businessName: 'Khyber Pass Express'
  },
  {
    name: 'Bashir Ahmed Baloch',
    email: 'bashir.driver@ecargo.com',
    password: 'password123',
    role: 'truck_owner',
    status: 'active',
    phone: '0313-4455667',
    cnic: '54301-8899001-4',
    businessName: 'Coastal Highway Driver'
  }
];

async function seedCompleteSystem() {
  try {
    await sequelize.sync();
    console.log('🔄 Connecting to database and syncing schema...');

    const userMap = {};

    // 1. Seed or update 22 users
    console.log('👤 Seeding 22 diverse logistics users across Pakistan...');
    for (const u of USERS_DATA) {
      let existing = await User.findOne({ where: { email: u.email } });
      if (!existing) {
        existing = await User.create(u);
        console.log(`  + Created user: ${u.name} (${u.role}) - ${u.email}`);
      } else {
        await existing.update({
          name: u.name,
          phone: u.phone,
          cnic: u.cnic,
          businessName: u.businessName,
          businessRegNumber: u.businessRegNumber,
          status: 'active'
        });
      }
      userMap[u.email] = existing;
    }

    // 2. Seed Trucks across different fleet owners
    console.log('\n🚛 Seeding fleet trucks across Pakistani cities...');
    const TRUCKS_DATA = [
      { plateNumber: 'LHR-8824', capacity: '25 Tons', loc: 'Lahore', ownerEmail: 'truckowner@ecargo.com', status: 'Available', truckType: '10 Wheeler Flatbed', driverName: 'Muhammad Rasheed', driverMobile: '0302-1239876', lat: 31.5204, lng: 74.3587 },
      { plateNumber: 'ISB-4412', capacity: '40 Tons', loc: 'Rawalpindi', ownerEmail: 'truckowner@ecargo.com', status: 'Available', truckType: 'Heavy 18 Wheeler Trailer', driverName: 'Gulzar Ahmed', driverMobile: '0333-5551234', lat: 33.6844, lng: 73.0479 },
      { plateNumber: 'PES-9102', capacity: '35 Tons', loc: 'Peshawar', ownerEmail: 'khan.brothers@ecargo.com', status: 'Available', truckType: 'Heavy 18 Wheeler Trailer', driverName: 'Sher Khan Afridi', driverMobile: '0342-9911223', lat: 34.0151, lng: 71.5249 },
      { plateNumber: 'GUJ-3341', capacity: '15 Tons', loc: 'Gujranwala', ownerEmail: 'gujjar.transport@ecargo.com', status: 'In Transit', truckType: '6 Wheeler Open Body', driverName: 'Iftikhar Gujjar', driverMobile: '0306-1122334', lat: 32.1877, lng: 74.1945 },
      { plateNumber: 'MUL-7721', capacity: '30 Tons', loc: 'Multan', ownerEmail: 'malik.heavy@ecargo.com', status: 'Available', truckType: 'Flatbed Container Carrier', driverName: 'Sohail Malik', driverMobile: '0308-9900112', lat: 30.1575, lng: 71.5249 },
      { plateNumber: 'QUE-1109', capacity: '22 Tons', loc: 'Quetta', ownerEmail: 'baloch.logistics@ecargo.com', status: 'Available', truckType: 'Reefer / Refrigerated Truck', driverName: 'Bashir Ahmed Baloch', driverMobile: '0313-4455667', lat: 30.1798, lng: 66.9750 },
      { plateNumber: 'SKT-5582', capacity: '8 Tons', loc: 'Sialkot', ownerEmail: 'chaudhry.fleet@ecargo.com', status: 'Available', truckType: 'Mazda / Shehzore Small Truck', driverName: 'Naveed Sialkoti', driverMobile: '0310-4433221', lat: 32.4945, lng: 74.5229 },
      { plateNumber: 'KHI-6634', capacity: '45 Tons', loc: 'Karachi', ownerEmail: 'truckowner@ecargo.com', status: 'Available', truckType: '22 Wheeler Multi-Axle Hauler', driverName: 'Zahid Hussain', driverMobile: '0321-7788990', lat: 24.8607, lng: 67.0011 },
      { plateNumber: 'FSD-2201', capacity: '18 Tons', loc: 'Faisalabad', ownerEmail: 'gujjar.transport@ecargo.com', status: 'Available', truckType: '10 Wheeler Flatbed', driverName: 'Qasim Ali', driverMobile: '0300-3344556', lat: 31.4504, lng: 73.1350 },
      { plateNumber: 'RWP-9031', capacity: '28 Tons', loc: 'Islamabad', ownerEmail: 'khan.brothers@ecargo.com', status: 'In Transit', truckType: 'Curtain-side Box Trailer', driverName: 'Farhan Khan', driverMobile: '0333-8899001', lat: 33.6844, lng: 73.0479 }
    ];

    const truckMap = {};
    for (const t of TRUCKS_DATA) {
      const owner = userMap[t.ownerEmail];
      if (!owner) continue;

      let existing = await Truck.findOne({ where: { plateNumber: t.plateNumber } });
      if (!existing) {
        existing = await Truck.create({
          plateNumber: t.plateNumber,
          capacity: t.capacity,
          loc: t.loc,
          ownerId: owner.id,
          status: t.status,
          truckType: t.truckType,
          driverName: t.driverName,
          driverMobile: t.driverMobile,
          lat: t.lat,
          lng: t.lng
        });
        console.log(`  + Created truck: ${t.plateNumber} (${t.truckType}) in ${t.loc}`);
      }
      truckMap[t.plateNumber] = existing;
    }

    // 3. Seed Cargo Requests
    console.log('\n📦 Seeding cargo consignments across Pakistan trade routes...');
    const CARGO_DATA = [
      {
        title: 'Industrial Cotton Yarn Bales (Export Grade)',
        weight: '25 Tons',
        origin: 'Faisalabad',
        destination: 'Karachi',
        businessEmail: 'business@ecargo.com',
        transporterEmail: 'transporter@ecargo.com',
        status: 'Truck Assigned',
        assignedTruck: 'LHR-8824',
        packagingType: 'Bales / Bundles',
        declaredValue: 'PKR 8,500,000',
        paymentTerms: 'To-Pay',
        baseFare: 145000,
        fuelSurcharge: 12000,
        taxAmount: 7850,
        totalFare: 164850,
        products: [
          { name: 'Grade-A Combed Cotton Yarn (Count 40/1)', quantity: 240, weight: '25 Tons' }
        ],
        pickupDetails: {
          address: 'Plot 42, Millat Industrial Estate, Faisalabad',
          contact: '0321-5554321',
          date: '2026-10-05'
        },
        recipients: [
          { name: 'Apex Shipping Port Qasim Terminal', address: 'Berth 7, Port Qasim, Karachi', phone: '0300-1122334' }
        ]
      },
      {
        title: 'Spices, Recipe Mixes & Processed Food Cartons',
        weight: '18 Tons',
        origin: 'Karachi',
        destination: 'Lahore',
        businessEmail: 'shan.foods@ecargo.com',
        transporterEmail: 'indus.transit@ecargo.com',
        status: 'In Transit',
        assignedTruck: 'GUJ-3341',
        packagingType: 'Corrugated Cartons',
        declaredValue: 'PKR 12,000,000',
        paymentTerms: 'Prepaid',
        baseFare: 135000,
        fuelSurcharge: 11000,
        taxAmount: 7300,
        totalFare: 153300,
        products: [
          { name: 'Biryani & Curry Masala Mix Cartons', quantity: 1800, weight: '18 Tons' }
        ],
        pickupDetails: {
          address: 'Shan Foods Sector 23, Korangi Industrial Area, Karachi',
          contact: '0322-4412389',
          date: '2026-10-04'
        },
        recipients: [
          { name: 'Shan Foods Central Distribution Center', address: 'Multan Road near Thokar Niaz Baig, Lahore', phone: '0321-9988771' }
        ]
      },
      {
        title: 'Dyed Finished Denim Fabrics & Canvas Rolls',
        weight: '30 Tons',
        origin: 'Lahore',
        destination: 'Sialkot',
        businessEmail: 'nishat.mills@ecargo.com',
        transporterEmail: 'bilal.cargo@ecargo.com',
        status: 'Pending',
        packagingType: 'Fabric Rolls on Wooden Pallets',
        declaredValue: 'PKR 15,200,000',
        paymentTerms: 'Prepaid',
        baseFare: 75000,
        fuelSurcharge: 6000,
        taxAmount: 4050,
        totalFare: 85050,
        products: [
          { name: 'Stretch Denim Fabric 12oz Rolls', quantity: 350, weight: '30 Tons' }
        ],
        pickupDetails: {
          address: 'Nishat Dyeing Unit 2, 22km Ferozepur Road, Lahore',
          contact: '0333-8901234',
          date: '2026-10-06'
        },
        recipients: [
          { name: 'Forward Sports Apparel Hub', address: 'Export Processing Zone, Sambrial Road, Sialkot', phone: '0301-4455662' }
        ]
      },
      {
        title: 'OEM Automotive Spare Parts & Engine Blocks',
        weight: '22 Tons',
        origin: 'Karachi',
        destination: 'Rawalpindi',
        businessEmail: 'pak.suzuki@ecargo.com',
        transporterEmail: 'khyber.freight@ecargo.com',
        status: 'Truck Assigned',
        assignedTruck: 'ISB-4412',
        packagingType: 'Reinforced Wooden Crates',
        declaredValue: 'PKR 21,000,000',
        paymentTerms: 'To-Pay',
        baseFare: 165000,
        fuelSurcharge: 14000,
        taxAmount: 8950,
        totalFare: 187950,
        products: [
          { name: 'Chassis Assemblies & Engine Radiators', quantity: 450, weight: '22 Tons' }
        ],
        pickupDetails: {
          address: 'Pak Suzuki Plant Bin Qasim, Karachi',
          contact: '0345-2198734',
          date: '2026-10-05'
        },
        recipients: [
          { name: 'Rawalpindi Motors Regional Spare Depot', address: 'Peshawar Road near Westridge, Rawalpindi', phone: '0300-5544332' }
        ]
      },
      {
        title: 'Granular Urea Fertilizer in Sealed Bags',
        weight: '40 Tons',
        origin: 'Multan',
        destination: 'Peshawar',
        businessEmail: 'fauji.fertilizer@ecargo.com',
        transporterEmail: 'silkroute.logistics@ecargo.com',
        status: 'In Transit',
        assignedTruck: 'RWP-9031',
        packagingType: '50kg HDPE Polypropylene Bags',
        declaredValue: 'PKR 6,400,000',
        paymentTerms: 'Prepaid',
        baseFare: 180000,
        fuelSurcharge: 15000,
        taxAmount: 9750,
        totalFare: 204750,
        products: [
          { name: 'Sona Urea 46% Nitrogen', quantity: 800, weight: '40 Tons' }
        ],
        pickupDetails: {
          address: 'FFC Goth Machhi Hub, Khanewal Road, Multan',
          contact: '0301-4455667',
          date: '2026-10-03'
        },
        recipients: [
          { name: 'Khyber Agri Inputs Warehouse', address: 'Ring Road near Charsadda Interchange, Peshawar', phone: '0312-3344556' }
        ]
      },
      {
        title: 'Liquid Bleach & Caustic Soda Flakes in Drums',
        weight: '20 Tons',
        origin: 'Faisalabad',
        destination: 'Gujranwala',
        businessEmail: 'sitara.chem@ecargo.com',
        transporterEmail: 'bilal.cargo@ecargo.com',
        status: 'Pending',
        packagingType: 'Steel & HDPE Drums',
        declaredValue: 'PKR 4,800,000',
        paymentTerms: 'Prepaid',
        baseFare: 65000,
        fuelSurcharge: 5000,
        taxAmount: 3500,
        totalFare: 73500,
        products: [
          { name: 'Caustic Soda Flakes 99%', quantity: 400, weight: '20 Tons' }
        ],
        pickupDetails: {
          address: 'Sitara Chemical Complex, Sheikhupura Road, Faisalabad',
          contact: '0312-9988776',
          date: '2026-10-06'
        },
        recipients: [
          { name: 'Gujranwala Sanitary & Ceramic Works', address: 'G.T. Road, Climaxabad, Gujranwala', phone: '0305-7788990' }
        ]
      }
    ];

    const cargoMap = {};
    for (const c of CARGO_DATA) {
      const bUser = userMap[c.businessEmail];
      const tUser = userMap[c.transporterEmail];
      if (!bUser) continue;

      let existing = await Cargo.findOne({ where: { title: c.title, businessOwnerId: bUser.id } });
      if (!existing) {
        existing = await Cargo.create({
          title: c.title,
          weight: c.weight,
          origin: c.origin,
          destination: c.destination,
          businessOwnerId: bUser.id,
          transporterId: tUser ? tUser.id : null,
          status: c.status,
          assignedTruck: c.assignedTruck,
          packagingType: c.packagingType,
          declaredValue: c.declaredValue,
          paymentTerms: c.paymentTerms,
          baseFare: c.baseFare,
          fuelSurcharge: c.fuelSurcharge,
          taxAmount: c.taxAmount,
          totalFare: c.totalFare,
          products: c.products,
          pickupDetails: c.pickupDetails,
          recipients: c.recipients
        });
        console.log(`  + Created cargo: "${c.title}" (${c.origin} -> ${c.destination})`);
      }
      cargoMap[c.title] = existing;
    }

    // 4. Seed Active Bookings
    console.log('\n📄 Seeding active freight bookings and e-Bilties...');
    const BOOKINGS_DATA = [
      {
        truckPlate: 'LHR-8824',
        cargoTitle: 'Industrial Cotton Yarn Bales (Export Grade)',
        transporterEmail: 'transporter@ecargo.com',
        price: 'PKR 164,850',
        status: 'Accepted',
        deliveryCode: 'BLTY-8842',
        eta: 'Oct 07, 2026 - 18:00'
      },
      {
        truckPlate: 'GUJ-3341',
        cargoTitle: 'Spices, Recipe Mixes & Processed Food Cartons',
        transporterEmail: 'indus.transit@ecargo.com',
        price: 'PKR 153,300',
        status: 'In Transit',
        deliveryCode: 'BLTY-9921',
        eta: 'Oct 06, 2026 - 14:00'
      },
      {
        truckPlate: 'ISB-4412',
        cargoTitle: 'OEM Automotive Spare Parts & Engine Blocks',
        transporterEmail: 'khyber.freight@ecargo.com',
        price: 'PKR 187,950',
        status: 'Accepted',
        deliveryCode: 'BLTY-3301',
        eta: 'Oct 08, 2026 - 10:00'
      },
      {
        truckPlate: 'RWP-9031',
        cargoTitle: 'Granular Urea Fertilizer in Sealed Bags',
        transporterEmail: 'silkroute.logistics@ecargo.com',
        price: 'PKR 204,750',
        status: 'In Transit',
        deliveryCode: 'BLTY-7712',
        eta: 'Oct 06, 2026 - 22:00'
      }
    ];

    for (const b of BOOKINGS_DATA) {
      const truck = truckMap[b.truckPlate];
      const cargo = cargoMap[b.cargoTitle];
      const transporter = userMap[b.transporterEmail];
      if (!truck || !cargo || !transporter) continue;

      let existing = await Booking.findOne({ where: { truckPlate: b.truckPlate, cargoId: cargo.id } });
      if (!existing) {
        existing = await Booking.create({
          truckId: truck.id,
          truckPlate: truck.plateNumber,
          truckOwnerId: truck.ownerId,
          cargoId: cargo.id,
          cargoTitle: cargo.title,
          transporterId: transporter.id,
          transporterName: transporter.businessName || transporter.name,
          price: b.price,
          status: b.status,
          deliveryCode: b.deliveryCode,
          eta: b.eta,
          conditionStatus: 'Secure & Sealed'
        });
        console.log(`  + Created booking: #${existing.id} ${b.cargoTitle} [${b.status}]`);
      }
    }

    // 5. Seed sample notifications
    console.log('\n🔔 Seeding sample transit alerts...');
    const NOTIFS = [
      { email: 'business@ecargo.com', message: 'E-Bilty #BLTY-8842 issued for Industrial Cotton Yarn Bales. Truck LHR-8824 assigned.' },
      { email: 'transporter@ecargo.com', message: 'Truck Owner Tariq Mehmood accepted booking for LHR-8824 (PKR 164,850).' },
      { email: 'truckowner@ecargo.com', message: 'New dispatch offer accepted for Truck LHR-8824: Faisalabad to Karachi.' },
      { email: 'shan.foods@ecargo.com', message: 'Consignment #BLTY-9921 is now IN TRANSIT on Super Highway (N-5).' }
    ];
    for (const n of NOTIFS) {
      const u = userMap[n.email];
      if (u) {
        await Notification.findOrCreate({
          where: { userId: u.id, message: n.message },
          defaults: { userId: u.id, message: n.message, isRead: false }
        });
      }
    }

    // 6. Seed sample complaints for Admin audit
    console.log('\n📝 Seeding sample complaints for Admin oversight...');
    const COMPLAINTS = [
      { email: 'business@ecargo.com', subject: 'Loading Delay at Port Qasim Gate 3', description: 'Container terminal clearance delayed by 4 hours due to customs queue.' },
      { email: 'truckowner@ecargo.com', subject: 'Toll Plaza E-Tag Scanner Issue', description: 'M-2 Toll Plaza Ravi scanner was non-responsive for registered commercial tags.' }
    ];
    for (const c of COMPLAINTS) {
      const u = userMap[c.email];
      if (u) {
        await Complaint.findOrCreate({
          where: { userId: u.id, subject: c.subject },
          defaults: {
            userId: u.id,
            userName: u.name,
            userRole: u.role,
            subject: c.subject,
            description: c.description,
            status: 'Open'
          }
        });
      }
    }

    console.log('\n🎉 SUCCESS: 22 Users, 10 Fleet Trucks, 6 Cargo Shipments, 4 Active Bilties & Complaints successfully seeded!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedCompleteSystem();
