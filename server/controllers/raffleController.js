
const mongoose = require("mongoose");

const Raffle = require("../models/Raffle");
const RaffleEntry = require("../models/RaffleEntry");
const User = require("../models/User");

// =====================================
// ADMIN: CREATE RAFFLE
// =====================================

const createRaffle = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      targetPoints,
    } = req.body;

    const points = Number(targetPoints);

    if (!title || !Number.isInteger(points) || points < 1) {
      return res.status(400).json({
        message: "Въведете име на наградата и валиден брой точки.",
      });
    }

    const raffle = await Raffle.create({
      title: title.trim(),
      description: description || "",
      image: image || "",
      targetPoints: points,
      createdBy: req.user.userId,
      status: "draft",
    });

    return res.status(201).json({
      message: "Томбoлата е създадена успешно.",
      raffle,
    });
  } catch (error) {
    console.error("Create raffle error:", error);

    return res.status(500).json({
      message: "Грешка при създаване на томболата.",
    });
  }
};

// =====================================
// ADMIN: GET ALL RAFFLES
// =====================================

const getAllRaffles = async (req, res) => {
  try {
    const raffles = await Raffle.find()
      .populate("winner", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json(raffles);
  } catch (error) {
    console.error("Get all raffles error:", error);

    return res.status(500).json({
      message: "Грешка при зареждане на томболите.",
    });
  }
};

// =====================================
// PUBLIC: GET ACTIVE RAFFLES
// =====================================

const getActiveRaffles = async (req, res) => {
  try {
    const raffles = await Raffle.find({
      status: "active",
    })
      .select(
        "title description image targetPoints collectedPoints createdAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json(raffles);
  } catch (error) {
    console.error("Get active raffles error:", error);

    return res.status(500).json({
      message: "Грешка при зареждане на активните томболи.",
    });
  }
};

// =====================================
// ADMIN: ACTIVATE RAFFLE
// =====================================

const activateRaffle = async (req, res) => {
  try {
    const raffle = await Raffle.findById(
      req.params.id
    );

    if (!raffle) {
      return res.status(404).json({
        message: "Томбoлата не е намерена.",
      });
    }

    if (raffle.status !== "draft") {
      return res.status(400).json({
        message: "Само нови томболи могат да бъдат активирани.",
      });
    }

    raffle.status = "active";

    await raffle.save();

    return res.status(200).json({
      message: "Томбoлата е активирана.",
      raffle,
    });
  } catch (error) {
    console.error("Activate raffle error:", error);

    return res.status(500).json({
      message: "Грешка при активиране на томболата.",
    });
  }
};

// =====================================
// USER: JOIN RAFFLE
// ONE ENTRY = ONE POINT
// =====================================

const joinRaffle = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { entries } = req.body;

    const quantity = Number(entries);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) {
      return res.status(400).json({
        message: "Изберете между 1 и 100 участия.",
      });
    }

    const result = await session.withTransaction(
      async () => {
        const raffle = await Raffle.findOne({
          _id: req.params.id,
          status: "active",
        }).session(session);

        if (!raffle) {
          throw new Error("RAFFLE_NOT_ACTIVE");
        }

        const remainingPoints =
          raffle.targetPoints - raffle.collectedPoints;

        if (remainingPoints <= 0) {
          throw new Error("RAFFLE_FULL");
        }

        if (quantity > remainingPoints) {
          throw new Error("NOT_ENOUGH_SLOTS");
        }

        const user = await User.findOneAndUpdate(
          {
            _id: req.user.userId,
            active: true,
            bonusPoints: { $gte: quantity },
          },
          {
            $inc: {
              bonusPoints: -quantity,
            },
          },
          {
            new: true,
            session,
          }
        );

        if (!user) {
          throw new Error("NOT_ENOUGH_POINTS");
        }

        const firstEntryNumber =
          raffle.collectedPoints + 1;

        const entryDocuments = Array.from(
          { length: quantity },
          (_, index) => ({
            raffle: raffle._id,
            user: user._id,
            pointsSpent: 1,
            entryNumber: firstEntryNumber + index,
          })
        );

        await RaffleEntry.insertMany(
          entryDocuments,
          { session }
        );

        raffle.collectedPoints += quantity;

        let winner = null;

        if (
          raffle.collectedPoints >= raffle.targetPoints
        ) {
          const totalEntries = raffle.collectedPoints;

          const randomEntryNumber =
            Math.floor(Math.random() * totalEntries) + 1;

          const winningEntry = await RaffleEntry.findOne({
            raffle: raffle._id,
            entryNumber: randomEntryNumber,
          }).session(session);

          if (!winningEntry) {
            throw new Error("WINNING_ENTRY_NOT_FOUND");
          }

          winningEntry.isWinner = true;

          await winningEntry.save({ session });

          raffle.status = "completed";
          raffle.winner = winningEntry.user;
          raffle.winnerEntry = winningEntry._id;
          raffle.completedAt = new Date();

          winner = winningEntry;
        }

        await raffle.save({ session });

        return {
          remainingPoints: user.bonusPoints,
          collectedPoints: raffle.collectedPoints,
          targetPoints: raffle.targetPoints,
          status: raffle.status,
          winner,
        };
      }
    );

    return res.status(200).json({
      message: "Участието е успешно.",
      ...result,
    });
  } catch (error) {
    console.error("Join raffle error:", error);

    const errors = {
      RAFFLE_NOT_ACTIVE: [
        404,
        "Тази томбола не е активна.",
      ],
      RAFFLE_FULL: [
        400,
        "Тази томбола вече е приключила.",
      ],
      NOT_ENOUGH_SLOTS: [
        400,
        "Няма достатъчно свободни участия за избраното количество.",
      ],
      NOT_ENOUGH_POINTS: [
        400,
        "Нямате достатъчно точки за това участие.",
      ],
      WINNING_ENTRY_NOT_FOUND: [
        500,
        "Не успяхме да определим печелившото участие.",
      ],
    };

    const knownError = errors[error.message];

    if (knownError) {
      return res.status(knownError[0]).json({
        message: knownError[1],
      });
    }

    return res.status(500).json({
      message: "Грешка при участие в томболата.",
    });
  } finally {
    await session.endSession();
  }
};

// =====================================
// ADMIN: CANCEL RAFFLE
// =====================================

const cancelRaffle = async (req, res) => {
  try {
    const raffle = await Raffle.findById(
      req.params.id
    );

    if (!raffle) {
      return res.status(404).json({
        message: "Томбoлата не е намерена.",
      });
    }

    if (raffle.status === "completed") {
      return res.status(400).json({
        message: "Приключила томбола не може да бъде отменена.",
      });
    }

    if (raffle.status === "cancelled") {
      return res.status(400).json({
        message: "Томбoлата вече е отменена.",
      });
    }

    raffle.status = "cancelled";

    await raffle.save();

    return res.status(200).json({
      message: "Томбoлата е отменена.",
      raffle,
    });
  } catch (error) {
    console.error("Cancel raffle error:", error);

    return res.status(500).json({
      message: "Грешка при отменяне на томболата.",
    });
  }
};

module.exports = {
  createRaffle,
  getAllRaffles,
  getActiveRaffles,
  activateRaffle,
  joinRaffle,
  cancelRaffle,
};
