const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Vehicle = require("./models/Vehicle");
const Tour = require("./models/Tour");
const Booking = require("./models/Booking");
const Message = require("./models/Message");

const seedDatabase = async () => {
  const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/khan-tourism";
  
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existings
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Tour.deleteMany({});
    await Booking.deleteMany({});
    await Message.deleteMany({});

    console.log("Existing collections cleared.");

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash("admin123", salt);
    const hashUserPassword = await bcrypt.hash("user123", salt);

    const adminUser = await User.create({
      name: "Abdullah Khan",
      email: "admin@khantourism.com",
      password: hashPassword,
      role: "admin",
      phone: "0336-5004848",
      verificationStatus: "verified",
    });

    const standardUser = await User.create({
      name: "Rana Nouman",
      email: "user@gmail.com",
      password: hashUserPassword,
      role: "user",
      phone: "0311-5353751",
      verificationStatus: "verified",
    });

    console.log("Users seeded successfully.");

    // 2. Seed Vehicles
    const vehiclesData = [
      {
        name: "Toyota Corolla GLI",
        model: "GLI 2015",
        category: "Economy",
        pricePerDay: 8000,
        images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop"],
        transmission: "Automatic",
        fuelEconomy: "12 km/L",
        capacity: 4,
        features: ["AC", "Airbags", "Bluetooth", "Comfort Seats"],
        isAvailable: true,
        driverIncluded: true,
        luxuryBadge: false
      },
      {
        name: "Toyota Corolla Grande",
        model: "Grande 2022",
        category: "Sedan",
        pricePerDay: 15000,
        images: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=600&auto=format&fit=crop"],
        transmission: "Automatic",
        fuelEconomy: "13 km/L",
        capacity: 5,
        features: ["AC", "Sunroof", "Leather Interior", "Cruise Control"],
        isAvailable: true,
        driverIncluded: true,
        luxuryBadge: false
      },
      {
        name: "Toyota Prado TX L",
        model: "Prado 2018",
        category: "SUV",
        pricePerDay: 35000,
        images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop"],
        transmission: "Automatic",
        fuelEconomy: "8 km/L",
        capacity: 7,
        features: ["AC", "Panoramic Sunroof", "Heated Seats", "4x4 Drive Mode"],
        isAvailable: true,
        driverIncluded: true,
        luxuryBadge: true
      },
      {
        name: "Toyota Hiace Grand Cabin",
        model: "Hiace 2020",
        category: "Van",
        pricePerDay: 22000,
        images: ["https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop"],
        transmission: "Manual",
        fuelEconomy: "10 km/L",
        capacity: 14,
        features: ["AC", "High Roof", "Reclining Seats", "LED TV Screen"],
        isAvailable: true,
        driverIncluded: true,
        luxuryBadge: false
      }
    ];

    await Vehicle.insertMany(vehiclesData);
    console.log("Vehicles seeded successfully.");

    // 3. Seed Tours
    const toursData = [
      {
        name: "Hunza Valley Autumn Luxury Tour",
        days: "5 Days / 4 Nights",
        price: 95000,
        image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1000&auto=format&fit=crop",
        category: "Adventure",
        description: "Experience the mesmerizing autumn colors of Hunza Valley. This premium tour package includes guided road travel in Prado SUVs, top-tier accommodations, dynamic local meals, and sightseeing entry passes.",
        highlights: ["Attabad Lake Boating", "Altit & Baltit Fort tours", "Passu Cones Sightseeing", "Khunjerab Pass (China Border)"],
        itinerary: [
          { day: 1, title: "Departure from Islamabad", description: "Drive to Chilas/Naran via Hazara Motorway. Stay in Serena hotel or equivalent." },
          { day: 2, title: "Journey to Karimabad (Hunza)", description: "Pass by meeting place of 3 mountain ranges. Check-in to Hunza hotel and explore local bazaar." },
          { day: 3, title: "Altit Fort & Attabad Lake", description: "Visit the historical Altit & Baltit Forts. Boat ride on the pristine turquoise Attabad Lake." },
          { day: 4, title: "Passu Cones & China Border", description: "Sightseeing of majestic Passu Cones. Drive to Khunjerab Pass (highest paved border crossing)." },
          { day: 5, title: "Return Voyage to Islamabad", description: "Drive back to Islamabad with memories of beautiful valleys." }
        ],
        bestTime: "September to November",
        activities: ["Sightseeing", "Boating", "Photography", "Cultural Tours"],
        weatherInfo: "Average temperature: 8°C - 15°C in autumn. Nights are chilly.",
        packingChecklist: ["Heavy jacket", "Gloves", "Thermal wear", "Hiking boots", "Sunglasses"]
      },
      {
        name: "Skardu Majestic Peaks Tour",
        days: "7 Days / 6 Nights",
        price: 135000,
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
        category: "Adventure",
        description: "Explore the giant Karakoram peaks, cold deserts, and high-altitude lakes of Skardu. Best suited for families looking for raw beauty with luxury arrangements.",
        highlights: ["Shangrila Resort visit", "Upper Kachura Lake boating", "Katpana Cold Desert Safari", "Deosai Plains expedition"],
        itinerary: [
          { day: 1, title: "Fly to Skardu or road travel", description: "Arrive at Skardu, check-in to hotel and relax." },
          { day: 2, title: "Shangrila & Kachura Lakes", description: "Explore the iconic Shangrila Resort. Hike up to Upper Kachura Lake." },
          { day: 3, title: "Shigar Valley Fort", description: "Drive to Shigar. Visit Shigar Fort and enjoy local Balti cuisine." },
          { day: 4, title: "Deosai National Park", description: "Day trip to the second highest plateau in the world, Deosai Plains. Spot Himalayan bears." },
          { day: 5, title: "Katpana Sand Dunes", description: "Visit the unique cold desert dunes at Katpana. Enjoy desert quad biking." },
          { day: 6, title: "Manthoka Waterfall", description: "Drive to Manthoka and enjoy a local picnic lunch." },
          { day: 7, title: "Departure", description: "Flight back or road departure to Islamabad." }
        ],
        bestTime: "June to September",
        activities: ["Jeep Safari", "Trekking", "Camping", "Lakeside Boating"],
        weatherInfo: "Sunny days (20°C) with cold winds. Very pleasant summers.",
        packingChecklist: ["Windcheater jacket", "Hiking poles", "Sunblock cream", "Light woolens"]
      },
      {
        name: "Swat Valley & Kalam Family Retreat",
        days: "4 Days / 3 Nights",
        price: 65000,
        image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1000&auto=format&fit=crop",
        category: "Family",
        description: "The Switzerland of East, Swat, offers lush green meadows, gushing rivers, and pine forests. This budget-friendly family tour covers all top sightseeing sites.",
        highlights: ["Malam Jabba Ski Resort", "Fizagat Park riverfront", "Kalam Forest walk", "Ushu Forest safari"],
        itinerary: [
          { day: 1, title: "Drive to Mingora (Swat)", description: "Travel via Swat Motorway. Check-in to hotel. Riverside evening walk." },
          { day: 2, title: "Malam Jabba Day Tour", description: "Enjoy chairlift rides, ziplines, and winter skiing (seasonal) at Malam Jabba." },
          { day: 3, title: "Kalam Forest Expedition", description: "Drive to Kalam. Visit the ancient Ushu pine forest and Mahodand Lake." },
          { day: 4, title: "Return Drive", description: "Explore local handicrafts bazaar and drive back to Islamabad." }
        ],
        bestTime: "April to October",
        activities: ["Chairlift", "Zipline", "River rafting", "Meadow walks"],
        weatherInfo: "Temperate summers around 24°C. Very pleasant weather.",
        packingChecklist: ["Light jacket", "Comfortable sneakers", "Umbrella", "Personal medicine kit"]
      }
    ];

    await Tour.insertMany(toursData);
    console.log("Tours seeded successfully.");

    // 4. Seed Bookings linked to test user
    const bookingsData = [
      {
        user: standardUser._id,
        type: "Car",
        itemName: "Toyota Corolla Grande",
        startDate: "2026-07-10",
        endDate: "2026-07-15",
        totalDays: 5,
        totalPrice: 75000,
        timelineStatus: "Booking Confirmed",
        details: {
          peopleCount: 4,
          driverName: "Karamat Shah",
          driverPhone: "0301-7654321",
          driverPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
          driverVehicleNo: "ICT-LE-392"
        }
      },
      {
        user: standardUser._id,
        type: "Tour",
        itemName: "Hunza Valley Autumn Luxury Tour",
        startDate: "2026-09-12",
        totalDays: 5,
        totalPrice: 95000,
        timelineStatus: "Quotation Sent",
        details: {
          peopleCount: 2
        }
      }
    ];

    await Booking.insertMany(bookingsData);
    console.log("Bookings seeded successfully.");

    console.log("🎉 Database fully seeded!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database: ", error);
    process.exit(1);
  }
};

seedDatabase();
