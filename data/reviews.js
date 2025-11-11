import { ObjectId } from 'mongodb';
import { movies } from '../config/mongoCollections.js';
import { validateString, validateObjectId, validateRating } from '../helpers.js';

const validateReviewTitle = (title) => {
  return validateString(title, 'Review title');
};

const validateReviewerName = (name) => {
  return validateString(name, 'Reviewer name');
};

const validateReviewText = (text) => {
  return validateString(text, 'Review text');
};

export const createReview = async (
  movieId,
  reviewTitle,
  reviewerName,
  review,
  rating
) => {
  movieId = validateObjectId(movieId);
  reviewTitle = validateReviewTitle(reviewTitle);
  reviewerName = validateReviewerName(reviewerName);
  review = validateReviewText(review);
  rating = validateRating(rating);

  const movieCollection = await movies();
  const movie = await movieCollection.findOne({ _id: movieId });
  if (!movie) throw 'Movie not found';

  const newReview = {
    _id: new ObjectId(),
    reviewTitle,
    reviewDate: new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }),
    reviewerName,
    review,
    rating
  };

  const updatedReviews = [...movie.reviews, newReview];
  const overallRating = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));

  const updateInfo = await movieCollection.updateOne(
    { _id: movieId },
    { 
      $push: { reviews: newReview },
      $set: { overallRating }
    }
  );

  if (updateInfo.modifiedCount === 0) throw 'Could not add review';

  const updatedMovie = await movieCollection.findOne({ _id: movieId });
  return updatedMovie;
};

export const getAllReviews = async (movieId) => {
  movieId = validateObjectId(movieId);
  const movieCollection = await movies();
  const movie = await movieCollection.findOne({ _id: movieId });
  if (!movie) throw 'Movie not found';
  return movie.reviews;
};

export const getReview = async (reviewId) => {
  reviewId = validateObjectId(reviewId);
  const movieCollection = await movies();
  const movie = await movieCollection.findOne(
    { 'reviews._id': reviewId },
    { projection: { 'reviews.$': 1 } }
  );
  if (!movie || !movie.reviews[0]) throw 'Review not found';
  return movie.reviews[0];
};

export const removeReview = async (reviewId) => {
  reviewId = validateObjectId(reviewId);
  const movieCollection = await movies();

  const movie = await movieCollection.findOne({ 'reviews._id': reviewId });
  if (!movie) throw 'Review not found';

  const updatedReviews = movie.reviews.filter(
    review => review._id.toString() !== reviewId.toString()
  );

  const overallRating = updatedReviews.length 
    ? Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1))
    : 0;

  const updateInfo = await movieCollection.updateOne(
    { 'reviews._id': reviewId },
    { 
      $pull: { reviews: { _id: reviewId } },
      $set: { overallRating }
    }
  );

  if (updateInfo.modifiedCount === 0) throw 'Could not remove review';

  return await movieCollection.findOne({ _id: movie._id });
};