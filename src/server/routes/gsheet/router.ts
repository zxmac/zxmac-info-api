import { Router } from "express";
import controller from "../../controllers/gsheet";
import validator, { ValidationSource } from "../../helpers/validator";
import schema from "./schema";

const router = Router();

router.get(
  '/sheets/:id/', 
  validator(schema.getSheet, ValidationSource.PARAM),
  controller.getSheet
);

router.get(
  '/:id/:sn/', 
  validator(schema.getData, ValidationSource.PARAM),
  controller.getData
);

router.get(
  '/:id/:sn/raw', 
  validator(schema.getRawData, ValidationSource.PARAM),
  controller.getRawData
);

export default router;