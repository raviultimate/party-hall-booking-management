const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// MongoDB connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Define all collection names
const collections = ['halls', 'bookings', 'customers', 'expenses', 'users'];

// Function to clear a specific collection
const clearCollection = async (collectionName) => {
  try {
    const collection = mongoose.connection.collection(collectionName);
    await collection.deleteMany({});
    console.log(`✅ Cleared collection: ${collectionName}`);
  } catch (error) {
    console.error(`❌ Error clearing collection ${collectionName}:`, error);
  }
};

// Function to clear all collections
const clearAllCollections = async () => {
  console.log('🗑️  Starting database cleanup...');
  
  for (const collectionName of collections) {
    await clearCollection(collectionName);
  }
  
  console.log('🎉 Database cleanup completed!');
};

// Function to clear specific collections
const clearSpecificCollections = async (collectionsToDelete) => {
  console.log('🗑️  Starting cleanup for specific collections...');
  
  for (const collectionName of collectionsToDelete) {
    if (collections.includes(collectionName)) {
      await clearCollection(collectionName);
    } else {
      console.log(`⚠️  Collection not recognized: ${collectionName}`);
    }
  }
  
  console.log('🎉 Specific collections cleanup completed!');
};

// Main function
const main = async () => {
  await connectToDatabase();
  
  console.log('\n⚠️  WARNING: This will delete data from your database! ⚠️\n');
  console.log('Available collections:');
  collections.forEach((col, index) => console.log(`${index + 1}. ${col}`));
  
  rl.question('\nDo you want to clear ALL collections or SPECIFIC ones? (all/specific): ', (answer) => {
    if (answer.toLowerCase() === 'all') {
      rl.question('\nAre you ABSOLUTELY SURE you want to delete ALL data? This cannot be undone! (yes/no): ', async (confirmation) => {
        if (confirmation.toLowerCase() === 'yes') {
          await clearAllCollections();
          mongoose.disconnect();
          rl.close();
        } else {
          console.log('Operation cancelled.');
          mongoose.disconnect();
          rl.close();
        }
      });
    } else if (answer.toLowerCase() === 'specific') {
      rl.question('\nEnter collection names to clear (comma-separated, e.g., "halls,bookings"): ', async (collectionsInput) => {
        const collectionsToDelete = collectionsInput.split(',').map(item => item.trim());
        
        rl.question(`\nAre you sure you want to delete data from: ${collectionsToDelete.join(', ')}? (yes/no): `, async (confirmation) => {
          if (confirmation.toLowerCase() === 'yes') {
            await clearSpecificCollections(collectionsToDelete);
            mongoose.disconnect();
            rl.close();
          } else {
            console.log('Operation cancelled.');
            mongoose.disconnect();
            rl.close();
          }
        });
      });
    } else {
      console.log('Invalid option. Operation cancelled.');
      mongoose.disconnect();
      rl.close();
    }
  });
};

// Add a non-interactive mode for scripting
if (process.argv.includes('--force-all')) {
  (async () => {
    await connectToDatabase();
    await clearAllCollections();
    mongoose.disconnect();
    process.exit(0);
  })();
} else if (process.argv.includes('--collections')) {
  const index = process.argv.indexOf('--collections');
  if (index > -1 && process.argv.length > index + 1) {
    const collectionsToDelete = process.argv[index + 1].split(',');
    (async () => {
      await connectToDatabase();
      await clearSpecificCollections(collectionsToDelete);
      mongoose.disconnect();
      process.exit(0);
    })();
  } else {
    console.error('No collections specified with --collections flag');
    process.exit(1);
  }
} else {
  main();
}
