// const AWS = require('aws-sdk')
// const { aws } = require('./vars')
// const fs = require('fs')

// const s3 = new AWS.S3({
//     region: aws.region,
//     accessKeyId: aws.access_key,
//     secretAccessKey: aws.secret_key
// })

// exports.uploadFileToS3 = (file,fileName) => {

//     const binaryImageData = Buffer.from(file, 'base64');

//     const uploadParams = {
//         Bucket: aws.bucket_name,
//         Body: binaryImageData,
//         Key: fileName
//     }

//     return s3.upload(uploadParams).promise()
// }

// exports.getFileStream = (fileKey) => {
//     const downloadParams = {
//         Key: fileKey,
//         Bucket: aws.bucket_name
//     }

//     return s3.getObject(downloadParams).createReadStream()
// }

// exports.deleteFileFromS3 = (fileKey) => {
//     const params = {
//         Bucket: aws.bucket_name,
//         Key: fileKey,
//     };
    
//     s3.deleteObject(params, (err, data) => {
//         if (err) {
//             console.error('Error deleting the file:', err);
//         } else {
//             console.log('File deleted successfully:', data);
//         }
//     });
// }

const fs = require('fs');
const path = require('path');
const { getRandomNumbers } = require("../utils");

// Function to upload a file locally
exports.uploadFile = async (base64) => {
  try {
    if (!base64.startsWith('data:image')) {
      return {
        status: 1,
        message: 'Uploaded file is not an image.',
      };
    }

    const fileSizeKB = checkBase64FileSize(base64);
    if (fileSizeKB > file.upload_image_size) {
      return {
        status: 1,
        message: `File size should be under ${file.upload_image_size} KB`,
      };
    }

    const fileExtension = getFileExtensionFromBase64(base64) || 'png';
    const fileName = getRandomNumbers() + Date.now() + '.' + fileExtension;
    const filePath = path.join(__dirname, '../uploads', fileName);

    // Remove the data:image/jpeg;base64 header to get the base64 data
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const binaryImageData = Buffer.from(base64Data, 'base64');

    // Write the file to local disk
    await fs.promises.writeFile(filePath, binaryImageData);

    return {
      status: 0,
      data: { filePath }, // Return the file path for reference if needed
    };
  } catch (error) {
    return {
      status: 1,
      message: error.message,
    };
  }
};

// Function to get a file stream locally
exports.getFileStream = (fileName) => {
  try {
    const filePath = path.join(__dirname, '../uploads', fileName);
    const readStream = fs.createReadStream(filePath);

    readStream.on('error', (err) => {
      console.error('Error reading image:', err);
    });

    return readStream;
  } catch (error) {
    console.error('Error getting file stream:', error);
    return null;
  }
};

// Function to delete a file locally
exports.deleteFile = async (fileName) => {
  try {
    const filePath = path.join(__dirname, '../uploads', fileName);
    await fs.promises.unlink(filePath); // Delete the file

    return {
      status: 0,
      message: 'File deleted successfully.',
    };
  } catch (error) {
    return {
      status: 1,
      message: `Error deleting the file: ${error.message}`,
    };
  }
};
