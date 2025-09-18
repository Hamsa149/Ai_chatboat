import express from "express";
const router = express.Router();

router.get("/ingest", (req, res) => {
  res.json({ message: "News ingestion endpoint" });
});

router.get("/articles", (req, res) => {
  res.json({ message: "Get news articles endpoint" });
});

export default router;