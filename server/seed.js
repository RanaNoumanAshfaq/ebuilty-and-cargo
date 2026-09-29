const sequelize = require('./db');
const User = require('./models/User');
const { Truck, Cargo, Booking } = require('./models/Logistics');

async function seed() {
  try {
    await sequelize.sync();
    console.log('Database connected, starting seed...');

    // 1. Create or find Admin
    let admin = await User.findOne({ where: { email: 'admin@ecargo.com' } });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@ecargo.com',
        password: 'password123',
        role: 'admin',
        status: 'active',
        phone: '0300-0000000',
        cnic: '37405-0000000-0'
      });
      console.log('✅ Admin created: admin@ecargo.com');
    }

    // 2. Create or find Business Owner
    let business = await User.findOne({ where: { email: 'business@ecargo.com' } });
    if (!business) {
      business = await User.create({
        name: 'Al-Rehman Enterprises',
        email: 'business@ecargo.com',
        password: 'password123',
        role: 'business',
        status: 'active',
        businessName: 'Al-Rehman Cotton & Textiles',
        businessRegNumber: 'REG-PK-88421',
        phone: '0321-5554321',
        cnic: '37405-1234567-1'
      });
      console.log('✅ Business Owner created: business@ecargo.com');
    }

    // 3. Create or find Transporter
    let transporter = await User.findOne({ where: { email: 'transporter@ecargo.com' } });
    if (!transporter) {
      transporter = await User.create({
        name: 'Fast Track Logistics',
        email: 'transporter@ecargo.com',
        password: 'password123',
        role: 'transporter',
        status: 'active',
        businessName: 'Fast Track Freight Brokers',
        businessRegNumber: 'FT-LOG-5421',
        phone: '0300-8889999',
        cnic: '37405-2345678-2'
      });
      console.log('✅ Transporter created: transporter@ecargo.com');
    }

    // 4. Create or find Truck Owner
    let truckOwner = await User.findOne({ where: { email: 'truckowner@ecargo.com' } });
    if (!truckOwner) {
      truckOwner = await User.create({
        name: 'Tariq Mehmood',
        email: 'truckowner@ecargo.com',
        password: 'password123',
        role: 'truck_owner',
        status: 'active',
        phone: '0301-7776655',
        cnic: '37405-3456789-3'
      });
      console.log('✅ Truck Owner created: truckowner@ecargo.com');
    }

    // 5. Create Sample Trucks for Truck Owner
    const existingTrucks = await Truck.count({ where: { ownerId: truckOwner.id } });
    if (existingTrucks === 0) {
      await Truck.create({
        plateNumber: 'LHR-8824',
        capacity: '25 Tons',
        loc: 'Lahore',
        ownerId: truckOwner.id,
        status: 'Available',
        truckType: '10 Wheeler Flatbed',
        driverName: 'Muhammad Rasheed',
        driverMobile: '0302-1239876',
        lat: 31.5204,
        lng: 74.3587
      });

      await Truck.create({
        plateNumber: 'ISB-4412',
        capacity: '40 Tons',
        loc: 'Rawalpindi',
        ownerId: truckOwner.id,
        status: 'Available',
        truckType: 'Heavy 18 Wheeler Trailer',
        driverName: 'Gulzar Ahmed',
        driverMobile: '0333-5551234',
        lat: 33.6844,
        lng: 73.0479
      });
      console.log('✅ Sample trucks created for Truck Owner');
    }

    // 6. Create Sample Cargo for Business Owner
    const existingCargo = await Cargo.count({ where: { businessOwnerId: business.id } });
    if (existingCargo === 0) {
      await Cargo.create({
        title: 'Industrial Cotton Yarn Bales',
        weight: '20',
        origin: 'Faisalabad Textile Hub',
        destination: 'Karachi Port Qasim',
        businessOwnerId: business.id,
        transporterId: transporter.id,
        status: 'Pending',
        products: [
          { name: 'Grade-A Cotton Yarn', quantity: 120, weight: '20 Tons' }
        ],
        pickupDetails: {
          address: 'Plot 42, Industrial Estate, Faisalabad',
          contact: '0321-5554321',
          date: new Date().toISOString().split('T')[0]
        },
        recipients: [
          { name: 'Apex Shipping & Export Terminal', address: 'Berth 5, Port Qasim, Karachi', phone: '0300-1122334' }
        ]
      });
      console.log('✅ Sample cargo request created');
    }

    console.log('\n🎉 Database successfully seeded with demo accounts & sample data!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seed();
