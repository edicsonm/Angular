/**
 * 
 */
var fun = function (){
	this.name = 'Edicson';
	this.lastName = 'Morales';
	this.despedida = 'Adios';
	
	this.saludar = function() {
		this.saludo = [{numero:'uno'},{numero:'dos'}];
		return this.saludo;
	}
	
	this.$get = function() {
		this.name = 'Edicson Morales';
		return this.name;
	}
	
	return this.name;
}
var MyAppModule = angular.module('MyAppModule', ['ui.bootstrap']);

/*MyAppModule.service('mainService', fun);
MyAppModule.provider('mainProvider', fun);
MyAppModule.factory('mainFactory', fun);*/

MyAppModule.service('userService', ['$http', '$q', '$log','$location',  function($http, $q, $log, $location) {
	var host = 'http://'+$location.host();
	return {
		saludar : function() {
			return "Bienvenidos a mi sistema!";
		},
		
		listarUsuarios : function() {
			var deferrer = $q.defer();
			$http.jsonp(host + '/SpringRestful/user?callback=JSON_CALLBACK')
			.success(function(data) {
				deferrer.resolve(data);
			})
			.error(function(error) {
				deferrer.reject(error);
			});
			return deferrer.promise
		},
		
		crearUsuario: function(user) {
			var deferrer = $q.defer();
			$http.post(host + '/SpringRestful/user',user)
			.then(function(value) {//Success
				console.log(value);
				/*console.log(value.data);
				console.log(value.status);
				console.log(value.headers);
				console.log(value.headers.url);
				console.log(value.config);
				console.log(value.config.url);
				console.log(value.statusText);*/
				
				deferrer.resolve(value)
			}, function(reason) {//Error
				console.log(reason);
				deferrer.reject(reason);
			}, function(value) {//Notify
				console.log(value);
			})
			return deferrer.promise
		},
		
		actualizarUsuario : function(user) {
			var deferrer = $q.defer();
			$http.put(host + '/SpringRestful/user',user)
			.then(function(value) {//Success
				console.log(value);
				/*console.log(value.data);
				console.log(value.status);
				console.log(value.headers);
				console.log(value.headers.url);
				console.log(value.config);
				console.log(value.config.url);
				console.log(value.statusText);*/
				deferrer.resolve(value)
			}, function(reason) {//Error
				console.log(reason);
				deferrer.reject(reason);
			}, function(value) {//Notify
				console.log(value);
			})
			return deferrer.promise
		},
		
		eliminarUsuario : function(user) {
			var deferrer = $q.defer();
			$http.delete(host + '/SpringRestful/user/'+user.name)
			.then(function(value) {//Success
				console.log(value);
				deferrer.resolve(value)
			}, function(reason) {//Error
				console.log(reason);
				deferrer.reject(reason);
			}, function(value) {//Notify
				console.log(value);
			})
			return deferrer.promise
		}
	};
	
}]);

MyAppModule.controller('mainController', ['$scope','$http', '$uibModal', 'userService', function($scope, $http, $uibModal, userService) {
	
	$scope.users = [];
	$scope.ocultar = function() {
		$scope.hide = true;
	}
	
	$scope.saludo = userService.saludar();
	
	$scope.eliminar = function(user, size) {
		var modalInstance = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'confirmation.html',
			controller:function($scope, $uibModalInstance, user){
				$scope.text = 'Estas seguro de querer eliminar el registro?'
				
				$scope.ok = function () {
					userService.eliminarUsuario(user).then(
						function(data) {
							console.log(data);
							$uibModalInstance.close(data);
						}, function(reason) {
							console.log(reason);
						})
				};
				$scope.cancel = function () {
					$uibModalInstance.dismiss('Cancel');
				}
			},
			size:size,
			resolve:{
				user:function (){return user}
			}
		});
		
		modalInstance.result.then(function (data){
			if(data.status == 204){
				$scope.obtenerUsuarios();
    			console.log('Usuario eliminado satisfactoriamente');
    			$scope.titleMessage = 'Success';
    			$scope.message = 'Usuario eliminado satisfactoriamente';
    			$scope.classAlert = 'success';
    			$scope.hide = false;
    		}
	    });
		
	};
	
	$scope.editar = function(user, size) {
		var modalInstance = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'userForm.html',
			controller:function ($scope, $uibModalInstance, title, user){
				$scope.name = user.name;
				$scope.lastName = user.lastName;
				$scope.title = title;
				$scope.disabled = true;
				
				$scope.save = function () {
					$scope.user = {name:$scope.name, lastName:$scope.lastName};
					userService.actualizarUsuario($scope.user).then(
	    		    	   function(data) {
		    		    		console.log(data);
		    		    		$uibModalInstance.close(data);
		    		    	}, function(reason) {
		    		    		
		    		    		$scope.titleMessage = 'Error';
	    		    			$scope.classAlert = 'danger';
	    		    			$scope.hide = false;
	    		    			$scope.messages = [];
	    		    			
	    		    			var fieldErrors = reason.data.fieldErrors;
	    		    			for (var int = 0; int < fieldErrors.length; int++) {
	    		    				var messageAUX = fieldErrors[int].field + ' ' +fieldErrors[int].message;
									var message = {message:messageAUX};
									$scope.messages.push(message);
								}
		    		    	});
				};
				$scope.cancel = function () {
					$uibModalInstance.dismiss('Cancel');
				}
			},
			size: size,
		    resolve: {
		    	title : function(){return 'Actualizar Usuario'},
		    	user:function(){return user}
		    }
		});
		
		modalInstance.result.then(function (data){
			if(data.status == 201){
				$scope.obtenerUsuarios();
    			console.log('Usuario actualizado satisfactoriamente');
    			$scope.titleMessage = 'Success';
    			$scope.message = 'Usuario actualizado satisfactoriamente';
    			$scope.classAlert = 'success';
    			$scope.hide = false;
    		}
	    });
		
	};
	
	$scope.agregar = function (size) {
		var modalInstance = $uibModal.open({
		animation: $scope.animationsEnabled,
		templateUrl: 'userForm.html',
		controller: function ($scope, $uibModalInstance, title, user) {
				$scope.hide = true;
				$scope.title = title;
				$scope.name = user.name;
				$scope.lastName = user.lastName;
				
				$scope.save = function () {
					$scope.user = {name:$scope.name, lastName:$scope.lastName};
					    		
		    		console.log(userService.saludar());
		    		userService.crearUsuario($scope.user).then(
		    		    	   function(data) {
		    		    		console.log(data);
		    		    		if(data.status == 201){
		    		    			console.log('Usuario registrado satisfactoriamente');
		    		    			$scope.titleMessage = 'Success';
		    		    			$scope.message = 'Usuario registrado satisfactoriamente';
		    		    			$scope.classAlert = 'success';
		    		    			$scope.hide = false;
		    		    			$uibModalInstance.close(data);
		    		    		} 
		    		    	}, function(reason) {
		    		    		
		    		    		$scope.titleMessage = 'Error';
	    		    			$scope.classAlert = 'danger';
	    		    			$scope.titleMessage = 'Error';
	    		    			$scope.hide = false;
	    		    			$scope.messages = [];
	    		    			
	    		    			var fieldErrors = reason.data.fieldErrors;
	    		    			for (var int = 0; int < fieldErrors.length; int++) {
	    		    				var messageAUX = fieldErrors[int].field + ' ' +fieldErrors[int].message;
									var message = {message:messageAUX};
									$scope.messages.push(message);
//									console.log(message.field + ' --> ' +message.message);
								}
	    		    			
		    		    	})
		    	    
		    	  };
		    	  
		    	  $scope.cancel = function () {
		    		  $uibModalInstance.dismiss('Cancel');
		    	  }
		      },
		      size: size,
		      resolve: {
		    	  title : function(){return 'Agregar Usuario'},
		    	  user : function(){return {name:'Nidia', lastName:'Morales'}}
		      }
		    });
		
		modalInstance.result.then(function (data){
			if(data.status == 201){
				$scope.obtenerUsuarios();
    			console.log('Usuario registrado satisfactoriamente');
    			$scope.titleMessage = 'Success';
    			$scope.message = 'Usuario registrado satisfactoriamente';
    			$scope.classAlert = 'success';
    			$scope.hide = false;
    		}
	    });
		
	};
	
	$scope.obtenerUsuarios = function(){
		userService.listarUsuarios().then(
			function(data) {
				$scope.users =  data;
			}, function(reason) {
				console.log('Error presente al tratar de obtener usuarios' + reason);	
		});
	};
	
}]);



