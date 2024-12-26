import { getWeatherData } from '../services/weatherService.js';
import { getCachedData, setCachedData } from '../services/cacheService.js';

export const getWeather = async (req, res, next) => {
  try {
    const { city } = req.params;
    
    // Improved input validation
    if (!city || city.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Invalid city parameter. City name must be at least 2 characters long.'
      });
    }

    const normalizedCity = city.trim().toLowerCase();

    // Try to get cached data first
    const cachedData = await getCachedData(normalizedCity);
    if (cachedData) {
      return res.json({ 
        source: 'cache',
        data: JSON.parse(cachedData)
      });
    }

    const weatherData = await getWeatherData(normalizedCity);
    await setCachedData(normalizedCity, JSON.stringify(weatherData));

    res.json({
      source: 'api',
      data: weatherData
    });
  } catch (error) {
    next(error);
  }
};
