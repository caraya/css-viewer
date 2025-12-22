module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{js,css,html,png,svg,json}'
	],
	swDest: 'dist/sw.js',
    maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // Increase limit for large JSON files
};
