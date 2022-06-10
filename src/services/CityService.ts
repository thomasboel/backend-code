import { autoInjectable } from 'tsyringe';

import ICity from '../models/ICity';

import CityRepository from '../repositories/CityRepository';

import dotenv from 'dotenv';
dotenv.config();

const appEndpoint = `${process.env.APP_HOST}:${process.env.APP_PORT}`;

// This should be stored in a Database, but in this example I will store it in here
const getAreaResultDict: { [key: string]: ICity[] | null; } = {};

@autoInjectable()
class CityService {
	cityRepository: CityRepository;

  constructor(cityRepository: CityRepository) {
		this.cityRepository = cityRepository;
	}

	async getAllCities(): Promise<ICity[]> {	
		const allCities = await this.cityRepository.getAllCities();
		return allCities;
	}

  async getCitiesByTag(tag: string, isActive: boolean): Promise<{ cities: ICity[] }> {
		const allCities = await this.getAllCities();

		const filteredCities = allCities.filter(city => 
			city.tags.includes(tag) && 
			city.isActive === isActive
		);
		
		return { cities: filteredCities };
	}

	async getDistanceBetweenCities(from: string, to: string): Promise<{ from: ICity, to: ICity, unit: string, distance: number }> {
		const allCities = await this.getAllCities();

		const fromCity = allCities.find(city => city.guid === from);
		const toCity = allCities.find(city => city.guid === to);

		if (!fromCity || !toCity) throw new Error("Invalid from city and/or to city.");

		const distance = this._getDistanceBetweenCities(fromCity, toCity);
		
		return { from: fromCity, to: toCity, unit: "km", distance };
	}

	async getCitiesNearCityInDistance(from: string, distance: number): Promise<{ resultsUrl: string }> {
		const guid = "2152f96f-50c7-4d76-9e18-f7033bd14428";

		// Set the result to null in the dictionary, this way we know if a request was made with any given guid when checking for the result.
		getAreaResultDict[guid] = null;
		
		// Execute the calculation after all current functions in the present queue get executed.
		setTimeout(async () => {
			const allCities = await this.getAllCities();

			const fromCity = allCities.find(city => city.guid === from);
			if (!fromCity) throw new Error("Invalid from city.");

			let citiesInArea: ICity[] = [];

			for (const city of allCities) {
				if (city === fromCity) continue;

				const distanceBetweenCityAndFromCity = this._getDistanceBetweenCities(fromCity, city);

				if (distanceBetweenCityAndFromCity <= distance) {
					citiesInArea.push(city);
				}
			}

			getAreaResultDict[guid] = citiesInArea;
		}, 0);

		return { resultsUrl: `${appEndpoint}/area-result/${guid}` };
	}

	async getCitiesNearCityInDistanceResult(resultGuid: string): Promise<{ cities: ICity[] }> {
		const result: ICity[] | null | undefined = getAreaResultDict[resultGuid];

		if (result === undefined) {
			throw new Error("Invalid guid, no such guid was found.");
		}

		if (result === null) {
			throw new Error("Result not yet ready.");
		}

		return { cities: result };
	}

	// https://www.movable-type.co.uk/scripts/latlong.html
	private _getDistanceBetweenCities(fromCity: ICity, toCity: ICity): number {
		const R = 6371; // kilometres
		const φ1 = fromCity.latitude * Math.PI/180; // φ, λ in radians
		const φ2 = toCity.latitude * Math.PI/180;
		const Δφ = (toCity.latitude-fromCity.latitude) * Math.PI/180;
		const Δλ = (toCity.longitude-fromCity.longitude) * Math.PI/180;

		const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
							Math.cos(φ1) * Math.cos(φ2) *
							Math.sin(Δλ/2) * Math.sin(Δλ/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

		return Math.round(R * c * 100) / 100; // in kilometres
	}
}

export default CityService;