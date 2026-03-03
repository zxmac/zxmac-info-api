import { Router } from "express";
import validator, { ValidationSource } from "../../helpers/validator";
import schema from "./schema";
import controller from "../../controllers/chat";
import { adminAuthenticator, authenticator } from "../../middlewares/jwt";

const router = Router();

router.post(
  '/',
  validator(schema.save, ValidationSource.BODY),
  controller.save
);

router.get(
  '/messages/:id',
  authenticator,
  validator(schema.getMessages, ValidationSource.PARAM),
  controller.getMessages
);

router.get(
  '/contacts', 
  adminAuthenticator, 
  controller.getChats
);

router.get(
  '/support',
  authenticator,
  controller.getSupport
);

router.get(
  '/active',
  authenticator,
  controller.getActiveUsers
);

export default router;