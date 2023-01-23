import axios from "axios";

interface ILocationResponse {
  country_name: string;
  city: string;
  time_zone: string;
}

const locationApiKey = process.env.LOCATION_API_KEY!;

async function getLocation(ipAddress: string): Promise<ILocationResponse> {
  try {
    return (
      await axios.get<ILocationResponse>(`https://api.ipgeolocation.io/ipgeo?apiKey=${locationApiKey}&ip=${ipAddress}`)
    ).data;
  } catch (err) {
    return {
      country_name: "unknown",
      city: "unknown",
      time_zone: "unknown",
    };
  }
}

export default getLocation;
