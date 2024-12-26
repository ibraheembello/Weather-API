const { getWeather } = require('../Weather API');

test('should return weather data for a valid city', async () => {
	const data = await getWeather('London');
	expect(data).toHaveProperty('temperature');
	expect(data).toHaveProperty('description');
});

test('should throw an error for an invalid city', async () => {
	await expect(getWeather('InvalidCity')).rejects.toThrow('City not found');
});