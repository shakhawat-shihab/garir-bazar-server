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
* For Reviews the following routes of api are used:
* /reviews ==> get request to load all reviews,
* /submitReview ==> post request to submit a review
* For Orders the following routes of api are used:
* /orders ==> get request load all the orders,
* /placeOrder ==> post request to place an order,
* /myOrder ==> get reuest to load my orderr with JWT token,
* /deleteOrder/:id ==> delete request to delete an order ,
* /updateOrder/:id ==> put rerquest to update an order
* For managing users the following routes of api are used:
* /users ==> post api to add an user,
* /user ==> put api to add an user,
* /users/:email ==> get API to know user role,
* /users/admin ==> put api to make a user admin, 

