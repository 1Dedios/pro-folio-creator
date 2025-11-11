import { ObjectId } from 'mongodb';
import { movies } from '../config/mongoCollections.js';
import { 
  validateString, 
  validateDate, 
  validateObjectId, 
  validateArray, 
  validateRuntime 
} from '../helpers.js';

const validateTitle = (title) => {
  title = validateString(title, 'Title');
  if (title.length < 2) throw 'Title must be at least 2 characters long';
  if (!/^[a-zA-Z0-9\s]+$/.test(title)) throw 'Title can only contain letters, numbers and spaces';
  return title;
};

const validateDirector = (director) => {
  director = validateString(director, 'Director');
  const [firstName, lastName] = director.split(' ');
  if (!firstName || !lastName) throw 'Director must have first and last name';
  if (firstName.length < 3 || lastName.length < 3) 
    throw 'Director first and last name must be at least 3 characters';
  if (!/^[a-zA-Z\s]+$/.test(director)) 
    throw 'Director name can only contain letters and spaces';
  return director;
};

const validateStudio = (studio) => {
  studio = validateString(studio, 'Studio');
  if (studio.length < 5) throw 'Studio must be at least 5 characters long';
  if (!/^[a-zA-Z\s]+$/.test(studio)) 
    throw 'Studio can only contain letters and spaces';
  return studio;
};

const validateGenre = (genre) => {
  genre = validateString(genre, 'Genre');
  if (genre.length < 5) throw 'Genre must be at least 5 characters long';
  if (!/^[a-zA-Z\s]+$/.test(genre)) 
    throw 'Genre can only contain letters and spaces';
  return genre;
};

const validateCastMember = (member) => {
  member = validateString(member, 'Cast member');
  const [firstName, lastName] = member.split(' ');
  if (!firstName || !lastName) throw 'Cast member must have first and last name';
  if (firstName.length < 3 || lastName.length < 3) 
    throw 'Cast member first and last name must be at least 3 characters';
  if (!/^[a-zA-Z\s]+$/.test(member)) 
    throw 'Cast member name can only contain letters and spaces';
  return member;
};

const validateMovieRating = (rating) => {
  rating = validateString(rating, 'Rating');
  const validRatings = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
  if (!validRatings.includes(rating)) 
    throw 'Invalid rating. Must be G, PG, PG-13, R, or NC-17';
  return rating;
};

export const createMovie = async (
  title,
  plot,
  genres,
  rating,
  studio,
  director,
  castMembers,
  dateReleased,
  runtime
) => {
  title = validateTitle(title);
  plot = validateString(plot, 'Plot');
  genres = validateArray(genres, 'Genres', validateGenre);
  rating = validateMovieRating(rating);
  studio = validateStudio(studio);
  director = validateDirector(director);
  castMembers = validateArray(castMembers, 'Cast members', validateCastMember);
  dateReleased = validateDate(dateReleased);
  runtime = validateRuntime(runtime);

  const movieCollection = await movies();
  const newMovie = {
    title,
    plot,
    genres,
    rating,
    studio,
    director,
    castMembers,
    dateReleased,
    runtime,
    reviews: [],
    overallRating: 0
  };

  const insertInfo = await movieCollection.insertOne(newMovie);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) 
    throw 'Could not add movie';

  return await getMovieById(insertInfo.insertedId.toString());
};

export const getAllMovies = async () => {
  const movieCollection = await movies();
  const movieList = await movieCollection.find({}, {
    projection: { _id: 1, title: 1 }
  }).toArray();
  return movieList;
};

export const getMovieById = async (movieId) => {
  movieId = validateObjectId(movieId);
  const movieCollection = await movies();
  const movie = await movieCollection.findOne({ _id: movieId });
  if (!movie) throw 'Movie not found';
  return movie;
};

export const removeMovie = async (movieId) => {
  movieId = validateObjectId(movieId);
  const movieCollection = await movies();
  const deletionInfo = await movieCollection.deleteOne({ _id: movieId });
  if (deletionInfo.deletedCount === 0) throw 'Could not delete movie';
  return { movieId: movieId.toString(), deleted: true };
};

export const updateMovie = async (
  movieId,
  title,
  plot,
  genres,
  rating,
  studio,
  director,
  castMembers,
  dateReleased,
  runtime
) => {
  movieId = validateObjectId(movieId);
  title = validateTitle(title);
  plot = validateString(plot, 'Plot');
  genres = validateArray(genres, 'Genres', validateGenre);
  rating = validateMovieRating(rating);
  studio = validateStudio(studio);
  director = validateDirector(director);
  castMembers = validateArray(castMembers, 'Cast members', validateCastMember);
  dateReleased = validateDate(dateReleased);
  runtime = validateRuntime(runtime);

  const movieCollection = await movies();
  const existingMovie = await getMovieById(movieId);

  const updatedMovie = {
    title,
    plot,
    genres,
    rating,
    studio,
    director,
    castMembers,
    dateReleased,
    runtime,
    reviews: existingMovie.reviews,
    overallRating: existingMovie.overallRating
  };

  const updateInfo = await movieCollection.updateOne(
    { _id: movieId },
    { $set: updatedMovie }
  );

  if (updateInfo.modifiedCount === 0) throw 'Could not update movie';
  return await getMovieById(movieId);
};

const renameMovie = async (id, newName) => {
  //Not used for this lab
};