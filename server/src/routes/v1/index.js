const express = require("express");
const router = express.Router();
const authRoutes = require("./auth.route");
const sportTypesRoutes = require("./sportTypes.route");
const regionRoutes = require("./region.route");
const townshipRoutes = require("./township.route");
const userRoutes = require("./user.route");
const adminRoutes = require("./admin.route");
const nrcRoutes = require("./nrc.route");
const ownerRoutes = require("./owner.route");
const bannerRoutes = require("./banner.route");
const courtRoutes = require("./court.route");
const employeeRoutes = require("./employee.route");
const bookingRoutes = require("./booking.route");
const calendarRoutes = require("./calendar.route");
const pricingRoutes = require("./pricing.route");
const planOrderRoutes = require("./planOrder.route");
const posPlanRoutes = require("./posPlan.route");
const reviewsRoutes = require("./reviews.route");
const contactRoutes = require("./contact.route");
const notificationRoutes = require("./notification.route");

const { seedAdmin } = require("../../seeds/admin");

router.get("/", async (req, res) => {
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  console.log("Sports Empire requester ip", ip);

  return res.send({
    status: 0,
    message: "This is Sports Empire Api V1",
    ip: ip,
  });
});

router.get("/seed/admin", seedAdmin);

router.use("/auth", authRoutes);
router.use("/sport_types", sportTypesRoutes);
router.use("/region", regionRoutes);
router.use("/township", townshipRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/nrc", nrcRoutes);
router.use("/owner", ownerRoutes);
router.use("/banner", bannerRoutes);
router.use("/court", courtRoutes);
router.use("/employee", employeeRoutes);
router.use("/booking", bookingRoutes);
router.use("/calendar", calendarRoutes);
router.use("/pricing", pricingRoutes);
router.use("/plan", planOrderRoutes);
router.use("/pos_plan", posPlanRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/contact", contactRoutes);
router.use("/notification", notificationRoutes);

module.exports = router;
