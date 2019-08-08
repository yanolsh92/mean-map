const Marker = require('../models/marker');

exports.bulkSave = (req, res, next) => {
  const markers=[];

  req.body.markers.forEach(m=>{
  const single = new Marker({
    location: m.location,
    creator: req.userData.userId
  });
  markers.push(single)
});

Marker.collection.insertMany(markers).then(createdMarkers =>{
   res.status(201).json({
     message:'Markers successfully saved',
     markers:createdMarkers.ops
     }
   );
 }).catch(error =>{
   res.status(500).json({
     message:'Creating markers failed!'
   });
 })
}

exports.getMarkers = (req, res, next) =>{
  const query = Marker.find({});
  query.find({ creator: req.userData.userId }).then(fetchedMarkers =>{
    res.status(200).json({
      messages: 'Markers fetched successfully',
      markers: fetchedMarkers
    })
  }).catch(error =>{
    res.status(500).json({
      message: 'Fetching markers failed'
    })
  });
}

exports.bulkDelete = (req, res, next) =>{
  Marker.deleteMany({ creator:req.userData.userId}).then(result =>{
      res.status(200).json({ message: 'Deletion successful' });

  }).catch(error => {
    res.status(500).json({
      message: 'Deletion markers failed'
    })
  });
}
