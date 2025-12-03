const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");

async function uploadUpdatedFiles() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: "gradwalk.us", // FTP server host
      user: "ftpgradwalk", // FTP username
      password: "ftpgradwalk", // FTP password
      secure: false, // Set to true if using FTPS
    });

    const localDir = path.join(__dirname, "build");
    const remoteDir = "web/panel.gradwalk.us/public_html";

    async function uploadDirectory(localDir, remoteDir) {
      await client.ensureDir(remoteDir);
      const files = fs.readdirSync(localDir);

      for (const file of files) {
        const localPath = path.join(localDir, file);
        const remotePath = path.join(remoteDir, file);

        const localStats = fs.statSync(localPath);

        if (localStats.isFile()) {
          // Check if the remote file exists and get its stats
          try {
            const remoteStats = await client.size(remotePath);

            if (localStats.mtime > remoteStats.date) {
              console.log(`Uploading updated file: ${file}`);
              await client.uploadFrom(localPath, remotePath);
            }
          } catch (err) {
            // If file doesn't exist on remote, upload it
            console.log(`Uploading new file: ${file}`);
            await client.uploadFrom(localPath, remotePath);
          }
        } else if (localStats.isDirectory()) {
          await uploadDirectory(localPath, remotePath);
        }
      }
    }

    await uploadDirectory(localDir, remoteDir);
  } catch (err) {
    console.error(err);
  }

  client.close();
}

uploadUpdatedFiles();
