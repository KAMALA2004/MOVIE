const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || path.join(__dirname, '../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Import models
const User = require('./User')(sequelize);
const Movie = require('./Movie')(sequelize);
const Review = require('./Review')(sequelize);
const Watchlist = require('./Watchlist')(sequelize);

// Define associations
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Movie.hasMany(Review, { foreignKey: 'movie_id', as: 'reviews' });
Review.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

// Watchlist associations
User.hasMany(Watchlist, { foreignKey: 'user_id', as: 'watchlist' });
Watchlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Movie.hasMany(Watchlist, { foreignKey: 'movie_id', as: 'watchlist' });
Watchlist.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

// Many-to-many associations through Watchlist
User.belongsToMany(Movie, { 
  through: Watchlist, 
  foreignKey: 'user_id', 
  otherKey: 'movie_id',
  as: 'watchlistMovies'
});
Movie.belongsToMany(User, { 
  through: Watchlist, 
  foreignKey: 'movie_id', 
  otherKey: 'user_id',
  as: 'watchlistUsers'
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Movie,
  Review,
  Watchlist
};
