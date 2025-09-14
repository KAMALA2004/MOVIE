const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Movie = sequelize.define('Movie', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    imdb_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        is: /^tt\d{7,8}$/
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1888,
        max: new Date().getFullYear() + 5
      }
    },
    rated: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    released: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    runtime: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    genre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    director: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    writer: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    actors: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    plot: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    language: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    awards: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    poster: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    imdb_rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      validate: {
        min: 0,
        max: 10
      }
    },
    imdb_votes: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'movie'
    },
    dvd: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    box_office: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    production: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    // Calculated fields
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 10
      }
    },
    total_reviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'movies',
    indexes: [
      {
        unique: true,
        fields: ['imdb_id']
      },
      {
        fields: ['title']
      },
      {
        fields: ['year']
      },
      {
        fields: ['average_rating']
      }
    ]
  });

  return Movie;
};
