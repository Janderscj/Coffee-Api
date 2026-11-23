import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { faker } from '@faker-js/faker';
import MenuItem from '../models/menuItem.Model.js';
import { CATEGORIES } from '../utils/categories.js';

const TOTAL = 100_000;
const BATCH = 5_000;

await connectDB();

if (!mongoose.connection.name.includes('perf')) {
  console.error(
    `Refusing to seed "${mongoose.connection.name}". Use a database with "perf" in its name.`
  );
  process.exit(1);
}

await MenuItem.deleteMany({});

for (let i = 0; i < TOTAL; i += BATCH) {
  const docs = Array.from({ length: BATCH }, (_, j) => ({
    name: `${faker.commerce.productName()} ${i + j}`,
    description: faker.lorem.sentence(),
    price: Number((Math.random() * 10 + 2).toFixed(2)),
    category: CATEGORIES[(i + j) % CATEGORIES.length],
    isSpecial: Math.random() < 0.02,
    available: Math.random() < 0.9,
  }));
  await MenuItem.insertMany(docs);
  console.log(`Inserted ${i + BATCH} / ${TOTAL}`);
}

await mongoose.disconnect();
console.log('Done');
