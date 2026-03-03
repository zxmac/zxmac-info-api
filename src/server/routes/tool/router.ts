import { Router } from "express";
import controller from "../../controllers/tool";

const router = Router();

router.post(
  '/form/json/:keys/', 
  controller.formToJson
);

router.post(
  '/puppeteer/pdfbuffer', 
  controller.pdfBuffer
);

export default router;