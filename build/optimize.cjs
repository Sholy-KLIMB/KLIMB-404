// Build the single-file Webflow embed. Requires esbuild and sharp.
const fs=require('fs'),path=require('path');
const esbuild=require('esbuild');
const sharp=require('sharp');
(async()=>{
const source=fs.readFileSync(path.join(__dirname,'klimb-embed.source.html'),'utf8');
let js=source.match(/<script>([\s\S]*?)<\/script>/)[1];
const css=source.match(/<style>([\s\S]*?)<\/style>/)[1];
const png=Buffer.from(js.match(/data:image\/png;base64,([^']+)/)[1],'base64');
const webp=await sharp(png).webp({lossless:true,effort:6}).toBuffer();
// Verify RGBA samples rather than assuming the format conversion is lossless.
const rgbaA=await sharp(png).ensureAlpha().raw().toBuffer();
const rgbaB=await sharp(webp).ensureAlpha().raw().toBuffer();
for(let i=0;i<rgbaA.length;i+=4){if(rgbaA[i+3]!==rgbaB[i+3]||(rgbaA[i+3]&&(!rgbaA.subarray(i,i+3).equals(rgbaB.subarray(i,i+3)))))throw Error('Sprite pixels changed');}
if(webp.length<png.length)js=js.replace('data:image/png;base64,'+png.toString('base64'),'data:image/webp;base64,'+webp.toString('base64'));
const minJS=(await esbuild.transform(js,{loader:'js',minify:true,target:'es2020',legalComments:'none',charset:'utf8'})).code;
const minCSS=(await esbuild.transform(css,{loader:'css',minify:true,target:['chrome100','safari15','firefox100'],legalComments:'none',charset:'utf8'})).code;
let output=source.replace(/<!--[\s\S]*?-->/g,'').replace(/<style>[\s\S]*?<\/style>/,'<style>'+minCSS.trim()+'</style>').replace(/<script>[\s\S]*?<\/script>/,'<script>'+minJS.trim()+'</script>').trim();
fs.writeFileSync(path.join(__dirname,'../klimb-jeu-embed-webflow.html'),output);
const before=Buffer.byteLength(source),after=Buffer.byteLength(output);
const report={before,after,saved:before-after,reductionPercent:Number(((1-after/before)*100).toFixed(1)),spritesLossless:true};
fs.writeFileSync(path.join(__dirname,'optimization.json'),JSON.stringify(report,null,2));console.log(report);
})().catch(e=>{console.error(e);process.exit(1)});
