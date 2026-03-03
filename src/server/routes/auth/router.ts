import { Router } from "express";
import controller from "../../controllers/auth";
import validator, { ValidationSource } from "../../helpers/validator";
import schema from "./schema";
import { authenticator, guestAuthenticator } from "../../middlewares/jwt";

const router = Router();

router.post(
  "/register",
  validator(schema.register, ValidationSource.BODY),
  controller.register
);

router.post(
  "/login",
  validator(schema.login, ValidationSource.BODY),
  controller.login
);

router.post(
  "/login/guest",
  guestAuthenticator,
  controller.loginAsGuest
);

router.post(
  "/login/admin",
  validator(schema.loginAsAdmin, ValidationSource.BODY),
  controller.loginAsAdmin
);

router.post(
  "/refresh",
  validator(schema.refresh, ValidationSource.BODY),
  controller.refresh
);

router.post(
  "/logout",
  authenticator,
  controller.logout
);

router.get(
  "/me",
  authenticator,
  controller.me
);

router.get(
  "/uuid",
  authenticator,
  controller.generateUUID
);

export default router;