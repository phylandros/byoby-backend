// require("dotenv").config();
// const db = require("../config/db");
// const natural = require('natural');
// const { verifyToken } = require('../config/middleware'); // Pastikan path ini benar

// // Membaca stopwords dari environment variable
// const stopWordsIndonesia = process.env.STOPWORDS.split(',');

// const getRecommendations = [verifyToken, (req, res) => {
//   const query = req.query.q || '';
//   console.log('Received query:', query);

//   const sql = `
//     SELECT items.id, items.title, items.imageUrl, items.price, items.description,
//            categories.name AS category, colors.name AS color, reviews.review, reviews.created_at
//     FROM items
//     LEFT JOIN categories ON items.category_id = categories.id
//     LEFT JOIN item_colors ON items.id = item_colors.item_id
//     LEFT JOIN colors ON item_colors.color_id = colors.id
//     LEFT JOIN order_items ON items.id = order_items.item_id
//     LEFT JOIN reviews ON order_items.order_id = reviews.order_id
//     WHERE reviews.created_at > NOW() - INTERVAL 3 MONTH
//   `;

//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error('Error fetching recommendations:', err);
//       return res.status(500).json({ message: 'Failed to fetch recommendations' });
//     }

//     console.log('Fetched results:', results.length, 'items');

//     // Proses hasil SQL menjadi dokumen
//     const documents = results.map(result => 
//       `${result.description} ${result.category} ${result.color} ${result.review}`
//     );

//     console.log('Generated documents:', documents.length, 'documents');

//     // Daftar kata unik di seluruh dokumen dan query
//     const words = new Set(query.toLowerCase().split(' '));
//     documents.forEach(doc => {
//       doc.toLowerCase().split(' ').forEach(word => words.add(word));
//     });
//     const allWords = Array.from(words).filter(word => !stopWordsIndonesia.includes(word)).sort();

//     console.log('Unique words:', allWords.length);

//     // Menghitung Term Frequency (TF)
//     const calculateTF = (text, words) => {
//       const tfDict = {};
//       const textWords = text.toLowerCase().split(' ');
//       const totalWords = textWords.length;

//       words.forEach(word => {
//         tfDict[word] = (textWords.filter(w => w === word).length / totalWords) || 0;
//       });

//       return tfDict;
//     };

//     // Menghitung TF untuk query
//     const tfQuery = calculateTF(query, allWords);
//     console.log('TF for query:', tfQuery);

//     // Menghitung TF untuk setiap dokumen
//     const tfDocs = documents.map(doc => calculateTF(doc, allWords));
//     console.log('Calculated TF for documents');

//     // Menghitung Document Frequency (DF)
//     const calculateDF = (docs, words) => {
//       const dfDict = {};
//       words.forEach(word => {
//         dfDict[word] = docs.filter(doc => doc.includes(word)).length;
//       });
//       return dfDict;
//     };

//     const df = calculateDF(documents, allWords);
//     console.log('Document Frequency (DF) calculated');

//     // Menghitung Inverse Document Frequency (IDF)
//     const idf = {};
//     const totalDocuments = documents.length;
//     allWords.forEach(word => {
//       idf[word] = Math.log(totalDocuments / (1 + df[word]));
//     });
//     console.log('Inverse Document Frequency (IDF) calculated');

//     // Menghitung TF-IDF
//     const calculateTFIDF = (tf, idf) => {
//       const tfidf = {};
//       Object.keys(tf).forEach(word => {
//         tfidf[word] = tf[word] * idf[word];
//       });
//       return tfidf;
//     };

//     const tfidfQuery = calculateTFIDF(tfQuery, idf);
//     const tfidfDocs = tfDocs.map(tfDoc => calculateTFIDF(tfDoc, idf));
//     console.log('TF-IDF calculated for query and documents');

//     // Menghitung Cosine Similarity
//     const cosineSimilarities = tfidfDocs.map(tfidfDoc => {
//       const queryVector = Object.values(tfidfQuery);
//       const docVector = Object.values(tfidfDoc);

//       const dotProduct = queryVector.reduce((sum, val, i) => sum + val * docVector[i], 0);
//       const magnitudeQuery = Math.sqrt(queryVector.reduce((sum, val) => sum + val * val, 0));
//       const magnitudeDoc = Math.sqrt(docVector.reduce((sum, val) => sum + val * val, 0));

//       return dotProduct / (magnitudeQuery * magnitudeDoc);
//     });

//     console.log('Cosine Similarities calculated:', cosineSimilarities);

//     // Mengurutkan dokumen berdasarkan Cosine Similarity dari besar ke kecil
//     let scoredDocuments = documents.map((doc, index) => ({
//       id: results[index].id,
//       title: results[index].title,
//       imageUrl: results[index].imageUrl,
//       price: results[index].price,
//       description: results[index].description,
//       category: results[index].category,
//       color: results[index].color,
//       review: results[index].review,
//       cosineSimilarity: cosineSimilarities[index]
//     }));

//     console.log('Documents scored with cosine similarity');

//     // Filter dokumen dengan cosine similarity > 0 dan urutkan dari terbesar ke terkecil
//     scoredDocuments = scoredDocuments
//       .filter(doc => doc.cosineSimilarity > 0)
//       .sort((a, b) => b.cosineSimilarity - a.cosineSimilarity);

//     console.log('Filtered and sorted documents by cosine similarity:', scoredDocuments.length, 'documents');

//     // Hapus dokumen dengan ID yang sama dan simpan yang memiliki cosine similarity tertinggi
//     const uniqueDocuments = scoredDocuments.reduce((acc, doc) => {
//       if (!acc.find(item => item.id === doc.id)) {
//         acc.push(doc);
//       }
//       return acc;
//     }, []);

//     console.log('Unique documents:', uniqueDocuments.length);

//     // Menampilkan hasil dalam format yang diinginkan
//     uniqueDocuments.forEach(doc => {
//       console.log(`id: ${doc.id}, title: '${doc.title}', imageUrl: '${doc.imageUrl}', price: ${doc.price}, description: '${doc.description}', category: '${doc.category}', color: '${doc.color}', review: '${doc.review}', cosineSimilarity: ${doc.cosineSimilarity}`);
//     });

//     // Mengembalikan hasil rekomendasi
//     res.json(uniqueDocuments);
//   });
// }];

// module.exports = { getRecommendations };

require("dotenv").config();
const db = require("../config/db");
const natural = require('natural');
const { verifyToken } = require('../config/middleware');

// Membaca stopwords dari environment variable
const stopWordsIndonesia = process.env.STOPWORDS.split(',');

const getRecommendations = [verifyToken, (req, res) => {
  const query = req.query.q || '';
  const userId = req.userId;  // Mengambil userId dari token yang telah diverifikasi

  console.log('Received query:', query);

  // Fetch user data including orders, items, categories, colors, and reviews
  const fetchUserOrdersQuery = `
    SELECT 
        u.id AS user_id,
        o.id AS order_id,
        i.id AS item_id,
        i.title AS item_title,
        i.imageUrl AS item_imageUrl,
        i.price AS item_price,
        i.discount AS item_discount,
        i.rating AS item_rating,
        c.name AS category_name,
        i.description AS item_description,
        col.name AS color_name,
        r.rating AS review_rating,
        r.review AS review_text,
        r.created_at AS review_date
    FROM 
        users u
    JOIN 
        orders o ON u.id = o.user_id
    JOIN 
        order_items oi ON o.id = oi.order_id
    JOIN 
        items i ON oi.item_id = i.id
    JOIN 
        categories c ON i.category_id = c.id
    LEFT JOIN 
        item_colors ic ON i.id = ic.item_id
    LEFT JOIN 
        colors col ON ic.color_id = col.id
    LEFT JOIN 
        reviews r ON o.id = r.order_id AND oi.item_id = i.id
    WHERE 
        u.id = ?
        AND (r.created_at > NOW() - INTERVAL 3 MONTH OR r.created_at IS NULL)
    ORDER BY 
        o.id, i.id, r.created_at;

  `;

  db.query(fetchUserOrdersQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user orders:', err);
      return res.status(500).json({ message: 'Failed to fetch user orders' });
    }

    if (results.length === 0) {
      console.log('No orders found for the given user ID');
      return res.status(404).json({ message: 'No orders found' });
    }

    console.log('Fetched user orders:', results.length, 'items');

    // Proses hasil SQL menjadi dokumen
    const documents = results.map(result => 
      `${result.item_description} ${result.category_name} ${result.color_name} ${result.review_text}`
    );

    console.log('Generated documents:', documents.length, 'documents');

    // Daftar kata unik di seluruh dokumen dan query
    const words = new Set(query.toLowerCase().split(' '));
    documents.forEach(doc => {
      doc.toLowerCase().split(' ').forEach(word => words.add(word));
    });
    const allWords = Array.from(words).filter(word => !stopWordsIndonesia.includes(word)).sort();

    console.log('Unique words:', allWords.length);

    // Menghitung Term Frequency (TF)
    const calculateTF = (text, words) => {
      const tfDict = {};
      const textWords = text.toLowerCase().split(' ');
      const totalWords = textWords.length;

      words.forEach(word => {
        tfDict[word] = (textWords.filter(w => w === word).length / totalWords) || 0;
      });

      return tfDict;
    };

    // Menghitung TF untuk query
    const tfQuery = calculateTF(query, allWords);
    console.log('TF for query:', tfQuery);

    // Menghitung TF untuk setiap dokumen
    const tfDocs = documents.map(doc => calculateTF(doc, allWords));
    console.log('Calculated TF for documents');

    // Menghitung Document Frequency (DF)
    const calculateDF = (docs, words) => {
      const dfDict = {};
      words.forEach(word => {
        dfDict[word] = docs.filter(doc => doc.includes(word)).length;
      });
      return dfDict;
    };

    const df = calculateDF(documents, allWords);
    console.log('Document Frequency (DF) calculated');

    // Menghitung Inverse Document Frequency (IDF)
    const idf = {};
    const totalDocuments = documents.length;
    allWords.forEach(word => {
      idf[word] = Math.log(totalDocuments / (1 + df[word]));
    });
    console.log('Inverse Document Frequency (IDF) calculated');

    // Menghitung TF-IDF
    const calculateTFIDF = (tf, idf) => {
      const tfidf = {};
      Object.keys(tf).forEach(word => {
        tfidf[word] = tf[word] * idf[word];
      });
      return tfidf;
    };

    const tfidfQuery = calculateTFIDF(tfQuery, idf);
    const tfidfDocs = tfDocs.map(tfDoc => calculateTFIDF(tfDoc, idf));
    console.log('TF-IDF calculated for query and documents');

    // Menghitung Cosine Similarity
    const cosineSimilarities = tfidfDocs.map(tfidfDoc => {
      const queryVector = Object.values(tfidfQuery);
      const docVector = Object.values(tfidfDoc);

      const dotProduct = queryVector.reduce((sum, val, i) => sum + val * docVector[i], 0);
      const magnitudeQuery = Math.sqrt(queryVector.reduce((sum, val) => sum + val * val, 0));
      const magnitudeDoc = Math.sqrt(docVector.reduce((sum, val) => sum + val * val, 0));

      return dotProduct / (magnitudeQuery * magnitudeDoc);
    });

    console.log('Cosine Similarities calculated:', cosineSimilarities);

    // Mengurutkan dokumen berdasarkan Cosine Similarity dari besar ke kecil
    let scoredDocuments = results.map((result, index) => ({
      id: result.item_id,
      title: result.item_title,  // Menambahkan title dari item
      imageUrl: result.item_imageUrl,  // Menambahkan URL gambar dari item
      price: result.item_price,  // Menambahkan harga dari item
      discount: result.item_discount,  // Menambahkan discount dari item
      rating: result.item_rating,  // Menambahkan rating dari item
      description: result.item_description,
      category: result.category_name,
      color: result.color_name,
      review: result.review_text,
      cosineSimilarity: cosineSimilarities[index]
    }));

    console.log('Documents scored with cosine similarity');

    // Filter dokumen dengan cosine similarity > 0 dan urutkan dari terbesar ke terkecil
    scoredDocuments = scoredDocuments
      .filter(doc => doc.cosineSimilarity > 0)
      .sort((a, b) => b.cosineSimilarity - a.cosineSimilarity);

    console.log('Filtered and sorted documents by cosine similarity:', scoredDocuments.length, 'documents');

    // Hapus dokumen dengan ID yang sama dan simpan yang memiliki cosine similarity tertinggi
    const uniqueDocuments = scoredDocuments.reduce((acc, doc) => {
      if (!acc.find(item => item.id === doc.id)) {
        acc.push(doc);
      }
      return acc;
    }, []);

    console.log('Unique documents:', uniqueDocuments.length);

    // Mengembalikan hasil rekomendasi
    res.json(uniqueDocuments);
  });
}];

module.exports = { getRecommendations };
