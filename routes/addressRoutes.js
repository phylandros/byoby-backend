const express = require("express");
const {
  getProvinces,
  getCitiesByProvince,
  getSubDistrictsByCity,
  getUrbanBySubDistrict,
  getPostalCodeByUrban,
  addAddress,
  getAddressesByUserId,
} = require("../controllers/addressController");

const router = express.Router();

router.get("/provinces", getProvinces);
router.get("/cities/:province_code", getCitiesByProvince);
router.get("/sub-districts/:city", getSubDistrictsByCity);
router.get("/urban/:sub_district", getUrbanBySubDistrict);
router.get("/postal-code", getPostalCodeByUrban);
router.post("/add", addAddress);
router.get("/:userId", getAddressesByUserId);

module.exports = router;
