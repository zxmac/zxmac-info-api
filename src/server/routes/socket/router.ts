import { Router } from "express";
import controller from "../../controllers/socket";
import validator from "../../helpers/validator";
import schema from "./schema";

const router = Router();

router.get(
  '/users/', 
  controller.getUsers
);

router.get(
  '/user/:id/', 
  validator(schema.getUser),
  controller.getUser
);

router.get(
  '/servers/', 
  controller.getServers
);

export default router;