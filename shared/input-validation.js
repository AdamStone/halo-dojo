"use strict";

var Joi = require('joi');

var schema = {
  any: Joi.any(),
  email: Joi.string().email(),
  guid: Joi.string().guid(),
  username: Joi.string().token().min(3).max(15),
  password: Joi.string().min(8).max(20),
  gamertag: Joi.string().regex(/^[A-Za-z\d]+(?: [A-Za-z\d]+)*$/).max(15).min(4),
  intRange: function(low, high) {
    return Joi.number().integer().min(low).max(high);
  },
  regex: function(string) {
    return Joi.string().regex(new RegExp('^' + string + '$'));
  },
  code: Joi.number().min(8).max(8),
  message: Joi.string().min(1).max(150),
};

schema.gtArray = Joi.array().includes(schema.gamertag).unique();

schema.auth = Joi.object().required().keys({
  id: Joi.string().guid(),
  ts: Joi.number(),
  nonce: Joi.string().token(),
  hash: Joi.string(),
  mac: Joi.string()
});

schema.hawkData = Joi.object().keys({
    auth: schema.auth,
    message: schema.message,
    to: schema.gamertag
  });

schema.socket = {
  handshake: Joi.object().keys({
    auth: schema.auth.required(),
    gamertag: schema.gamertag.required()
  }),
  message: Joi.object().keys({
    auth: schema.auth.required(),
    recipient: schema.gamertag.required(),
    message: schema.message.required()
  })
};

schema.profile = Joi.object().keys({
  bio: Joi.string().max(500).allow('').optional(),
  games: Joi.object().optional()
});


module.exports = schema;