import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from '../models/menuItemModel.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedData = [
  // Espresso
  {
    name: 'Espresso',
    description: 'Bold and rich single shot of espresso',
    price: 2.50,
    category: 'Espresso',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Double Espresso',
    description: 'Two shots of espresso for extra strength',
    price: 3.00,
    category: 'Espresso',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Americano',
    description: 'Espresso with hot water',
    price: 2.75,
    category: 'Espresso',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Macchiato',
    description: 'Espresso with a touch of steamed milk',
    price: 3.25,
    category: 'Espresso',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Lungo',
    description: 'Long espresso with more water',
    price: 2.75,
    category: 'Espresso',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Ristretto',
    description: 'Short, concentrated espresso shot',
    price: 2.75,
    category: 'Espresso',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Red Eye',
    description: 'Americano with an espresso shot',
    price: 3.50,
    category: 'Espresso',
    isSpecial: true,
    available: true,
  },

  // Hot
  {
    name: 'Cappuccino',
    description: 'Espresso with equal parts steamed milk and foam',
    price: 4.00,
    category: 'Hot',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Latte',
    description: 'Espresso with steamed milk and light foam',
    price: 4.00,
    category: 'Hot',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Mocha',
    description: 'Espresso with steamed milk and chocolate',
    price: 4.50,
    category: 'Hot',
    isSpecial: true,
    available: true,
  },
  {
    name: 'Flat White',
    description: 'Espresso with velvety steamed milk',
    price: 4.25,
    category: 'Hot',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Hot Chocolate',
    description: 'Rich and creamy hot chocolate',
    price: 3.75,
    category: 'Hot',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Caramel Macchiato',
    description: 'Macchiato with caramel drizzle',
    price: 4.75,
    category: 'Hot',
    isSpecial: true,
    available: true,
  },
  {
    name: 'Cortado',
    description: 'Espresso with equal parts steamed milk',
    price: 3.75,
    category: 'Hot',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Affogato',
    description: 'Espresso poured over vanilla ice cream',
    price: 4.50,
    category: 'Hot',
    isSpecial: true,
    available: true,
  },

  // Iced
  {
    name: 'Iced Coffee',
    description: 'Cold brew coffee over ice',
    price: 3.00,
    category: 'Iced',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Iced Latte',
    description: 'Espresso with cold milk over ice',
    price: 4.00,
    category: 'Iced',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Iced Cappuccino',
    description: 'Espresso with cold milk and foam over ice',
    price: 4.00,
    category: 'Iced',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Iced Mocha',
    description: 'Espresso with cold milk and chocolate over ice',
    price: 4.50,
    category: 'Iced',
    isSpecial: true,
    available: true,
  },
  {
    name: 'Iced Vanilla Latte',
    description: 'Iced latte with vanilla syrup',
    price: 4.50,
    category: 'Iced',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Iced Caramel Latte',
    description: 'Iced latte with caramel syrup',
    price: 4.50,
    category: 'Iced',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Iced Hazelnut Latte',
    description: 'Iced latte with hazelnut syrup',
    price: 4.50,
    category: 'Iced',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Iced Americano',
    description: 'Espresso with cold water over ice',
    price: 3.25,
    category: 'Iced',
    isSpecial: false,
    available: true,
  },

  // Tea
  {
    name: 'Green Tea',
    description: 'Fresh brewed green tea',
    price: 2.75,
    category: 'Tea',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Black Tea',
    description: 'Classic black tea with steamed milk',
    price: 3.25,
    category: 'Tea',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Chai Tea Latte',
    description: 'Spiced chai tea with steamed milk',
    price: 4.00,
    category: 'Tea',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Iced Tea',
    description: 'Refreshing iced tea',
    price: 2.75,
    category: 'Tea',
    isSpecial: false,
    available: true,
  },
  {
    name: 'London Fog',
    description: 'Earl Grey tea with vanilla and milk',
    price: 4.00,
    category: 'Tea',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Matcha Latte',
    description: 'Creamy matcha green tea latte',
    price: 4.50,
    category: 'Tea',
    isSpecial: true,
    available: true,
  },

  // Protein
  {
    name: 'Protein Coffee',
    description: 'Latte with added protein powder',
    price: 5.00,
    category: 'Protein',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Protein Shake - Vanilla',
    description: 'Creamy vanilla protein shake',
    price: 5.50,
    category: 'Protein',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Protein Shake - Chocolate',
    description: 'Rich chocolate protein shake',
    price: 5.50,
    category: 'Protein',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Protein Shake - Strawberry',
    description: 'Fresh strawberry protein shake',
    price: 5.50,
    category: 'Protein',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Protein Espresso',
    description: 'Double espresso with protein powder',
    price: 5.00,
    category: 'Protein',
    isSpecial: false,
    available: true,
  },

  // Caffeine Free
  {
    name: 'Herbal Tea',
    description: 'Soothing herbal tea blend',
    price: 2.75,
    category: 'Caffeine Free',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Decaf Latte',
    description: 'Decaffeinated latte with steamed milk',
    price: 4.00,
    category: 'Caffeine Free',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Steamed Milk',
    description: 'Hot steamed milk',
    price: 2.50,
    category: 'Caffeine Free',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Decaf Cappuccino',
    description: 'Decaffeinated cappuccino with foam',
    price: 4.00,
    category: 'Caffeine Free',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Rooibos Latte',
    description: 'Red rooibos tea with steamed milk',
    price: 4.00,
    category: 'Caffeine Free',
    isSpecial: false,
    available: true,
  },

  // Pastry
  {
    name: 'Croissant',
    description: 'Buttery French croissant',
    price: 3.50,
    category: 'Pastry',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Chocolate Croissant',
    description: 'Croissant with chocolate filling',
    price: 3.75,
    category: 'Pastry',
    isSpecial: true,
    available: true,
  },
  {
    name: 'Blueberry Muffin',
    description: 'Fresh blueberry muffin',
    price: 3.00,
    category: 'Pastry',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Almond Biscotti',
    description: 'Crispy almond biscotti',
    price: 2.50,
    category: 'Pastry',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Cinnamon Roll',
    description: 'Warm cinnamon roll with frosting',
    price: 4.00,
    category: 'Pastry',
    isSpecial: true,
    available: true,
  },
  {
    name: 'Chocolate Chip Cookie',
    description: 'Warm chocolate chip cookie',
    price: 2.75,
    category: 'Pastry',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Lemon Poppy Muffin',
    description: 'Tangy lemon poppy seed muffin',
    price: 3.00,
    category: 'Pastry',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Banana Bread',
    description: 'Moist banana bread slice',
    price: 3.25,
    category: 'Pastry',
    isSpecial: false,
    available: true,
  },
  {
    name: 'Danish Pastry',
    description: 'Sweet danish with fruit filling',
    price: 3.50,
    category: 'Pastry',
    isSpecial: true,
    available: true,
  },
  {
    name: 'Scone with Cream',
    description: 'Fluffy scone with clotted cream',
    price: 3.75,
    category: 'Pastry',
    isSpecial: false,
    available: true,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing items
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');
    
    // Insert seed data
    const inserted = await MenuItem.insertMany(seedData);
    console.log(`Successfully seeded database with ${inserted.length} menu items`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Temporarily disabled - switching to 100k entry seed
// seedDatabase();
console.log('Menu seed script disabled temporarily');
