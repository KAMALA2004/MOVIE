const { Movie } = require('../models');

class MovieService {
  static async getOrCreateMovieByImdbId(imdbId) {
    try {
      // First, try to find the movie in our database
      let movie = await Movie.findOne({ where: { imdb_id: imdbId } });
      
      if (movie) {
        return movie;
      }

      // If movie doesn't exist, create a basic entry
      // We'll fetch full details from OMDb API if needed
      movie = await Movie.create({
        imdb_id: imdbId,
        title: `Movie ${imdbId}`, // Placeholder title
        year: new Date().getFullYear(),
        poster: '/placeholder-movie.jpg',
        imdb_rating: 0,
        average_rating: 0,
        total_reviews: 0
      });

      return movie;
    } catch (error) {
      console.error('Error in getOrCreateMovieByImdbId:', error);
      throw error;
    }
  }

  static async updateMovieFromOmdb(imdbId, omdbData) {
    try {
      const movie = await Movie.findOne({ where: { imdb_id: imdbId } });
      
      if (!movie) {
        throw new Error('Movie not found');
      }

      // Update movie with OMDb data
      await movie.update({
        title: omdbData.Title || movie.title,
        year: parseInt(omdbData.Year) || movie.year,
        rated: omdbData.Rated || movie.rated,
        released: omdbData.Released || movie.released,
        runtime: omdbData.Runtime || movie.runtime,
        genre: omdbData.Genre || movie.genre,
        director: omdbData.Director || movie.director,
        writer: omdbData.Writer || movie.writer,
        actors: omdbData.Actors || movie.actors,
        plot: omdbData.Plot || movie.plot,
        language: omdbData.Language || movie.language,
        country: omdbData.Country || movie.country,
        awards: omdbData.Awards || movie.awards,
        poster: omdbData.Poster || movie.poster,
        imdb_rating: parseFloat(omdbData.imdbRating) || movie.imdb_rating,
        imdb_votes: omdbData.imdbVotes || movie.imdb_votes,
        type: omdbData.Type || movie.type,
        dvd: omdbData.DVD || movie.dvd,
        box_office: omdbData.BoxOffice || movie.box_office,
        production: omdbData.Production || movie.production,
        website: omdbData.Website || movie.website
      });

      return movie;
    } catch (error) {
      console.error('Error updating movie from OMDb:', error);
      throw error;
    }
  }
}

module.exports = MovieService;
