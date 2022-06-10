import { Request, Router } from 'express';

import { autoInjectable } from 'tsyringe';

import CityService from '../services/CityService';

import dotenv from 'dotenv';
dotenv.config();

@autoInjectable()
class CityController {
	cityService: CityService;
	router: Router;

	constructor(cityService: CityService) {
		this.cityService = cityService;
		this.router = Router();
	}

	routes() {
	  /*
		 * ========== MIDDLEWARE ==========
		 * Authentication Middleware
		 */
		this.router.use('/', (req, res, next) => {
			if (req.token === process.env.APP_AUTHENTICATION_TOKEN) {
				next();
			} else {
				res.status(401).send("Authentication Error.");
			}
		});
		
	  /*
		 * ===== ENDPOINT =====
		 * Retuns a list of all cities
		 * @method GET
		 */
		this.router.get('/all-cities', async (req, res) => {
			try {
				const cities = await this.cityService.getAllCities();
				res.status(200).send(cities);
			} catch (err: any) {
				res.status(400).send(err);
			}
		});

		/*
		 * ===== ENDPOINT =====
		 * Retuns a list of cities filtered by a tag paramater
		 * @method GET
		 */
		interface CitiesByTagRequestQuery {
			tag: string;
			isActive: string;
		}

		this.router.get('/cities-by-tag', async (req: Request<{}, {}, {}, CitiesByTagRequestQuery>, res) => {
			const { tag, isActive } = req.query;

			const parsedIsActive = Boolean(isActive);

			try {
				const cities = await this.cityService.getCitiesByTag(tag, parsedIsActive);
				res.status(200).send(cities);
			} catch (err: any) {
				res.status(400).send(err);
			}
		});

		/*
		 * ===== ENDPOINT =====
		 * Returns the distance between two given cities
		 * @method GET
		 */
		interface DistanceRequestQuery {
			from: string;
			to: string;
		}

		this.router.get('/distance', async (req: Request<{}, {}, {}, DistanceRequestQuery>, res) => {
			const { from, to } = req.query;

			try {
				const distance = await this.cityService.getDistanceBetweenCities(from, to);
				res.status(200).send(distance);
			} catch (err: any) {
				res.status(400).send(err);
			}
		});

		/*
		 * ===== ENDPOINT =====
		 * Initiates the calculation of an amount of cities around a given city within a given distance
		 * @method GET
		 */
		interface AreaRequestQuery {
			from: string;
			distance: string;
		}

		this.router.get('/area', async (req: Request<{}, {}, {}, AreaRequestQuery>, res) => {
			const { from, distance } = req.query;

			const parsedDistance = Number(distance);

			try {
				const requestGuid = await this.cityService.getCitiesNearCityInDistance(from, parsedDistance);
				res.status(202).send(requestGuid);
			} catch (err: any) {
				res.status(400).send(err);
			}
		});

		/*
		 * ===== ENDPOINT =====
		 * Initiates the calculation of an amount of cities around a given city within a given distance
		 * @method GET
		 */
		interface AreaResultRequestParams {
			guid: string;
		}

		this.router.get('/area-result/:guid', async (req: Request<AreaResultRequestParams>, res) => {
			const { guid } = req.params;

			try {
				const result = await this.cityService.getCitiesNearCityInDistanceResult(guid);
				res.status(200).send(result);
			} catch (err: any) {
				if (err.message === "Invalid guid, no such guid was found.") {
					res.status(400).send(err);
				}
				else if (err.message === "Result not yet ready.") {
					res.status(202).send();
				}
			}
		});

		return this.router;
	}
}

export default CityController;