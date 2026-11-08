import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const rootDir=path.resolve(root);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
 try {
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);
  if((file!==rootDir&&!file.startsWith(rootDir+path.sep))||pathname.split('/').some(p=>p.startsWith('.'))){res.writeHead(403).end();return;}
  let stat=await fs.stat(file).catch(()=>null);
  if(stat?.isDirectory()){
   if(!pathname.endsWith('/')){res.writeHead(301,{Location:pathname+'/'+new URL(req.url,'http://localhost').search}).end();return;}
   file=path.join(file,'index.html');stat=await fs.stat(file).catch(()=>null);
  }
  const status=stat?.isFile()?200:404;
  if(status===404)file=path.join(root,'404.html');
  const bytes=await fs.readFile(file);
  const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
  if(range&&status===200){const start=Number(range[1]),end=Math.min(Number(range[2]||bytes.length-1),bytes.length-1);if(start>end){res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`}).end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});res.end(bytes.subarray(start,end+1));}
  else {res.writeHead(status,{...headers,'Content-Length':bytes.length});res.end(bytes);}
 }catch{res.writeHead(500).end('Preview error');}
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173/'));
