const gulp = require("gulp");
const webpackStream = require("webpack-stream");
const webpack = require("webpack");
const cleanCSS = require("gulp-clean-css");

gulp.task("webpack",function(){
	return gulp.src("./src/modules/webinterface/src/js/main.js")
		.pipe(webpackStream({
			output: {
				filename: "bundle.js"
			},
			devtool: "source-map",
		}, webpack))
		.pipe(gulp.dest("./src/modules/webinterface/dist/public/js"));

});

gulp.task("css",function(){
	return gulp.src("./src/modules/webinterface/src/css/*.css")
		.pipe(cleanCSS({}))
		.pipe(gulp.dest("./src/modules/webinterface/dist/public/css"));
});

gulp.task("default",["webpack","css"]);