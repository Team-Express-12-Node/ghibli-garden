const BaseData = require('./base/base.data');
const Film = require('../models/film.model');
const formatDate = require('../utils/datetime');

class FilmsData extends BaseData {
    constructor(db) {
        super(db, Film, Film);
    }

    _isModelValid(model) {
        // custom validation
        return super._isModelValid(model);
    }

    postComment(id, comment, username) {
        let filmToComment;
        const users = this.db.collection('users');
        return this.findById(id)
            .then((film) => {
                if (!film) {
                    return Promise.reject('Comment failed');
                }
                return film;
            })
            .then((film) => {
                if (!film.comments) {
                    film.comments = [];
                }

                if (film.comments.length > 63) {
                    return Promise.reject('Maximum number of comments reached');
                }

                film.comments.push({
                    text: comment,
                    date: formatDate(new Date()),
                    user: username,
                });

                filmToComment = film;
                return users.findOne({
                    username: username,
                });
            })
            .then((user) => {
                // // tests
                // console.log(user);
                // return Promise.reject('Comment failed');
                const updateFilm = this.collection.updateOne(
                    { title: filmToComment.title },
                    filmToComment
                );
                if (!user.comments) {
                    user.comments = [];
                }
                user.comments.push({
                    text: comment,
                    date: formatDate(new Date()),
                });

                const updateUser = users.updateOne(
                    { username: username },
                    user
                );

                return Promise.all([
                    updateFilm,
                    updateUser,
                ]);
            })
            .then((values) => {
                return Promise.resolve('Comment added successfully');
            })
            .catch((err) => {
                return Promise.reject('Sorry, failed to post ' +
                    'a comment' + err);
            });
    }

    rateFilm(id, rating, username) {
        return this.findById(id)
            .then((film) => {
                if (!film) {
                    return Promise.reject('Rate failed');
                }
                return film;
            })
            .then((film) => {
                if (!film.rating) {
                    film.rating = 5;
                }
                if (!film.ratedBy) {
                    film.ratedBy = [];
                }
                if (film.ratedBy.includes(username)) {
                    return Promise.reject('Already voted, sorry');
                }
                const rateValue = parseInt(rating, 10);
                if (rateValue < 0 || rateValue > 10) {
                    return Promise.reject('Invalid rating provided');
                }

                film.ratedBy.push(username);
                const numberOfRates = film.ratedBy.length;
                const oldRate = film.rating;
                const newRate =
                    oldRate + ((rateValue - oldRate) / numberOfRates);
                film.rating = newRate;
                return this.collection.updateOne(
                    { title: film.title },
                    film
                );
            })
            .then(() => {
                return Promise.resolve('Thanks for rating this film!');
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    }
}

module.exports = FilmsData;
