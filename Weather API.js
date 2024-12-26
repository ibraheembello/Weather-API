


app.use(limiter);
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// API routes
app.use('/api/weather', router);

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});



// src/routes/weather.js
import express from 'express';
import { getWeather } from '../controllers/weatherController.js';

const router = express.Router();

router.get('/:city', getWeather);

export default router;

// src/controllers/weatherController.js
import { getWeatherData } from '../services/weatherService.js';
import { getCachedData, setCachedData } from '../services/cacheService.js';

export const getWeather = async (req, res, next) => {
  try {
    const { city } = req.params;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    // Try to get cached data first
    const cachedData = await getCachedData(city);
    if (cachedData) {
      return res.json({ 
        source: 'cache',
        data: JSON.parse(cachedData)
      });
    }

    // If no cached data, fetch from API
    const weatherData = await getWeatherData(city);
    
    // Cache the new data
    await setCachedData(city, JSON.stringify(weatherData));

    res.json({
      source: 'api',
      data: weatherData
    });
  } catch (error) {
    next(error);
  }
};

// src/services/weatherService.js
import axios from 'axios';

const VISUAL_CROSSING_API_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

export const getWeatherData = async (city) => {
  try {
    const response = await axios.get(
      `${VISUAL_CROSSING_API_URL}/${encodeURIComponent(city)}`,
      {
        params: {
          unitGroup: 'metric',
          key: process.env.VISUAL_CROSSING_API_KEY
        }
      }
    );

    const { currentConditions, address } = response.data;
    
    return {
      location: address,
      temperature: currentConditions.temp,
      humidity: currentConditions.humidity,
      windSpeed: currentConditions.windspeed,
      conditions: currentConditions.conditions,
      timestamp: new Date(currentConditions.datetime).toISOString()
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('City not found');
    }
    throw new Error('Failed to fetch weather data');
  }
};

// src/services/cacheService.js
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL);
const CACHE_TTL = process.env.CACHE_TTL || 43200; // 12 hours in seconds

export const getCachedData = async (key) => {
  try {
    return await redis.get(key);
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const setCachedData = async (key, value) => {
  try {
    await redis.set(key, value, 'EX', CACHE_TTL);
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

// src/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.message === 'City not found') {
    return res.status(404).json({ error: 'City not found' });
  }

  res.status(500).json({ error: 'Something went wrong!' });
};