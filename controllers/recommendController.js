require("dotenv").config();
const db = require("../config/db");
const natural = require('natural');
const TfIdf = natural.TfIdf;
const cosineSimilarity = require('compute-cosine-similarity');

// Membaca stopwords dari environment variable
const stopWordsIndonesia = process.env.STOPWORDS.split(',');

const getRecommendations = (req, res) => {
  const query = req.query.q || '';

  const sql = `
    SELECT items.id, items.title, items.imageUrl, items.price, items.description,
           categories.name AS category, colors.name AS color, reviews.review
    FROM items
    LEFT JOIN categories ON items.category_id = categories.id
    LEFT JOIN item_colors ON items.id = item_colors.item_id
    LEFT JOIN colors ON item_colors.color_id = colors.id
    LEFT JOIN order_items ON items.id = order_items.item_id
    LEFT JOIN reviews ON order_items.order_id = reviews.order_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching recommendations:', err);
      return res.status(500).json({ message: 'Failed to fetch recommendations' });
    }

    console.log('Results from SQL query:', results);

    const items = results.map(result => ({
      id: result.id,
      title: result.title,
      imageUrl: result.imageUrl,
      price: result.price,
      description: result.description,
      category: result.category,
      color: result.color,
      review: result.review || '' 
    }));

    console.log('Processed items:', items);

    const tfidf = new TfIdf();
    items.forEach(item => {
      if (item.review) {
        const document = `${item.description} ${item.category} ${item.color} ${item.review}`;
        tfidf.addDocument(document);
        console.log('Added document to TF-IDF:', document);
      }
    });

    const cleanedQuery = query.toLowerCase().split(' ')
      .filter(word => !stopWordsIndonesia.includes(word))
      .join(' ');

    console.log('Cleaned query:', cleanedQuery);

    const queryVector = [];
    tfidf.tfidfs(cleanedQuery, (i, measure) => {
      queryVector.push(measure);
    });

    console.log('Query vector:', queryVector);

    const scores = [];
    items.forEach((item, index) => {
      if (item.review) {
        const itemVector = [];
        tfidf.tfidfs(`${item.description} ${item.category} ${item.color} ${item.review}`, (i, measure) => {
          itemVector.push(measure);
        });
        const similarity = cosineSimilarity(queryVector, itemVector);
        scores.push({ id: item.id, score: similarity });
        console.log('Item vector:', itemVector);
        console.log('Cosine similarity:', similarity);
      }
    });

    scores.sort((a, b) => b.score - a.score);

    const recommendedItems = scores.map(score => {
      const item = items.find(item => item.id === score.id);
      return {
        ...item,
        cosineSimilarity: score.score
      };
    });

    console.log('Recommended items:', recommendedItems);

    res.json(recommendedItems);
  });
};

module.exports = { getRecommendations };
