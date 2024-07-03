const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ghpages = require("gh-pages");

// Helper function to update version in a file
const updateVersion = (filePath, regex, newVersion) => {
	const data = fs.readFileSync(filePath, "utf8");
	const result = data.replace(regex, `$1${newVersion}$3`);
	fs.writeFileSync(filePath, result, "utf8");
	console.log(`Updated version in ${filePath} to ${newVersion}`);
};

// Step 1: Update version in package.json
const packageJsonPath = path.join(__dirname, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const currentVersion = packageJson.version;
const versionParts = currentVersion.split(".").map(Number);
versionParts[2] += 1;
const newVersion = versionParts.join(".");
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf8");
console.log(`Updated version in package.json to ${newVersion}`);

// Step 2: Update version in plugin.xml
const pluginXmlPath = path.join(__dirname, "plugin.xml");
updateVersion(
	pluginXmlPath,
	/(<plugin[^>]* version=")([^"]+)("[^>]*>)/,
	newVersion
);

// Step 3: Run "npm run build" in the www folder
const wwwPath = path.join(__dirname, "www");
execSync("npm run build", { cwd: wwwPath, stdio: "inherit" });
console.log("Build completed in www folder");

// Step 4: Run "npm publish" in the root directory
execSync("npm publish", { stdio: "inherit" });
console.log("Published to npm");

const docsPath = path.join(wwwPath, "build", "docs");
ghpages.publish(
	docsPath,
	{
		branch: "gh-pages",
		message: `docs: update to version ${newVersion}`,
	},
	(err) => {
		if (err) {
			console.error("Failed to publish documentation to GitHub Pages", err);
		} else {
			console.log("Published documentation to GitHub Pages");
		}
	}
);
