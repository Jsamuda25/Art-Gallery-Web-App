# Art-Gallery-Web-App
Social Media Application based around an interactive art gallery.

This program implements an online art gallery that allows users to follow artists, like artwork,
leave artwork reviews and more. The MongoDB database technology is used to store all relevant data, the PUG template
engine is used to deliver the front end and the backend of the program is done using JavaScript with NodeJS, Express and
sessions.


# General Design elements

- Sessions are used to maintain the loggede in user's preferences and settings.
- My interface has an orange and blue color scheme.
- The header of my pages has links that serve as navigation tools to various page. This was implemented in place of
a designated “Your Profile” page. For example, users can navigate their liked photos from the header navigation
bar.
- Users can see all artwork they have uploaded through a personal catalogue page.
- Artists can see all the workshops they have created via a designated page (I believe this is an extra piece of
functionality).
- Users can see all workshops they joined on a specific page.
- A bell icon that acts a link has been added so users can navigate to their notifications
- A brush icon will appear in the header if user is an artist/ is in artist mode.
- The search for an artwork functionality is implemented using a dropdown bar and search bar.
- Users can delete their reviews.
- Users can view all the workshops they are enrolled in (I believe this is an extra piece of functionality).
- PUG forms and parametrized URL IDs were used as much as possible to send or get information.

# Launching instructions

- Download and extract app.zip file
- Input ‘npm install’ in the terminal of correct directory location
- Input ‘node database-initializer.js’ in correct terminal to initialize database
- Input 'node server.js' in correct terminal to run the server
- Input URL http://localhost:3000/ in browser
- Now you can test the application


# Photos
![Screenshot 2022-12-27 at 18-00-43 Artist Page](https://user-images.githubusercontent.com/92758403/209734881-b2f70692-d251-456c-9b82-5ae71a266f80.png)

![Screenshot 2022-12-27 at 17-59-38 Login Page](https://user-images.githubusercontent.com/92758403/209734862-0388e223-ea8c-4ecd-aeec-f448f1764813.png)

![Screenshot 2022-12-27 at 18-00-25 Upload Page](https://user-images.githubusercontent.com/92758403/209734956-3858f62d-9ff3-4160-a077-9bdf7670c972.png)

![Screenshot 2022-12-27 at 18-00-00 Home Page](https://user-images.githubusercontent.com/92758403/209734966-98ad49fa-7a20-4f3e-a2a5-209383e58a8f.png)





