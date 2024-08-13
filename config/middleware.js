// const multer = require('multer');
// const path = require('path');

// // Konfigurasi penyimpanan untuk multer
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, '/assets/img_produk'); // Tentukan direktori penyimpanan
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname)); // Tentukan nama file
//     }
// });

// const upload = multer({ storage: storage });

// module.exports = upload;


const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

// Konfigurasi penyimpanan untuk produk
const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/img_produk'); // Tentukan folder penyimpanan untuk produk
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Simpan file dengan nama yang unik berdasarkan timestamp
    }
});

// Konfigurasi penyimpanan untuk kategori
const categoryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/img_kategori'); // Tentukan folder penyimpanan untuk kategori
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Simpan file dengan nama yang unik berdasarkan timestamp
    }
});

// Export middleware untuk upload gambar
const uploadProductImage = multer({ storage: productStorage });
const uploadCategoryImage = multer({ storage: categoryStorage });

// Middleware untuk verifikasi token JWT
const verifyToken = (req, res, next) => {
    // Mengambil token dari header Authorization
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided.' });
    }

    // Token biasanya dalam format "Bearer <token>", jadi kita split
    const bearerToken = token.split(' ')[1];

    // Verifikasi token
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token.' });
        }

        // Menyimpan userId yang ter-decode ke dalam request untuk digunakan nanti
        req.userId = decoded.id;
        next();
    });
};

module.exports = {
    uploadProductImage,
    uploadCategoryImage,
    verifyToken,
};
