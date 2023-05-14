const Joi = require("joi")
const validator = (schema) => (payload) => schema.validate(payload, { abortEarly:false });


const addMovie = Joi.object({
    titleType: Joi.string().required(),
    primaryTitle: Joi.string().required(),
    runtimeMinutes: Joi.number().required(),
    genres: Joi.string().required(),
    averageRating: Joi.number().required(),
    numVotes: Joi.number().required(),
});

module.exports = validator(addMovie);