const { src, dest } = require("gulp");
const fs = require('fs');
const gulp = require("gulp");
const browsersync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const scss = require('gulp-sass')(require('sass'));
const group_media = require("gulp-group-css-media-queries");
const plumber = require("gulp-plumber");
const del = require("del");

const uglify = require("gulp-uglify-es").default;
const rename = require("gulp-rename");
const fileinclude = require("gulp-file-include");
const clean_css = require("gulp-clean-css");
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const svg = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');

let dist = "dist";
let src_folder = "src";

let path = {
	dist: {
		html: 		dist + "/",
		js: 		dist + "/js/",
		css: 		dist + "/css/",
		images: 	dist + "/img/",
		sprites: 	dist + "/img/sprites/",
		fonts: 		dist + "/fonts/",
		json: 		dist + "/json/"
	},
	src: {
		favicon: 	 src_folder + "/img/favicon.{jpg,png,svg,gif,ico,webp}",
		html: 		 src_folder + "/*.html",
		js: 		 src_folder + "/js/*.js",
		css: 		 src_folder + "/scss/style.scss",
		images: 	 src_folder + "/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
		sprites: 	 src_folder + "/img/svg/*.svg",
		fonts: 		 src_folder + "/fonts/*.ttf",
		json: 		 src_folder + "/json/**/*.*"
	},
	watch: {
		html: 		 src_folder + "/**/*.html",
		js: 		 src_folder + "/**/*.js",
		css: 		 src_folder + "/**/*.scss",
		images: 	 src_folder + "/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
		sprites: 	 src_folder + "/img/svg/*.svg",
		json: 		 src_folder + "/json/**/*.*"
	},
	clean: "./" + dist + "/"
};

let foldersArray = ['videos'];
function copyFolders() {
	foldersArray.forEach(folderItem => {
		src(src_folder + "/" + folderItem + "/**/*.*", {})
			.pipe(newer(dist + "/" + folderItem + "/"))
			.pipe(dest(dist + "/" + folderItem + "/"));
	});
	return src(path.src.html).pipe(browsersync.stream());
}

function browserSync(done) {
	browsersync.init({
		server: {
			baseDir: "./" + dist + "/"
		},
        port: 4000,
        notify: true,
        directory: true
	});
}

function html() {
	return src(path.src.html, {})
		.pipe(fileinclude())
		.on('error', function (err) {
			console.error('Error!', err.message);
		})
		.pipe(dest(path.dist.html))
		.pipe(browsersync.stream());
}

function css() {
	return src(path.src.css, {})
		.pipe(
			scss({ outputStyle: 'expanded' }).on('error', scss.logError)
		)
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(dest(path.dist.css))
		.pipe(browsersync.stream());
}

function json() {
	return src(path.src.json, {})
		.pipe(dest(path.dist.json))
		.pipe(browsersync.stream());
}

function js() {
	return src(path.src.js, {})
		.pipe(fileinclude())
		.on('error', function (err) {
			console.error('Error!', err.message);
		})
		.pipe(
			rename({
				suffix: ".min",
				extname: ".js"
			})
		)
		.pipe(dest(path.dist.js))
		.pipe(browsersync.stream());
}

function images() {
	return src(path.src.images)
		.pipe(newer(path.dist.images))
		.pipe(dest(path.dist.images))
}

function fonts_otf() {
	return src('./' + src_folder + '/fonts/*.otf')
		.pipe(plumber())
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(gulp.dest('./' + src_folder + '/fonts/'));
}
function fonts() {
	src(path.src.fonts)
		.pipe(plumber())
		.pipe(gulp.dest(path.dist.fonts))
		.pipe(ttf2woff())
		.pipe(dest(path.dist.fonts));
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.dist.fonts))
		.pipe(browsersync.stream())

}
function fontstyle() {
	let file_content = fs.readFileSync(src_folder + '/scss/base/_fonts.scss');
	if (file_content == '') {
		fs.writeFile(src_folder + '/scss/base/_fonts.scss', '', cb);
		fs.readdir(path.dist.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(src_folder + '/scss/base/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
	return src(path.src.html).pipe(browsersync.stream());
}

function cb() { }

function clean() {
	return del(path.clean);
}

function watchFiles() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.sprites], sprites);
	gulp.watch([path.watch.images], images);
}

function cssBuild() {
	return src(path.src.css, {})
		.pipe(plumber())
		.pipe(
			scss({ outputStyle: 'expanded' }).on('error', scss.logError)
		)
		.pipe(group_media())
		.pipe(
			autoprefixer({
				grid: true,
				overrideBrowserslist: ["last 5 versions"],
				cascade: true
			})
		)
		.pipe(gulp.dest(path.dist.css))
		.pipe(clean_css())
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(dest(path.dist.css))
		.pipe(browsersync.stream());
}

function jsBuild() {
	let scriptPath = path.dist.js + 'script.min.js';
	let vendorsPath = path.dist.js + 'vendors.min.js';
	del(scriptPath);
	del(vendorsPath);
	return src(path.src.js, {})
		.pipe(plumber())
		.pipe(fileinclude())
		.pipe(gulp.dest(path.dist.js))
		.pipe(uglify(/* options */))
		.on('error', function (err) { console.log(err.toString()); this.emit('end'); })
		.pipe(
			rename({
				suffix: ".min",
				extname: ".js"
			})
		)
		.pipe(dest(path.dist.js))
		.pipe(browsersync.stream());
}

function htmlBuild() {
	return src(path.src.html, {})
		.pipe(plumber())
		.pipe(fileinclude())
		.pipe(dest(path.dist.html))
		.pipe(browsersync.stream());
}

function sprites() {
	return gulp.src(path.src.sprites)
		.pipe(svg({
			shape: {
				dest: "intermediate-svg"
			},
			mode: {
				stack: {
				sprite: "../sprite.svg"
				}
			}
		}
	))
	.pipe(gulp.dest(path.dist.sprites))
	.on("end", browsersync.reload);
};

function sprites() {
    return gulp.src(path.src.sprites)
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svg({
            mode: {
                symbol: {
                    sprite: "../sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest(path.dist.sprites))
        .on("end", browsersync.reload);
};

function sprites() {
	return gulp.src(path.src.sprites)
		.pipe(svg({
			shape: {
				dest: "intermediate-svg",
				id: {
					generator: function(name, file) {
						return file.stem + "-usage";
					}
				}
			},
			mode: {
				symbol: {
					sprite: "../sprite.svg",
					inline: true
				}
			}
		}))
		.pipe(gulp.dest(path.dist.sprites))
		.on("end", browsersync.reload);
};



let fontsBuild = gulp.series(fonts_otf, fonts, fontstyle);
let buildDev = gulp.series(clean, gulp.parallel(fontsBuild, copyFolders, json, html, css, js, sprites, images));
let watch = gulp.series(buildDev, gulp.parallel(watchFiles, browserSync));
let build = gulp.series(clean, gulp.parallel(fontsBuild, htmlBuild, cssBuild, jsBuild, images));

exports.copy = copyFolders;
exports.fonts = fontsBuild;
exports.build = build;
exports.watch = watch;
exports.default = watch;