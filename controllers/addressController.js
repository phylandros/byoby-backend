const db = require("../config/db");

// Function to fetch provinces
exports.getProvinces = (req, res) => {
  const query = "SELECT * FROM db_province_data";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching provinces:", err);
      res.status(500).send("Error fetching provinces");
    } else {
      res.status(200).json(results);
    }
  });
};

// Function to fetch cities based on selected province
exports.getCitiesByProvince = (req, res) => {
  const { province_code } = req.params;
  const query =
    "SELECT DISTINCT city FROM db_postal_code_data WHERE province_code = ?";

  db.query(query, [province_code], (err, results) => {
    if (err) {
      console.error("Error fetching cities:", err);
      res.status(500).send("Error fetching cities");
    } else {
      res.status(200).json(results);
    }
  });
};

// Function to fetch sub-districts based on selected city
exports.getSubDistrictsByCity = (req, res) => {
  const { city } = req.params;
  const query =
    "SELECT DISTINCT sub_district FROM db_postal_code_data WHERE city = ?";

  db.query(query, [city], (err, results) => {
    if (err) {
      console.error("Error fetching sub-districts:", err);
      res.status(500).send("Error fetching sub-districts");
    } else {
      res.status(200).json(results);
    }
  });
};

// Function to fetch urban areas based on selected sub-district
exports.getUrbanBySubDistrict = (req, res) => {
  const { sub_district } = req.params;
  const query =
    "SELECT DISTINCT urban FROM db_postal_code_data WHERE sub_district = ?";

  db.query(query, [sub_district], (err, results) => {
    if (err) {
      console.error("Error fetching urban areas:", err);
      res.status(500).send("Error fetching urban areas");
    } else {
      res.status(200).json(results);
    }
  });
};

// Function to fetch postal code based on selected urban area
exports.getPostalCodeByUrban = (req, res) => {
  const { urban, sub_district, city, province_code } = req.query;
  const query = `SELECT postal_code 
                 FROM db_postal_code_data 
                 WHERE urban = ? AND sub_district = ? AND city = ? AND province_code = ?`;

  db.query(
    query,
    [urban, sub_district, city, province_code],
    (err, results) => {
      if (err) {
        console.error("Error fetching postal code:", err);
        res.status(500).send("Error fetching postal code");
      } else if (results.length > 0) {
        res.status(200).json({ postal_code: results[0].postal_code });
      } else {
        res.status(404).send("Postal code not found");
      }
    }
  );
};

// exports.addAddress = (req, res) => {
//   const {
//     userId,
//     fullName,
//     phone,
//     address,
//     rt,
//     rw,
//     province,
//     city,
//     subDistrict,
//     urban,
//     postalCode,
//   } = req.body;

//   const query = `
//     INSERT INTO addresses (
//       user_id, full_name, phone, address, rt, rw, province, city, sub_district, urban, postal_code
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(
//     query,
//     [
//       userId,
//       fullName,
//       phone,
//       address,
//       rt,
//       rw,
//       province,
//       city,
//       subDistrict,
//       urban,
//       postalCode,
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("Error adding address:", err);
//         res.status(500).send("Error adding address");
//       } else {
//         res.status(201).send("Address added successfully");
//       }
//     }
//   );
// };

// exports.getAddressesByUserId = (req, res) => {
//   const { userId } = req.params;
//   const query = `
//     SELECT a.*, p.province_name
//     FROM addresses a
//     JOIN db_province_data p ON a.province = p.province_code
//     WHERE a.user_id = ?
//   `;

//   db.query(query, [userId], (err, results) => {
//     if (err) {
//       console.error("Error fetching addresses:", err);
//       res.status(500).send("Error fetching addresses");
//     } else {
//       res.status(200).json(results);
//     }
//   });
// };

exports.addAddress = (req, res) => {
  const {
    userId,
    fullName,
    phone,
    address,
    rt,
    rw,
    province,
    city,
    subDistrict,
    urban,
    postalCode,
  } = req.body;

  const query = `
    INSERT INTO addresses (
      user_id, full_name, phone, address, rt, rw, province, city, sub_district, urban, postal_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      userId,
      fullName,
      phone,
      address,
      rt,
      rw,
      province,
      city,
      subDistrict,
      urban,
      postalCode,
    ],
    (err, result) => {
      if (err) {
        console.error("Error adding address:", err);
        res.status(500).send("Error adding address");
      } else {
        res.status(201).send("Address added successfully");
      }
    }
  );
};

exports.getAddressesByUserId = (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT a.*, p.province_name 
    FROM addresses a
    JOIN db_province_data p ON a.province = p.province_code
    WHERE a.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching addresses:", err);
      res.status(500).send("Error fetching addresses");
    } else {
      res.status(200).json(results);
    }
  });
};
