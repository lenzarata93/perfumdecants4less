
const express = require("express");

const router = express.Router();

const {
  createRaffle,
  getAllRaffles,
  getActiveRaffles,
  activateRaffle,
  joinRaffle,
  cancelRaffle,
  getRaffleEntries,
} = require("../controllers/raffleController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// =====================================
// PUBLIC ROUTES
// =====================================

// Всички могат да виждат активните томболи
router.get("/active", getActiveRaffles);

// =====================================
// ADMIN ROUTES
// =====================================

// Всички томболи
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getAllRaffles
);

// Участници в конкретна томбола
router.get(
  "/:id/entries",
  authMiddleware,
  adminMiddleware,
  getRaffleEntries
);

// Създаване на томбола
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createRaffle
);

// Активиране на томбола
router.patch(
  "/:id/activate",
  authMiddleware,
  adminMiddleware,
  activateRaffle
);

// Отмяна на томбола
router.patch(
  "/:id/cancel",
  authMiddleware,
  adminMiddleware,
  cancelRaffle
);

// =====================================
// USER ROUTES
// =====================================

// Участие в томбола
router.post(
  "/:id/join",
  authMiddleware,
  joinRaffle
);

module.exports = router;
