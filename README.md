## The Project

This is a backend application built with the Express framework with TypeScript.  

The project makes use of the Controller-Service-Repository pattern and you will find that the directory names reflect these.

# Setup & Development

*Commands should be ran from the project root*

- Install dependencies with `npm i`.

- Copy the `.env.example` to a new file named `.env`.  

*In this example I am going to keep the .env commited to git for ease of use, but this is where your precious secrets go normally, and you don't want these to be public.*

- Start the backend with `npm start`.

# Deploy

- Create a build with `npm run build`.

- Deploy the created `build` directory to hosting solution and point the root directory on the Web Server to the `build` directory.
