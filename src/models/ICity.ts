export default interface ICity {
	guid: string;
	isActive: boolean;
	address: string;
	latitude: number;
	longitude: number;
	tags: string[];
}