const ftp = require("basic-ftp");
const path = require("path");

async function uploadBuild() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 100000;

  try {
    await client.access({
      host: "api.gradwalk.us",
      user: "admin_ftp_api",
      password: "Krishna@6938",
      secure: false,
    });

    console.log("Connected to FTP server");

    // Safer deploy: upload to temp dir and then atomically rename
    const buildFolderPath = path.join(__dirname, "dist");

    // Always operate from FTP root where public_html lives
    try {
      await client.cd("/");
    } catch {}

    const TMP_DIR = "public_html_next";
    const LIVE_DIR = "public_html";
    const PREV_DIR = "public_html_prev";

    console.log(`Preparing temp dir: ${TMP_DIR}`);
    await client.ensureDir(TMP_DIR);
    await client.cd(TMP_DIR);
    try {
      // Clear any leftovers from previous failed deploys
      await client.clearWorkingDir();
    } catch (e) {
      // ignore if not supported
    }

    console.log("Uploading build folder to temp dir...");
    await client.uploadFromDir(buildFolderPath);

    // Go back to root to perform renames
    try {
      await client.cd("/");
    } catch {}

    // Remove previous backup if exists
    try {
      console.log(`Cleaning previous backup: ${PREV_DIR}`);
      await client.removeDir(PREV_DIR);
    } catch (e) {
      // ignore if it doesn't exist
    }

    // Move current live to backup if exists
    try {
      console.log(`Renaming ${LIVE_DIR} -> ${PREV_DIR}`);
      await client.rename(LIVE_DIR, PREV_DIR);
    } catch (e) {
      console.log(`No existing ${LIVE_DIR} to backup or rename not supported.`);
    }

    // Promote temp to live
    console.log(`Promoting ${TMP_DIR} -> ${LIVE_DIR}`);
    await client.rename(TMP_DIR, LIVE_DIR);

    console.log("Upload + promote successful!");
  } catch (err) {
    console.error("Error during FTP upload:", err);
  } finally {
    client.close();
  }
}

uploadBuild();
