import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

// Convert exec to promise-based
const execPromise = promisify(exec);

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// MongoDB connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return false;
  }
};

// Run a seed script
const runSeedScript = async (scriptName) => {
  try {
    console.log(`Running ${scriptName}...`);
    const { stdout, stderr } = await execPromise(`node --experimental-json-modules scripts/${scriptName}.js`);
    
    if (stderr) {
      console.error(`Error in ${scriptName}:`, stderr);
    }
    
    console.log(`${scriptName} output:`, stdout);
    return true;
  } catch (error) {
    console.error(`Failed to run ${scriptName}:`, error);
    return false;
  }
};

// Main function
const main = async () => {
  // Test database connection
  const connected = await connectToDatabase();
  if (!connected) {
    console.error('Cannot proceed without database connection');
    process.exit(1);
  }
  
  // Close the connection (we'll let each script handle its own connection)
  await mongoose.connection.close();
  
  // Run seed scripts in order
  console.log('Starting seeding process...');
  
  // 1. Seed users first (admin users)
  await runSeedScript('seed-users');
  
  // 2. Seed halls
  await runSeedScript('seed-halls');
  
  // 3. Seed customers
  await runSeedScript('seed-customers');
  
  // 4. Seed bookings (depends on halls and customers)
  await runSeedScript('seed-bookings');
  
  // 5. Seed expenses (depends on bookings)
  await runSeedScript('seed-expenses');
  
  // 6. Seed payments (depends on bookings)
  await runSeedScript('seed-payments');
  
  console.log('All seeding completed successfully!');
  process.exit(0);
};

main();
