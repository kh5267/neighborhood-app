# Neighborhood Map (React) Project

This is the final assessment project for Udacity's React Fundamentals course.

Developer:  Kevin Huibregtse
Date: 02/8/2019

### Instructions

1. In a terminal, run "npm start" to create the local web server.
2. In a browser, navigate to "localhost: 3000"
3. How the application works
    a. The neighborhood of Cedarburg, WI is displayed on the map
    b. On the left is a list of popular locations in this neighborhood
    c. The user can filter the list by typing in the entry field - both the location list and visible markers are filtered
    d. Clicking a location will cause the associated marker to bounce twice, and Yelp reviews (if found) will be populated in the lower left window
    e. Clicking a marker will populate the Yelp reviews as well
    f. The proportions and fonts will adjust as the window size shrinks

### Dependencies
React
https://maps.googleapis.com/maps/api/
https://api.yelp.com/v3/businesses/matches
https://api.yelp.com/v3/businesses/{id}/reviews


### Required Files
src/App.css
src/App.js
src/index.js
src/Map.js
public/index.html
package-lock.json
package.json