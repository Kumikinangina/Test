const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;

const API_CONFIG = {
  FAB_DL: 'https://api.fabdl.com',    
};

app.use(cors());  
app.use(express.json());

app.get('/spotifydl', async (req, res) => {
  const { url: spotifyLink } = req.query;  

  if (!spotifyLink) {
    console.log('Missing Spotify URL parameter');
    return res.status(400).json({ 
      status: false,
      error: 'Missing required parameter: url' 
    });
  }

  try {
    const trackInfo = await axios.get(`${API_CONFIG.FAB_DL}/spotify/get?url=${spotifyLink}`);
    const track = trackInfo.data.result;

    const downloadData = await axios.get(
      `${API_CONFIG.FAB_DL}/spotify/mp3-convert-task/${track.gid}/${track.id}`
    );
    const mp3Info = downloadData.data.result;

    const response = {
      status: true,
      song: {
        title: track.name,
        cover: track.image,
        artist: track.artists,
        duration: track.duration_ms
      },
      mp3: `${API_CONFIG.FAB_DL}${mp3Info.download_url}`
    };

    res.json(response);

  } catch (error) {
    console.error('ERROR:', error.message);
    res.status(500).json({ 
      status: false,
      error: 'Request processing failed',
      message: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
