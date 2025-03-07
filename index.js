require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoint for testing
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage dla URLi
const urlDatabase = {};
let counter = 1;

// POST endpoint - skracanie URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Próba utworzenia obiektu URL - jeśli nie uda się, adres jest nieprawidłowy
  try {
    const urlObj = new URL(originalUrl);
    // Weryfikacja hosta przy użyciu dns.lookup
    dns.lookup(urlObj.hostname, (err, address) => {
      if (err) {
        // Jeśli lookup zwróci błąd, zwracamy odpowiedź z błędem
        res.json({ error: 'invalid url' });
      } else {
        // Jeśli URL jest poprawny, zapisz go w bazie (w pamięci)
        const shortUrl = counter;
        urlDatabase[shortUrl] = originalUrl;
        counter++;
        res.json({ original_url: originalUrl, short_url: shortUrl });
      }
    });
  } catch (error) {
    // Jeśli konstruktor URL rzuci wyjątek, adres jest nieprawidłowy
    res.json({ error: 'invalid url' });
  }
});

// GET endpoint - przekierowanie na oryginalny URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
