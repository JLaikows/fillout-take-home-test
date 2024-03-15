import express from "express";
import { getResponses } from "../../lib/forms";

const router = express.Router();

router.get("/:id/submissions", getResponses);

export default router;
