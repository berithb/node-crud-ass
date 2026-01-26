import cloudinary from "../config/cloudinary";

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string
) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) reject(error);
        resolve(result);
      })
      .end(buffer);
  });
};
