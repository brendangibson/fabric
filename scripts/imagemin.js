import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';

await imagemin(['static/assets/*.{jpg,png}'], {
	destination: 'static/assets/webp',
	plugins: [imageminWebp({ quality: 50 })]
});

console.log('Images optimized');
