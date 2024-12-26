import axios from 'axios';
import { ApiError } from '../middleware/errorHandler.js';

const WEATHER_API_URL = process.env.WEATHER_API_BASE_URL;

export const getWeatherData = async (city) => {
  try {
    if (!process.env.VISUAL_CROSSING_API_KEY) {
      throw new ApiError(500, 'Weather API key not configured');
    }

    const response = await axios.get(`${WEATHER_API_URL}/${encodeURIComponent(city)}`, {
      params: {
        unitGroup: 'metric',
        key: process.env.VISUAL_CROSSING_API_KEY
      },
      timeout: parseInt(process.env.API_TIMEOUT) || 5000,
      validateStatus: status => status === 200
    });

    if (!response.data?.currentConditions) {
      throw new ApiError(502, 'Invalid response from weather service');
    }

    return {
      location: response.data.address,
      temperature: response.data.currentConditions.temp,
      humidity: response.data.currentConditions.humidity,
      windSpeed: response.data.currentConditions.windspeed,
      conditions: response.data.currentConditions.conditions,
      timestamp: new Date().toISOString(),
      lastUpdated: response.data.currentConditions.datetime
    };

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new ApiError(504, 'Weather service timeout');
      }
      if (error.response?.status === 404) {
        throw new ApiError(404, 'City not found');
      }
      if (error.response?.status === 401) {
        throw new ApiError(500, 'Invalid API key');
      }
      throw new ApiError(502, 'Weather service unavailable');
    }
    throw error;
  }
};
