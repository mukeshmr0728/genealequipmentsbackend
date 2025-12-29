// Load env FIRST
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase ENV variables missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/', (req, res) => {
  res.send('Industrial Website Backend Running');
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message, pageSource } = req.body;

  // 1. Save to Supabase
  try {
    const { error } = await supabase
      .from('contact_submissions')
      .insert([{ name, email, phone, message, page_source: pageSource }]);

    if (error) console.error('Supabase Error:', error);
  } catch (err) {
    console.error('Supabase Exception:', err);
  }

  // 2. Send to Google Sheets
  try {
    if (process.env.GOOGLE_SCRIPT_URL) {
      await fetch(process.env.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          pageSource,
          timestamp: new Date().toISOString()
        })
      });
    }
  } catch (err) {
    console.error('Google Sheets Error:', err);
  }

  res.json({ success: true, message: 'Submission received' });
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
