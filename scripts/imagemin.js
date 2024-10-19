import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';

await imagemin(['static/assets/*.{jpg,png}'], {
	destination: 'static/assets/webp',
	plugins: [imageminWebp({ quality: 50 })]
});

await imagemin(['static/bigLogo.png'], {
	destination: 'static',
	plugins: [imageminWebp({ quality: 75 })]
});

console.log('Images optimized');
