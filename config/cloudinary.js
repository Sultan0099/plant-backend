const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: 'sabaikram', 
    api_key: '526194336779934', 
    api_secret: 'lNP6jOD7e31eTRUyRHiZB-dWX8s'
})

let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

       streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

module.exports = { streamUpload, cloudinary }