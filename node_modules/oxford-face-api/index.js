'use strict'

var request = require("superagent");

var Face = function(api_primary_key){
	this.API_PRIMARY_KEY = api_primary_key;
	this.API_URL = "https://api.projectoxford.ai/face/v0";
}

Face.prototype.detection = function(image_url, callback) {
	var request_body = {
		url: image_url
	};
	request
		.post(this.API_URL + "/detections")
		.query({analyzesFaceLandmarks: true})
		.query({analyzesAge: true})
		.query({analyzesGender: true})
		.query({analyzesHeadPose: true})
		.set('Content-Type', 'application/json')
		.set('Ocp-Apim-Subscription-Key', this.API_PRIMARY_KEY)
		.send(request_body)
		.end(function(error, response) {
			if(!error && response.statusCode == 200) {
				return callback(null, response.body);
			} else {
				return callback(error);
			}
	});
}

Face.prototype.identification = function(face_ids, group_id, limit, callback){
  var request_body = {
    faceIds: face_ids,
    personGroupId: group_id,
    maxNumOfCandidatesReturned: limit
  };
	request
		.post(this.API_URL + "/identifications")
		.set('Content-Type', 'application/json')
		.set('Ocp-Apim-Subscription-Key', this.API_PRIMARY_KEY)
		.send(request_body)
		.end(function(error, response) {
			if(!error && response.statusCode == 200) {
				return callback(null, response.body);
			} else {
				return callback(error);
			}
	});
}

Face.prototype.add_a_person_face = function(group_id, person_id, face_id, callback){
	var request_body = {
		userData: ""
	};
	request
		.put(this.API_URL + "/persongroups/" + group_id + "/persons/" + person_id + "/faces/" + face_id)
		.set('Content-Type', 'application/json')
		.set('Ocp-Apim-Subscription-Key', this.API_PRIMARY_KEY)
		.send(request_body)
		.end(function(error, response) {
			if(!error && response.statusCode == 200) {
				return callback(null, response.body);
			} else {
				return callback(error);
			}
	});
};

Face.prototype.create_a_person = function(group_id, person_name, face_ids, callback){
	var request_body = {
		faceIds: face_ids,
		name: person_name,
		userData: ""
	};
	request
		.post(this.API_URL + "/persongroups/" + group_id + "/persons")
		.set('Content-Type', 'application/json')
		.set('Ocp-Apim-Subscription-Key', this.API_PRIMARY_KEY)
		.send(request_body)
		.end(function(error, response) {
			if(!error && response.statusCode == 200) {
				return callback(null, response.body);
			} else {
				return callback(error);
			}
	});
};

Face.prototype.train_persongroup = function(group_id, callback){
	request
		.post(this.API_URL + "/persongroups/" + group_id + "/training")
		.set('Ocp-Apim-Subscription-Key', this.API_PRIMARY_KEY)
		.end(function(error, response) {
			if(!error && (response.statusCode == 200 || response.statusCode == 201)) {
				return callback(null, response.body);
			} else {
				return callback(error);
			}
	});
};

module.exports = Face;
