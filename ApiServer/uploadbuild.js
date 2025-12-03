const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");

async function uploadBuild() {
  const client = new ftp.Client();
  client.ftp.verbose = true; // Set to true if you want more detailed logs
  client.ftp.timeout = 2000000;
  try {
    // Connect to FTP server
    await client.access({
      host: "api.jlisting.org", // FTP server host
      user: "ftp@api.jlisting.org", // FTP username
      password: "8317537171", // FTP password
      secure: false, // Set to true if using FTPS
    });

    console.log("Connected to FTP server");
    // Navigate to the folder where the files need to be uploaded
    await client.ensureDir("/"); // Folder on the server

    // Get the build folder path
    const buildFolderPath = path.join(__dirname, "dist");

    // Upload all files in the build folder
    console.log("Uploading build folder...");
    await client.uploadFromDir(buildFolderPath);
    console.log("Upload successful!");
  } catch (err) {
    console.error("Error during FTP upload:", err);
  } finally {
    client.close();
  }
}

uploadBuild();
