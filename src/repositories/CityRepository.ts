import cities from './addresses.json';

import ICity from '../models/ICity';

class CityRepository {
	async getAllCities(): Promise<ICity[]> {
		// Possible optimization: read all cities as a stream	
		return cities as ICity[];
	}
}

export default CityRepository;