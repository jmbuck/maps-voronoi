# Voronoi Diagrams on Maps

This project was created as a final project for CS 531 Computational Geometry at Purdue. Using the Google Maps API, you can locate different types of landmarks (e.g. hospital, restaurant) in a city and generate a Voronoi Diagram around them. 

You can also search by keyword for places (e.g. McDonalds) to retrieve points for a Voronoi Diagram.

Lastly, you can get all of the cities above a certain population threshold in a US State or any country and generate a Voronoi Diagram using the cities as points. For states, the population threshold is 1500. For the US, the population threshold is 5000. All other countries have no population threshold since the data for non-US countries is much more sparse.

Since it is not easy to get a list of cities in a state using the Google Maps API, US cities and World cities are provided by simplemaps:

US Cities: https://simplemaps.com/data/us-cities 

World Cities: https://simplemaps.com/data/world-cities

# Installation

1. Run `npm install` to get the project dependencies
2. Create a file `secret.js` following the template in `secret.example.js` and add your Google Maps API key and project id. The API Key should have the Maps, Places, and Geocoding APIs enabled.
3. Get the cities data from the URLs provided, and add them to a `data` folder inside of `src` as `uscities.csv` and `worldcities.csv`
4. Start the local client with `npm start`