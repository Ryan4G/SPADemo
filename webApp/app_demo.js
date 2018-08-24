/*
 * app_demo.js 
 */

 function Car(name, color = 'red'){
 	this.name = name;
 	this.color = color;
 	this.describes = function(){
 		console.log('my car named %s , and its color is %s ', this.name, this.color);
 	};
 }

 var myCar = new Car('bob', 'blue');
 myCar.describes();

 Car.prototype.price = 120;
 Car.prototype.howmuch = function(){
 	console.log("the %s car price is %d", this.color, this.price);
 }

 myCar.howmuch();

 function Truck(name, color, wheels){
 	Car.call(this, name, color);
 	this.wheels = wheels;
 	this.log = function(){
 		console.log('this %s car named %s , it has %d wheels.', this.color, this.name, this.wheels);
 	}
 }

 var myTruck = new Truck('sssa', 'green', 4);
 myTruck.describes();
 myTruck.log();