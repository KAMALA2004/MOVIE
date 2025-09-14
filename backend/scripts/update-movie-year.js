const { Movie } = require('../models');

async function updateMovieYear() {
  try {
    // Update the year column to allow null values
    await Movie.sequelize.query('ALTER TABLE movies ALTER COLUMN year DROP NOT NULL');
    console.log('✅ Movie year field updated to allow null values');
  } catch (error) {
    console.error('❌ Error updating movie year field:', error);
  }
}

// Run the script
updateMovieYear().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
