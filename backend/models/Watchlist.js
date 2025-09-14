const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Watchlist = sequelize.define('Watchlist', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    movie_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'movies',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('want_to_watch', 'watching', 'watched'),
      defaultValue: 'want_to_watch'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    }
  }, {
    tableName: 'watchlist',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'movie_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['movie_id']
      },
      {
        fields: ['status']
      }
    ]
  });

  return Watchlist;
};
