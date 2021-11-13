# Project Name : Garir Bazar Server Side

Live-site: https://garir-bazar.herokuapp.com/

## Description

* This is the server side for the Garir Bazar website.
* Diferent API are defined for CRUD operation.
* For Services the following routes of api are used:
* /addService ==> Post request to add a service ,
* /deleteService/:id ==> delete request to delete a service passed by params ,
* /service/byId ==> post request to load the Services having the given IDs,
* /services/car ==> get request to load all cars from services
* For Reviews the following routes of api are used /reviews,  /submitReview 
* For Orders the following routes of api are used /orders,  /placeOrder, /myOrder, /deleteOrder/:id, /updateOrder/:id
* FOr managing users the following routes of api are used /users, /users, /users/:email, /users/admin, 

* /getService is implemented using get API.
* /addService is implemented using post API.
* /deleteOrder is implemented using delete API.
* /updateOrder/:id is implemented using put API.
