# Users Service

This was an implementation of a microservice whereby people can sign up to a service, get a JWT that would then (hopefully) be used in other microservices to see a list of products / order stuff.  
Users can also do a couple things like invite another user, change their profile, admins can delete users.  

The project was initially supposed to be an API to call but then a basic front-end (using Pug) was put in place so that the service could be demoed to lecturers.  

Service is implemented - https://sausersservice.herokuapp.com/ with docs available at https://sausersservice.herokuapp.com/docs/.  
Email invite will not work since i took my email credentials out of the code.

To run:  
- Git clone / download this repo  
- CD into the installation  
- Change credentials.js to have some correct data to connect to a mongoose connection. Development one will be used when running normally, test one will be used when running "npm run test"  
- (If you want the emailing route to work) Change line 375 and 376 in /routes/users.js to be a gmail account.  
- Run "npm run build"  
- Run "npm run start" / "npm run dev" (with nodemon)
