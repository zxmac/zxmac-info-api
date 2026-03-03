import Joi from "joi";

export default {
  save: Joi.object().keys({
    id: Joi.string().min(8).max(50),
    userId: Joi.string().min(8).max(20),
    timestamp: Joi.string().max(20).allow(null, ''),
    isRead: Joi.boolean(),
    sender: Joi.string().min(8).max(20),
    status: Joi.string().min(4).max(10),
    hasChat: Joi.boolean(),
    recipient: Joi.string().min(8).max(20).required(),
    content: Joi.string().min(1).max(200).required(),
  }),
  getMessages: Joi.object().keys({
    id: Joi.string().max(60).required()
  }),
};