# oxford-face-api
oxford-face-api provides a interface with the Face APIs in Microsoft Project Oxford.

## Installation

```
$npm install oxford-face-api
```

## Usage

```node.js
var Face = require('oxford-face-api');
var face = new Face(YOUR_FACE_API_PRIMARY_KEY);

face.detection(image_url, function(error, response_body){
  ...
});

face.identification(face_ids, group_id, limit, function(error, response_body){
  ...
});

face.create_a_person(group_id, person_name, face_ids, function(error, response_body){
  ...
});

face.add_a_person_face(group_id, person_id, face_id, function(error, response_body){
  ...
});

face.train_persongroup(group_id, function(error, response_body){
  ...
});
```
