(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},t={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},n=1e3,r=1001,i=1002,a=1003,o=1004,s=1005,c=1006,l=1007,u=1008,d=1009,f=1010,p=1011,m=1012,h=1013,g=1014,_=1015,v=1016,y=1017,b=1018,x=1020,S=35902,C=35899,w=1021,T=1022,E=1023,D=1026,O=1027,k=1028,A=1029,j=1030,M=1031,N=1033,P=33776,F=33777,I=33778,L=33779,R=35840,ee=35841,te=35842,ne=35843,z=36196,B=37492,V=37496,re=37488,ie=37489,H=37490,ae=37491,oe=37808,se=37809,ce=37810,le=37811,ue=37812,de=37813,fe=37814,pe=37815,me=37816,he=37817,ge=37818,_e=37819,ve=37820,ye=37821,be=36492,xe=36494,Se=36495,Ce=36283,we=36284,Te=36285,Ee=36286,U=2300,De=2301,Oe=2302,ke=2303,W=2400,Ae=2401,G=2402,je=3200,Me=`srgb`,Ne=`srgb-linear`,Pe=`linear`,Fe=`srgb`,Ie=7680,Le=35044,Re=35048,ze=2e3;function Be(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Ve(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function He(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Ue(){let e=He(`canvas`);return e.style.display=`block`,e}var We={};function Ge(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function Ke(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function qe(...e){e=Ke(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function Je(...e){e=Ke(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Ye(...e){let t=e.join(` `);t in We||(We[t]=!0,qe(...e))}function Xe(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var Ze={0:0,2:6,4:4,3:5,1:1,6:2,7:7,5:3},Qe=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},$e=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),et=1234567,tt=Math.PI/180,nt=180/Math.PI;function rt(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return($e[e&255]+$e[e>>8&255]+$e[e>>16&255]+$e[e>>24&255]+`-`+$e[t&255]+$e[t>>8&255]+`-`+$e[t>>16&15|64]+$e[t>>24&255]+`-`+$e[n&63|128]+$e[n>>8&255]+`-`+$e[n>>16&255]+$e[n>>24&255]+$e[r&255]+$e[r>>8&255]+$e[r>>16&255]+$e[r>>24&255]).toLowerCase()}function it(e,t,n){return Math.max(t,Math.min(n,e))}function at(e,t){return(e%t+t)%t}function ot(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function st(e,t,n){return e===t?0:(n-e)/(t-e)}function ct(e,t,n){return(1-n)*e+n*t}function lt(e,t,n,r){return ct(e,t,1-Math.exp(-n*r))}function ut(e,t=1){return t-Math.abs(at(e,t*2)-t)}function dt(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function ft(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function pt(e,t){return e+Math.floor(Math.random()*(t-e+1))}function mt(e,t){return e+Math.random()*(t-e)}function ht(e){return e*(.5-Math.random())}function gt(e){e!==void 0&&(et=e);let t=et+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function _t(e){return e*tt}function vt(e){return e*nt}function yt(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function bt(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function xt(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function St(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:qe(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function Ct(e){switch(e.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function wt(e,t){if(t.constructor===Float32Array)return e;let n=Ct(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.max(e/n,-1)}function Tt(e,t){if(t.constructor===Float32Array)return e;let n=Ct(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.round(e*n)}var Et={DEG2RAD:tt,RAD2DEG:nt,generateUUID:rt,clamp:it,euclideanModulo:at,mapLinear:ot,inverseLerp:st,lerp:ct,damp:lt,pingpong:ut,smoothstep:dt,smootherstep:ft,randInt:pt,randFloat:mt,randFloatSpread:ht,seededRandom:gt,degToRad:_t,radToDeg:vt,isPowerOfTwo:yt,ceilPowerOfTwo:bt,floorPowerOfTwo:xt,setQuaternionFromProperEuler:St,normalize:Tt,denormalize:wt},K=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(it(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(it(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Dt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:qe(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(it(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},q=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(kt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(kt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this.z=it(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this.z=it(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(it(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ot.copy(this).projectOnVector(e),this.sub(Ot)}reflect(e){return this.sub(Ot.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(it(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ot=new q,kt=new Dt,At=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return Ye(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(jt.makeScale(e,t)),this}rotate(e){return Ye(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(jt.makeRotation(-e)),this}translate(e,t){return Ye(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(jt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},jt=new At,Mt=new At().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Nt=new At().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Pt(){let e={enabled:!0,workingColorSpace:Ne,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=It(e.r),e.g=It(e.g),e.b=It(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Lt(e.r),e.g=Lt(e.g),e.b=Lt(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Pe:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[n].fromXYZ).multiply(this.spaces[t].toXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Ne]:{primaries:t,whitePoint:r,transfer:Pe,toXYZ:Mt,fromXYZ:Nt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Me},outputColorSpaceConfig:{drawingBufferColorSpace:Me}},[Me]:{primaries:t,whitePoint:r,transfer:Fe,toXYZ:Mt,fromXYZ:Nt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Me}}}),e}var Ft=Pt();function It(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Lt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Rt,zt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Rt===void 0&&(Rt=He(`canvas`)),Rt.width=e.width,Rt.height=e.height;let t=Rt.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Rt}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=He(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=It(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(It(t[e]/255)*255):t[e]=It(t[e]);return{data:t,width:e.width,height:e.height}}return qe(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Bt=0,Vt=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Bt++}),this.uuid=rt(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width||0,t.height||0,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Ht(r[t].image)):e.push(Ht(r[t]))}else e=Ht(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Ht(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?zt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(qe(`Texture: Unable to serialize Texture.`),{})}var Ut=0,Wt=new q,Gt=class e extends Qe{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,i=r,a=r,o=c,s=u,l=E,f=d,p=e.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ut++}),this.uuid=rt(),this.name=``,this.source=new Vt(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=o,this.minFilter=s,this.anisotropy=p,this.format=l,this.internalFormat=null,this.type=f,this.offset=new K(0,0),this.repeat=new K(1,1),this.center=new K(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new At,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Wt).x}get height(){return this.source.getSize(Wt).y}get depth(){return this.source.getSize(Wt).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){qe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?qe(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case n:e.x-=Math.floor(e.x);break;case r:e.x=e.x<0?0:1;break;case i:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case n:e.y-=Math.floor(e.y);break;case r:e.y=e.y<0?0:1;break;case i:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Gt.DEFAULT_IMAGE=null,Gt.DEFAULT_MAPPING=300,Gt.DEFAULT_ANISOTROPY=1;var Kt=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this.z=it(this.z,e.z,t.z),this.w=it(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this.z=it(this.z,e,t),this.w=it(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(it(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},qt=class extends Qe{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:c,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Kt(0,0,e,t),this.scissorTest=!1,this.viewport=new Kt(0,0,e,t),this.textures=[];let r=n.count;for(let i=0;i<r;i++)this.textures[i]=new Gt({width:e,height:t,depth:n.depth}),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:c,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Vt(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},Jt=class extends qt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Yt=class extends Gt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=a,this.minFilter=a,this.wrapR=r,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Xt=class extends Gt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=a,this.minFilter=a,this.wrapR=r,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Zt=class e{static{this.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/Qt.setFromMatrixColumn(e,0).length(),i=1/Qt.setFromMatrixColumn(e,1).length(),a=1/Qt.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(en,e,tn)}lookAt(e,t,n){let r=this.elements;return an.subVectors(e,t),an.lengthSq()===0&&(an.z=1),an.normalize(),nn.crossVectors(n,an),nn.lengthSq()===0&&(Math.abs(n.z)===1?an.x+=1e-4:an.z+=1e-4,an.normalize(),nn.crossVectors(n,an)),nn.normalize(),rn.crossVectors(an,nn),r[0]=nn.x,r[4]=rn.x,r[8]=an.x,r[1]=nn.y,r[5]=rn.y,r[9]=an.y,r[2]=nn.z,r[6]=rn.z,r[10]=an.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],M=r[14],N=r[3],P=r[7],F=r[11],I=r[15];return i[0]=a*x+o*T+s*k+c*N,i[4]=a*S+o*E+s*A+c*P,i[8]=a*C+o*D+s*j+c*F,i[12]=a*w+o*O+s*M+c*I,i[1]=l*x+u*T+d*k+f*N,i[5]=l*S+u*E+d*A+f*P,i[9]=l*C+u*D+d*j+f*F,i[13]=l*w+u*O+d*M+f*I,i[2]=p*x+m*T+h*k+g*N,i[6]=p*S+m*E+h*A+g*P,i[10]=p*C+m*D+h*j+g*F,i[14]=p*w+m*O+h*M+g*I,i[3]=_*x+v*T+y*k+b*N,i[7]=_*S+v*E+y*A+b*P,i[11]=_*C+v*D+y*j+b*F,i[15]=_*w+v*O+y*M+b*I,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=Qt.set(r[0],r[1],r[2]).length(),o=Qt.set(r[4],r[5],r[6]).length(),s=Qt.set(r[8],r[9],r[10]).length();i<0&&(a=-a),$t.copy(this);let c=1/a,l=1/o,u=1/s;return $t.elements[0]*=c,$t.elements[1]*=c,$t.elements[2]*=c,$t.elements[4]*=l,$t.elements[5]*=l,$t.elements[6]*=l,$t.elements[8]*=u,$t.elements[9]*=u,$t.elements[10]*=u,t.setFromRotationMatrix($t),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=ze,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=ze,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Qt=new q,$t=new Zt,en=new q(0,0,0),tn=new q(1,1,1),nn=new q,rn=new q,an=new q,on=new Zt,sn=new Dt,cn=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(it(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-it(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(it(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-it(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(it(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-it(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:qe(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return on.makeRotationFromQuaternion(e),this.setFromRotationMatrix(on,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return sn.setFromEuler(this),this.setFromQuaternion(sn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};cn.DEFAULT_ORDER=`XYZ`;var ln=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},un=0,dn=new q,fn=new Dt,pn=new Zt,mn=new q,hn=new q,gn=new q,_n=new Dt,vn=new q(1,0,0),yn=new q(0,1,0),bn=new q(0,0,1),xn={type:`added`},Sn={type:`removed`},Cn={type:`childadded`,child:null},wn={type:`childremoved`,child:null},Tn=class e extends Qe{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:un++}),this.uuid=rt(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new q,n=new cn,r=new Dt,i=new q(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Zt},normalMatrix:{value:new At}}),this.matrix=new Zt,this.matrixWorld=new Zt,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ln,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return fn.setFromAxisAngle(e,t),this.quaternion.multiply(fn),this}rotateOnWorldAxis(e,t){return fn.setFromAxisAngle(e,t),this.quaternion.premultiply(fn),this}rotateX(e){return this.rotateOnAxis(vn,e)}rotateY(e){return this.rotateOnAxis(yn,e)}rotateZ(e){return this.rotateOnAxis(bn,e)}translateOnAxis(e,t){return dn.copy(e).applyQuaternion(this.quaternion),this.position.add(dn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(vn,e)}translateY(e){return this.translateOnAxis(yn,e)}translateZ(e){return this.translateOnAxis(bn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(pn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?mn.copy(e):mn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),hn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?pn.lookAt(hn,mn,this.up):pn.lookAt(mn,hn,this.up),this.quaternion.setFromRotationMatrix(pn),r&&(pn.extractRotation(r.matrixWorld),fn.setFromRotationMatrix(pn),this.quaternion.premultiply(fn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(Je(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(xn),Cn.child=e,this.dispatchEvent(Cn),Cn.child=null):Je(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Sn),wn.child=e,this.dispatchEvent(wn),wn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),pn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),pn.multiply(e.parent.matrixWorld)),e.applyMatrix4(pn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(xn),Cn.child=e,this.dispatchEvent(Cn),Cn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hn,e,gn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hn,_n,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};Tn.DEFAULT_UP=new q(0,1,0),Tn.DEFAULT_MATRIX_AUTO_UPDATE=!0,Tn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var En=class extends Tn{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Dn={type:`move`},On=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new En,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new En,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new q,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new q),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new En,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new q,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new q,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.quaternion,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Dn)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new En;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},kn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},An={h:0,s:0,l:0},jn={h:0,s:0,l:0};function Mn(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var J=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Me){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ft.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Ft.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ft.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Ft.workingColorSpace){if(e=at(e,1),t=it(t,0,1),n=it(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Mn(i,r,e+1/3),this.g=Mn(i,r,e),this.b=Mn(i,r,e-1/3)}return Ft.colorSpaceToWorking(this,r),this}setStyle(e,t=Me){function n(t){t!==void 0&&parseFloat(t)<1&&qe(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseFloat(i[1]))/100,Math.min(100,parseFloat(i[2]))/100,Math.min(100,parseFloat(i[3]))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:qe(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);qe(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Me){let n=kn[e.toLowerCase()];return n===void 0?qe(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=It(e.r),this.g=It(e.g),this.b=It(e.b),this}copyLinearToSRGB(e){return this.r=Lt(e.r),this.g=Lt(e.g),this.b=Lt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Me){return Ft.workingToColorSpace(Nn.copy(this),e),Math.round(it(Nn.r*255,0,255))*65536+Math.round(it(Nn.g*255,0,255))*256+Math.round(it(Nn.b*255,0,255))}getHexString(e=Me){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ft.workingColorSpace){Ft.workingToColorSpace(Nn.copy(this),t);let n=Nn.r,r=Nn.g,i=Nn.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=Ft.workingColorSpace){return Ft.workingToColorSpace(Nn.copy(this),t),e.r=Nn.r,e.g=Nn.g,e.b=Nn.b,e}getStyle(e=Me){Ft.workingToColorSpace(Nn.copy(this),e);let t=Nn.r,n=Nn.g,r=Nn.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(An),this.setHSL(An.h+e,An.s+t,An.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(An),e.getHSL(jn);let n=ct(An.h,jn.h,t),r=ct(An.s,jn.s,t),i=ct(An.l,jn.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Nn=new J;J.NAMES=kn;var Pn=class e{constructor(e,t=25e-5){this.isFogExp2=!0,this.name=``,this.color=new J(e),this.density=t}clone(){return new e(this.color,this.density)}toJSON(){return{type:`FogExp2`,name:this.name,color:this.color.getHex(),density:this.density}}},Fn=class extends Tn{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new cn,this.environmentIntensity=1,this.environmentRotation=new cn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background===null?null:e.background.clone(),this.environment=e.environment===null?null:e.environment.clone(),this.fog=e.fog===null?null:e.fog.clone(),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial===null?null:e.overrideMaterial.clone(),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},In=new q,Ln=new q,Rn=new q,zn=new q,Bn=new q,Vn=new q,Hn=new q,Un=new q,Wn=new q,Gn=new q,Kn=new Kt,qn=new Kt,Jn=new Kt,Yn=class e{constructor(e=new q,t=new q,n=new q){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),In.subVectors(e,t),r.cross(In);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){In.subVectors(r,t),Ln.subVectors(n,t),Rn.subVectors(e,t);let a=In.dot(In),o=In.dot(Ln),s=In.dot(Rn),c=Ln.dot(Ln),l=Ln.dot(Rn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,zn)!==null&&zn.x>=0&&zn.y>=0&&zn.x+zn.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,zn)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,zn.x),s.addScaledVector(a,zn.y),s.addScaledVector(o,zn.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Kn.setScalar(0),qn.setScalar(0),Jn.setScalar(0),Kn.fromBufferAttribute(e,t),qn.fromBufferAttribute(e,n),Jn.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Kn,i.x),a.addScaledVector(qn,i.y),a.addScaledVector(Jn,i.z),a}static isFrontFacing(e,t,n,r){return In.subVectors(n,t),Ln.subVectors(e,t),In.cross(Ln).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return In.subVectors(this.c,this.b),Ln.subVectors(this.a,this.b),In.cross(Ln).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Bn.subVectors(r,n),Vn.subVectors(i,n),Un.subVectors(e,n);let s=Bn.dot(Un),c=Vn.dot(Un);if(s<=0&&c<=0)return t.copy(n);Wn.subVectors(e,r);let l=Bn.dot(Wn),u=Vn.dot(Wn);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0&&s-l>0)return a=s/(s-l),t.copy(n).addScaledVector(Bn,a);Gn.subVectors(e,i);let f=Bn.dot(Gn),p=Vn.dot(Gn);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Vn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Hn.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Hn,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Bn,a).addScaledVector(Vn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Xn=class{constructor(e=new q(1/0,1/0,1/0),t=new q(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Qn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Qn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Qn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Qn):Qn.fromBufferAttribute(r,t),Qn.applyMatrix4(e.matrixWorld),this.expandByPoint(Qn);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),$n.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),$n.copy(e.boundingBox)),$n.applyMatrix4(e.matrixWorld),this.union($n)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Qn),Qn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(or),sr.subVectors(this.max,or),er.subVectors(e.a,or),tr.subVectors(e.b,or),nr.subVectors(e.c,or),rr.subVectors(tr,er),ir.subVectors(nr,tr),ar.subVectors(er,nr);let t=[0,-rr.z,rr.y,0,-ir.z,ir.y,0,-ar.z,ar.y,rr.z,0,-rr.x,ir.z,0,-ir.x,ar.z,0,-ar.x,-rr.y,rr.x,0,-ir.y,ir.x,0,-ar.y,ar.x,0];return!ur(t,er,tr,nr,sr)||(t=[1,0,0,0,1,0,0,0,1],!ur(t,er,tr,nr,sr))?!1:(cr.crossVectors(rr,ir),t=[cr.x,cr.y,cr.z],ur(t,er,tr,nr,sr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Qn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Qn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(Zn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Zn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Zn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Zn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Zn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Zn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Zn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Zn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Zn)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Zn=[new q,new q,new q,new q,new q,new q,new q,new q],Qn=new q,$n=new Xn,er=new q,tr=new q,nr=new q,rr=new q,ir=new q,ar=new q,or=new q,sr=new q,cr=new q,lr=new q;function ur(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){lr.fromArray(e,a);let o=i.x*Math.abs(lr.x)+i.y*Math.abs(lr.y)+i.z*Math.abs(lr.z),s=t.dot(lr),c=n.dot(lr),l=r.dot(lr);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var dr=new q,fr=new K,pr=0,mr=class extends Qe{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:pr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Le,this.updateRanges=[],this.gpuType=_,this.version=0,this._normalizationScale=e===void 0?void 0:Ct(e)}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)fr.fromBufferAttribute(this,t),fr.applyMatrix3(e),this.setXY(t,fr.x,fr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)dr.fromBufferAttribute(this,t),dr.applyMatrix3(e),this.setXYZ(t,dr.x,dr.y,dr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)dr.fromBufferAttribute(this,t),dr.applyMatrix4(e),this.setXYZ(t,dr.x,dr.y,dr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)dr.fromBufferAttribute(this,t),dr.applyNormalMatrix(e),this.setXYZ(t,dr.x,dr.y,dr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)dr.fromBufferAttribute(this,t),dr.transformDirection(e),this.setXYZ(t,dr.x,dr.y,dr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}_denormalize(e){let t=this._normalizationScale;return t===void 0?wt(e,this.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?Tt(e,this.array):Math.round(e*t)}},hr=class extends mr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},gr=class extends mr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},_r=class extends mr{constructor(e,t,n){super(new Float32Array(e),t,n)}},vr=new Xn,yr=new q,br=new q,xr=class{constructor(e=new q,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?vr.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;yr.subVectors(e,this.center);let t=yr.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(yr,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(br.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(yr.copy(e.center).add(br)),this.expandByPoint(yr.copy(e.center).sub(br))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Sr=0,Cr=new Zt,wr=new Tn,Tr=new q,Er=new Xn,Dr=new Xn,Or=new q,kr=class e extends Qe{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Sr++}),this.uuid=rt(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Be(e)?gr:hr)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new At().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Cr.makeRotationFromQuaternion(e),this.applyMatrix4(Cr),this}rotateX(e){return Cr.makeRotationX(e),this.applyMatrix4(Cr),this}rotateY(e){return Cr.makeRotationY(e),this.applyMatrix4(Cr),this}rotateZ(e){return Cr.makeRotationZ(e),this.applyMatrix4(Cr),this}translate(e,t,n){return Cr.makeTranslation(e,t,n),this.applyMatrix4(Cr),this}scale(e,t,n){return Cr.makeScale(e,t,n),this.applyMatrix4(Cr),this}lookAt(e){return wr.lookAt(e),wr.updateMatrix(),this.applyMatrix4(wr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Tr).negate(),this.translate(Tr.x,Tr.y,Tr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new _r(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&qe(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Xn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)Je(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new q(-1/0,-1/0,-1/0),new q(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Er.setFromBufferAttribute(n),this.morphTargetsRelative?(Or.addVectors(this.boundingBox.min,Er.min),this.boundingBox.expandByPoint(Or),Or.addVectors(this.boundingBox.max,Er.max),this.boundingBox.expandByPoint(Or)):(this.boundingBox.expandByPoint(Er.min),this.boundingBox.expandByPoint(Er.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Je(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new xr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)Je(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new q,1/0);else if(e){let n=this.boundingSphere.center;if(Er.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Dr.setFromBufferAttribute(n),this.morphTargetsRelative?(Or.addVectors(Er.min,Dr.min),Er.expandByPoint(Or),Or.addVectors(Er.max,Dr.max),Er.expandByPoint(Or)):(Er.expandByPoint(Dr.min),Er.expandByPoint(Dr.max))}Er.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Or.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Or));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Or.fromBufferAttribute(a,t),o&&(Tr.fromBufferAttribute(e,t),Or.add(Tr)),r=Math.max(r,n.distanceToSquared(Or))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&Je(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Je(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new mr(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[],c=new Uint8Array(n.count);for(let e=0;e<n.count;e++)o[e]=new q,s[e]=new q;let l=new q,u=new q,d=new q,f=new K,p=new K,m=new K,h=new q,g=new q;function _(e,t,r){c[e]=c[t]=c[r]=1,l.fromBufferAttribute(n,e),u.fromBufferAttribute(n,t),d.fromBufferAttribute(n,r),f.fromBufferAttribute(i,e),p.fromBufferAttribute(i,t),m.fromBufferAttribute(i,r),u.sub(l),d.sub(l),p.sub(f),m.sub(f);let a=1/(p.x*m.y-m.x*p.y);isFinite(a)&&(h.copy(u).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(a),g.copy(d).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(a),o[e].add(h),o[t].add(h),o[r].add(h),s[e].add(g),s[t].add(g),s[r].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let t=0,n=v.length;t<n;++t){let n=v[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)_(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let y=new q,b=new q,x=new q,S=new q;function C(e){x.fromBufferAttribute(r,e),S.copy(x);let t=o[e];y.copy(t),y.sub(x.multiplyScalar(x.dot(t))).normalize(),b.crossVectors(S,t);let n=b.dot(s[e])<0?-1:1;a.setXYZW(e,y.x,y.y,y.z,n)}for(let e=0,t=n.count;e<t;++e)c[e]&&C(e);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new mr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new q,i=new q,a=new q,o=new q,s=new q,c=new q,l=new q,u=new q;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Or.fromBufferAttribute(e,t),Or.normalize(),e.setXYZ(t,Or.x,Or.y,Or.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new mr(a,r,i)}if(this.index===null)return qe(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},Ar=new q,jr=new q,Mr=new At,Nr=class{constructor(e=new q(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Ar.subVectors(n,t).cross(jr.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(Ar),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Mr.getNormalMatrix(e),r=this.coplanarPoint(Ar).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Pr=0,Fr=class extends Qe{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Pr++}),this.uuid=rt(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new J(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ie,this.stencilZFail=Ie,this.stencilZPass=Ie,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){qe(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?qe(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new J().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new Nr().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new K().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new K().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Ir=new q,Lr=new q,Rr=new q,zr=new q,Br=class{constructor(e=new q,t=new q(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ir)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ir.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ir.copy(this.origin).addScaledVector(this.direction,t),Ir.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Lr.copy(e).add(t).multiplyScalar(.5),Rr.copy(t).sub(e).normalize(),zr.copy(this.origin).sub(Lr);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Rr),o=zr.dot(this.direction),s=-zr.dot(Rr),c=zr.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Lr).addScaledVector(Rr,d),f}intersectSphere(e,t){if(e.radius<0)return null;Ir.subVectors(e.center,this.origin);let n=Ir.dot(this.direction),r=Ir.dot(Ir)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Ir)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,M,N;if(y>=b&&y>=x?(w=s,D=u,A=p,N=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,M=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,M=_)):b>=x?(w=c,D=d,A=m,N=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,M=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,M=v)):(w=l,D=f,A=h,N=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,M=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,M=g)),w===0)return null;let P=S/w,F=C/w,I=1/w,L=T-P*D,R=E-F*D,ee=O-P*A,te=k-F*A,ne=j-P*N,z=M-F*N,B=ne*te-z*ee,V=L*z-R*ne,re=ee*R-te*L;if(r){if(B<0||V<0||re<0)return null}else if((B<0||V<0||re<0)&&(B>0||V>0||re>0))return null;let ie=B+V+re;if(ie===0)return null;let H=I*(B*D+V*A+re*N);return(ie>0?H<0:H>0)?null:this.at(H/ie,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Vr=class extends Fr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new J(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new cn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Hr=new Zt,Ur=new Br,Wr=new xr,Gr=new q,Kr=new q,qr=new q,Jr=new q,Yr=new q,Xr=new q,Zr=new q,Qr=new q,$r=class extends Tn{constructor(e=new kr,t=new Vr){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Xr.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Yr.fromBufferAttribute(s,e),a?Xr.addScaledVector(Yr,r):Xr.addScaledVector(Yr.sub(t),r))}t.add(Xr)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Wr.copy(n.boundingSphere),Wr.applyMatrix4(i),Ur.copy(e.ray).recast(e.near),Wr.containsPoint(Ur.origin)===!1&&(Ur.intersectSphere(Wr,Gr)===null||Ur.origin.distanceToSquared(Gr)>(e.far-e.near)**2)||(Hr.copy(i).invert(),Ur.copy(e.ray).applyMatrix4(Hr),(n.boundingBox===null||Ur.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Ur)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=ti(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=ti(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=ti(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=ti(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function ei(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Qr.copy(s),Qr.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Qr);return l<n.near||l>n.far?null:{distance:l,point:Qr.clone(),object:e}}function ti(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Kr),e.getVertexPosition(c,qr),e.getVertexPosition(l,Jr);let u=ei(e,t,n,r,Kr,qr,Jr,Zr);if(u){let e=new q;Yn.getBarycoord(Zr,Kr,qr,Jr,e),i&&(u.uv=Yn.getInterpolatedAttribute(i,s,c,l,e,new K)),a&&(u.uv1=Yn.getInterpolatedAttribute(a,s,c,l,e,new K)),o&&(u.normal=Yn.getInterpolatedAttribute(o,s,c,l,e,new q),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new q,materialIndex:0};Yn.getNormal(Kr,qr,Jr,t.normal),u.face=t,u.barycoord=e}return u}var ni=class extends Gt{constructor(e=null,t=1,n=1,r,i,o,s,c,l=a,u=a,d,f){super(null,o,s,c,l,u,r,i,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},ri=class extends mr{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ii=new Zt,ai=new Zt,oi=[],si=new Xn,ci=new Zt,li=new $r,ui=new xr,di=class extends $r{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ri(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,ci)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Xn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ii),si.copy(e.boundingBox).applyMatrix4(ii),this.boundingBox.union(si)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new xr),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ii),ui.copy(e.boundingSphere).applyMatrix4(ii),this.boundingSphere.union(ui)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture===null?null:e.morphTexture.clone(),this.instanceColor=e.instanceColor===null?null:e.instanceColor.clone(),this.count=e.count,this.boundingBox=e.boundingBox===null?null:e.boundingBox.clone(),this.boundingSphere=e.boundingSphere===null?null:e.boundingSphere.clone(),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(li.geometry=this.geometry,li.material=this.material,li.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ui.copy(this.boundingSphere),ui.applyMatrix4(n),e.ray.intersectsSphere(ui)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,ii),ai.multiplyMatrices(n,ii),li.matrixWorld=ai,li.raycast(e,oi);for(let e=0,n=oi.length;e<n;e++){let n=oi[e];n.instanceId=i,n.object=this,t.push(n)}oi.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new ri(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new ni(new Float32Array(r*this.count),r,this.count,k,_));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},fi=new xr,pi=new K(.5,.5),mi=new q,hi=class{constructor(e=new Nr,t=new Nr,n=new Nr,r=new Nr,i=new Nr,a=new Nr){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=ze,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),fi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),fi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(fi)}intersectsSprite(e){return fi.center.set(0,0,0),fi.radius=.7071067811865476+pi.distanceTo(e.center),fi.applyMatrix4(e.matrixWorld),this.intersectsSphere(fi)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(mi.x=r.normal.x>0?e.max.x:e.min.x,mi.y=r.normal.y>0?e.max.y:e.min.y,mi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(mi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},gi=new Zt,_i=class e{constructor(){this.coordinateSystem=ze,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let e=0;e<t.length;e++){let r=t[e];gi.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[e]===void 0&&(n[e]=new hi),n[e].setFromProjectionMatrix(gi,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new hi),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new e().copy(this)}},vi=class extends Fr{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new J(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},yi=new Zt,bi=new Br,xi=new xr,Si=new q,Ci=class extends Tn{constructor(e=new kr,t=new vi){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),xi.copy(n.boundingSphere),xi.applyMatrix4(r),xi.radius+=i,e.ray.intersectsSphere(xi)===!1)return;yi.copy(r).invert(),bi.copy(e.ray).applyMatrix4(yi);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);Si.fromBufferAttribute(l,n),wi(Si,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)Si.fromBufferAttribute(l,a),wi(Si,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function wi(e,t,n,r,i,a,o){let s=bi.distanceSqToPoint(e);if(s<n){let n=new q;bi.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Ti=class extends Gt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ei=class extends Gt{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Di=class extends Gt{constructor(e,t,n=g,r,i,o,s=a,c=a,l,u=D,d=1){if(u!==1026&&u!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},r,i,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Vt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Oi=class extends Di{constructor(e,t=g,n=301,r,i,o=a,s=a,c,l=D){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,r,i,o,s,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},ki=class extends Gt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ai=class e extends kr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new _r(c,3)),this.setAttribute(`normal`,new _r(l,3)),this.setAttribute(`uv`,new _r(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new q;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},ji=class e extends kr{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new q,l=new K;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new _r(a,3)),this.setAttribute(`normal`,new _r(o,3)),this.setAttribute(`uv`,new _r(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Mi=class e extends kr{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new _r(u,3)),this.setAttribute(`normal`,new _r(d,3)),this.setAttribute(`uv`,new _r(f,2));function _(){let a=new q,_=new q,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new K,m=new q,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Ni=class e extends kr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new _r(p,3)),this.setAttribute(`normal`,new _r(m,3)),this.setAttribute(`uv`,new _r(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}};function Pi(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Ii(i))i.isRenderTargetTexture?(qe(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(Ii(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function Fi(e){let t={};for(let n=0;n<e.length;n++){let r=Pi(e[n]);for(let e in r)t[e]=r[e]}return t}function Ii(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Li(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Ri(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Ft.workingColorSpace}var zi={clone:Pi,merge:Fi},Bi=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Vi=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Hi=class extends Fr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Bi,this.fragmentShader=Vi,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Pi(e.uniforms),this.uniformsGroups=Li(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new J().setHex(r.value);break;case`v2`:this.uniforms[n].value=new K().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new q().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new Kt().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new At().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new Zt().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Ui=class extends Hi{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Wi=class extends Fr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new J(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new J(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new K(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new cn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Gi=class extends Fr{constructor(e){super(),this.isMeshNormalMaterial=!0,this.type=`MeshNormalMaterial`,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new K(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}},Ki=class extends Fr{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type=`MeshLambertMaterial`,this.color=new J(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new J(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new K(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new cn,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},qi=class extends Fr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=je,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ji=class extends Fr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Yi(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Xi(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Zi=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},Qi=class extends Zi{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:W,endingEnd:W}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case Ae:i=e,o=2*t-n;break;case G:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case Ae:a=e,s=2*n-t;break;case G:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},$i=class extends Zi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},ea=class extends Zi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},ta=class extends Zi{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=ia(n,t,g,y,r);i[p]=na(x,o,_,b,m)}return i}};function na(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function ra(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function ia(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=na(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=ra(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var aa=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Yi(t,this.TimeBufferType),this.values=Yi(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Yi(e.times,Array),values:Yi(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),Xi(e.settings)&&(n.settings={inTangents:Yi(e.settings.inTangents,Array),outTangents:Yi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ea(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new $i(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Qi(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new ta(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case U:t=this.InterpolantFactoryMethodDiscrete;break;case De:t=this.InterpolantFactoryMethodLinear;break;case Oe:t=this.InterpolantFactoryMethodSmooth;break;case ke:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return qe(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return U;case this.InterpolantFactoryMethodLinear:return De;case this.InterpolantFactoryMethodSmooth:return Oe;case this.InterpolantFactoryMethodBezier:return ke}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e;Xi(this.settings)&&(oa(this.settings.inTangents,e),oa(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Xi(this.settings)&&(sa(this.settings.inTangents,e),sa(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Je(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(Je(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){Je(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){Je(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Ve(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){Je(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Oe,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Xi(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function oa(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]+=t}function sa(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}aa.prototype.ValueTypeName=``,aa.prototype.TimeBufferType=Float32Array,aa.prototype.ValueBufferType=Float32Array,aa.prototype.DefaultInterpolation=De;var ca=class extends aa{constructor(e,t,n){super(e,t,n)}};ca.prototype.ValueTypeName=`bool`,ca.prototype.ValueBufferType=Array,ca.prototype.DefaultInterpolation=U,ca.prototype.InterpolantFactoryMethodLinear=void 0,ca.prototype.InterpolantFactoryMethodSmooth=void 0;var la=class extends aa{constructor(e,t,n,r){super(e,t,n,r)}};la.prototype.ValueTypeName=`color`;var ua=class extends aa{constructor(e,t,n,r){super(e,t,n,r)}};ua.prototype.ValueTypeName=`number`;var da=class extends Zi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Dt.slerpFlat(i,0,a,c-o,a,c,s);return i}},fa=class extends aa{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new da(this.times,this.values,this.getValueSize(),e)}};fa.prototype.ValueTypeName=`quaternion`,fa.prototype.InterpolantFactoryMethodSmooth=void 0;var pa=class extends aa{constructor(e,t,n){super(e,t,n)}};pa.prototype.ValueTypeName=`string`,pa.prototype.ValueBufferType=Array,pa.prototype.DefaultInterpolation=U,pa.prototype.InterpolantFactoryMethodLinear=void 0,pa.prototype.InterpolantFactoryMethodSmooth=void 0;var ma=class extends aa{constructor(e,t,n,r){super(e,t,n,r)}};ma.prototype.ValueTypeName=`vector`;var ha=class extends Tn{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new J(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},ga=class extends ha{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(Tn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new J(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},_a=new Zt,va=new q,ya=new q,ba=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new K(512,512),this.mapType=d,this.map=null,this.mapPass=null,this.matrix=new Zt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new hi,this._frameExtents=new K(1,1),this._viewportCount=1,this._viewports=[new Kt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;va.setFromMatrixPosition(e.matrixWorld),t.position.copy(va),ya.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ya),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){_a.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(_a,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(_a)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},xa=new q,Sa=new Dt,Ca=new q,wa=class extends Tn{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Zt,this.projectionMatrix=new Zt,this.projectionMatrixInverse=new Zt,this.coordinateSystem=ze,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(xa,Sa,Ca),Ca.x===1&&Ca.y===1&&Ca.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(xa,Sa,Ca.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(xa,Sa,Ca),Ca.x===1&&Ca.y===1&&Ca.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(xa,Sa,Ca.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ta=new q,Ea=new K,Da=new K,Oa=class extends wa{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=nt*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(tt*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return nt*2*Math.atan(Math.tan(tt*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ta.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ta.x,Ta.y).multiplyScalar(-e/Ta.z),Ta.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ta.x,Ta.y).multiplyScalar(-e/Ta.z)}getViewSize(e,t){return this.getViewBounds(e,Ea,Da),t.subVectors(Da,Ea)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(tt*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ka=class extends wa{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Aa=class extends ba{constructor(){super(new ka(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ja=class extends ha{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(Tn.DEFAULT_UP),this.updateMatrix(),this.target=new Tn,this.shadow=new Aa}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Ma=-90,Na=1,Pa=class extends Tn{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Oa(Ma,Na,e,t);r.layers=this.layers,this.add(r);let i=new Oa(Ma,Na,e,t);i.layers=this.layers,this.add(i);let a=new Oa(Ma,Na,e,t);a.layers=this.layers,this.add(a);let o=new Oa(Ma,Na,e,t);o.layers=this.layers,this.add(o);let s=new Oa(Ma,Na,e,t);s.layers=this.layers,this.add(s);let c=new Oa(Ma,Na,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Fa=class extends Oa{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}},Ia=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=La.bind(this),e.addEventListener(`visibilitychange`,this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener(`visibilitychange`,this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e===void 0?performance.now():e)-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function La(){this._document.hidden===!1&&this.reset()}var Ra=`\\[\\]\\.:\\/`,za=RegExp(`[\\[\\]\\.:\\/]`,`g`),Ba=`[^\\[\\]\\.:\\/]`,Va=`[^`+Ra.replace(`\\.`,``)+`]`,Ha=`((?:WC+[\\/:])*)`.replace(`WC`,Ba),Ua=`(WCOD+)?`.replace(`WCOD`,Va),Wa=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Ba),Ga=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Ba),Ka=RegExp(`^`+Ha+Ua+Wa+Ga+`$`),qa=[`material`,`materials`,`bones`,`map`],Ja=class{constructor(e,t,n){let r=n||Ya.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Ya=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(za,``)}static parseTrackName(e){let t=Ka.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);qa.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){qe(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){Je(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){Je(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){Je(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){Je(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){Je(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){Je(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){Je(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;Je(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){Je(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){Je(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ya.Composite=Ja,Ya.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Ya.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Ya.prototype.GetterByBindingType=[Ya.prototype._getValue_direct,Ya.prototype._getValue_array,Ya.prototype._getValue_arrayElement,Ya.prototype._getValue_toArray],Ya.prototype.SetterByBindingTypeAndVersioning=[[Ya.prototype._setValue_direct,Ya.prototype._setValue_direct_setNeedsUpdate,Ya.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ya.prototype._setValue_array,Ya.prototype._setValue_array_setNeedsUpdate,Ya.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ya.prototype._setValue_arrayElement,Ya.prototype._setValue_arrayElement_setNeedsUpdate,Ya.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ya.prototype._setValue_fromArray,Ya.prototype._setValue_fromArray_setNeedsUpdate,Ya.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Xa=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){let e=1e-6;return this.phi=it(this.phi,e,Math.PI-e),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(it(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};(class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});var Za=class extends Qe{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Qa(e,t,n,r){let i=$a(r);switch(n){case w:return e*t;case k:return e*t/i.components*i.byteLength;case A:return e*t/i.components*i.byteLength;case j:return e*t*2/i.components*i.byteLength;case M:return e*t*2/i.components*i.byteLength;case T:return e*t*3/i.components*i.byteLength;case E:return e*t*4/i.components*i.byteLength;case N:return e*t*4/i.components*i.byteLength;case P:case F:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case I:case L:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ee:case ne:return Math.max(e,16)*Math.max(t,8)/4;case R:case te:return Math.max(e,8)*Math.max(t,8)/2;case z:case B:case re:case ie:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case V:case H:case ae:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case oe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case se:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case ce:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case le:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case ue:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case de:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case fe:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case pe:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case me:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case he:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case ge:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case _e:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case ve:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case ye:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case be:case xe:case Se:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Ce:case we:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Te:case Ee:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function $a(e){switch(e){case d:case f:return{byteLength:1,components:1};case m:case p:case v:return{byteLength:2,components:1};case y:case b:return{byteLength:2,components:4};case g:case h:case _:return{byteLength:4,components:1};case S:case C:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`187`}})),typeof window<`u`&&(window.__THREE__?qe(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`187`);function eo(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function to(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var no={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},Y={common:{diffuse:{value:new J(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new At},alphaMap:{value:null},alphaMapTransform:{value:new At},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new At}},envmap:{envMap:{value:null},envMapRotation:{value:new At},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new At}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new At}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new At},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new At},normalScale:{value:new K(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new At},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new At}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new At}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new At}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new J(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new J(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new At},alphaTest:{value:0},uvTransform:{value:new At}},sprite:{diffuse:{value:new J(16777215)},opacity:{value:1},center:{value:new K(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new At},alphaMap:{value:null},alphaMapTransform:{value:new At},alphaTest:{value:0}}},ro={basic:{uniforms:Fi([Y.common,Y.specularmap,Y.envmap,Y.aomap,Y.lightmap,Y.fog]),vertexShader:no.meshbasic_vert,fragmentShader:no.meshbasic_frag},lambert:{uniforms:Fi([Y.common,Y.specularmap,Y.envmap,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.fog,Y.lights,{emissive:{value:new J(0)},envMapIntensity:{value:1}}]),vertexShader:no.meshlambert_vert,fragmentShader:no.meshlambert_frag},phong:{uniforms:Fi([Y.common,Y.specularmap,Y.envmap,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.fog,Y.lights,{emissive:{value:new J(0)},specular:{value:new J(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:no.meshphong_vert,fragmentShader:no.meshphong_frag},standard:{uniforms:Fi([Y.common,Y.envmap,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.roughnessmap,Y.metalnessmap,Y.fog,Y.lights,{emissive:{value:new J(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:no.meshphysical_vert,fragmentShader:no.meshphysical_frag},toon:{uniforms:Fi([Y.common,Y.aomap,Y.lightmap,Y.emissivemap,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.gradientmap,Y.fog,Y.lights,{emissive:{value:new J(0)}}]),vertexShader:no.meshtoon_vert,fragmentShader:no.meshtoon_frag},matcap:{uniforms:Fi([Y.common,Y.bumpmap,Y.normalmap,Y.displacementmap,Y.fog,{matcap:{value:null}}]),vertexShader:no.meshmatcap_vert,fragmentShader:no.meshmatcap_frag},points:{uniforms:Fi([Y.points,Y.fog]),vertexShader:no.points_vert,fragmentShader:no.points_frag},dashed:{uniforms:Fi([Y.common,Y.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:no.linedashed_vert,fragmentShader:no.linedashed_frag},depth:{uniforms:Fi([Y.common,Y.displacementmap]),vertexShader:no.depth_vert,fragmentShader:no.depth_frag},normal:{uniforms:Fi([Y.common,Y.bumpmap,Y.normalmap,Y.displacementmap,{opacity:{value:1}}]),vertexShader:no.meshnormal_vert,fragmentShader:no.meshnormal_frag},sprite:{uniforms:Fi([Y.sprite,Y.fog]),vertexShader:no.sprite_vert,fragmentShader:no.sprite_frag},background:{uniforms:{uvTransform:{value:new At},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:no.background_vert,fragmentShader:no.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new At}},vertexShader:no.backgroundCube_vert,fragmentShader:no.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:no.cube_vert,fragmentShader:no.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:no.equirect_vert,fragmentShader:no.equirect_frag},distance:{uniforms:Fi([Y.common,Y.displacementmap,{referencePosition:{value:new q},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:no.distance_vert,fragmentShader:no.distance_frag},shadow:{uniforms:Fi([Y.lights,Y.fog,{color:{value:new J(0)},opacity:{value:1}}]),vertexShader:no.shadow_vert,fragmentShader:no.shadow_frag}};ro.physical={uniforms:Fi([ro.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new At},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new At},clearcoatNormalScale:{value:new K(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new At},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new At},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new At},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new At},sheen:{value:0},sheenColor:{value:new J(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new At},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new At},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new At},transmissionSamplerSize:{value:new K},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new At},attenuationDistance:{value:0},attenuationColor:{value:new J(0)},specularColor:{value:new J(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new At},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new At},anisotropyVector:{value:new K},anisotropyMap:{value:null},anisotropyMapTransform:{value:new At}}]),vertexShader:no.meshphysical_vert,fragmentShader:no.meshphysical_frag};var io={r:0,b:0,g:0},ao=new Zt,oo=new At;oo.set(-1,0,0,0,1,0,0,0,1);function so(e,t,n,r,i,a){let o=new J(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&i.isCubeTexture?(l===void 0&&(l=new $r(new Ai(1,1,1),new Hi({name:`BackgroundCubeMaterial`,uniforms:Pi(ro.backgroundCube.uniforms),vertexShader:ro.backgroundCube.vertexShader,fragmentShader:ro.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(ao.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(oo),l.material.toneMapped=Ft.getTransfer(i.colorSpace)!==Fe,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new $r(new Ni(2,2),new Hi({name:`BackgroundMaterial`,uniforms:Pi(ro.background.uniforms),vertexShader:ro.background.vertexShader,fragmentShader:ro.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=Ft.getTransfer(i.colorSpace)!==Fe,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(io,Ri(e)),n.buffers.color.setClear(io.r,io.g,io.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function co(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.isInterleavedBuffer===!0?t.stride:t.itemSize,p=s.offset;if(t.isInstancedInterleavedBuffer||t.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function lo(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function uo(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(qe(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),f=n.logarithmicDepthBuffer===!0&&d===!1;n.reversedDepthBuffer===!0&&d===!1&&qe(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`),n.logarithmicDepthBuffer===!0&&d===!0&&qe(`WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function fo(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Nr,s=new At,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var po=class extends Jt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Ti(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Ai(5,5,5),i=new Hi({name:`CubemapFromEquirect`,uniforms:Pi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new $r(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=c),new Pa(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},mo=256,ho=3,go=20,_o=256,vo=16,yo=3,bo=new q,xo=new J,So=class e{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Pa(1,10,null),this._boxMesh=new $r(new Ai(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=bo}=i,s=this._renderer;this._setSize(a);let c=this._allocateTarget(),l=this._getSourceTarget(!0);t>0&&(l.texture.mipmapsAutoUpdate=!1);let u=s.autoClear,d=s.autoClearColor,f=s.autoClearDepth,p=s.autoClearStencil,m=e.background;s.autoClear=!0,s.autoClearColor=!0,s.autoClearDepth=!0,s.autoClearStencil=!0,m===null&&(e.background=s.getClearColor(xo));let h=new Pa(n,r,l);return h.position.copy(o),h.update(s,e),s.autoClear=u,s.autoClearColor=d,s.autoClearDepth=f,s.autoClearStencil=p,e.background=m,t>0&&(l.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ko(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Oo(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(mo,xt(e))}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?mo:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=Co(e,!1,!1),n=Math.log2(e)-ho;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name=`PMREM`,t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Co(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let r=this._boxMesh,i=this._cubeCamera;r.material=n,i.renderTarget=e,i.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),i.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===301||e.mapping===302?(this._cubemapMaterial===null&&(this._cubemapMaterial=ko()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Oo()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=To(),this._integrationMaterial=Eo());let n=this._cubeSize,r=t.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(n/vo);for(let o=0;o<=r;o++){let s=e.lodToRoughness(o,r);if(o>r-yo)a.roughness.value=s,this._renderCube(t,o,this._integrationMaterial);else{let e=s>0?Math.log2(n)+.5*Math.log2(6/(_o*s**4))+.5:0;i.roughness.value=s,i.lodBias.value=e,this._renderCube(t,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Do());let n=this._blurMaterial,r=n.uniforms,i=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=i.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(i,0,n)}};function Co(e,t,n){return new po(e,{minFilter:u,generateMipmaps:t,type:v,colorSpace:Ne,depthBuffer:n})}function wo(e,t,n){return new Hi({name:e,uniforms:t,vertexShader:no.cube_vert,fragmentShader:n,side:1,blending:0,depthTest:!1,depthWrite:!1})}function To(){return wo(`PMREMGGXConvolution`,{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${_o}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Eo(){return wo(`PMREMGGXIntegration`,{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:vo}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Do(){return wo(`PMREMSphericalGaussianBlur`,{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${go}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function Oo(){return wo(`PMREMEquirectangularToCubemap`,{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function ko(){return wo(`PMREMCubemapToCubemap`,{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Ao(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new po(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture&&t.isPMREMTexture!==!0){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new So(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new So(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function jo(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Ye(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Mo(e,t,n,r){let i={},a=new WeakMap,o=new FinalizationRegistry(e=>delete i[e]);function s(e){c(e.target)}function c(e){e.index!==null&&t.remove(e.index);for(let n in e.attributes)t.remove(e.attributes[n]);e.removeEventListener(`dispose`,s),delete i[e.id],o.unregister(e);let c=a.get(e);c&&(t.remove(c),a.delete(e)),r.releaseStatesOfGeometry(e),e.isInstancedBufferGeometry===!0&&delete e._maxInstanceCount,n.memory.geometries--}function l(e,t){return i[t.id]===void 0&&(t.addEventListener(`dispose`,s),i[t.id]=new WeakRef(t),o.register(t,t.id,t),n.memory.geometries++),t}function u(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function d(e){let n=e.index,r=e.attributes.position,i=0;if(r===void 0)return;let o=n===null?r.array.length/3-1:n.array.length,s=new(r.count>=65535?gr:hr)(Math.ceil(o/3)*6,1),c=s.array;if(n!==null){let e=n.array;i=n.version;for(let t=0,n=0;t<o;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];c[n++]=r,c[n++]=i,c[n++]=i,c[n++]=a,c[n++]=a,c[n++]=r}}else{i=r.version;for(let e=0,t=0;e<o;e+=3){let n=e+0,r=e+1,i=e+2;c[t++]=n,c[t++]=r,c[t++]=r,c[t++]=i,c[t++]=i,c[t++]=n}}s.version=i;let l=a.get(e);l&&t.remove(l),a.set(e,s)}function f(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&d(e)}else d(e);return a.get(e)}function p(){for(let e in i){let t=i[e].deref();t!==void 0&&c(t)}}return{get:l,update:u,getWireframeAttribute:f,dispose:p}}function No(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function Po(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:Je(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Fo(e,t,n){let r=new WeakMap,i=new Kt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new Yt(h,p,m,u);g.type=_,g.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new K(p,m)},r.set(o,d);function y(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Io(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Lo={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Ro(e,t,n,r,i,a){let o=new Jt(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=null,u=new kr;u.setAttribute(`position`,new _r([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute(`uv`,new _r([0,2,0,0,2,0],2));let d=new Ui({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new $r(u,d),p=new ka(-1,1,1,-1,0,1),m=null,h=null,g=!1,_,y=null,b=[],S=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<b.length;n++){let r=b[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){b=e,S=b.length>0&&b[0].isRenderPass===!0;let t=o.width,n=o.height;b.length>0&&s===null&&(s=new Jt(t,n,{type:v,depthBuffer:!1,stencilBuffer:!1}),c=new Jt(t,n,{type:v,depthBuffer:!1,stencilBuffer:!1}));let r=i===!0&&b.some(e=>e.needsDepthTexture===!0);r!==(o.depthTexture!==null)&&(r===!0&&l===null&&(l=new Di(t,n),a===!0&&(l.format=O,l.type=x)),o.dispose(),o.depthTexture=r?l:null,o.resolveDepthBuffer=r,o.storeMultisampledDepthBuffer=r);for(let e=0;e<b.length;e++){let i=b[e];i.setSize&&i.setSize(t,n),r&&i.needsDepthTexture===!0&&i.setDepthTexture&&i.setDepthTexture(l)}},this.begin=function(e,t){if(g||e.toneMapping===0&&b.length===0)return!1;if(y=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return S===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return S},this.end=function(e,t){e.toneMapping=_,g=!0;let n=o,r=s;for(let i=0;i<b.length;i++){let a=b[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(m!==e.outputColorSpace||h!==e.toneMapping){m=e.outputColorSpace,h=e.toneMapping,d.defines={},Ft.getTransfer(m)===`srgb`&&(d.defines.SRGB_TRANSFER=``);let t=Lo[h];t&&(d.defines[t]=``),d.needsUpdate=!0}d.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(y),e.render(f,p),y=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),u.dispose(),d.dispose()}}var zo=new Gt,Bo=new Di(1,1),Vo=new Oi(1),Ho=new Yt,Uo=new Xt,Wo=new Ti,Go=[],Ko=[],qo=new Float32Array(16),Jo=new Float32Array(9),Yo=new Float32Array(4);function Xo(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Go[i];if(a===void 0&&(a=new Float32Array(i),Go[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Zo(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Qo(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function $o(e,t){let n=Ko[t];n===void 0&&(n=new Int32Array(t),Ko[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function es(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function ts(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Zo(n,t))return;e.uniform2fv(this.addr,t),Qo(n,t)}}function ns(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Zo(n,t))return;e.uniform3fv(this.addr,t),Qo(n,t)}}function rs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Zo(n,t))return;e.uniform4fv(this.addr,t),Qo(n,t)}}function is(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Zo(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Qo(n,t)}else{if(Zo(n,r))return;Yo.set(r),e.uniformMatrix2fv(this.addr,!1,Yo),Qo(n,r)}}function as(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Zo(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Qo(n,t)}else{if(Zo(n,r))return;Jo.set(r),e.uniformMatrix3fv(this.addr,!1,Jo),Qo(n,r)}}function os(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Zo(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Qo(n,t)}else{if(Zo(n,r))return;qo.set(r),e.uniformMatrix4fv(this.addr,!1,qo),Qo(n,r)}}function ss(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function cs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Zo(n,t))return;e.uniform2iv(this.addr,t),Qo(n,t)}}function ls(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Zo(n,t))return;e.uniform3iv(this.addr,t),Qo(n,t)}}function us(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Zo(n,t))return;e.uniform4iv(this.addr,t),Qo(n,t)}}function ds(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function fs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Zo(n,t))return;e.uniform2uiv(this.addr,t),Qo(n,t)}}function ps(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Zo(n,t))return;e.uniform3uiv(this.addr,t),Qo(n,t)}}function ms(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Zo(n,t))return;e.uniform4uiv(this.addr,t),Qo(n,t)}}function hs(e){return e.version===0&&(e.compareFunction=519,e.needsUpdate=!0),e}function gs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_2D_SHADOW?hs(Bo):zo,n.setTexture2D(t||a,i)}function _s(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Uo,i)}function vs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_CUBE_SHADOW?hs(Vo):Wo,n.setTextureCube(t||a,i)}function ys(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Ho,i)}function bs(e){switch(e){case 5126:return es;case 35664:return ts;case 35665:return ns;case 35666:return rs;case 35674:return is;case 35675:return as;case 35676:return os;case 5124:case 35670:return ss;case 35667:case 35671:return cs;case 35668:case 35672:return ls;case 35669:case 35673:return us;case 5125:return ds;case 36294:return fs;case 36295:return ps;case 36296:return ms;case 35678:case 36198:case 36298:case 36306:case 35682:return gs;case 35679:case 36299:case 36307:return _s;case 35680:case 36300:case 36308:case 36293:return vs;case 36289:case 36303:case 36311:case 36292:return ys}}function xs(e,t){e.uniform1fv(this.addr,t)}function Ss(e,t){let n=Xo(t,this.size,2);e.uniform2fv(this.addr,n)}function Cs(e,t){let n=Xo(t,this.size,3);e.uniform3fv(this.addr,n)}function ws(e,t){let n=Xo(t,this.size,4);e.uniform4fv(this.addr,n)}function Ts(e,t){let n=Xo(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Es(e,t){let n=Xo(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Ds(e,t){let n=Xo(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Os(e,t){e.uniform1iv(this.addr,t)}function ks(e,t){e.uniform2iv(this.addr,t)}function As(e,t){e.uniform3iv(this.addr,t)}function js(e,t){e.uniform4iv(this.addr,t)}function Ms(e,t){e.uniform1uiv(this.addr,t)}function Ns(e,t){e.uniform2uiv(this.addr,t)}function Ps(e,t){e.uniform3uiv(this.addr,t)}function Fs(e,t){e.uniform4uiv(this.addr,t)}function Is(e,t,n){let r=this.cache,i=t.length,a=$o(n,i);Zo(r,a)||(e.uniform1iv(this.addr,a),Qo(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?hs(Bo):zo;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Ls(e,t,n){let r=this.cache,i=t.length,a=$o(n,i);Zo(r,a)||(e.uniform1iv(this.addr,a),Qo(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Uo,a[e])}function Rs(e,t,n){let r=this.cache,i=t.length,a=$o(n,i);Zo(r,a)||(e.uniform1iv(this.addr,a),Qo(r,a));let o;o=this.type===e.SAMPLER_CUBE_SHADOW?hs(Vo):Wo;for(let e=0;e!==i;++e)n.setTextureCube(t[e]||o,a[e])}function zs(e,t,n){let r=this.cache,i=t.length,a=$o(n,i);Zo(r,a)||(e.uniform1iv(this.addr,a),Qo(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Ho,a[e])}function Bs(e){switch(e){case 5126:return xs;case 35664:return Ss;case 35665:return Cs;case 35666:return ws;case 35674:return Ts;case 35675:return Es;case 35676:return Ds;case 5124:case 35670:return Os;case 35667:case 35671:return ks;case 35668:case 35672:return As;case 35669:case 35673:return js;case 5125:return Ms;case 36294:return Ns;case 36295:return Ps;case 36296:return Fs;case 35678:case 36198:case 36298:case 36306:case 35682:return Is;case 35679:case 36299:case 36307:return Ls;case 35680:case 36300:case 36308:case 36293:return Rs;case 36289:case 36303:case 36311:case 36292:return zs}}var Vs=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=bs(t.type)}},Hs=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Bs(t.type)}},Us=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Ws=/(\w+)(\])?(\[|\.)?/g;function Gs(e,t){e.seq.push(t),e.map[t.id]=t}function Ks(e,t,n){let r=e.name,i=r.length;for(Ws.lastIndex=0;;){let a=Ws.exec(r),o=Ws.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Gs(n,l===void 0?new Vs(s,e,t):new Hs(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Us(s),Gs(n,e)),n=e}}}var qs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Ks(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Js(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Ys=37297,Xs=0;function Zs(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Qs=new At;function $s(e){Ft._getMatrix(Qs,Ft.workingColorSpace,e);let t=`mat3( ${Qs.elements.map(e=>e.toFixed(4))} )`;switch(Ft.getTransfer(e)){case Pe:return[t,`LinearTransferOETF`];case Fe:return[t,`sRGBTransferOETF`];default:return qe(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function ec(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Zs(e.getShaderSource(t),r)}return i}function tc(e,t){let n=$s(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,`}`].join(`
`)}var nc={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function rc(e,t){let n=nc[t];return n===void 0?(qe(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var ic=new q;function ac(){return Ft.getLuminanceCoefficients(ic),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${ic.x.toFixed(4)}, ${ic.y.toFixed(4)}, ${ic.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function oc(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(lc).join(`
`)}function sc(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function cc(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function lc(e){return e!==``}function uc(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function dc(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var fc=/^[ \t]*#include +<([\w\d./]+)>/gm;function pc(e){return e.replace(fc,mc)}function mc(e,t){let n=no[t];if(n===void 0)throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`);return pc(n)}var hc=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function gc(e){return e.replace(hc,_c)}function _c(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function vc(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var yc={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function bc(e){return yc[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var xc={302:`ENVMAP_MODE_REFRACTION`};function Sc(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:xc[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var Cc={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function wc(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:Cc[e.combine]||`ENVMAP_BLENDING_NONE`}function Tc(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=bc(n),l=n.envMapPMREM===!0?`ENVMAP_TYPE_PMREM`:`ENVMAP_TYPE_CUBE`,u=Sc(n),d=wc(n),f=oc(n),p=sc(a),m=i.createProgram(),h,g,_=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(h=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(lc).join(`
`),h.length>0&&(h+=`
`),g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(lc).join(`
`),g.length>0&&(g+=`
`)):(h=[vc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.diffuseRoughnessMapUv?`#define DIFFUSE_ROUGHNESSMAP_UV `+n.diffuseRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(lc).join(`
`),g=[vc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMapPMREM?`#define ENVMAP_MAX_LOD `+n.envMapMaxLod+`.0`:``,n.envMapPMREM?`#define ENVMAP_SIZE `+n.envMapSize+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughness?`#define USE_DIFFUSE_ROUGHNESS`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:no.tonemapping_pars_fragment,n.toneMapping===0?``:rc(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,no.colorspace_pars_fragment,tc(`linearToOutputTexel`,n.outputColorSpace),ac(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(lc).join(`
`)),o=pc(o),o=uc(o,n),o=dc(o,n),s=pc(s),s=uc(s,n),s=dc(s,n),o=gc(o),s=gc(s),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,h=[f,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+h,g=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+g);let v=_+h+o,y=_+g+s,b=Js(i,i.VERTEX_SHADER,v),x=Js(i,i.FRAGMENT_SHADER,y);i.attachShader(m,b),i.attachShader(m,x),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(m,0,`position`):i.bindAttribLocation(m,0,n.index0AttributeName),i.linkProgram(m);function S(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(m)||``,r=i.getShaderInfoLog(b)||``,a=i.getShaderInfoLog(x)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(m,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,m,b,x);else{let e=ec(i,b,`vertex`),n=ec(i,x,`fragment`);Je(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(m,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):qe(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:h},fragmentShader:{log:c,prefix:g}})}i.deleteShader(b),i.deleteShader(x),C=new qs(i,m),w=cc(i,m)}let C;this.getUniforms=function(){return C===void 0&&S(this),C};let w;this.getAttributes=function(){return w===void 0&&S(this),w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(m,Ys)),T},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Xs++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=b,this.fragmentShader=x,this}var Ec=0,Dc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Oc(e),t.set(e,n)),n}},Oc=class{constructor(e){this.id=Ec++,this.code=e,this.usedTimes=0}};function kc(e){return e===1030||e===37490||e===36285}function Ac(e,t,n,r,i,a){let o=new ln,s=new Dc,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function p(e){return c.add(e),e===0?`uv`:`uv${e}`}function m(i,o,l,u,m,h){let g=u.fog,_=m.geometry,v=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,b=t.get(i.envMap||v,y),x=f[i.type],S=r.precision;i.precision!==null&&(S=r.getMaxPrecision(i.precision),S!==i.precision&&qe(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,S,`instead.`));let C=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,w=C===void 0?0:C.length,T=0;_.morphAttributes.position!==void 0&&(T=1),_.morphAttributes.normal!==void 0&&(T=2),_.morphAttributes.color!==void 0&&(T=3);let E,D,O,k;if(x){let e=ro[x];E=e.vertexShader,D=e.fragmentShader}else{E=i.vertexShader,D=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),O=e.id,k=t.id}let A=e.getRenderTarget(),j=e.state.buffers.depth.getReversed(),M=m.isInstancedMesh===!0,N=m.isBatchedMesh===!0,P=!!i.map,F=!!i.matcap,I=!!b,L=I&&b.isPMREMTexture===!0,R=!!i.aoMap,ee=!!i.lightMap,te=!!i.bumpMap&&i.wireframe===!1,ne=!!i.normalMap,z=!!i.displacementMap,B=!!i.emissiveMap,V=!!i.metalnessMap,re=!!i.roughnessMap,ie=i.anisotropy>0,H=i.clearcoat>0,ae=i.diffuseRoughness>0,oe=i.dispersion>0,se=i.retroreflectivity>0,ce=i.iridescence>0,le=i.sheen>0,ue=i.transmission>0,de=ie&&!!i.anisotropyMap,fe=H&&!!i.clearcoatMap,pe=H&&!!i.clearcoatNormalMap,me=H&&!!i.clearcoatRoughnessMap,he=ae&&!!i.diffuseRoughnessMap,ge=ce&&!!i.iridescenceMap,_e=ce&&!!i.iridescenceThicknessMap,ve=le&&!!i.sheenColorMap,ye=le&&!!i.sheenRoughnessMap,be=!!i.specularMap,xe=!!i.specularColorMap,Se=!!i.specularIntensityMap,Ce=ue&&!!i.transmissionMap,we=ue&&!!i.thicknessMap,Te=!!i.gradientMap,Ee=!!i.alphaMap,U=i.alphaTest>0,De=!!i.alphaHash,Oe=!!i.extensions,ke=0;i.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(ke=e.toneMapping);let W=L?b.isCompressedCubeTexture?b.image[0].mipmaps:b.mipmaps:null,Ae={shaderID:x,shaderType:i.type,shaderName:i.name,vertexShader:E,fragmentShader:D,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:S,batching:N,batchingColor:N&&m._colorsTexture!==null,instancing:M,instancingColor:M&&m.instanceColor!==null,instancingMorph:M&&m.morphTexture!==null,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Ft.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:P,matcap:F,envMap:I,envMapMode:I&&b.mapping,envMapPMREM:L,envMapMaxLod:L?W.length-1:null,envMapSize:L?W[0].width:null,aoMap:R,lightMap:ee,bumpMap:te,normalMap:ne,displacementMap:z,emissiveMap:B,normalMapObjectSpace:ne&&i.normalMapType===1,normalMapTangentSpace:ne&&i.normalMapType===0,packedNormalMap:ne&&i.normalMapType===0&&kc(i.normalMap.format),metalnessMap:V,roughnessMap:re,anisotropy:ie,anisotropyMap:de,clearcoat:H,clearcoatMap:fe,clearcoatNormalMap:pe,clearcoatRoughnessMap:me,diffuseRoughness:ae,diffuseRoughnessMap:he,dispersion:oe,retroreflection:se,iridescence:ce,iridescenceMap:ge,iridescenceThicknessMap:_e,sheen:le,sheenColorMap:ve,sheenRoughnessMap:ye,specularMap:be,specularColorMap:xe,specularIntensityMap:Se,transmission:ue,transmissionMap:Ce,thicknessMap:we,gradientMap:Te,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Ee,alphaTest:U,alphaHash:De,combine:i.combine,mapUv:P&&p(i.map.channel),aoMapUv:R&&p(i.aoMap.channel),lightMapUv:ee&&p(i.lightMap.channel),bumpMapUv:te&&p(i.bumpMap.channel),normalMapUv:ne&&p(i.normalMap.channel),displacementMapUv:z&&p(i.displacementMap.channel),emissiveMapUv:B&&p(i.emissiveMap.channel),metalnessMapUv:V&&p(i.metalnessMap.channel),roughnessMapUv:re&&p(i.roughnessMap.channel),anisotropyMapUv:de&&p(i.anisotropyMap.channel),clearcoatMapUv:fe&&p(i.clearcoatMap.channel),clearcoatNormalMapUv:pe&&p(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:me&&p(i.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:he&&p(i.diffuseRoughnessMap.channel),iridescenceMapUv:ge&&p(i.iridescenceMap.channel),iridescenceThicknessMapUv:_e&&p(i.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&p(i.sheenColorMap.channel),sheenRoughnessMapUv:ye&&p(i.sheenRoughnessMap.channel),specularMapUv:be&&p(i.specularMap.channel),specularColorMapUv:xe&&p(i.specularColorMap.channel),specularIntensityMapUv:Se&&p(i.specularIntensityMap.channel),transmissionMapUv:Ce&&p(i.transmissionMap.channel),thicknessMapUv:we&&p(i.thicknessMap.channel),alphaMapUv:Ee&&p(i.alphaMap.channel),vertexTangents:!!_.attributes.tangent&&(ne||ie),vertexNormals:!!_.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!_.attributes.color&&_.attributes.color.itemSize===4,pointsUvs:m.isPoints===!0&&!!_.attributes.uv&&(P||Ee),fog:!!g,useFog:i.fog===!0,fogExp2:!!g&&g.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||_.attributes.normal===void 0&&ne===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:j,skinning:m.isSkinnedMesh===!0,hasPositionAttribute:_.attributes.position!==void 0,morphTargets:_.morphAttributes.position!==void 0,morphNormals:_.morphAttributes.normal!==void 0,morphColors:_.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:h.filter(e=>e.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:ke,decodeVideoTexture:P&&i.map.isVideoTexture===!0&&Ft.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:B&&i.emissiveMap.isVideoTexture===!0&&Ft.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Oe&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Oe&&i.extensions.multiDraw===!0||N)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Ae.vertexUv1s=c.has(1),Ae.vertexUv2s=c.has(2),Ae.vertexUv3s=c.has(3),c.clear(),Ae}function h(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(g(n,t),_(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function g(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapPMREM),e.push(t.envMapMaxLod),e.push(t.envMapSize),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.diffuseRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.numLightProbeGrids),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function _(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.diffuseRoughness&&o.enable(25),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function v(e){let t=f[e.type],n;if(t){let e=ro[t];n=zi.clone(e.uniforms)}else n=e.uniforms;return n}function y(t,n){let r=u.get(n);return r===void 0?(r=new Tc(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function b(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function x(e){s.remove(e)}function S(){s.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:v,acquireProgram:y,releaseProgram:b,releaseShaderCache:x,programs:l,dispose:S}}function jc(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Mc(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Nc(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Pc(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||Mc),r.length>1&&r.sort(t||Nc),i.length>1&&i.sort(t||Nc)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Fc(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Pc,e.set(t,[i])):n>=r.length?(i=new Pc,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Ic(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new q,color:new J};break;case`SpotLight`:n={position:new q,direction:new q,color:new J,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new q,color:new J,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new q,skyColor:new J,groundColor:new J};break;case`RectAreaLight`:n={color:new J,position:new q,halfWidth:new q,halfHeight:new q}}return e[t.id]=n,n}}}function Lc(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new K};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new K};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new K,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Rc=0;function zc(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Bc(e){let t=new Ic,n=Lc(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new q);let i=new q,a=new Zt,o=new Zt;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(zc);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Y.LTC_FLOAT_1,r.rectAreaLTC2=Y.LTC_FLOAT_2):(r.rectAreaLTC1=Y.LTC_HALF_1,r.rectAreaLTC2=Y.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=Rc++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function Vc(e){let t=new Bc(e),n=[],r=[],i=[];function a(e){u.camera=e,n.length=0,r.length=0,i.length=0}function o(e){e.isLightProbeGrid?i.push(e):n.push(e)}function s(e){r.push(e)}function c(){t.setup(n),i.sort((e,t)=>e.priority-t.priority||e.id-t.id)}function l(e){t.setupView(n,e)}let u={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:s}}function Hc(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Vc(e),t.set(n,[a])):r>=i.length?(a=new Vc(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Uc=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Wc=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Gc=[new q(1,0,0),new q(-1,0,0),new q(0,1,0),new q(0,-1,0),new q(0,0,1),new q(0,0,-1)],Kc=[new q(0,-1,0),new q(0,-1,0),new q(0,0,1),new q(0,0,-1),new q(0,-1,0),new q(0,-1,0)],qc=new Zt,Jc=new q,Yc=new q;function Xc(e,t,n){let r=new hi,i=new K,o=new K,s=new Kt,l=new qi,u=new Ji,d={},f=n.maxTextureSize,p={0:1,1:0,2:2},m=new Hi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new K},radius:{value:4}},vertexShader:Uc,fragmentShader:Wc}),h=m.clone();h.defines.HORIZONTAL_PASS=1;let y=new kr;y.setAttribute(`position`,new mr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new $r(y,m),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let S=this.type;this.render=function(t,n,l){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||t.length===0)return;this.type===2&&(qe(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.state;m.setBlending(0),m.buffers.depth.getReversed()===!0?m.buffers.color.setClear(0,0,0,0):m.buffers.color.setClear(1,1,1,1),m.buffers.depth.setTest(!0),m.setScissorTest(!1);let h=S!==this.type;h&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let u=0,d=t.length;u<d;u++){let d=t[u],p=d.shadow;if(p===void 0){qe(`WebGLShadowMap:`,d,`has no shadow.`);continue}if(p.autoUpdate===!1&&p.needsUpdate===!1)continue;i.copy(p.mapSize);let y=p.getFrameExtents();i.multiply(y),o.copy(p.mapSize),(i.x>f||i.y>f)&&(i.x>f&&(o.x=Math.floor(f/y.x),i.x=o.x*y.x,p.mapSize.x=o.x),i.y>f&&(o.y=Math.floor(f/y.y),i.y=o.y*y.y,p.mapSize.y=o.y));let b=e.state.buffers.depth.getReversed();if(p.camera._reversedDepth=b,p.map===null||h===!0){if(p.map!==null&&(p.map.depthTexture!==null&&(p.map.depthTexture.dispose(),p.map.depthTexture=null),p.map.dispose()),this.type===3){if(d.isPointLight){qe(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}p.map=new Jt(i.x,i.y,{format:j,type:v,minFilter:c,magFilter:c,generateMipmaps:!1}),p.map.texture.name=d.name+`.shadowMap`,p.map.depthTexture=new Di(i.x,i.y,_),p.map.depthTexture.name=d.name+`.shadowMapDepth`,p.map.depthTexture.format=D,p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=a,p.map.depthTexture.magFilter=a}else d.isPointLight?(p.map=new po(i.x),p.map.depthTexture=new Oi(i.x,g)):(p.map=new Jt(i.x,i.y),p.map.depthTexture=new Di(i.x,i.y,g)),p.map.depthTexture.name=d.name+`.shadowMap`,p.map.depthTexture.format=D,this.type===1?(p.map.depthTexture.compareFunction=b?518:515,p.map.depthTexture.minFilter=c,p.map.depthTexture.magFilter=c):(p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=a,p.map.depthTexture.magFilter=a);p.camera.updateProjectionMatrix()}p.map.isWebGLCubeRenderTarget!==!0&&(p.map.width!==i.x||p.map.height!==i.y)&&p.map.setSize(i.x,i.y);let x=p.map.isWebGLCubeRenderTarget?6:p.getViewportCount();d.isPointLight!==!0&&p.updateMatrices(d,l);let S=p.camera.layers.mask&4294967294?p.camera.layers:l.layers;for(let t=0;t<x;t++){let i=p.getCamera(t);if(d.isPointLight){let e=p.camera,n=p.matrix,r=d.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Jc.setFromMatrixPosition(d.matrixWorld),e.position.copy(Jc),Yc.copy(e.position),Yc.add(Gc[t]),e.up.copy(Kc[t]),e.lookAt(Yc),e.updateMatrixWorld(),n.makeTranslation(-Jc.x,-Jc.y,-Jc.z),qc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),p._frustum.setFromProjectionMatrix(qc,e.coordinateSystem,e.reversedDepth)}if(p.map.isWebGLCubeRenderTarget)e.setRenderTarget(p.map,t),e.clear();else{t===0&&(e.setRenderTarget(p.map),e.clear());let n=p.getViewport(t);s.set(o.x*n.x,o.y*n.y,o.x*n.z,o.y*n.w),m.viewport(s)}r=p.getFrustum(t),T(n,l,i,d,S,this.type)}p.isPointLightShadow!==!0&&this.type===3&&C(p,l),p.needsUpdate=!1}S=this.type,x.needsUpdate=!1,e.setRenderTarget(u,d,p)};function C(n,r){let a=t.update(b);m.defines.VSM_SAMPLES!==n.blurSamples&&(m.defines.VSM_SAMPLES=n.blurSamples,h.defines.VSM_SAMPLES=n.blurSamples,m.needsUpdate=!0,h.needsUpdate=!0),n.mapPass===null?n.mapPass=new Jt(i.x,i.y,{format:j,type:v}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),m.uniforms.shadow_pass.value=n.map.depthTexture,m.uniforms.resolution.value.set(n.map.width,n.map.height),m.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,m,b,null),h.uniforms.shadow_pass.value=n.mapPass.texture,h.uniforms.resolution.value.set(n.map.width,n.map.height),h.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,h,b,null)}function w(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?u:l,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=d[e];r===void 0&&(r={},d[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,E)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?p[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function T(n,i,a,o,s,c){if(n.visible===!1)return;if(n.layers.test(s)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),s=n.material;if(Array.isArray(s)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=s[u.materialIndex];if(d&&d.visible){let t=w(n,d,o,c);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(s.visible){let t=w(n,s,o,c);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)T(l[e],i,a,o,s,c)}function E(e){e.target.removeEventListener(`dispose`,E);for(let t in d){let n=d[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Zc(e,t){function n(){let t=!1,n=new Kt,r=null,i=new Kt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?V(e.DEPTH_TEST):re(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Ze[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?V(e.STENCIL_TEST):re(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c={},l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new J(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,M=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),N=!1,P=0,F=e.getParameter(e.VERSION);F.indexOf(`WebGL`)===-1?F.indexOf(`OpenGL ES`)!==-1&&(P=parseFloat(/^OpenGL ES (\d)/.exec(F)[1]),N=P>=2):(P=parseFloat(/^WebGL (\d)/.exec(F)[1]),N=P>=1);let I=null,L={},R=e.getParameter(e.SCISSOR_BOX),ee=e.getParameter(e.VIEWPORT),te=new Kt().fromArray(R),ne=new Kt().fromArray(ee);function z(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let B={};B[e.TEXTURE_2D]=z(e.TEXTURE_2D,e.TEXTURE_2D,1),B[e.TEXTURE_CUBE_MAP]=z(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),B[e.TEXTURE_2D_ARRAY]=z(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),B[e.TEXTURE_3D]=z(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),V(e.DEPTH_TEST),o.setFunc(3),ue(!1),de(1),V(e.CULL_FACE),ce(0);function V(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function re(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function ie(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function H(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function ae(t){return h!==t&&(e.useProgram(t),h=t,!0)}let oe={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};oe[103]=e.MIN,oe[104]=e.MAX;let se={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function ce(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(re(e.BLEND),g=!1);else if(g===!1&&(V(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Je(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:Je(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:Je(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:Je(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(oe[n],oe[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(se[r],se[i],se[o],se[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function le(t,n){t.side===2?re(e.CULL_FACE):V(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ue(r),t.blending===1&&t.transparent===!1?ce(0):ce(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),pe(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?V(e.SAMPLE_ALPHA_TO_COVERAGE):re(e.SAMPLE_ALPHA_TO_COVERAGE)}function ue(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function de(t){t===0?re(e.CULL_FACE):(V(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function fe(t){t!==k&&(N&&e.lineWidth(t),k=t)}function pe(t,n,r){t?(V(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n,r=-r),e.polygonOffset(n,r))):re(e.POLYGON_OFFSET_FILL)}function me(t){t?V(e.SCISSOR_TEST):re(e.SCISSOR_TEST)}function he(t){t===void 0&&(t=e.TEXTURE0+M-1),I!==t&&(e.activeTexture(t),I=t)}function ge(t,n,r){r===void 0&&(r=I===null?e.TEXTURE0+M-1:I);let i=L[r];i===void 0&&(i={type:void 0,texture:void 0},L[r]=i),(i.type!==t||i.texture!==n)&&(I!==r&&(e.activeTexture(r),I=r),e.bindTexture(t,n||B[t]),i.type=t,i.texture=n)}function _e(){let t=L[I];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function ve(){try{e.compressedTexImage2D(...arguments)}catch(e){Je(`WebGLState:`,e)}}function ye(){try{e.compressedTexImage3D(...arguments)}catch(e){Je(`WebGLState:`,e)}}function be(){try{e.texSubImage2D(...arguments)}catch(e){Je(`WebGLState:`,e)}}function xe(){try{e.texSubImage3D(...arguments)}catch(e){Je(`WebGLState:`,e)}}function Se(){try{e.compressedTexSubImage2D(...arguments)}catch(e){Je(`WebGLState:`,e)}}function Ce(){try{e.compressedTexSubImage3D(...arguments)}catch(e){Je(`WebGLState:`,e)}}function we(){try{e.texStorage2D(...arguments)}catch(e){Je(`WebGLState:`,e)}}function Te(){try{e.texStorage3D(...arguments)}catch(e){Je(`WebGLState:`,e)}}function Ee(){try{e.texImage2D(...arguments)}catch(e){Je(`WebGLState:`,e)}}function U(){try{e.texImage3D(...arguments)}catch(e){Je(`WebGLState:`,e)}}function De(t){return d[t]===void 0?e.getParameter(t):d[t]}function Oe(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function ke(t){te.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),te.copy(t))}function W(t){ne.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ne.copy(t))}function Ae(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),e.uniformBlockBinding(n,i,i),r.set(t,i))}function G(t,n,r){let i=l.get(n).get(t);c[i]!==r&&(e.bindBufferBase(e.UNIFORM_BUFFER,i,r),c[i]=r)}function je(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},I=null,L={},f={},c={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new J(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,te.set(0,0,e.canvas.width,e.canvas.height),ne.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:V,disable:re,bindFramebuffer:ie,drawBuffers:H,useProgram:ae,setBlending:ce,setMaterial:le,setFlipSided:ue,setCullFace:de,setLineWidth:fe,setPolygonOffset:pe,setScissorTest:me,activeTexture:he,bindTexture:ge,unbindTexture:_e,compressedTexImage2D:ve,compressedTexImage3D:ye,texImage2D:Ee,texImage3D:U,pixelStorei:Oe,getParameter:De,updateUBOMapping:Ae,uniformBlockBinding:G,texStorage2D:we,texStorage3D:Te,texSubImage2D:be,texSubImage3D:xe,compressedTexSubImage2D:Se,compressedTexSubImage3D:Ce,scissor:ke,viewport:W,reset:je}}function Qc(e,t,d,f,p,m,h){let g=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new K,y=new WeakMap,b=new Set,x,S=new WeakMap,C=new Set,w=new FinalizationRegistry(e=>C.delete(e)),T=!1;try{T=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function E(e,t){return T?new OffscreenCanvas(e,t):He(`canvas`)}function D(e,t,n){let r=1,i=je(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);x===void 0&&(x=E(n,a));let o=t?E(n,a):x;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),qe(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&qe(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function k(e){return e.generateMipmaps}function A(t){e.generateMipmap(t)}function j(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function M(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];qe(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||qe(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?Pe:Ft.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function N(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,qe(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function P(e,t){return k(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function F(e){let t=new WeakRef(e);f.get(e).__ref=t,C.add(t),w.register(e,t,t)}function I(e){let t=f.get(e).__ref;t!==void 0&&(C.delete(t),w.unregister(t))}function L(e){ee(e.target)}function R(e){te(e.target)}function ee(e){e.removeEventListener(`dispose`,L),I(e),z(e),e.isVideoTexture&&y.delete(e),e.isHTMLTexture&&b.delete(e)}function te(e){e.removeEventListener(`dispose`,R),I(e),V(e)}function ne(){for(let e of C){let t=e.deref();t!==void 0&&(t.isRenderTarget===!0?te(t):ee(t))}C.clear(),b.clear()}function z(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=S.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&B(e),Object.keys(r).length===0&&S.delete(n)}f.remove(e)}function B(t){let n=f.get(t);e.deleteTexture(n.__webglTexture);let r=t.source,i=S.get(r);delete i[n.__cacheKey],h.memory.textures--}function V(t){let n=f.get(t);n.__depthDisposeCallback&&n.__depthDisposeCallback();let r=t.depthTexture;if(r&&r.renderTarget===t&&ee(r),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=f.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),h.memory.textures--),f.remove(i[t])}f.remove(t)}let re=0;function ie(){re=0}function H(){return re}function ae(e){re=e}function oe(){let e=re;return e>=p.maxTextures&&qe(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+p.maxTextures),re+=1,e}function se(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.mipmapsAutoUpdate),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function ce(t,n){let r=f.get(t);if(t.isVideoTexture&&Ae(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&r.__version!==t.version){let e=t.image;if(e===null)qe(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)qe(`WebGLRenderer: Texture marked for update but image is incomplete`);else{ye(r,t,n);return}}else t.isExternalTexture&&(r.__webglTexture=t.sourceTexture?t.sourceTexture:null);d.bindTexture(e.TEXTURE_2D,r.__webglTexture,e.TEXTURE0+n)}function le(t,n){let r=f.get(t);t.isRenderTargetTexture===!1&&t.version>0&&r.__version!==t.version?ye(r,t,n):(t.isExternalTexture&&(r.__webglTexture=t.sourceTexture?t.sourceTexture:null),d.bindTexture(e.TEXTURE_2D_ARRAY,r.__webglTexture,e.TEXTURE0+n))}function ue(t,n){let r=f.get(t);t.isRenderTargetTexture===!1&&t.version>0&&r.__version!==t.version?ye(r,t,n):d.bindTexture(e.TEXTURE_3D,r.__webglTexture,e.TEXTURE0+n)}function de(t,n){let r=f.get(t);t.version>0&&r.__version!==t.version?be(r,t,n):d.bindTexture(e.TEXTURE_CUBE_MAP,r.__webglTexture,e.TEXTURE0+n)}let fe={[n]:e.REPEAT,[r]:e.CLAMP_TO_EDGE,[i]:e.MIRRORED_REPEAT},pe={[a]:e.NEAREST,[o]:e.NEAREST_MIPMAP_NEAREST,[s]:e.NEAREST_MIPMAP_LINEAR,[c]:e.LINEAR,[l]:e.LINEAR_MIPMAP_NEAREST,[u]:e.LINEAR_MIPMAP_LINEAR},me={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function he(n,r){if(r.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(r.magFilter===1006||r.magFilter===1007||r.magFilter===1005||r.magFilter===1008||r.minFilter===1006||r.minFilter===1007||r.minFilter===1005||r.minFilter===1008)&&qe(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,fe[r.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,fe[r.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,fe[r.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,pe[r.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,pe[r.minFilter]),r.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,me[r.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(r.magFilter===1003||r.minFilter!==1005&&r.minFilter!==1008||r.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(r.anisotropy>1||f.get(r).__currentAnisotropy){let i=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,i.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(r.anisotropy,p.getMaxAnisotropy())),f.get(r).__currentAnisotropy=r.anisotropy}}}function ge(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,L),F(n));let i=n.source,a=S.get(i);a===void 0&&(a={},S.set(i,a));let o=se(n);if(o!==t.__cacheKey){a[o]===void 0&&(a[o]={texture:e.createTexture(),usedTimes:0},h.memory.textures++,r=!0),a[o].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&B(n)),t.__cacheKey=o,t.__webglTexture=a[o].texture}return r}function _e(e,t,n){return Math.floor(Math.floor(e/n)/t)}function ve(t,n,r,i){let a=t.updateRanges;if(a.length===0)d.texSubImage2D(e.TEXTURE_2D,0,0,0,n.width,n.height,r,i,n.data);else{a.sort((e,t)=>e.start-t.start);let o=0;for(let e=1;e<a.length;e++){let t=a[o],r=a[e],i=t.start+t.count,s=_e(r.start,n.width,4),c=_e(t.start,n.width,4);r.start<=i+1&&s===c&&_e(r.start+r.count-1,n.width,4)===s?t.count=Math.max(t.count,r.start+r.count-t.start):(++o,a[o]=r)}a.length=o+1;let s=d.getParameter(e.UNPACK_ROW_LENGTH),c=d.getParameter(e.UNPACK_SKIP_PIXELS),l=d.getParameter(e.UNPACK_SKIP_ROWS);d.pixelStorei(e.UNPACK_ROW_LENGTH,n.width);for(let t=0,o=a.length;t<o;t++){let o=a[t],s=Math.floor(o.start/4),c=Math.ceil(o.count/4),l=s%n.width,u=Math.floor(s/n.width),f=c;d.pixelStorei(e.UNPACK_SKIP_PIXELS,l),d.pixelStorei(e.UNPACK_SKIP_ROWS,u),d.texSubImage2D(e.TEXTURE_2D,0,l,u,f,1,r,i,n.data)}t.clearUpdateRanges(),d.pixelStorei(e.UNPACK_ROW_LENGTH,s),d.pixelStorei(e.UNPACK_SKIP_PIXELS,c),d.pixelStorei(e.UNPACK_SKIP_ROWS,l)}}function ye(t,n,r){let i=e.TEXTURE_2D;(n.isDataArrayTexture||n.isCompressedArrayTexture)&&(i=e.TEXTURE_2D_ARRAY),n.isData3DTexture&&(i=e.TEXTURE_3D);let a=ge(t,n),o=n.source;d.bindTexture(i,t.__webglTexture,e.TEXTURE0+r);let s=f.get(o);if(o.version!==s.__version||a===!0){if(d.activeTexture(e.TEXTURE0+r),!(typeof ImageBitmap<`u`&&n.image instanceof ImageBitmap)){let t=Ft.getPrimaries(Ft.workingColorSpace),r=n.colorSpace===``?null:Ft.getPrimaries(n.colorSpace),i=n.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;d.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,n.flipY),d.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),d.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}d.pixelStorei(e.UNPACK_ALIGNMENT,n.unpackAlignment);let t=D(n.image,!1,p.maxTextureSize);t=G(n,t);let c=m.convert(n.format,n.colorSpace),l=m.convert(n.type),u=M(n.internalFormat,c,l,n.normalized,n.colorSpace,n.isVideoTexture);he(i,n);let f,h=n.mipmaps,g=n.isVideoTexture!==!0,_=s.__version===void 0||a===!0,v=o.dataReady,y=P(n,t);if(n.isDepthTexture)u=N(n.format===O,n.type),_&&(g?d.texStorage2D(e.TEXTURE_2D,1,u,t.width,t.height):d.texImage2D(e.TEXTURE_2D,0,u,t.width,t.height,0,c,l,null));else if(n.isDataTexture){if(h.length>0){g&&_&&d.texStorage2D(e.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let t=0,n=h.length;t<n;t++)f=h[t],g?v&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,c,l,f.data):d.texImage2D(e.TEXTURE_2D,t,u,f.width,f.height,0,c,l,f.data);n.generateMipmaps=!1}else g?(_&&d.texStorage2D(e.TEXTURE_2D,y,u,t.width,t.height),v&&ve(n,t,c,l)):d.texImage2D(e.TEXTURE_2D,0,u,t.width,t.height,0,c,l,t.data)}else if(n.isCompressedTexture){if(n.isCompressedArrayTexture){g&&_&&d.texStorage3D(e.TEXTURE_2D_ARRAY,y,u,h[0].width,h[0].height,t.depth);for(let r=0,i=h.length;r<i;r++)if(f=h[r],n.format!==1023){if(c!==null){if(g){if(v){if(n.layerUpdates.size>0){let t=Qa(f.width,f.height,n.format,n.type);for(let i of n.layerUpdates){let n=f.data.subarray(i*t/f.data.BYTES_PER_ELEMENT,(i+1)*t/f.data.BYTES_PER_ELEMENT);d.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,r,0,0,i,f.width,f.height,1,c,n)}}else d.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,r,0,0,0,f.width,f.height,t.depth,c,f.data)}}else d.compressedTexImage3D(e.TEXTURE_2D_ARRAY,r,u,f.width,f.height,t.depth,0,f.data,0,0)}else qe(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else g?v&&d.texSubImage3D(e.TEXTURE_2D_ARRAY,r,0,0,0,f.width,f.height,t.depth,c,l,f.data):d.texImage3D(e.TEXTURE_2D_ARRAY,r,u,f.width,f.height,t.depth,0,c,l,f.data);n.layerUpdates.size>0&&n.clearLayerUpdates()}else{g&&_&&d.texStorage2D(e.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let t=0,r=h.length;t<r;t++)f=h[t],n.format===1023?g?v&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,c,l,f.data):d.texImage2D(e.TEXTURE_2D,t,u,f.width,f.height,0,c,l,f.data):c===null?qe(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):g?v&&d.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,c,f.data):d.compressedTexImage2D(e.TEXTURE_2D,t,u,f.width,f.height,0,f.data)}}else if(n.isDataArrayTexture){if(g){if(_&&d.texStorage3D(e.TEXTURE_2D_ARRAY,y,u,t.width,t.height,t.depth),v){if(n.layerUpdates.size>0){let r=Qa(t.width,t.height,n.format,n.type);for(let i of n.layerUpdates){let n=t.data.subarray(i*r/t.data.BYTES_PER_ELEMENT,(i+1)*r/t.data.BYTES_PER_ELEMENT);d.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,i,t.width,t.height,1,c,l,n)}n.clearLayerUpdates()}else d.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,c,l,t.data)}}else d.texImage3D(e.TEXTURE_2D_ARRAY,0,u,t.width,t.height,t.depth,0,c,l,t.data)}else if(n.isData3DTexture)g?(_&&d.texStorage3D(e.TEXTURE_3D,y,u,t.width,t.height,t.depth),v&&d.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,c,l,t.data)):d.texImage3D(e.TEXTURE_3D,0,u,t.width,t.height,t.depth,0,c,l,t.data);else if(n.isFramebufferTexture){if(_){if(g)d.texStorage2D(e.TEXTURE_2D,y,u,t.width,t.height);else{let n=t.width,r=t.height;for(let t=0;t<y;t++)d.texImage2D(e.TEXTURE_2D,t,u,n,r,0,c,l,null),n>>=1,r>>=1}}}else if(n.isHTMLTexture){if(`texElementImage2D`in e){let r=e.canvas;if(r.hasAttribute(`layoutsubtree`)||r.setAttribute(`layoutsubtree`,`true`),t.parentNode!==r){r.appendChild(t),b.add(n),r.onpaint=e=>{let t=e.changedElements;for(let e of b)t.includes(e.image)&&(e.needsUpdate=!0)},r.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(h.length>0){if(g&&_){let t=je(h[0]);d.texStorage2D(e.TEXTURE_2D,y,u,t.width,t.height)}for(let t=0,n=h.length;t<n;t++)f=h[t],g?v&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,c,l,f):d.texImage2D(e.TEXTURE_2D,t,u,c,l,f);n.generateMipmaps=!1}else if(g){if(_){let n=je(t);d.texStorage2D(e.TEXTURE_2D,y,u,n.width,n.height)}v&&d.texSubImage2D(e.TEXTURE_2D,0,0,0,c,l,t)}else d.texImage2D(e.TEXTURE_2D,0,u,c,l,t);k(n)&&n.mipmapsAutoUpdate===!0&&A(i),s.__version=o.version,n.onUpdate&&n.onUpdate(n)}t.__version=n.version}function be(t,n,r){if(n.image.length!==6)return;let i=ge(t,n),a=n.source;d.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+r);let o=f.get(a);if(a.version!==o.__version||i===!0){d.activeTexture(e.TEXTURE0+r);let t=Ft.getPrimaries(Ft.workingColorSpace),s=n.colorSpace===``?null:Ft.getPrimaries(n.colorSpace),c=n.colorSpace===``||t===s?e.NONE:e.BROWSER_DEFAULT_WEBGL;d.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,n.flipY),d.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),d.pixelStorei(e.UNPACK_ALIGNMENT,n.unpackAlignment),d.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,c);let l=n.isCompressedTexture||n.image[0].isCompressedTexture,u=n.image[0]&&n.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!l&&!u?f[e]=D(n.image[e],!0,p.maxCubemapSize):f[e]=u?n.image[e].image:n.image[e],f[e]=G(n,f[e]);let h=f[0],g=m.convert(n.format,n.colorSpace),_=m.convert(n.type),v=M(n.internalFormat,g,_,n.normalized,n.colorSpace),y=n.isVideoTexture!==!0,b=o.__version===void 0||i===!0,x=a.dataReady,S=P(n,h);he(e.TEXTURE_CUBE_MAP,n);let C;if(n.isDepthTexture){if(v=N(n.format===O,n.type),b){if(y)d.texStorage2D(e.TEXTURE_CUBE_MAP,1,v,h.width,h.height);else for(let t=0;t<6;t++)d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,h.width,h.height,0,g,_,null)}}else if(l){y&&b&&d.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let t=0;t<6;t++){C=f[t].mipmaps;for(let r=0;r<C.length;r++){let i=C[r];n.format===1023?y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,g,_,i.data):g===null?qe(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&d.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):d.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,i.data)}}}else{if(C=n.mipmaps,y&&b){C.length>0&&S++;let t=je(f[0]);d.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,t.width,t.height)}for(let t=0;t<6;t++)if(u){y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,f[t].width,f[t].height,g,_,f[t].data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,f[t].width,f[t].height,0,g,_,f[t].data);for(let n=0;n<C.length;n++){let r=C[n].image[t].image;y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,0,0,r.width,r.height,g,_,r.data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,v,r.width,r.height,0,g,_,r.data)}}else{y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,f[t]):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,g,_,f[t]);for(let n=0;n<C.length;n++){let r=C[n];y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,0,0,g,_,r.image[t]):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,v,g,_,r.image[t])}}}k(n)&&n.mipmapsAutoUpdate===!0&&A(e.TEXTURE_CUBE_MAP),o.__version=a.version,n.onUpdate&&n.onUpdate(n)}t.__version=n.version}function xe(t,n,r,i,a,o){let s=m.convert(r.format,r.colorSpace),c=m.convert(r.type),l=M(r.internalFormat,s,c,r.normalized,r.colorSpace),u=f.get(n),p=f.get(r);if(p.__renderTarget=n,!u.__hasExternalTextures){let t=Math.max(1,n.width>>o),r=Math.max(1,n.height>>o);a===e.TEXTURE_3D||a===e.TEXTURE_2D_ARRAY?d.texImage3D(a,o,l,t,r,n.depth,0,s,c,null):d.texImage2D(a,o,l,t,r,0,s,c,null)}d.bindFramebuffer(e.FRAMEBUFFER,t),W(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,i,a,p.__webglTexture,0,ke(n)):(a===e.TEXTURE_2D||a>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&a<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,i,a,p.__webglTexture,o),d.bindFramebuffer(e.FRAMEBUFFER,null)}function Se(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=N(n.stencilBuffer,a),s=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;W(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ke(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,ke(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,s,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let a=t[i],o=m.convert(a.format,a.colorSpace),s=m.convert(a.type),c=M(a.internalFormat,o,s,a.normalized,a.colorSpace);W(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ke(n),c,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,ke(n),c,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,c,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Ce(t,n,r){let i=n.isWebGLCubeRenderTarget===!0;if(d.bindFramebuffer(e.FRAMEBUFFER,t),!(n.depthTexture&&n.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let a=f.get(n.depthTexture);a.__renderTarget=n;let o=i?n.depthTexture.image[0]:n.depthTexture.image;a.__webglTexture&&o.width===n.width&&o.height===n.height||(o.width=n.width,o.height=n.height,n.depthTexture.needsUpdate=!0),i?de(n.depthTexture,0):ce(n.depthTexture,0);let s=a.__webglTexture,c=ke(n),l=i?e.TEXTURE_CUBE_MAP_POSITIVE_X+r:e.TEXTURE_2D,u=n.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(n.depthTexture.format===1026)W(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,u,l,s,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,u,l,s,0);else if(n.depthTexture.format===1027)W(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,u,l,s,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,u,l,s,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function we(t){let n=f.get(t),r=t.isWebGLCubeRenderTarget===!0;if(n.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(n.__depthDisposeCallback&&n.__depthDisposeCallback(),e){let t=()=>{delete n.__boundDepthTexture,delete n.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),n.__depthDisposeCallback=t}n.__boundDepthTexture=e}if(t.depthTexture&&!n.__autoAllocateDepthBuffer){if(r)for(let e=0;e<6;e++)Ce(n.__webglFramebuffer[e],t,e);else t.texture.mipmaps.length>0?Ce(n.__webglFramebuffer[0],t,0):Ce(n.__webglFramebuffer,t,0)}else if(r){n.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer[r]),n.__webglDepthbuffer[r]===void 0)n.__webglDepthbuffer[r]=e.createRenderbuffer(),Se(n.__webglDepthbuffer[r],t,!1);else{let i=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=n.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,i,e.RENDERBUFFER,a)}}else if(t.texture.mipmaps.length>0?d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer[0]):d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer),n.__webglDepthbuffer===void 0)n.__webglDepthbuffer=e.createRenderbuffer(),Se(n.__webglDepthbuffer,t,!1);else{let r=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,i=n.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,i),e.framebufferRenderbuffer(e.FRAMEBUFFER,r,e.RENDERBUFFER,i)}d.bindFramebuffer(e.FRAMEBUFFER,null)}function Te(t,n,r){let i=f.get(t);n!==void 0&&xe(i.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),r!==void 0&&we(t)}function Ee(t){let n=t.texture,r=f.get(t),i=f.get(n);t.addEventListener(`dispose`,R),F(t);let a=t.textures,o=t.isWebGLCubeRenderTarget===!0,s=a.length>1;if(s||(i.__webglTexture===void 0&&(i.__webglTexture=e.createTexture()),i.__version=n.version,h.memory.textures++),o){r.__webglFramebuffer=[];for(let t=0;t<6;t++)if(n.mipmaps.length>0){r.__webglFramebuffer[t]=[];for(let i=0;i<n.mipmaps.length;i++)r.__webglFramebuffer[t][i]=e.createFramebuffer()}else r.__webglFramebuffer[t]=e.createFramebuffer()}else{if(n.mipmaps.length>0){r.__webglFramebuffer=[];for(let t=0;t<n.mipmaps.length;t++)r.__webglFramebuffer[t]=e.createFramebuffer()}else r.__webglFramebuffer=e.createFramebuffer();if(s)for(let t=0,n=a.length;t<n;t++){let n=f.get(a[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),h.memory.textures++)}if(t.samples>0&&W(t)===!1){r.__webglMultisampledFramebuffer=e.createFramebuffer(),r.__webglColorRenderbuffer=[],d.bindFramebuffer(e.FRAMEBUFFER,r.__webglMultisampledFramebuffer);for(let n=0;n<a.length;n++){let i=a[n];r.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,r.__webglColorRenderbuffer[n]);let o=m.convert(i.format,i.colorSpace),s=m.convert(i.type),c=M(i.internalFormat,o,s,i.normalized,i.colorSpace,t.isXRRenderTarget===!0),l=ke(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,l,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,r.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(r.__webglDepthRenderbuffer=e.createRenderbuffer(),Se(r.__webglDepthRenderbuffer,t,!0)),d.bindFramebuffer(e.FRAMEBUFFER,null)}}if(o){d.bindTexture(e.TEXTURE_CUBE_MAP,i.__webglTexture),he(e.TEXTURE_CUBE_MAP,n);for(let i=0;i<6;i++)if(n.mipmaps.length>0)for(let a=0;a<n.mipmaps.length;a++)xe(r.__webglFramebuffer[i][a],t,n,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+i,a);else xe(r.__webglFramebuffer[i],t,n,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+i,0);k(n)?A(e.TEXTURE_CUBE_MAP):n.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,n.mipmaps.length-1),d.unbindTexture()}else if(s){for(let n=0,i=a.length;n<i;n++){let i=a[n],o=f.get(i),s=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(s=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),d.bindTexture(s,o.__webglTexture),he(s,i),xe(r.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0+n,s,0),k(i)&&A(s)}d.unbindTexture()}else{let a=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(a=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),d.bindTexture(a,i.__webglTexture),he(a,n),n.mipmaps.length>0)for(let i=0;i<n.mipmaps.length;i++)xe(r.__webglFramebuffer[i],t,n,e.COLOR_ATTACHMENT0,a,i);else xe(r.__webglFramebuffer,t,n,e.COLOR_ATTACHMENT0,a,0);k(n)?A(a):n.mipmaps.length>0&&e.texParameteri(a,e.TEXTURE_MAX_LEVEL,n.mipmaps.length-1),d.unbindTexture()}t.depthBuffer&&we(t)}function U(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(k(r)&&r.mipmapsAutoUpdate===!0){let t=j(e),n=f.get(r).__webglTexture;d.bindTexture(t,n),A(t),d.unbindTexture()}}}let De=[];function Oe(t){if(t.samples>0){if(W(t)===!1){let n=t.textures,r=t.width,i=t.height,a=e.COLOR_BUFFER_BIT,o=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,s=f.get(t),c=n.length>1;if(c)for(let t=0;t<n.length;t++)d.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),d.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);d.bindFramebuffer(e.READ_FRAMEBUFFER,s.__webglMultisampledFramebuffer),t.texture.mipmaps.length>0?d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglFramebuffer[0]):d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglFramebuffer);for(let l=0;l<n.length;l++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(a|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(a|=e.STENCIL_BUFFER_BIT)),c){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,s.__webglColorRenderbuffer[l]);let t=f.get(n[l]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,r,i,0,0,r,i,a,e.NEAREST),_===!0&&(De.length=0,De.push(e.COLOR_ATTACHMENT0+l),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&De.push(o),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,De))}if(d.bindFramebuffer(e.READ_FRAMEBUFFER,null),d.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),c)for(let t=0;t<n.length;t++){d.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,s.__webglColorRenderbuffer[t]);let r=f.get(n[t]).__webglTexture;d.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,r,0)}d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&_){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function ke(e){return Math.min(p.maxSamples,e.samples)}function W(e){let n=f.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function Ae(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function G(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Ft.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&qe(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):Je(`WebGLTextures: Unsupported texture color space:`,n)),t}function je(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=oe,this.resetTextureUnits=ie,this.getTextureUnits=H,this.setTextureUnits=ae,this.setTexture2D=ce,this.setTexture2DArray=le,this.setTexture3D=ue,this.setTextureCube=de,this.rebindTextures=Te,this.setupRenderTarget=Ee,this.updateRenderTargetMipmap=U,this.updateMultisampleRenderTarget=Oe,this.setupDepthRenderbuffer=we,this.setupFrameBufferTexture=xe,this.useMultisampledRTT=W,this.dispose=ne}function $c(e,t){function n(n,r=``){let i,a=Ft.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var el=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,tl=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,nl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new ki(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Hi({vertexShader:el,fragmentShader:tl,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new $r(new Ni(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},rl=class extends Qe{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,f=null,p=null,m=null,h=typeof XRWebGLBinding<`u`,_=new nl,v={},y=t.getContextAttributes(),b=null,S=null,C=[],w=[],T=new K,k=null,A=null,j=new Oa;j.viewport=new Kt;let M=new Oa;M.viewport=new Kt;let N=[j,M],P=new Fa,F=null,I=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new On,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new On,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new On,C[e]=t),t.getHandSpace()};function L(e){let t=w.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function R(){r.removeEventListener(`select`,L),r.removeEventListener(`selectstart`,L),r.removeEventListener(`selectend`,L),r.removeEventListener(`squeeze`,L),r.removeEventListener(`squeezestart`,L),r.removeEventListener(`squeezeend`,L),r.removeEventListener(`end`,R),r.removeEventListener(`inputsourceschange`,ee);for(let e=0;e<C.length;e++){let t=w[e];t!==null&&(w[e]=null,C[e].disconnect(t))}F=null,I=null,_.reset();for(let e in v)delete v[e];if(e.setRenderTarget(b),p=null,f=null,u=null,r=null,S=null,V.stop(),n.isPresenting=!1,e.setPixelRatio(k),e.setSize(T.width,T.height,!1),A!==null){let e=A.camera;e.fov=A.fov,e.zoom=A.zoom,e.updateProjectionMatrix(),A=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&qe(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&qe(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return u===null&&h&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(b=e.getRenderTarget(),r.addEventListener(`select`,L),r.addEventListener(`selectstart`,L),r.addEventListener(`selectend`,L),r.addEventListener(`squeeze`,L),r.addEventListener(`squeezestart`,L),r.addEventListener(`squeezeend`,L),r.addEventListener(`end`,R),r.addEventListener(`inputsourceschange`,ee),y.xrCompatible!==!0&&await t.makeXRCompatible(),k=e.getPixelRatio(),e.getSize(T),h&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;y.depth&&(o=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=y.stencil?O:D,a=y.stencil?x:g);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),f=u.createProjectionLayer(s),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new Jt(f.textureWidth,f.textureHeight,{format:E,type:d,depthTexture:new Di(f.textureWidth,f.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new Jt(p.framebufferWidth,p.framebufferHeight,{format:E,type:d,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),V.setContext(r),V.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function ee(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=w.indexOf(n);r>=0&&(w[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=w.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=w.length){w.push(n),r=e;break}else if(w[e]===null){w[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}function te(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),P.near=M.near=j.near=t,P.far=M.far=j.far=n,(F!==P.near||I!==P.far)&&(r.updateRenderState({depthNear:P.near,depthFar:P.far}),F=P.near,I=P.far),P.layers.mask=e.layers.mask|6,j.layers.mask=P.layers.mask&-5,M.layers.mask=P.layers.mask&-3;let i=e.parent,a=P.cameras;te(P,i);for(let e=0;e<a.length;e++)te(a[e],i);P.projectionMatrix.copy(j.projectionMatrix),P.projectionMatrixInverse.copy(j.projectionMatrixInverse),A===null&&e.isPerspectiveCamera&&(A={camera:e,fov:e.fov,zoom:e.zoom}),ne(e,P,i)};function ne(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=nt*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return P},this.getFoveation=function(){if(f!==null||p!==null)return s},this.setFoveation=function(e){s=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(P)},this.getCameraTexture=function(e){return v[e]};let z=null;function B(t,i){if(l=i.getViewerPose(c||a),m=i,l!==null){let t=l.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==P.cameras.length&&(P.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=u.getViewSubImage(f,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=N[n];o===void 0&&(o=new Oa,o.layers.enable(n),o.viewport=new Kt,N[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(P.matrix.copy(o.matrix),P.matrix.decompose(P.position,P.quaternion,P.scale)),i===!0&&P.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&h){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&h){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new ki,v[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=w[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}z&&z(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),m=null}let V=new eo;V.setAnimationLoop(B),this.setAnimationLoop=function(e){z=e},this.dispose=function(){}}},il=new Zt,al=new At;al.set(-1,0,0,0,1,0,0,0,1);function ol(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Ri(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(il.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(al),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.diffuseRoughness>0&&(e.diffuseRoughness.value=t.diffuseRoughness,t.diffuseRoughnessMap&&(e.diffuseRoughnessMap.value=t.diffuseRoughnessMap,n(t.diffuseRoughnessMap,e.diffuseRoughnessMapTransform))),t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessMinimum,e.iridescenceThicknessMaximum.value=t.iridescenceThicknessMaximum,t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function sl(e,t,n,r){let i={},a={};function o(e,t){let n=t.program;r.uniformBlockBinding(e,n,i[e.id])}function s(e,n){let o=i[e.id];o===void 0&&(m(e),o=c(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let u=t.render.frame;a[e.id]!==u&&(l(e),a[e.id]=u)}function c(t){let n=e.createBuffer(),r=t.__size,i=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,r,i),e.bindBuffer(e.UNIFORM_BUFFER,null),n}function l(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)u(t[n],e,n,a);else u(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function u(t,n,r,i){if(f(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=h(i,!0);d(i,t.__data,e),e+=a.storage/Float32Array.BYTES_PER_ELEMENT}}else d(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function d(e,t,n){typeof e==`number`||typeof e==`boolean`?t[n]=e:e.isMatrix3?(t[n]=e.elements[0],t[n+1]=e.elements[1],t[n+2]=e.elements[2],t[n+3]=0,t[n+4]=e.elements[3],t[n+5]=e.elements[4],t[n+6]=e.elements[5],t[n+7]=0,t[n+8]=e.elements[6],t[n+9]=e.elements[7],t[n+10]=e.elements[8],t[n+11]=0):ArrayBuffer.isView(e)?t.set(e.subarray(0,t.length-n),n):e.toArray(t,n)}function f(e,t,n,r){let i=e.value,a=t+`_`+n;if(Array.isArray(i)){r[a]===void 0&&(r[a]=[]);let e=r[a],t=!1;for(let n=0;n<i.length;n++)p(i[n],e,n)===!0&&(t=!0);return t}return p(i,r,a)}function p(e,t,n){if(t[n]===void 0)return t[n]=typeof e==`number`||typeof e==`boolean`?e:ArrayBuffer.isView(e)?e.slice():e.clone(),!0;{let r=t[n];if(typeof e==`number`||typeof e==`boolean`){if(r!==e)return t[n]=e,!0}else if(ArrayBuffer.isView(e))return!0;else if(r.equals(e)===!1)return r.copy(e),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let i=0,a=r.length;i<a;i++){let a=r[i],o=Array.isArray(a.value)?a.value:[a.value],s=Array.isArray(t[e])||Array.isArray(a.value),c=n;for(let e=0,t=o.length;e<t;e++){let t=o[e],r=h(t,s),i=n%16,a=i%r.boundary,l=i+a;n+=a,l!==0&&16-l<r.storage&&(n+=16-l),e===0&&(c=n),n+=r.storage}a.__data=new(a.type===`int`?Int32Array:a.type===`uint`?Uint32Array:Float32Array)((n-c)/Float32Array.BYTES_PER_ELEMENT),a.__offset=c}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e,t){let n={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(n.boundary=4,n.storage=4):e.isVector2?(n.boundary=8,n.storage=8):e.isVector3||e.isColor?(n.boundary=16,n.storage=12):e.isVector4?(n.boundary=16,n.storage=16):e.isMatrix3?(n.boundary=16,n.storage=48):e.isMatrix4?(n.boundary=16,n.storage=64):e.isTexture?qe(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(n.boundary=16,n.storage=e.byteLength):qe(`WebGLRenderer: Unsupported uniform value type.`,e),t===!0&&(n.boundary=16,n.storage=Math.ceil(n.storage/16)*16),n}function g(t){let n=t.target;n.removeEventListener(`dispose`,g),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);i={},a={}}return{bind:o,update:s,dispose:_}}var cl=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ll=null;function ul(){return ll===null&&(ll=new ni(cl,16,16,j,v),ll.name=`DFG_LUT`,ll.minFilter=c,ll.magFilter=c,ll.wrapS=r,ll.wrapT=r,ll.generateMipmaps=!1,ll.needsUpdate=!0),ll}var dl=class{constructor(e={}){let{canvas:t=Ue(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:p=!1,outputBufferType:h=d}=e;this.isWebGLRenderer=!0;let _;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);_=n.getContextAttributes().alpha}else _=a;let S=h,C=new Set([N,M,A]),w=new Set([d,g,m,x,y,b]),T=new Uint32Array(4),E=new Int32Array(4),D={textures:[],min:[],max:[],resolution:[]},O=null,k=null,j=[],P=[],F=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let I=this,L=!1,R=null,ee=null,te=null,ne=null;this._outputColorSpace=Me;let z=0,B=0,V=null,re=-1,ie=null,H=new Kt,ae=new Kt,oe=null,se=new J(0),ce=0,le=t.width,ue=t.height,de=1,fe=null,pe=null,me=new Kt(0,0,le,ue),he=new Kt(0,0,le,ue),ge=!1,_e=new hi,ve=new _i,ye=!1,be=!1,xe=new Zt,Se=new q,Ce=new Kt,we={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Te=!1;function Ee(){return V===null?de:1}let U=n;function De(e,n){return t.getContext(e,n)}let Oe,ke,W,Ae,G,je,Ne,Pe,Fe,Ie,Le,Re,Be,Ve,He,We,Ke,Ye,Ze,Qe,$e,et,tt;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:f};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r187`),t.addEventListener(`webglcontextlost`,it,!1),t.addEventListener(`webglcontextrestored`,at,!1),t.addEventListener(`webglcontextcreationerror`,ot,!1),U===null){let t=`webgl2`;if(U=De(t,e),U===null)throw De(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}nt()}catch(e){throw t.removeEventListener(`webglcontextlost`,it,!1),t.removeEventListener(`webglcontextrestored`,at,!1),t.removeEventListener(`webglcontextcreationerror`,ot,!1),Je(`WebGLRenderer: `+e.message),e}function nt(){Oe=new jo(U),Oe.init(),$e=new $c(U,Oe),ke=new uo(U,Oe,e,$e),W=new Zc(U,Oe),ke.reversedDepthBuffer&&p&&W.buffers.depth.setReversed(!0),ee=U.createFramebuffer(),te=U.createFramebuffer(),ne=U.createFramebuffer(),Ae=new Po(U),G=new jc,je=new Qc(U,Oe,W,G,ke,$e,Ae),Ne=new Ao(I),Pe=new to(U),et=new co(U,Pe),Fe=new Mo(U,Pe,Ae,et),Ie=new Io(U,Fe,Pe,et,Ae),Ye=new Fo(U,ke,je),He=new fo(G),Le=new Ac(I,Ne,Oe,ke,et,He),Re=new ol(I,G),Be=new Fc,Ve=new Hc(Oe),Ke=new so(I,Ne,W,Ie,_,s),We=new Xc(I,Ie,ke),tt=new sl(U,Ae,ke,W),Ze=new lo(U,Oe,Ae),Qe=new No(U,Oe,Ae),Ae.programs=Le.programs,I.capabilities=ke,I.extensions=Oe,I.properties=G,I.renderLists=Be,I.shadowMap=We,I.state=W,I.info=Ae}S!==1009&&(F=new Ro(S,t.width,t.height,o,r,i));let rt=new rl(I,U);this.xr=rt,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let e=Oe.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Oe.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return de},this.setPixelRatio=function(e){e!==void 0&&(de=e,this.setSize(le,ue,!1))},this.getSize=function(e){return e.set(le,ue)},this.setSize=function(e,n,r=!0){rt.isPresenting?qe(`WebGLRenderer: Can't change size while VR device is presenting.`):(le=e,ue=n,t.width=Math.floor(e*de),t.height=Math.floor(n*de),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),F!==null&&F.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(le*de,ue*de).floor()},this.setDrawingBufferSize=function(e,n,r){le=e,ue=n,de=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(S===1009)Je(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){qe(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}F.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(H)},this.getViewport=function(e){return e.copy(me)},this.setViewport=function(e,t,n,r){e.isVector4?me.set(e.x,e.y,e.z,e.w):me.set(e,t,n,r),W.viewport(H.copy(me).multiplyScalar(Ee()).round())},this.getScissor=function(e){return e.copy(he)},this.setScissor=function(e,t,n,r){e.isVector4?he.set(e.x,e.y,e.z,e.w):he.set(e,t,n,r),W.scissor(ae.copy(he).multiplyScalar(Ee()).round())},this.getScissorTest=function(){return ge},this.setScissorTest=function(e){W.setScissorTest(ge=e)},this.setOpaqueSort=function(e){fe=e},this.setTransparentSort=function(e){pe=e},this.getClearColor=function(e){return e.copy(Ke.getClearColor())},this.setClearColor=function(){Ke.setClearColor(...arguments)},this.getClearAlpha=function(){return Ke.getClearAlpha()},this.setClearAlpha=function(){Ke.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(V!==null){let t=V.texture.format;e=C.has(t)}if(e){let e=V.texture.type,t=w.has(e),n=Ke.getClearColor(),r=Ke.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(T[0]=i,T[1]=a,T[2]=o,T[3]=r,U.clearBufferuiv(U.COLOR,0,T)):(E[0]=i,E[1]=a,E[2]=o,E[3]=r,U.clearBufferiv(U.COLOR,0,E))}else r|=U.COLOR_BUFFER_BIT}t&&(r|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&U.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),R=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,it,!1),t.removeEventListener(`webglcontextrestored`,at,!1),t.removeEventListener(`webglcontextcreationerror`,ot,!1),Ke.dispose(),Be.dispose(),Ve.dispose(),je.dispose(),G.dispose(),Ne.dispose(),Ie.dispose(),Fe.dispose(),et.dispose(),tt.dispose(),Le.dispose(),rt.dispose(),rt.removeEventListener(`sessionstart`,pt),rt.removeEventListener(`sessionend`,mt),ht.stop()};function it(e){e.preventDefault(),Ge(`WebGLRenderer: Context Lost.`),L=!0}function at(){Ge(`WebGLRenderer: Context Restored.`),L=!1;let e=Ae.autoReset,t=We.enabled,n=We.autoUpdate,r=We.needsUpdate,i=We.type;nt(),Ae.autoReset=e,We.enabled=t,We.autoUpdate=n,We.needsUpdate=r,We.type=i}function ot(e){Je(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function st(e){let t=e.target;t.removeEventListener(`dispose`,st),ct(t)}function ct(e){lt(e),G.remove(e)}function lt(e){let t=G.get(e).programs;t!==void 0&&(t.forEach(function(e){Le.releaseProgram(e)}),e.isShaderMaterial&&Le.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=we);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=Et(e,t,n,r,i);W.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Fe.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;et.setup(i,r,s,n,c);let h,g=Ze;if(c!==null&&(h=Pe.get(c),g=Qe,g.setIndex(h)),i.isMesh)r.wireframe===!0?(W.setLineWidth(r.wireframeLinewidth*Ee()),g.setMode(U.LINES)):g.setMode(U.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),W.setLineWidth(e*Ee()),i.isLineSegments?g.setMode(U.LINES):i.isLineLoop?g.setMode(U.LINE_LOOP):g.setMode(U.LINE_STRIP)}else i.isPoints?g.setMode(U.POINTS):i.isSprite&&g.setMode(U.TRIANGLES);if(i.isBatchedMesh){if(Oe.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Pe.get(c).bytesPerElement:1,o=G.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(U,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function ut(e,t,n,r){R!==null&&e.isNodeMaterial&&R.setObject(r,e),ye===!0&&He.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,St(e,t,r),e.side=0,e.needsUpdate=!0,St(e,t,r),e.side=2):St(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),R!==null&&R.renderStart(e,t,n),k=Ve.get(n),k.init(t),P.push(k),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),k.setupLights(),R!==null&&R.updateLights(k.state.lightsArray),be=this.localClippingEnabled,ye=He.init(this.clippingPlanes,be),ye===!0&&He.setGlobalState(this.clippingPlanes,t),R!==null&&We.render(k.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];ut(o,n,t,e),r.add(o)}else ut(i,n,t,e),r.add(i)}}),k=P.pop(),R!==null&&R.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=G.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Oe.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let dt=null;function ft(e){dt&&dt(e)}function pt(){ht.stop()}function mt(){ht.start()}let ht=new eo;ht.setAnimationLoop(ft),typeof self<`u`&&ht.setContext(self),this.setAnimationLoop=function(e){dt=e,rt.setAnimationLoop(e),e===null?ht.stop():ht.start()},rt.addEventListener(`sessionstart`,pt),rt.addEventListener(`sessionend`,mt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){Je(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(L===!0)return;R!==null&&R.renderStart(e,t);let n=rt.enabled===!0&&rt.isPresenting===!0,r=F!==null&&(V===null||n)&&F.begin(I,V);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),rt.enabled===!0&&rt.isPresenting===!0&&(F===null||F.isCompositing()===!1)&&(rt.cameraAutoUpdate===!0&&rt.updateCamera(t),t=rt.getCamera()),e.isScene===!0&&e.onBeforeRender(I,e,t,V),k=Ve.get(e,P.length),k.init(t),k.state.textureUnits=je.getTextureUnits(),P.push(k),xe.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),t.isArrayCamera?ve.setFromArrayCamera(t):_e.setFromProjectionMatrix(xe,ze,t.reversedDepth),be=this.localClippingEnabled,ye=He.init(this.clippingPlanes,be),O=Be.get(e,j.length),O.init(),j.push(O),this.info.render.frame++,rt.enabled===!0&&rt.isPresenting===!0){let e=I.xr.getDepthSensingMesh();e!==null&&gt(e,t,-1/0,I.sortObjects)}gt(e,t,0,I.sortObjects),O.finish(),R!==null&&R.updateLights(k.state.lightsArray),I.sortObjects===!0&&O.sort(fe,pe),Te=rt.enabled===!1||rt.isPresenting===!1||rt.hasDepthSensing()===!1,Te&&Ke.addToRenderList(O,e),this.info.autoReset===!0&&this.info.reset(),ye===!0&&He.beginShadows();let i=k.state.shadowsArray;if(We.render(i,e,t),ye===!0&&He.endShadows(),(r&&F.hasRenderPass())===!1){let n=O.opaque,r=O.transmissive;if(k.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];vt(n,r,e,a)}Te&&Ke.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];_t(O,e,n,n.viewport)}}else r.length>0&&vt(n,r,e,t),Te&&Ke.render(e),_t(O,e,t)}V!==null&&B===0&&(je.updateMultisampleRenderTarget(V),je.updateRenderTargetMipmap(V)),r&&F.end(I),e.isScene===!0&&e.onAfterRender(I,e,t),et.resetDefaultState(),re=-1,ie=null,P.pop(),P.length>0?(k=P[P.length-1],je.setTextureUnits(k.state.textureUnits),ye===!0&&He.setGlobalState(I.clippingPlanes,k.state.camera)):k=null,j.pop(),O=j.length>0?j[j.length-1]:null,R!==null&&R.renderEnd()};function gt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)k.pushLight(e),e.castShadow&&k.pushShadow(e);else if(e.isSprite){let i=t.isArrayCamera?ve:_e;if(!e.frustumCulled||e.intersectsFrustum(i)){r&&Ce.setFromMatrixPosition(e.matrixWorld).applyMatrix4(xe);let i=Ie.update(e),a=e.material;a.visible&&O.push(e,i,a,n,Ce.z,null,t)}}else if(e.isMesh||e.isLine||e.isPoints){let i=t.isArrayCamera?ve:_e;if(!e.frustumCulled||e.intersectsFrustum(i)){let i=Ie.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),Ce.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),Ce.copy(e.boundingSphere.center)),Ce.applyMatrix4(e.matrixWorld).applyMatrix4(xe)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&O.push(e,i,c,n,Ce.z,s,t)}}else a.visible&&O.push(e,i,a,n,Ce.z,null,t)}}}let i=e.children;for(let e=0,a=i.length;e<a;e++)gt(i[e],t,n,r)}function _t(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;k.setupLightsView(n),ye===!0&&He.setGlobalState(I.clippingPlanes,n),r&&W.viewport(H.copy(r)),i.length>0&&yt(i,t,n),a.length>0&&yt(a,t,n),o.length>0&&yt(o,t,n),W.buffers.depth.setTest(!0),W.buffers.depth.setMask(!0),W.buffers.color.setMask(!0),W.setPolygonOffset(!1)}function vt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(k.state.transmissionRenderTarget[r.id]===void 0){let e=Oe.has(`EXT_color_buffer_half_float`)||Oe.has(`EXT_color_buffer_float`);k.state.transmissionRenderTarget[r.id]=new Jt(1,1,{generateMipmaps:!0,type:e?v:d,minFilter:u,samples:Math.max(4,ke.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Ft.workingColorSpace})}let a=k.state.transmissionRenderTarget[r.id],o=r.viewport||H;a.setSize(o.z*I.transmissionResolutionScale,o.w*I.transmissionResolutionScale);let s=I.getRenderTarget(),c=I.getActiveCubeFace(),l=I.getActiveMipmapLevel();I.setRenderTarget(a),I.getClearColor(se),ce=I.getClearAlpha(),ce<1&&I.setClearColor(16777215,.5),I.clear(),Te&&Ke.render(n);let f=I.toneMapping;I.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),k.setupLightsView(r),ye===!0&&He.setGlobalState(I.clippingPlanes,r),yt(e,n,r),je.updateMultisampleRenderTarget(a),je.updateRenderTargetMipmap(a),Oe.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,bt(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(je.updateMultisampleRenderTarget(a),je.updateRenderTargetMipmap(a))}I.setRenderTarget(s,c,l),I.setClearColor(se,ce),p!==void 0&&(r.viewport=p),I.toneMapping=f}function yt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&bt(o,t,n,s,l,c)}}function bt(e,t,n,r,i,a){R!==null&&i.isNodeMaterial&&R.setObject(e,i),e.onBeforeRender(I,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(I,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,I.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,I.renderBufferDirect(n,t,r,i,e,a),i.side=2):I.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(I,t,n,r,i,a)}function xt(e){let t=0;for(let n of e)n.texture!==null&&t++;return t}function St(e,t,n){t.isScene!==!0&&(t=we);let r=G.get(e),i=k.state.lights,a=k.state.shadowsArray,o=i.state.version,s=Le.getParameters(e,i.state,a,t,n,k.state.lightProbeGridArray),c=Le.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Ne.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,st),l=new Map,r.programs=l,r.programVariants=new Map);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return Tt(e,s),d}else s.uniforms=Le.getUniforms(e),R!==null&&e.isNodeMaterial&&R.build(e,n,s),e.onBeforeCompile(s,I),d=Le.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=He.uniform),Tt(e,s),r.needsLights=Dt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.numLightProbeGrids=xt(k.state.lightProbeGridArray),r.currentProgram=d,r.uniformsList=null,d}function Ct(e,t,n,r,i){let a=G.get(e),o=a.currentProgram.id+`,`+r+`,`+i,s=a.programVariants.get(o);return s===void 0?(s=St(e,t,n),a.programVariants.set(o,s)):(a.currentProgram=s,a.uniformsList=null,a.outputColorSpace=r,a.toneMapping=i),s}function wt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=qs.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function Tt(e,t){let n=G.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function Et(e,t,n,r,i){t.isScene!==!0&&(t=we),je.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=V===null?I.outputColorSpace:V.isXRRenderTarget===!0?V.texture.colorSpace:Ft.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Ne.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(V===null||V.isXRRenderTarget===!0)&&(h=I.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=G.get(r),y=k.state.lights;if(ye===!0&&(be===!0||e!==ie)){let t=e===ie&&r.id===re;He.setState(r,e,t)}let b=!1,x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version||i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==He.numPlanes||v.numIntersection!==He.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.morphTargetsCount===_&&v.numLightProbeGrids===xt(k.state.lightProbeGridArray)?(v.outputColorSpace!==s||v.toneMapping!==h)&&(x=!0):b=!0:b=!0:(b=!0,v.__version=r.version);let S=v.currentProgram;(b===!0||x===!0)&&(S=x===!0?Ct(r,t,i,s,h):St(r,t,i),R&&r.isNodeMaterial&&R.onUpdateProgram(r,S,v));let C=!1,w=!1,T=!1,E=S.getUniforms(),O=v.uniforms;if(W.useProgram(S.program)&&(C=!0,w=!0,T=!0),r.id!==re&&(re=r.id,w=!0),C||ie!==e){W.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),E.setValue(U,`projectionMatrix`,e.projectionMatrix),E.setValue(U,`viewMatrix`,e.matrixWorldInverse);let t=E.map.cameraPosition;t!==void 0&&t.setValue(U,Se.setFromMatrixPosition(e.matrixWorld)),ke.logarithmicDepthBuffer&&E.setValue(U,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&E.setValue(U,`isOrthographic`,e.isOrthographicCamera===!0),ie!==e&&(ie=e,w=!0,T=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&E.setValue(U,`sunShadowMap`,y.state.sunShadowMap,je),y.state.directionalShadowMap.length>0&&E.setValue(U,`directionalShadowMap`,y.state.directionalShadowMap,je),y.state.spotShadowMap.length>0&&E.setValue(U,`spotShadowMap`,y.state.spotShadowMap,je),y.state.pointShadowMap.length>0&&E.setValue(U,`pointShadowMap`,y.state.pointShadowMap,je)),i.isSkinnedMesh){E.setOptional(U,i,`bindMatrix`),E.setOptional(U,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),E.setValue(U,`boneTexture`,e.boneTexture,je))}i.isBatchedMesh&&(E.setOptional(U,i,`batchingTexture`),E.setValue(U,`batchingTexture`,i._matricesTexture,je),E.setOptional(U,i,`batchingIdTexture`),E.setValue(U,`batchingIdTexture`,i._indirectTexture,je),E.setOptional(U,i,`batchingColorTexture`),i._colorsTexture!==null&&E.setValue(U,`batchingColorTexture`,i._colorsTexture,je));let A=n.morphAttributes;if((A.position!==void 0||A.normal!==void 0||A.color!==void 0)&&Ye.update(i,n,S),(w||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,E.setValue(U,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(O.envMapIntensity.value=t.environmentIntensity),O.dfgLUT!==void 0&&(O.dfgLUT.value=ul()),w){if(E.setValue(U,`toneMappingExposure`,I.toneMappingExposure),v.needsLights&&K(O,T),a&&r.fog===!0&&Re.refreshFogUniforms(O,a),Re.refreshMaterialUniforms(O,r,de,ue,k.state.transmissionRenderTarget[e.id]),v.needsLights&&v.numLightProbeGrids>0){let e=D,t=0;for(let n of k.state.lightProbeGridArray)n.texture!==null&&(e.textures[t]=n.texture,e.min[t]=n.boundingBox.min,e.max[t]=n.boundingBox.max,e.resolution[t]=n.resolution,t++);for(let n in e)e[n].length=t;O.probesSH.value=e.textures,O.probesMin.value=e.min,O.probesMax.value=e.max,O.probesResolution.value=e.resolution}qs.upload(U,wt(v),O,je)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(qs.upload(U,wt(v),O,je),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&E.setValue(U,`center`,i.center),E.setValue(U,`modelViewMatrix`,i.modelViewMatrix),E.setValue(U,`normalMatrix`,i.normalMatrix),E.setValue(U,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];tt.update(n,S),tt.bind(n,S)}}return S}function K(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Dt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return z},this.getActiveMipmapLevel=function(){return B},this.getRenderTarget=function(){return V},this.setRenderTargetTextures=function(e,t,n){let r=G.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),G.get(e.texture).__webglTexture=t,G.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=G.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){V=e,z=t,B=n;let r=null,i=!1,a=!1;if(e){let o=G.get(e);if(o.__useDefaultFramebuffer!==void 0){W.bindFramebuffer(U.FRAMEBUFFER,o.__webglFramebuffer),H.copy(e.viewport),ae.copy(e.scissor),oe=e.scissorTest,W.viewport(H),W.scissor(ae),W.setScissorTest(oe),re=-1;return}if(o.__webglFramebuffer===void 0)je.setupRenderTarget(e);else if(o.__hasExternalTextures)je.rebindTextures(e,G.get(e.texture).__webglTexture,G.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&G.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);je.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=G.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&je.useMultisampledRTT(e)===!1?G.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,H.copy(e.viewport),ae.copy(e.scissor),oe=e.scissorTest}else H.copy(me).multiplyScalar(de).floor(),ae.copy(he).multiplyScalar(de).floor(),oe=ge;if(n!==0&&(r=ee),W.bindFramebuffer(U.FRAMEBUFFER,r)&&W.drawBuffers(e,r),W.viewport(H),W.scissor(ae),W.setScissorTest(oe),i){let r=G.get(e.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=G.get(e.textures[t]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=G.get(e.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,t.__webglTexture,n)}re=-1};function Ot(e){let t=G.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=ke.textureFormatReadable(e.format),t.__typeReadable=ke.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){Je(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=G.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){W.bindFramebuffer(U.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+s);let u=Ot(o);if(u.__formatReadable===!1){Je(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){Je(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&U.readPixels(t,n,r,i,$e.convert(c),$e.convert(l),a)}finally{let e=V===null?null:G.get(V).__webglFramebuffer;W.bindFramebuffer(U.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=G.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){W.bindFramebuffer(U.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+s);let d=Ot(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,f),U.bufferData(U.PIXEL_PACK_BUFFER,a.byteLength,U.STREAM_READ),U.readPixels(t,n,r,i,$e.convert(l),$e.convert(u),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);let p=V===null?null:G.get(V).__webglFramebuffer;W.bindFramebuffer(U.FRAMEBUFFER,p);let m=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Xe(U,m,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,f),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,a),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer(f),U.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;je.setTexture2D(e,0),U.copyTexSubImage2D(U.TEXTURE_2D,n,0,0,o,s,i,a),W.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=$e.convert(t.format),_=$e.convert(t.type),v;t.isData3DTexture?(je.setTexture3D(t,0),v=U.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(je.setTexture2DArray(t,0),v=U.TEXTURE_2D_ARRAY):(je.setTexture2D(t,0),v=U.TEXTURE_2D),W.activeTexture(U.TEXTURE0),W.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,t.flipY),W.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),W.pixelStorei(U.UNPACK_ALIGNMENT,t.unpackAlignment);let y=W.getParameter(U.UNPACK_ROW_LENGTH),b=W.getParameter(U.UNPACK_IMAGE_HEIGHT),x=W.getParameter(U.UNPACK_SKIP_PIXELS),S=W.getParameter(U.UNPACK_SKIP_ROWS),C=W.getParameter(U.UNPACK_SKIP_IMAGES);W.pixelStorei(U.UNPACK_ROW_LENGTH,h.width),W.pixelStorei(U.UNPACK_IMAGE_HEIGHT,h.height),W.pixelStorei(U.UNPACK_SKIP_PIXELS,l),W.pixelStorei(U.UNPACK_SKIP_ROWS,u),W.pixelStorei(U.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=G.get(e),r=G.get(t),h=G.get(n.__renderTarget),g=G.get(r.__renderTarget);W.bindFramebuffer(U.READ_FRAMEBUFFER,h.__webglFramebuffer),W.bindFramebuffer(U.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,G.get(e).__webglTexture,i,d+n),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,G.get(t).__webglTexture,a,m+n)),U.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,U.DEPTH_BUFFER_BIT,U.NEAREST);W.bindFramebuffer(U.READ_FRAMEBUFFER,null),W.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||G.has(e)){let n=G.get(e),r=G.get(t);W.bindFramebuffer(U.READ_FRAMEBUFFER,te),W.bindFramebuffer(U.DRAW_FRAMEBUFFER,ne);for(let e=0;e<c;e++)w?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,n.__webglTexture,i),T?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,r.__webglTexture,a),i===0?T?U.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):U.copyTexSubImage2D(v,a,f,p,l,u,o,s):U.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,U.COLOR_BUFFER_BIT,U.NEAREST);W.bindFramebuffer(U.READ_FRAMEBUFFER,null),W.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?U.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?U.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):U.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):U.texSubImage2D(U.TEXTURE_2D,a,f,p,o,s,g,_,h);W.pixelStorei(U.UNPACK_ROW_LENGTH,y),W.pixelStorei(U.UNPACK_IMAGE_HEIGHT,b),W.pixelStorei(U.UNPACK_SKIP_PIXELS,x),W.pixelStorei(U.UNPACK_SKIP_ROWS,S),W.pixelStorei(U.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps===!0&&t.mipmapsAutoUpdate===!0&&U.generateMipmap(v),W.unbindTexture()},this.initRenderTarget=function(e){G.get(e).__webglFramebuffer===void 0&&je.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?je.setTextureCube(e,0):e.isData3DTexture?je.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?je.setTexture2DArray(e,0):je.setTexture2D(e,0),W.unbindTexture()},this.resetState=function(){z=0,B=0,V=null,W.reset(),et.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return ze}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ft._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ft._getUnpackColorSpace()}};function fl(){return{time:{speed:1,paused:!1},growth:{gravity:1,phototropism:.25,gravitropism:.35,attraction:1,straightness:1.6,wander:.3,maxTurn:13,scaffoldBranching:.4,selfPrune:.22,branchAngle:42,phyllotaxis:137.5,apicalDominance:.5,branchingProbability:.22,segmentLength:.22,growthRate:1.6,vigorDecay:.82,maxOrder:6,weeping:0,torsion:0,sag:1,maxNodes:14e3},crown:{shape:0,radius:3.6,height:6.5,base:2.4,bole:1.7,attractors:4e3},thickness:{exponent:1.9,twigRadius:.0075,thickeningRate:.6,rootFlare:1.4},leaves:{size:.145,density:3.4,hue:.27,saturation:.55,maxBranchRadius:.03,shape:0,lightness:1,glow:0,glowHue:.5,form:`oak`},light:{azimuth:35,elevation:50},sky:{timeOfDay:17.6,cycle:!0,nightSpeed:3,dayLength:96,latitude:48,sunYaw:311,exposure:.9,skyGain:1,wind:.35,meadow:!0,fog:1,stars:1,moonPhase:.42,godRays:1,skyHue:.6,skyTint:0,sunHue:.08,sunTint:0,sun2:0,sun2Hue:.55,sun2Yaw:140,sunSize:1,groundHue:.25,groundTint:0,quality:`High`},leaffall:{enabled:!0,rate:1,litter:1},weather:{event:`auto`,kind:`auto`,lightning:!0},sway:{amount:1},critters:{amount:1},season:{on:!0,yearLength:300,date:.12,hold:!1,blossom:1},breakage:{enabled:!0,strength:1},camera:{autoFrame:!0,autoRotate:!0,cinema:!0},seed:{seed:1}}}var pl=0,ml=()=>pl,hl=()=>++pl;function gl(e){let t=e,n=0,r=1;for(let e in t){if(e===`sky`||e===`camera`||e===`time`||e===`weather`||e===`leaffall`||e===`season`)continue;let i=t[e];for(let e in i){let t=i[e];n+=(typeof t==`number`?t:typeof t==`boolean`?+t:String(t).length)*(r++*.6180339887%1+.5)}}return n}function _l(e,t){new URLSearchParams(t).forEach((t,n)=>{let r=e,[i,a]=n.includes(`.`)?n.split(`.`):[void 0,n];for(let e of Object.keys(r)){if(i&&e!==i)continue;let n=r[e];if(a in n){let e=n[a];if(typeof e==`number`){let e=Number(t);Number.isFinite(e)&&(n[a]=e)}else n[a]=typeof e==`boolean`?t===`true`||t===`1`:t;return}}})}var vl=class{s;constructor(e){this.s=e>>>0}next(){let e=this.s=this.s+1831565813>>>0;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}range(e,t){return e+(t-e)*this.next()}unit(e){let t=this.range(-1,1),n=this.range(0,Math.PI*2),r=Math.sqrt(1-t*t);return e[0]=r*Math.cos(n),e[1]=t,e[2]=r*Math.sin(n),e}},yl=class{cell;pts;alive;cells=new Map;constructor(e,t,n){this.cell=e,this.pts=t,this.alive=n;for(let e=0;e<t.length/3;e++)this.insert(e)}key(e,t,n){return((e+512)*1024+(t+512))*1024+(n+512)}insert(e){let t=this.cell,n=this.key(Math.floor(this.pts[e*3]/t),Math.floor(this.pts[e*3+1]/t),Math.floor(this.pts[e*3+2]/t)),r=this.cells.get(n);r||this.cells.set(n,r=[]),r.push(e)}query(e,t,n,r,i){let a=this.cell,o=r*r,s=Math.floor((e-r)/a),c=Math.floor((e+r)/a),l=Math.floor((t-r)/a),u=Math.floor((t+r)/a),d=Math.floor((n-r)/a),f=Math.floor((n+r)/a);for(let r=s;r<=c;r++)for(let a=l;a<=u;a++)for(let s=d;s<=f;s++){let c=this.cells.get(this.key(r,a,s));if(c)for(let r=c.length-1;r>=0;r--){let a=c[r];if(!this.alive[a]){c[r]=c[c.length-1],c.pop();continue}let s=this.pts[a*3]-e,l=this.pts[a*3+1]-t,u=this.pts[a*3+2]-n,d=s*s+l*l+u*u;d<=o&&i(a,s,l,u,d)}}}};function bl(e,t){let n=Math.sqrt(Math.max(0,1-(2*t-1)*(2*t-1))),r=Math.max(0,1-t)*Math.min(1,t*8),i=Math.max(0,t)**.6*Math.sqrt(Math.max(0,1-t**6));return e<=1?n+(r-n)*Math.max(0,e):r+(i-r)*Math.min(1,e-1)}function xl(e){let t=Math.max(.02,e.growth.gravity),n=1+.7*Math.max(0,1-t);return{radius:e.crown.radius,height:e.crown.height*n,base:e.crown.base*n}}function Sl(e,t){let n=new vl(t^2654435769),{radius:r,height:i,base:a}=xl(e),o=Math.max(10,Math.floor(e.crown.attractors)),s=new Float32Array(o*3),c=0,l=0;for(;c<o&&l++<o*50;){let t=n.range(-1,1),o=n.range(-1,1),l=n.next();Math.sqrt(t*t+o*o)>bl(e.crown.shape,l)||(s[c*3]=t*r,s[c*3+1]=a+l*i,s[c*3+2]=o*r,c++)}return s.subarray(0,c*3)}var Cl=globalThis,wl={log:(e,t)=>Cl.__tel?.log(e,t),phase:(e,t=!1)=>Cl.__tel?.phase(e,t),setStats:e=>Cl.__tel?.setStats(e),info:e=>Cl.__tel?.info(e),glInfo:e=>Cl.__tel?.glInfo?.(e)??{}};function Tl(e){let t=e.get(`safe`)===`1`,n=n=>t||e.get(n)===`0`,r=Number(e.get(`rebuildHz`));return{safe:t,shadows:!n(`shadows`),leaves:!n(`leaves`),meadow:!n(`meadow`),rain:!n(`rain`),breakage:!n(`breakage`),sway:!n(`sway`),leaffall:!n(`leaffall`),backdrop:!n(`backdrop`),skyBasic:t||e.get(`sky`)===`basic`,grow:!n(`grow`),antialias:!n(`antialias`),leafSafe:t||e.get(`leafsafe`)===`1`?!0:e.get(`leafsafe`)!==`0`&&null,leafShadow:e.get(`leafshadow`)===`0`?!1:e.get(`leafshadow`)===`1`||null,leafShader:[`basic`,`safe`,`full`].find(t=>e.get(`leafshader`)===t)??null,rebuildHz:Number.isFinite(r)&&r>0?r:0}}var El=.012,Dl=1,Ol=.08,kl=994e4,Al=[0,1,0],jl=3,Ml=.3,Nl=1.5,Pl=.2,Fl=.16,Il=.3,Ll=.6,Rl=.75,zl=3,Bl=[3,6],Vl=[3.2,6.4],Hl=class{params;nodes=[];chains=[];buds=[];leaves=[];time=0;lightGrid=null;lightVersion=0;topology=0;breaks=[];damage=new Float32Array;loadStats={evals:0,n:0,max:0,over:0,twigs:0,limbs:0};loadTimer=0;shedStats={shoots:0,shed:0,shedLeaves:0,lastShedT:0};ld={leaf:new Float32Array,w:new Float32Array,cx:new Float32Array,cy:new Float32Array,cz:new Float32Array};bboxMin=[0,0,0];bboxMax=[0,0,0];rng;attr;attrAlive;grid;gridCell=1;tmp=[0,0,0];lightTimer=0;constructor(e){this.params=e,this.rng=new vl(e.seed.seed),this.reset()}reset(){let e=this.params;this.rng=new vl(e.seed.seed),this.nodes=[],this.chains=[],this.buds=[],this.leaves=[],this.lightGrid=null,this.lightVersion++,this.time=0,this.topology++,this.breaks=[],this.damage=new Float32Array,this.shedStats={shoots:0,shed:0,shedLeaves:0,lastShedT:0},this.rebuildAttractors();let t=this.addNode(-1,0,0,0,1,0,0);this.chains.push(this.newChain(t,0)),this.lightTimer=0,this.nodes[t].len=0,this.nodes[t].targetLen=0;let n=this.rng.unit(this.tmp);this.extend(0,.05*n[0],1,.05*n[2])}rebuildAttractors(){let e=this.params;this.attr=Sl(e,e.seed.seed),this.attrAlive=new Uint8Array(this.attr.length/3).fill(1),this.gridCell=Math.max(.3,this.perception()),this.grid=new yl(this.gridCell,this.attr,this.attrAlive);let t=this.killRadius();for(let e of this.nodes)this.grid.query(e.rx,e.ry,e.rz,t,e=>this.attrAlive[e]=0)}newChain(e,t){let n=this.rng.unit([0,0,0]);return{nodes:[e],order:t,alive:!0,starve:0,pruned:!1,shade:0,wx:n[0],wy:n[1],wz:n[2]}}get attractorCount(){let e=0;for(let t=0;t<this.attrAlive.length;t++)e+=this.attrAlive[t];return e}perception(){return this.params.growth.segmentLength*7}killRadius(){return this.params.growth.segmentLength*3}addNode(e,t,n,r,i,a,o){let s=e>=0?this.nodes[e]:void 0,c={parent:e,chain:t,order:n,dx:r,dy:i,dz:a,len:0,targetLen:o,rx:s?s.rx:0,ry:s?s.ry:0,rz:s?s.rz:0,radius:this.params.thickness.twigRadius*.3,phyllo:s?s.phyllo+this.params.growth.phyllotaxis*(Math.PI/180):this.rng.range(0,Math.PI*2),born:this.time,wx:0,wy:0,wz:0,wdx:r,wdy:i,wdz:a,sag:0,subLen:0,pipe:0,leafy:!1,light:1,juv:1};return this.nodes.push(c),this.topology++,this.nodes.length-1}extend(e,t,n,r){let i=this.chains[e],a=Math.hypot(t,n,r)||1,o=i.nodes[i.nodes.length-1],s=this.addNode(o,e,i.order,t/a,n/a,r/a,this.params.growth.segmentLength*this.rng.range(.85,1.15));if(i.nodes.push(s),this.params.crown.bole>0){let e=this.nodes[o].ry;if(e<Nl){let t=this.nodes[s];t.juv=Pl+.8*Math.max(0,e)/Nl,t.targetLen*=t.juv,t.radius*=Il+.7*t.juv}}}attractorPull(e,t,n,r,i,a,o,s){let c=0,l=0,u=0,d=0;this.grid.query(e,t,n,o,(e,t,n,o,s)=>{let f=Math.sqrt(s)||1e-6;t*r+n*i+o*a<f*.25||(c+=t/f,l+=n/f,u+=o/f,d++)});let f=Math.hypot(c,l,u)||1;return s[0]=c/f,s[1]=l/f,s[2]=u/f,d}sunDir(){let e=this.params.light.azimuth*Math.PI/180,t=this.params.light.elevation*Math.PI/180;return[Math.cos(t)*Math.cos(e),Math.sin(t),Math.cos(t)*Math.sin(e)]}step(e){let t=this.params.growth;this.time+=e;let n=this.nodes.length>=t.maxNodes;if(!n)for(let n=0;n<this.chains.length;n++){let r=this.chains[n];if(!r.alive)continue;let i=r.nodes[r.nodes.length-1],a=this.nodes[i],o=t.vigorDecay**+r.order,s=a.juv<1?Fl+.84*(a.juv-Pl)/.8:1;a.len+=t.segmentLength*t.growthRate*o*s*e,a.len>=a.targetLen?(a.len=a.targetLen,this.updateRest(i),this.completeSegment(n,i)):this.updateRest(i)}n||this.budBreak(e),this.lightTimer-=e,this.lightTimer<=0&&(this.lightTimer=.5,this.shedStats.shoots>this.shedStats.shed&&this.shedJuvenile(),wl.phase(`light grid`),this.updateLight(),wl.phase(`sim step`,!0)),this.updateStructure(e)}updateRest(e){let t=this.nodes[e],n=this.nodes[t.parent];t.rx=n.rx+t.dx*t.len,t.ry=n.ry+t.dy*t.len,t.rz=n.rz+t.dz*t.len}completeSegment(e,t){let n=this.params,r=n.growth,i=this.chains[e],a=this.nodes[t],o=xl(n);this.grid.query(a.rx,a.ry,a.rz,this.killRadius(),e=>this.attrAlive[e]=0);let s=n.crown.bole>0;if(i.order<r.maxOrder&&i.juv===void 0){let n=r.branchAngle*Math.PI/180,[o,s,c]=Gl(a.dx,a.dy,a.dz,a.phyllo),l=Math.cos(n),u=Math.sin(n);this.buds.push({node:t,chain:e,indexInChain:i.nodes.length-1,dx:a.dx*l+o*u,dy:a.dy*l+s*u,dz:a.dz*l+c*u,born:this.time})}if(i.order>=1||a.ry>o.base*.8||s){a.leafy=!0;let e=a.juv<1?Ll+.4*(a.juv-Pl)/.8:1,n=a.juv<.3?2:4,r=a.juv<.5?0:4,i=this.time,o=a.phyllo+this.rng.range(0,1);for(let r=0;r<n;r++)this.leaves.push({node:t,t:this.rng.range(.6,1),around:o+r*(n===2?Math.PI:2.4)+this.rng.range(-.3,.3),tilt:this.rng.range(.3,.9),roll:this.rng.range(-.6,.6),size:this.rng.range(.7,1.25)*e,rank:(r+this.rng.next())/4,born:i,tint:this.rng.next()});let s=t*2654435761+2654435769>>>0,c=()=>(s^=s<<13,s>>>=0,s^=s>>>17,s^=s<<5,s>>>=0,s/4294967296);for(let n=0;n<r;n++)this.leaves.push({node:t,t:.72+.28*c(),around:o+1.2+n*2.4+(c()-.5)*.8,tilt:.35+.6*c(),roll:(c()-.5)*1.4,size:(.6+.45*c())*e,rank:(n+c())/4,born:i,tint:c()})}let c=this.tmp;if(i.juv!==void 0&&i.nodes.length-1>=i.juv){i.alive=!1;return}let l=i.juv===void 0?this.attractorPull(a.rx,a.ry,a.rz,a.dx,a.dy,a.dz,this.perception(),c):0,u=a.ry>o.base*.95||i.order>0;if(i.juv===void 0?l===0&&u?i.starve++:i.starve=Math.max(0,i.starve-1):i.starve=0,i.starve>2||i.order===0&&l===0&&a.ry>o.base+o.height*1.05){i.alive=!1;return}let d=this.sunDir(),f=r.gravitropism*Math.min(2,r.gravity),p=this.rng.unit([0,0,0]),m=i.wx*.8+p[0]*.35,h=i.wy*.8+p[1]*.35,g=i.wz*.8+p[2]*.35,_=Math.hypot(m,h,g)||1;i.wx=m/=_,i.wy=h/=_,i.wz=g/=_;let v=l>0?r.attraction:0,y=i.order===0?l===0?1.2:.6:0,b=i.order>=2?r.weeping*Math.min(3,r.gravity)*Math.min(1,(i.order-1)*.6):0,x=a.dx*r.straightness+c[0]*v+d[0]*r.phototropism+m*r.wander,S=a.dy*r.straightness+c[1]*v+d[1]*r.phototropism+(f+y-b)*Al[1]+h*r.wander,C=a.dz*r.straightness+c[2]*v+d[2]*r.phototropism+g*r.wander;if(r.torsion!==0){let e=r.torsion*Math.PI/180*(i.order%2?-1:1),t=Math.cos(e),n=Math.sin(e),a=x*t-C*n;C=x*n+C*t,x=a}let w=Math.hypot(x,S,C)||1;x/=w,S/=w,C/=w;let T=-(Ml+.7*Math.min(1,Math.max(0,r.weeping)));if(S<T){let e=Math.hypot(x,C);if(e>1e-4){let t=Math.sqrt(1-T*T)/e;x*=t,C*=t,S=T}}let E=r.maxTurn*Math.PI/180,D=Math.max(-1,Math.min(1,x*a.dx+S*a.dy+C*a.dz)),O=Math.acos(D);if(O>E&&O>1e-5){let e=Math.sin(O),t=Math.sin(O-E)/e,n=Math.sin(E)/e;x=a.dx*t+x*n,S=a.dy*t+S*n,C=a.dz*t+C*n}this.extend(e,x,S,C)}budBreak(e){let t=this.params.growth,n=t.apicalDominance*10,r=this.params.thickness.twigRadius,i=[0,0,0];for(let a=this.buds.length-1;a>=0;a--){let o=this.buds[a],s=this.chains[o.chain],c=this.time-o.born;if(c>40||s.pruned){this.buds[a]=this.buds[this.buds.length-1],this.buds.pop();continue}let l=1;if(s.alive){let e=s.nodes.length-1-o.indexInChain;l=Wl(n,n+4,e)}let u=this.nodes[o.node];if(s.order===0&&u.ry<this.params.crown.bole){if(c<.5||u.radius>r*Vl[0])continue;let n=s.alive?Wl(2,5,s.nodes.length-1-o.indexInChain):1;if(this.rng.next()>t.branchingProbability*n*zl*e||(this.buds[a]=this.buds[this.buds.length-1],this.buds.pop(),Ul(o.node)>Rl))continue;let i=this.chains.length,l=this.newChain(o.node,1);l.juv=Math.round(Bl[0]+(Bl[1]-Bl[0])*Ul(o.node+7919)),this.chains.push(l),this.shedStats.shoots++,this.extend(i,o.dx,o.dy*.6+.25,o.dz);continue}let d=t.vigorDecay**+(s.order+1)*(s.order===0?t.scaffoldBranching:1);if(this.rng.next()>t.branchingProbability*l*d*e)continue;let f=this.attractorPull(u.rx,u.ry,u.rz,o.dx,o.dy,o.dz,this.perception()*1.2,i);if(this.buds[a]=this.buds[this.buds.length-1],this.buds.pop(),f<4)continue;let p=this.chains.length;this.chains.push(this.newChain(o.node,s.order+1)),this.extend(p,o.dx*2+i[0]*.5,o.dy*2+i[1]*.5,o.dz*2+i[2]*.5)}}updateLight(){let e=this.nodes,t=e.length;if(t<50)return;let n=this.params.growth.segmentLength*4,r=this.bboxMin,i=this.bboxMax,a=r[0]-n,o=Math.min(0,r[1])-n,s=r[2]-n,c=Math.ceil((i[0]-a)/n)+2,l=Math.ceil((i[1]-o)/n)+2,u=Math.ceil((i[2]-s)/n)+2;if(!isFinite(c*l*u)||c*l*u>4e5)return;let d=(e,t,n)=>(t*u+n)*c+e,f=new Float32Array(c*l*u),p=new Int32Array(t);for(let r=0;r<t;r++){let t=e[r],i=Math.floor((t.wx-a)/n),m=Math.floor((t.wy-o)/n),h=Math.floor((t.wz-s)/n),g=i>=0&&m>=0&&h>=0&&i<c&&m<l&&h<u?d(i,m,h):-1;p[r]=g,g>=0&&t.leafy&&!this.chains[t.chain].pruned&&(f[g]+=1)}this.lightGrid={dens:f,ox:a,oy:o,oz:s,cell:n,nx:c,ny:l,nz:u},this.lightVersion++;let m=new Float32Array(f.length),h=new Float32Array(f.length),g=new Float32Array(f.length),_=new Float32Array(f.length),v=new Float32Array(f.length);for(let e=0;e<c;e++)for(let t=0;t<u;t++){let n=0;for(let r=l-1;r>=0;r--){let i=d(e,r,t);m[i]=n+f[i]*.5,n+=f[i]}}for(let e=0;e<l;e++)for(let t=0;t<u;t++){let n=0,r=0;for(let r=0;r<c;r++){let i=d(r,e,t);h[i]=n+f[i]*.5,n+=f[i]}for(let n=c-1;n>=0;n--){let i=d(n,e,t);g[i]=r+f[i]*.5,r+=f[i]}}for(let e=0;e<l;e++)for(let t=0;t<c;t++){let n=0,r=0;for(let r=0;r<u;r++){let i=d(t,e,r);_[i]=n+f[i]*.5,n+=f[i]}for(let n=u-1;n>=0;n--){let i=d(t,e,n);v[i]=r+f[i]*.5,r+=f[i]}}for(let n=0;n<t;n++){let t=p[n];if(t<0){e[n].light=1;continue}let r=(2*Math.exp(-.05*m[t])+Math.exp(-.05*h[t])+Math.exp(-.05*g[t])+Math.exp(-.05*_[t])+Math.exp(-.05*v[t]))/6;e[n].light=r}let y=this.params.growth.selfPrune;for(let t of this.chains){if(t.pruned)continue;let n=this.chains[e[t.nodes[0]].chain];if(n!==t&&n.pruned){t.pruned=!0,t.alive=!1;continue}if(y<=0||t.order<2||t.nodes.length<2){t.shade=0;continue}let r=0;for(let n=1;n<t.nodes.length;n++)r=Math.max(r,e[t.nodes[n]].light);r<y?t.shade++:t.shade=0,t.shade>=4&&(t.pruned=!0,t.alive=!1)}}shedJuvenile(){let e=this.nodes,t=this.chains,n=this.params.thickness.twigRadius,r=-1,i=1/0;for(let a=1;a<t.length;a++){let o=t[a];if(o.juv===void 0||o.pruned)continue;let s=e[o.nodes[0]];s.radius<n*(Vl[0]+(Vl[1]-Vl[0])*Ul(o.nodes[0]+104729))||s.ry<i&&(i=s.ry,r=a)}if(r<0)return;let a=t[r];a.pruned=!0,a.alive=!1;let o=a.nodes.slice(1),s=new Set(o),c=0;for(let e of this.leaves)s.has(e.node)&&c++;this.shedStats.shed++,this.shedStats.shedLeaves+=c,this.shedStats.lastShedT=this.time,this.topology++,this.breaks.push({root:o[0],nodeIds:o,chains:[r],time:this.time,leaves:c,radius:e[o[0]].radius,shed:!0}),this.breaks.length>16&&this.breaks.shift()}breakAt(e){let t=this.nodes,n=this.chains,r=t.length,i=t[e];if(!i||i.parent<0)return null;let a=i.chain,o=n[a];if(!o||o.order<1||o.pruned||o.nodes.length<2)return null;let s=[],c;if(o.nodes.length>=4){let e=o.nodes.splice(2);c=e[0];let r=n.length;n.push({nodes:[o.nodes[1],...e],order:o.order,alive:!1,starve:0,pruned:!0,shade:0,wx:o.wx,wy:o.wy,wz:o.wz});for(let n of e)t[n].chain=r;o.alive=!1,s.push(r)}else c=o.nodes[1],o.pruned=!0,o.alive=!1,s.push(a);let l=new Uint8Array(r);l[c]=1;let u=[c];for(let e=c+1;e<r;e++)l[t[e].parent]&&(l[e]=1,u.push(e));for(let e=0;e<n.length;e++){let t=n[e];t.nodes.length<2||!l[t.nodes[1]]||(t.pruned||(t.pruned=!0,t.alive=!1),e!==s[0]&&s.push(e))}for(let e=this.buds.length-1;e>=0;e--){let t=this.buds[e];(l[t.node]||n[t.chain].pruned)&&(this.buds[e]=this.buds[this.buds.length-1],this.buds.pop())}let d=0;for(let e of this.leaves)l[e.node]&&d++;this.topology++,this.lightTimer=0;let f={root:c,nodeIds:u,chains:s,time:this.time,leaves:d,radius:t[c].radius};return this.breaks.push(f),this.breaks.length>16&&this.breaks.shift(),f}loadRatios(e,t,n,r=-1){let i=this.nodes,a=this.chains,o=i.length,s=this.ld;if(s.w.length<o){let e=Math.ceil(o*1.5)+64;s.leaf=new Float32Array(e),s.w=new Float32Array(e),s.cx=new Float32Array(e),s.cy=new Float32Array(e),s.cz=new Float32Array(e)}let c=s.leaf,l=s.w,u=s.cx,d=s.cy,f=s.cz;c.fill(0,0,o),l.fill(0,0,o),u.fill(0,0,o),d.fill(0,0,o),f.fill(0,0,o);for(let e of this.leaves)c[e.node]+=1;for(let e=o-1;e>0;e--){let t=i[e];if(a[t.chain].pruned){c[e]=0;continue}let n=El*c[e]+Dl*t.len*t.radius;l[e]+=n,u[e]+=t.wx*n,d[e]+=t.wy*n,f[e]+=t.wz*n;let r=t.parent;c[r]+=c[e],l[r]+=l[e],u[r]+=u[e],d[r]+=d[e],f[r]+=f[e]}for(let o=1;o<a.length;o++){let s=a[o];if(s.pruned||s.order<1||s.nodes.length<2||s.juv!==void 0)continue;let p=s.nodes[1],m=i[p],h=l[p];if(h<=0)continue;let g=u[p]/h-m.wx,_=d[p]/h-m.wy,v=f[p]/h-m.wz,y=g*e.dirX+v*e.dirZ,b=g-y*e.dirX,x=v-y*e.dirZ,S=Math.sqrt(b*b+_*_+x*x),C=Math.hypot(g,v),w=r>=0?r:e.gust(m.wx,m.wz),T=w*w*(El*c[p]+Dl*m.subLen*2*m.radius),E=m.radius;n(p,(T*S+Ol*h*C)/(t*kl*E*E*E),m.subLen)}}windLoad(e,t,n){if(t.base<=.6||n<=0)return this.loadTimer=0,null;if(this.loadTimer+=e,this.loadTimer<.25)return null;let r=Math.min(.5,this.loadTimer);if(this.loadTimer=0,this.damage.length<this.nodes.length){let e=new Float32Array(Math.ceil(this.nodes.length*1.5)+64);e.set(this.damage),this.damage=e}let i=this.damage,a=this.loadStats,o=-1,s=1,c=0,l=0,u=0;if(this.loadRatios(t,n,(e,t)=>{c++,t>l&&(l=t),t>1&&(u++,i[e]+=r*(t-1),i[e]>s&&(s=i[e],o=e))}),a.evals++,a.n=c,a.max=l,a.over=u,o<0)return null;let d=this.breakAt(o);return d&&(i[o]=0,d.nodeIds.length<30?a.twigs++:a.limbs++),d}updateStructure(e){let t=this.params,n=this.nodes,r=n.length,i=Math.max(1.2,t.thickness.exponent),a=t.thickness.twigRadius;for(let e=0;e<r;e++)n[e].pipe=0,n[e].subLen=0;let o=1-Math.exp(-e*t.thickness.thickeningRate*4);for(let t=r-1;t>=0;t--){let r=n[t],s,c=r.juv<1?a*(Il+.7*r.juv):a;if(s=r.pipe===0?c*(.35+.65*(r.targetLen>0?r.len/r.targetLen:1)):Math.max(c,r.pipe**(1/i)),s>r.radius&&(r.radius+=(s-r.radius)*(e>0?o:1)),e<=0&&(r.radius=Math.max(r.radius,s*.999)),!this.chains[r.chain].pruned&&(r.subLen+=r.len,r.parent>=0)){let e=n[r.parent];e.pipe+=s**+i,e.subLen+=r.subLen}}let s=t.growth.gravity*t.growth.sag*4e-6,c=(1-Math.min(1,Math.max(0,t.growth.weeping)))/jl,l=this.bboxMin,u=this.bboxMax;l[0]=l[1]=l[2]=1/0,u[0]=u[1]=u[2]=-1/0;for(let e=0;e<r;e++){let t=n[e];if(t.parent<0)t.wx=t.rx,t.wy=t.ry,t.wz=t.rz,t.sag=0,t.wdx=0,t.wdy=1,t.wdz=0;else{let e=n[t.parent],r=Math.hypot(t.dx,t.dz),i=Math.min(.08,s*t.subLen*t.len*r/(t.radius*t.radius));t.sag=Math.min(1.3,e.sag*Math.exp(-t.len*c)+i),Kl(t.dx,t.dy,t.dz,t.sag,this.tmp),t.wdx=this.tmp[0],t.wdy=this.tmp[1],t.wdz=this.tmp[2],t.wx=e.wx+t.wdx*t.len,t.wy=e.wy+t.wdy*t.len,t.wz=e.wz+t.wdz*t.len}t.wx<l[0]&&(l[0]=t.wx),t.wy<l[1]&&(l[1]=t.wy),t.wz<l[2]&&(l[2]=t.wz),t.wx>u[0]&&(u[0]=t.wx),t.wy>u[1]&&(u[1]=t.wy),t.wz>u[2]&&(u[2]=t.wz)}}};function Ul(e){let t=e*2654435761+2654435769>>>0;return t^=t<<13,t>>>=0,t^=t>>>17,t^=t<<5,t>>>=0,t/4294967296}function Wl(e,t,n){let r=Math.min(1,Math.max(0,(n-e)/(t-e||1e-6)));return r*r*(3-2*r)}function Gl(e,t,n,r){let i=1,a=0;Math.abs(e)>.9&&(i=0,a=1);let o=t*a-n*0,s=n*i-e*a,c=e*0-t*i,l=Math.hypot(o,s,c)||1;o/=l,s/=l,c/=l;let u=t*c-n*s,d=n*o-e*c,f=e*s-t*o,p=Math.cos(r),m=Math.sin(r);return[o*p+u*m,s*p+d*m,c*p+f*m]}function Kl(e,t,n,r,i){let a=Math.hypot(e,n);if(a<1e-4||r<=0)return i[0]=e,i[1]=t,i[2]=n,i;let o=Math.min(Math.PI*.97,Math.atan2(a,t)+r),s=Math.sin(o);return i[0]=e/a*s,i[1]=Math.cos(o),i[2]=n/a*s,i}var ql={type:`change`},Jl={type:`start`},Yl={type:`end`},Xl=new Br,Zl=new Nr,Ql=Math.cos(70*Et.DEG2RAD),$l=new q,eu=2*Math.PI,tu={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},nu=1e-6,ru=class extends Za{constructor(n,r=null){super(n,r),this.state=tu.NONE,this.target=new q,this.cursor=new q,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:`ArrowLeft`,UP:`ArrowUp`,RIGHT:`ArrowRight`,BOTTOM:`ArrowDown`},this.mouseButtons={LEFT:e.ROTATE,MIDDLE:e.DOLLY,RIGHT:e.PAN},this.touches={ONE:t.ROTATE,TWO:t.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle=`auto`,this._domElementKeyEvents=null,this._lastPosition=new q,this._lastQuaternion=new Dt,this._lastTargetPosition=new q,this._quat=new Dt().setFromUnitVectors(n.up,new q(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Xa,this._sphericalDelta=new Xa,this._scale=1,this._panOffset=new q,this._rotateStart=new K,this._rotateEnd=new K,this._rotateDelta=new K,this._panStart=new K,this._panEnd=new K,this._panDelta=new K,this._dollyStart=new K,this._dollyEnd=new K,this._dollyDelta=new K,this._dollyDirection=new q,this._mouse=new K,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=au.bind(this),this._onPointerDown=iu.bind(this),this._onPointerUp=ou.bind(this),this._onContextMenu=pu.bind(this),this._onMouseWheel=lu.bind(this),this._onKeyDown=uu.bind(this),this._onTouchStart=du.bind(this),this._onTouchMove=fu.bind(this),this._onMouseDown=su.bind(this),this._onMouseMove=cu.bind(this),this._interceptControlDown=mu.bind(this),this._interceptControlUp=hu.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e===`grab`?this.domElement.style.cursor=`grab`:this.domElement.style.cursor=`auto`}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener(`pointerdown`,this._onPointerDown),this.domElement.addEventListener(`pointercancel`,this._onPointerUp),this.domElement.addEventListener(`contextmenu`,this._onContextMenu),this.domElement.addEventListener(`wheel`,this._onMouseWheel,{passive:!1}),this.domElement.ownerDocument.addEventListener(`keydown`,this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction=`none`}disconnect(){this.state=tu.NONE,this.domElement.removeEventListener(`pointerdown`,this._onPointerDown),this.domElement.ownerDocument.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.removeEventListener(`pointerup`,this._onPointerUp),this.domElement.removeEventListener(`pointercancel`,this._onPointerUp),this.domElement.removeEventListener(`wheel`,this._onMouseWheel),this.domElement.removeEventListener(`contextmenu`,this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.ownerDocument.removeEventListener(`keydown`,this._interceptControlDown,{capture:!0}),this.domElement.ownerDocument.removeEventListener(`keyup`,this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction=``,this.domElement.style.cursor=`auto`}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(ql),this.update(),this.state=tu.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;$l.copy(t).sub(this.target),$l.applyQuaternion(this._quat),this._spherical.setFromVector3($l),this.autoRotate&&this.state===tu.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(n)&&isFinite(r)&&(n<-Math.PI?n+=eu:n>Math.PI&&(n-=eu),r<-Math.PI?r+=eu:r>Math.PI&&(r-=eu),n<=r?this._spherical.theta=Math.max(n,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+r)/2?Math.max(n,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let i=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let e=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),i=e!=this._spherical.radius}if($l.setFromSpherical(this._spherical),$l.applyQuaternion(this._quatInverse),t.copy(this.target).add($l),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let e=null;if(this.object.isPerspectiveCamera){let t=$l.length();e=this._clampDistance(t*this._scale);let n=t-e;this.object.position.addScaledVector(this._dollyDirection,n),this.object.updateMatrixWorld(),i=!!n}else if(this.object.isOrthographicCamera){let t=new q(this._mouse.x,this._mouse.y,0);t.unproject(this.object);let n=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),i=n!==this.object.zoom;let r=new q(this._mouse.x,this._mouse.y,0);r.unproject(this.object),this.object.position.sub(r).add(t),this.object.updateMatrixWorld(),e=$l.length()}else console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.`),this.zoomToCursor=!1;e!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(e).add(this.object.position):(Xl.origin.copy(this.object.position),Xl.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Xl.direction))<Ql?this.object.lookAt(this.target):(Zl.setFromNormalAndCoplanarPoint(this.object.up,this.target),Xl.intersectPlane(Zl,this.target))))}else if(this.object.isOrthographicCamera){let e=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),e!==this.object.zoom&&(this.object.updateProjectionMatrix(),i=!0)}return this._scale=1,this._performCursorZoom=!1,i||this._lastPosition.distanceToSquared(this.object.position)>nu||8*(1-this._lastQuaternion.dot(this.object.quaternion))>nu||this._lastTargetPosition.distanceToSquared(this.target)>nu?(this.dispatchEvent(ql),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e===null?eu/60/60*this.autoRotateSpeed:eu/60*this.autoRotateSpeed*e}_getZoomScale(e){let t=Math.abs(e*.01);return .95**(this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){$l.setFromMatrixColumn(t,0),$l.multiplyScalar(-e),this._panOffset.add($l)}_panUp(e,t){this.screenSpacePanning===!0?$l.setFromMatrixColumn(t,1):($l.setFromMatrixColumn(t,0),$l.crossVectors(this.object.up,$l)),$l.multiplyScalar(e),this._panOffset.add($l)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let r=this.object.position;$l.copy(r).sub(this.target);let i=$l.length();i*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*i/n.clientHeight,this.object.matrix),this._panUp(2*t*i/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.`),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),r=e-n.left,i=t-n.top,a=n.width,o=n.height;this._mouse.x=r/a*2-1,this._mouse.y=-(i/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientY),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(eu*this._rotateDelta.x/t.clientHeight),this._rotateUp(eu*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.zoomToCursor&&(this._performCursorZoom=!0,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(eu*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-eu*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(eu*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-eu*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateStart.set(n,r)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panStart.set(n,r)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyStart.set(0,i)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateEnd.set(n,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(eu*this._rotateDelta.x/t.clientHeight),this._rotateUp(eu*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panEnd.set(n,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyEnd.set(0,i),this._dollyDelta.set(0,(this._dollyEnd.y/this._dollyStart.y)**+this.zoomSpeed),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new K,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function iu(e){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(e.pointerId),this.domElement.ownerDocument.addEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.addEventListener(`pointerup`,this._onPointerUp)),this._isTrackingPointer(e)||(this._addPointer(e),e.pointerType===`touch`?this._onTouchStart(e):this._onMouseDown(e),this._cursorStyle===`grab`&&(this.domElement.style.cursor=`grabbing`)))}function au(e){this.enabled!==!1&&(e.pointerType===`touch`?this._onTouchMove(e):this._onMouseMove(e))}function ou(e){switch(this._removePointer(e),this._pointers.length){case 0:this.domElement.releasePointerCapture(e.pointerId),this.domElement.ownerDocument.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.removeEventListener(`pointerup`,this._onPointerUp),this.dispatchEvent(Yl),this.state=tu.NONE,this._cursorStyle===`grab`&&(this.domElement.style.cursor=`grab`);break;case 1:let t=this._pointers[0],n=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:n.x,pageY:n.y})}}function su(t){let n;switch(t.button){case 0:n=this.mouseButtons.LEFT;break;case 1:n=this.mouseButtons.MIDDLE;break;case 2:n=this.mouseButtons.RIGHT;break;default:n=-1}switch(n){case e.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(t),this.state=tu.DOLLY;break;case e.ROTATE:if(t.ctrlKey||t.metaKey||t.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(t),this.state=tu.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(t),this.state=tu.ROTATE}break;case e.PAN:if(t.ctrlKey||t.metaKey||t.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(t),this.state=tu.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(t),this.state=tu.PAN}break;default:this.state=tu.NONE}this.state!==tu.NONE&&this.dispatchEvent(Jl)}function cu(e){switch(this.state){case tu.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(e);break;case tu.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(e);break;case tu.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(e)}}function lu(e){this.enabled!==!1&&this.enableZoom!==!1&&this.state===tu.NONE&&(e.preventDefault(),this.dispatchEvent(Jl),this._handleMouseWheel(this._customWheelEvent(e)),this.dispatchEvent(Yl))}function uu(e){this.enabled!==!1&&this._handleKeyDown(e)}function du(e){switch(this._trackPointer(e),this._pointers.length){case 1:switch(this.touches.ONE){case t.ROTATE:if(this.enableRotate===!1){this.state=tu.NONE;break}this._handleTouchStartRotate(e),this.state=tu.TOUCH_ROTATE;break;case t.PAN:if(this.enablePan===!1){this.state=tu.NONE;break}this._handleTouchStartPan(e),this.state=tu.TOUCH_PAN;break;default:this.state=tu.NONE}break;case 2:switch(this.touches.TWO){case t.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(e),this.state=tu.TOUCH_DOLLY_PAN;break;case t.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(e),this.state=tu.TOUCH_DOLLY_ROTATE;break;default:this.state=tu.NONE}break;default:this.state=tu.NONE}this.state!==tu.NONE&&this.dispatchEvent(Jl)}function fu(e){switch(this._trackPointer(e),this.state){case tu.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(e),this.update();break;case tu.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(e),this.update();break;case tu.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(e),this.update();break;case tu.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(e),this.update();break;default:this.state=tu.NONE}}function pu(e){this.enabled!==!1&&e.preventDefault()}function mu(e){e.key===`Control`&&(this._controlActive=!0,this.domElement.ownerDocument.addEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}function hu(e){e.key===`Control`&&(this._controlActive=!1,this.domElement.ownerDocument.removeEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}function gu(e){let t=new vl(e),n=new Float32Array(4096).map(()=>t.next()),r=(e,t)=>n[(e*73856093^t*19349663)&4095];return(e,t,n,i)=>{let a=Math.floor(e),o=Math.floor(t),s=e-a,c=t-o,l=s*s*(3-2*s),u=c*c*(3-2*c),d=(e,t)=>(e%t+t)%t,f=d(a,n),p=d(a+1,n),m=d(o,i),h=d(o+1,i),g=r(f,m),_=r(p,m),v=r(f,h),y=r(p,h);return g+(_-g)*l+(v-g)*u+(g-_-v+y)*l*u}}function _u(e,t,n,r,i,a){let o=0,s=.5,c=1;for(let l=0;l<a;l++)o+=s*e(t*c,n*c,r*c,i*c),s*=.5,c*=2;return o}function vu(){let e=gu(7),t=new Float32Array(131072);for(let n=0;n<512;n++)for(let r=0;r<256;r++){let i=r/256*8,a=n/512*4,o=_u(e,i*.5,a*2,4,8,3)*2.5,s=1-Math.abs(Math.sin((i+o)*Math.PI)),c=_u(e,i,a*6,8,24,4);t[n*256+r]=s**.6*.7+c*.5}let r=()=>{let e=document.createElement(`canvas`);return e.width=256,e.height=512,e},i=r(),a=r(),o=r(),s=i.getContext(`2d`).createImageData(256,512),c=a.getContext(`2d`).createImageData(256,512),l=o.getContext(`2d`).createImageData(256,512),u=(e,n)=>t[(n+512)%512*256+(e+256)%256];for(let e=0;e<512;e++)for(let t=0;t<256;t++){let n=(e*256+t)*4,r=u(t,e),i=.25+.75*r;s.data[n]=120*i+40,s.data[n+1]=104*i+34,s.data[n+2]=88*i+30,s.data[n+3]=255;let a=(u(t+1,e)-u(t-1,e))*4,o=(u(t,e+1)-u(t,e-1))*4,d=Math.hypot(a,o,1);c.data[n]=(-a/d*.5+.5)*255,c.data[n+1]=(o/d*.5+.5)*255,c.data[n+2]=(1/d*.5+.5)*255,c.data[n+3]=255;let f=200+55*(1-r);l.data[n]=l.data[n+1]=l.data[n+2]=f,l.data[n+3]=255}i.getContext(`2d`).putImageData(s,0,0),a.getContext(`2d`).putImageData(c,0,0),o.getContext(`2d`).putImageData(l,0,0);let d=(e,t)=>{let r=new Ei(e);return r.wrapS=r.wrapT=n,r.colorSpace=t?Me:``,r.anisotropy=8,r};return{map:d(i,!0),normalMap:d(a,!1),roughnessMap:d(o,!1)}}function yu(){let e=504.32,t=496.64,n=new vl(29),r=gu(17),i=document.createElement(`canvas`);i.width=i.height=512;let a=i.getContext(`2d`);a.clearRect(0,0,512,512);let o=e=>240.64*Math.sin(Math.PI*Math.min(1,e*.86+.02))**.8*(.55+.45*Math.min(1,e*1.6)),s=(e,t)=>{let n=e*5+(t>0?0:.38)+.15,r=n-Math.floor(n),i=Math.sin(Math.PI*r)**.55;return 1-.42*Pu(.05,.25,e)*(1-.6*Pu(.75,1,e))*(1-i)},c=(e,t)=>{if(e<=0||e>=1)return 0;let n=1+.025*Math.sin(e*140+t*1.7)*Pu(.1,.3,e);return o(e)*s(e,t)*n*(t>0?1:.94)},l=e=>256+12.8*Math.sin(e*Math.PI*.9),u=n=>e-n*t;a.beginPath(),a.moveTo(l(0),u(0));for(let e=1;e<=400;e++){let t=e/400;a.lineTo(l(t)+c(t,1),u(t))}for(let e=400;e>=0;e--){let t=e/400;a.lineTo(l(t)-c(t,-1),u(t))}a.closePath();let d=a.createLinearGradient(0,e,0,7.68);d.addColorStop(0,`#8fa64a`),d.addColorStop(.35,`#6e9038`),d.addColorStop(1,`#4f7a2c`),a.fillStyle=d,a.fill();let f=(e,t,n,r)=>{a.strokeStyle=r,a.lineCap=`round`;for(let r=1;r<e.length;r++)a.lineWidth=t+(n-t)*(r/(e.length-1)),a.beginPath(),a.moveTo(e[r-1][0],e[r-1][1]),a.lineTo(e[r][0],e[r][1]),a.stroke()},p=[];for(let e=0;e<=40;e++){let t=e/40*.97;p.push([l(t),u(t)])}f(p,9,1.5,`rgba(196,206,120,0.85)`);for(let e of[1,-1])for(let t=0;t<5;t++){let r=(e>0?0:.38)+.15,i=(t+.5-r)/5;if(i<.08||i>.95)continue;let a=Math.max(.03,i-.09),o=[];for(let t=0;t<=12;t++){let n=t/12,r=a+(i-a)*n**.7;o.push([l(r)+e*c(i,e)*.92*n,u(r)])}f(o,4,.8,`rgba(176,192,104,0.7)`);for(let t=1;t<4;t++){let[r,i]=o[t*3],a=-Math.PI/2+e*(.5+n.next()*.5),s=512*(.03+n.next()*.035);f([[r,i],[r+Math.cos(a)*s*.5+e*s*.4,i+Math.sin(a)*s*.5],[r+Math.cos(a)*s+e*s*.6,i+Math.sin(a)*s]],1.6,.5,`rgba(160,180,96,0.45)`)}}let m=a.getImageData(0,0,512,512),h=m.data;for(let n=0;n<512;n++){let i=(e-n)/t;if(i<=0||i>=1)continue;let a=l(i);for(let e=0;e<512;e++){let t=(n*512+e)*4;if(h[t+3]<8)continue;let o=e>=a?1:-1,s=Math.max(1,c(i,o)),l=Math.abs(e-a)/s,u=1;u*=1-.28*Pu(.72,1,l);let d=_u(r,e/512*6,n/512*6,64,64,3);u*=.86+.26*d,r(e/512*90,n/512*90,128,128)>.82&&(u*=.82);let f=.12*(Math.exp(-(((l-.38)/.18)**2))*(o>0?1:.55))*(.6+.4*Math.sin(i*Math.PI));h[t]=Math.min(255,h[t]*u+255*f*.8),h[t+1]=Math.min(255,h[t+1]*u+255*f),h[t+2]=Math.min(255,h[t+2]*u+255*f*.55)}}return a.putImageData(m,0,0),f([[l(0),e],[l(0)-2,511]],7,5,`#7d8a40`),i}var bu=`rgba(196,206,120,0.85)`,xu=`rgba(176,192,104,0.7)`,Su=`rgba(160,180,96,0.5)`,Cu=`#7d8a40`,wu=e=>e-Math.floor(e),Tu=e=>{let t=new Path2D;return e.forEach(([e,n],r)=>r?t.lineTo(e,n):t.moveTo(e,n)),t.closePath(),t};function Eu(e,t,n,r,i=260){let a=[];for(let o=0;o<=i;o++){let s=o/i;a.push([t(s)+e(s,1),n+(r-n)*s])}for(let o=i;o>=0;o--){let s=o/i;a.push([t(s)-e(s,-1),n+(r-n)*s])}return a}function Du(e,t,n,r=-Math.PI,i=Math.PI,a=420){let o=[];for(let s=0;s<=a;s++){let c=r+(i-r)*s/a,l=n(c);o.push([e+l*Math.sin(c),t+l*Math.cos(c)])}return o}var Ou=(e,t,n,r)=>e.map(([e,i])=>[n+e*Math.cos(t)+i*Math.sin(t),r-e*Math.sin(t)+i*Math.cos(t)]),ku=(e,t,n=8,r=0)=>{let i=[],a=-(t[1]-e[1]),o=t[0]-e[0];for(let s=0;s<=n;s++){let c=s/n,l=r*Math.sin(Math.PI*c);i.push([e[0]+(t[0]-e[0])*c+a*l,e[1]+(t[1]-e[1])*c+o*l])}return i},Au=[{id:`oak`,name:`Oak`,aspect:.6,len:1},{id:`willow`,name:`Willow`,aspect:.27,len:1.5,paint(e){let t=.07,n=e=>.032*Math.sin(Math.PI*e)-.016,r=e=>.098*Math.sin(Math.PI*e**.72)**.85*(1+.04*wu(e*40)*Pu(.05,.2,e));e.blade(Tu(Eu(r,n,t,.99)),`nonzero`,()=>{let i=e=>t+.9199999999999999*e;for(let t of[1,-1])for(let a=0;a<17;a++){let o=.06+a*.052+(t>0?0:.026);e.vein(ku([n(o),i(o)],[n(o+.085)+t*r(o+.085)*.95,i(o+.085)],6,t*.08),.007,.003,Su)}let a=[];for(let e=0;e<=40;e++){let t=e/40*.98;a.push([n(t),i(t)])}e.vein(a,.024,.005,bu)}),e.vein([[0,0],[n(0),.09000000000000001]],.026,.022,Cu)}},{id:`birch`,name:`Birch`,aspect:.74,len:.9,paint(e){let t=.14,n=e=>.012*Math.sin(Math.PI*e),r=(e,t)=>.33*Math.sin(Math.PI*e**.58)**.95*(1-.3*e)*(1+(.085*wu(e*12+(t>0?0:.4))+.04*wu(e*36))*Pu(.04,.16,e))*(t>0?1:.95);e.blade(Tu(Eu(r,n,t,.99)),`nonzero`,()=>{let i=e=>t+.85*e;for(let t of[1,-1])for(let a=0;a<9;a++){let o=.03+(a+(t>0?0:.4))/12,s=Math.min(.99,o+.1+.06*(1-o)),c=[n(o),i(o)],l=[n(s)+t*r(s,t)*.97,i(s)];e.vein(ku(c,l,8,-t*.04),.011,.004,xu);for(let n=1;n<4;n++){let r=n/4,i=c[0]+(l[0]-c[0])*r,a=c[1]+(l[1]-c[1])*r;e.vein([[i,a],[i+t*.012,a+.04]],.004,.002,Su)}}let a=[];for(let e=0;e<=40;e++){let t=e/40*.97;a.push([n(t),i(t)])}e.vein(a,.022,.004,bu)}),e.vein([[0,0],[.004,.16]],.028,.022,Cu)}},{id:`maple`,name:`Maple`,aspect:.92,len:.88,paint(e){let t=.36,n=[{a:0,len:.62,w:.8},{a:.95,len:.53,w:.78},{a:-.95,len:.5,w:.78},{a:1.9,len:.36,w:.7},{a:-1.9,len:.35,w:.7}];e.blade(Tu(Du(0,t,e=>{let t=.2;for(let r of n){let n=Math.abs(e-r.a)/r.w;if(n>=1)continue;let i=r.len*Math.max((1-n)**1.15,.7*Math.max(0,1-Math.abs(n-.33)/.13),.5*Math.max(0,1-Math.abs(n-.55)/.1));i>t&&(t=i)}return t},-Math.PI,Math.PI,720)),`nonzero`,()=>{let r=[0,.17999999999999997];for(let i of n){let n=[i.len*.96*Math.sin(i.a),t+i.len*.96*Math.cos(i.a)],a=ku(r,n,12,0);for(let t=3;t<11;t+=2)for(let o of[1,-1]){let[s,c]=a[t],l=n[0]-r[0],u=n[1]-r[1],d=Math.hypot(l,u),f=.13*i.len*(1-t/14),p=Math.cos(o*.75),m=Math.sin(o*.75);e.vein([[s,c],[s+(l*p-u*m)/d*f,c+(l*m+u*p)/d*f]],.008,.003,Su)}e.vein(a,.02,.004,i.a===0?bu:xu)}}),e.vein([[0,0],[0,.18999999999999997]],.028,.022,Cu)}},{id:`ginkgo`,name:`Ginkgo`,aspect:1.24,len:.8,paint(e){let t=.27,n=1.08,r=e=>.675*(1+.025*Math.sin(e*23)+.015*Math.sin(e*47+1))*(1-.34*Math.exp(-((e/.055)**2)))*(1-.07*(Math.abs(e)/n)**4),i=Du(0,t,r,-1.08,n,360);i.push([.012,.24000000000000002],[-.012,.24000000000000002]),e.blade(Tu(i),`nonzero`,()=>{for(let i=0;i<38;i++){let a=-1.0476+2*n*.97*(i+.5)/38+(e.rng.next()-.5)*.02,o=r(a)*(.9+.07*e.rng.next());e.vein(ku([0,.26],[o*Math.sin(a),t+o*Math.cos(a)],6,0),.008,.003,i%3==0?xu:Su)}}),e.vein([[0,0],[0,.30000000000000004]],.03,.022,Cu)}},{id:`round`,name:`Round`,aspect:.84,len:.8,paint(e){let t=.565,n=e=>.385*(1+.1*Math.exp(-((e/.2)**2))+.012*Math.sin(e*28))*(1-.13*Math.exp(-(((Math.PI-Math.abs(e))/.32)**2))),r=t-n(Math.PI);e.blade(Tu(Du(0,t,n)),`nonzero`,()=>{for(let i of[1,-1])for(let a=0;a<4;a++){let o=i*(.5+a*.52),s=n(o)*.93,c=ku([0,r+.02+a*0+(3-a)*.09],[s*Math.sin(o),t+s*Math.cos(o)],10,i*.1);e.vein(c,.012,.004,xu);for(let t=3;t<10;t+=3)e.vein([c[t],[c[t][0]+i*.03,c[t][1]+.06]],.005,.002,Su)}e.vein(ku([0,r],[0,t+n(0)*.96],12,0),.02,.004,bu)}),e.vein([[0,0],[0,r+.03]],.026,.02,Cu)}},{id:`spray`,name:`Conifer`,aspect:.62,len:1.15,paint(e){let t=[],n=e=>.02*Math.sin(e*5),r=[];for(let e=0;e<=30;e++){let t=e/30*.97;r.push([n(t),t])}t.push({pts:r,w0:.05,w1:.03});for(let r=0;r<15;r++){let i=.09+r*.058,a=r%2?1:-1,o=(.05+.3*(1-i)**.65)*Pu(-.05,.22,i)*(.9+.2*e.rng.next()),s=a*(.8+.12*e.rng.next()),c=[n(i),i],l=ku(c,[c[0]+o*Math.sin(s),c[1]+o*Math.cos(s)],8,a*.07);if(t.push({pts:l,w0:.05,w1:.03}),o>.13)for(let[e,n]of[[.38,1],[.62,-1]]){let r=l[Math.round(e*8)],i=s+n*.62,a=o*.36;t.push({pts:ku(r,[r[0]+a*Math.sin(i),r[1]+a*Math.cos(i)],4,0),w0:.042,w1:.026})}}let{g:i}=e;for(let n of t)e.vein(n.pts,n.w0*1.3,n.w1*1.3,`#456c28`);for(let n of t)e.vein(n.pts,n.w0*.86,n.w1*.86,e.grad);i.strokeStyle=`rgba(176,196,110,0.6)`,i.lineWidth=.0055,i.lineCap=`round`;for(let e of t){let t=e.pts[0],n=e.pts[e.pts.length-1],r=Math.hypot(n[0]-t[0],n[1]-t[1]),a=Math.floor(r/.03);for(let o=1;o<a;o++){let s=o/a,c=e.pts[Math.min(e.pts.length-1,Math.round(s*(e.pts.length-1)))],l=(n[0]-t[0])/r,u=(n[1]-t[1])/r,d=(e.w0+(e.w1-e.w0)*s)*.4;i.beginPath(),i.moveTo(c[0]-u*d-l*.012,c[1]+l*d-u*.012),i.lineTo(c[0]+l*.006,c[1]+u*.006),i.lineTo(c[0]+u*d-l*.012,c[1]-l*d-u*.012),i.stroke()}}}},{id:`frond`,name:`Forked`,aspect:.82,len:1.1,paint(e){let t=.71;for(let n of[1,-1]){let r=e=>n*.075*Math.sin(Math.PI*e)*(1-.6*e),i=e=>.105*Math.sin(Math.PI*e**.8)**.8*(1+.05*Math.sin(e*60)),a=e=>Ou(e,n*.4,0,.27);e.blade(Tu(a(Eu(i,r,0,t*(n>0?1:.93)))),`nonzero`,()=>{let o=[];for(let e=0;e<=30;e++){let i=e/30*.96;o.push([r(i),i*t*(n>0?1:.93)])}let s=a(o);for(let t=3;t<29;t+=2)for(let n of[1,-1]){let[r,a]=s[t],o=s[t+1][0]-r,c=s[t+1][1]-a,l=Math.hypot(o,c),u=i(t/30)*.85;e.vein([[r,a],[r+o/l*.03-c/l*n*u,a+c/l*.03+o/l*n*u]],.006,.003,Su)}e.vein(s,.024,.005,bu)})}e.vein([[0,0],[0,.30000000000000004]],.05,.04,Cu);let{g:n}=e;n.fillStyle=`#93a653`,n.beginPath(),n.arc(0,.29000000000000004,.05,0,Math.PI*2),n.fill(),n.fillStyle=`rgba(214,222,150,0.9)`,n.beginPath(),n.arc(-.012,.30200000000000005,.02,0,Math.PI*2),n.fill()}},{id:`ring`,name:`Ring`,aspect:.88,len:.9,paint(e){let t=.565,n=.635,r=.2,i=e=>.4*(1+.035*Math.sin(e*9+.6)),a=Tu(Du(0,t,i));a.moveTo(r,n),a.arc(0,n,r,0,Math.PI*2),e.blade(a,`evenodd`,()=>{for(let a=0;a<18;a++){let o=(a+.5)/18*Math.PI*2-Math.PI,s=i(o)*.94;e.vein(ku([r*Math.sin(o),n+r*Math.cos(o)],[s*Math.sin(o),t+s*Math.cos(o)],5,.05),.012,.004,xu)}let a=[];for(let e=0;e<=64;e++){let t=e/64*Math.PI*2;a.push([.23*Math.sin(t),n+.23*Math.cos(t)])}e.vein(a,.014,.014,bu)}),e.vein([[0,0],[0,.20499999999999993]],.04,.03,Cu)}},{id:`spiral`,name:`Spiral`,aspect:.86,len:1.1,paint(e){let t=-.05,n=.6,r=[];for(let e=0;e<=20;e++){let t=e/20,i=(1-t)**3,a=3*t*(1-t)**2,o=3*t*t*(1-t),s=t**3;r.push([a*.22+o*.275+s*.275,a*.05+o*.3+s*n+i*0])}let i=Math.PI*2*1.72,a=[];for(let e=1;e<=110;e++){let o=e/110,s=o*i,c=.325-.275*o**.9;r.push([t+c*Math.cos(s),n+c*Math.sin(s)]),e%6==3&&o<.62&&a.push([t+(c+.07-.02*o)*Math.cos(s),n+(c+.07-.02*o)*Math.sin(s)])}let{g:o}=e;o.fillStyle=`#456c28`;for(let[e,t]of a)o.beginPath(),o.arc(e,t,.03,0,Math.PI*2),o.fill();e.vein(r,.14,.066,`#456c28`);let s=r[r.length-1];o.beginPath(),o.arc(s[0],s[1],.05,0,Math.PI*2),o.fill(),e.vein(r,.11,.048,e.grad),o.fillStyle=`#86a046`;for(let[e,t]of a)o.beginPath(),o.arc(e,t,.02,0,Math.PI*2),o.fill();e.vein(r,.02,.006,bu),o.fillStyle=`#a9bb62`,o.beginPath(),o.arc(s[0],s[1],.036,0,Math.PI*2),o.fill()}}],ju=e=>Au.find(t=>t.id===e)??Au[0];function Mu(e,t=512){let n=ju(e),r=document.createElement(`canvas`);r.width=r.height=t;let i=r.getContext(`2d`,{willReadFrequently:!0});if(!n.paint){let e=yu();return t===512?e:(i.drawImage(e,0,0,t,t),r)}i.save(),i.setTransform(.97*t/n.aspect,0,0,-.97*t,t/2,.985*t),i.lineCap=`round`,i.lineJoin=`round`;let a=i.createLinearGradient(0,0,0,1);a.addColorStop(0,`#8fa64a`),a.addColorStop(.35,`#6e9038`),a.addColorStop(1,`#4f7a2c`);let o={g:i,grad:a,rng:new vl(31),vein(e,t,n,r){i.strokeStyle=r,i.lineCap=`round`;for(let r=1;r<e.length;r++)i.lineWidth=t+(n-t)*(r/(e.length-1)),i.beginPath(),i.moveTo(e[r-1][0],e[r-1][1]),i.lineTo(e[r][0],e[r][1]),i.stroke()},blade(e,t,n){i.fillStyle=a,i.fill(e,t),i.save(),i.clip(e,t),i.strokeStyle=`rgba(34,58,14,0.17)`,i.lineWidth=.085,i.stroke(e),i.lineWidth=.035,i.stroke(e),n?.(),i.restore()}};n.paint(o),i.restore();let s=gu(17),c=i.getImageData(0,0,t,t),l=c.data;for(let e=0;e<t;e++)for(let n=0;n<t;n++){let r=(e*t+n)*4;if(l[r+3]<8)continue;let i=n/t,a=e/t,o=_u(s,i*6,a*6,64,64,3),c=.86+.26*o;s(i*90,a*90,128,128)>.82&&(c*=.82);let u=.1*Math.exp(-(((i-.62+.25*(a-.5)+.2*(o-.5))/.1)**2))*(.6+.4*Math.sin((1-a)*Math.PI));l[r]=Math.min(255,l[r]*c+255*u*.8),l[r+1]=Math.min(255,l[r+1]*c+255*u),l[r+2]=Math.min(255,l[r+2]*c+255*u*.55)}return i.putImageData(c,0,0),r}function Nu(e=`oak`){let t=ju(e),n=new Ei(Mu(t.id));return n.colorSpace=Me,n.anisotropy=8,n.userData.form={id:t.id,kx:t.len*t.aspect/.6,ky:t.len,preserve:t.id!==`oak`},n}function Pu(e,t,n){let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)}function Fu(e=!1){let t=gu(3),r=document.createElement(`canvas`);r.width=r.height=512;let i=r.getContext(`2d`),a=i.createImageData(512,512);for(let n=0;n<512;n++)for(let r=0;r<512;r++){let i=_u(t,r/512*8,n/512*8,8,8,5),o=t(r/512*128,n/512*128,128,128),s=(n*512+r)*4,c=e?3:1,l=i-.5;a.data[s]=68+40*c*l+20*o,a.data[s+1]=97+50*c*l+30*o,a.data[s+2]=39+18*c*l,a.data[s+3]=255}i.putImageData(a,0,0);let o=new vl(11);for(let e=0;e<6e3;e++){let e=o.next()*512,t=o.next()*512,n=3+o.next()*6,r=-Math.PI/2+o.range(-.5,.5),a=o.next();i.strokeStyle=`rgba(${60+a*70},${90+a*80},${30+a*30},0.55)`,i.lineWidth=1;for(let a of[0,-512,512])for(let o of[0,-512,512])i.beginPath(),i.moveTo(e+a,t+o),i.lineTo(e+a+Math.cos(r)*n,t+o+Math.sin(r)*n),i.stroke()}let s=new Ei(r);return s.wrapS=s.wrapT=n,s.colorSpace=Me,s.anisotropy=8,s}function Iu(e=5){let t=document.createElement(`canvas`);t.width=t.height=256;let n=t.getContext(`2d`),r=new vl(e);n.lineCap=`round`;for(let e=0;e<64;e++){let t=e/64,i=256*(.5+r.range(-.3,.3)*(.4+.6*r.next())),a=r.range(-1,1),o=256*(.35+.6*r.next()**.8)*(e%7==0?1:.85),s=i+a*o*.42,c=256-o,l=i+a*o*.08,u=256-o*.6,d=r.next(),f=r.next()<.14,p=256*(.028+.022*r.next());for(let e=0;e<10;e++){let r=e/10,a=(e+1)/10,o=e=>[(1-e)*(1-e)*i+2*e*(1-e)*l+e*e*s,(1-e)*(1-e)*256+2*e*(1-e)*u+e*e*c],[m,h]=o(r),[g,_]=o(a),v=.72+.22*t+.3*r,y=f?118+30*d:62+46*d,b=f?150+30*d:104+52*d,x=f?40+12*d:38+22*d;n.strokeStyle=`rgb(${Math.min(255,y*v)|0},${Math.min(255,b*v)|0},${Math.min(255,x*v)|0})`,n.lineWidth=Math.max(1.6,p*(1-.82*r)),n.beginPath(),n.moveTo(m,h),n.lineTo(g,_),n.stroke()}}let i=n.getImageData(0,0,256,256),a=i.data,o=0,s=0,c=0,l=0;for(let e=0;e<a.length;e+=4)a[e+3]>=128&&(o+=a[e],s+=a[e+1],c+=a[e+2],l++);o=o/l*1.1,s=s/l*1.1,c=c/l*1.1;for(let t=0;t<256;t++){let n=t=>{let n=Math.sin(t*91.7+e*13.1)*43758.5453;return n-Math.floor(n)},r=256*(.015+.09*n(Math.floor(t/5))+.05*n(Math.floor(t/2)+77));for(let e=0;e<256;e++){let n=255-e,i=(e*256+t)*4;if(n<r){a[i+3]=0;continue}let l=1-Math.min(1,n/56.32);if(l<=0||a[i+3]<128)continue;let u=l*(2-l)*.9;a[i]+=(o-a[i])*u,a[i+1]+=(s-a[i+1])*u,a[i+2]+=(c-a[i+2])*u}}n.putImageData(i,0,0);let u=new Ei(t);return u.colorSpace=Me,u}function Lu(e=3,t=!1){let n=document.createElement(`canvas`);n.width=n.height=256;let r=n.getContext(`2d`),i=new vl(e*31+(t?7:0));if(!t){r.strokeStyle=`rgb(58,46,36)`,r.lineCap=`round`;let e=256*(.5+i.range(-.03,.03));r.lineWidth=15.36,r.beginPath(),r.moveTo(e,256),r.lineTo(e+256*i.range(-.02,.02),153.6),r.stroke(),r.lineWidth=7.168;for(let t of[-1,1])r.beginPath(),r.moveTo(e,215.04),r.lineTo(e+t*256*i.range(.1,.22),256*i.range(.55,.65)),r.stroke()}let a=[],o=t?.66:.43,s=t?.3:.4,c=t?6:13;for(let e=0;e<c;e++){let e=i.next()*Math.PI*2,t=Math.sqrt(i.next())*.62;a.push([.5+Math.cos(e)*t*.5,o+Math.sin(e)*t*s*(Math.sin(e)>0?.8:1),i.range(.09,.19)])}a.push([.5,o,.22]);let l=[];for(let e=0;e<2200;e++){let e=a[Math.floor(i.next()*a.length)],t=i.next()*Math.PI*2,n=Math.sqrt(i.next())*e[2],r=e[0]+Math.cos(t)*n,c=e[1]+Math.sin(t)*n*.9;if(c>.985)continue;let u=(e[1]-c)/e[2],d=(o-c)/s;l.push([r,c,.5+.3*u+.16*d+i.range(-.22,.22),i.range(.008,.024)])}l.sort((e,t)=>t[1]-e[1]+(e[2]-t[2])*.2);for(let[e,t,n,a]of l){let o=Math.min(1,Math.max(0,n));r.fillStyle=`rgb(${26+78*o*o|0},${40+96*o|0},${20+34*o*o|0})`,r.beginPath(),r.ellipse(e*256,t*256,a*256*1.25,a*256,i.range(-.6,.6),0,Math.PI*2),r.fill()}let u=new Ei(n);return u.colorSpace=Me,u}function Ru(e=3,t=!1){let n=document.createElement(`canvas`);n.width=n.height=256;let r=n.getContext(`2d`),i=new vl(e*53+(t?11:0));r.lineCap=`round`;let a=t?4:6,o=(e,t,n,s,c,l)=>{let u=e+Math.cos(n)*s,d=Math.max(5.12,t-Math.sin(n)*s),f=i.range(-.18,.18)*s,p=58+34*i.next()+l*7;if(r.strokeStyle=`rgb(${p|0},${p*.87|0},${p*.78|0})`,r.lineWidth=Math.max(1.7,c),r.beginPath(),r.moveTo(e,t),r.quadraticCurveTo((e+u)/2+Math.sin(n)*f,(t+d)/2+Math.cos(n)*f,u,d),r.stroke(),l>=a||u<35.84||u>220.16)return;let m=l===0||i.next()<.55?3:2;for(let e=0;e<m;e++){let t=n+(e/(m-1)*2-1)*i.range(.45,.85)+i.range(-.2,.2);o(u,d,t+(Math.PI/2-t)*.12,s*i.range(.55,.74),c*.6,l+1)}};if(t)for(let e=0;e<7;e++)o(256*(.5+i.range(-.2,.2)),253.44,Math.PI/2+(e/6*2-1)*1+i.range(-.15,.15),256*i.range(.13,.18),5.12,1);else o(256*(.5+i.range(-.03,.03)),256,Math.PI/2+i.range(-.06,.06),69.12,14.08,0);let s=new Ei(n);return s.colorSpace=Me,s}function zu(e){let t=document.createElement(`canvas`);t.width=t.height=128;let n=t.getContext(`2d`),r=new vl({daisy:21,buttercup:22,poppy:23,clover:24}[e]);n.lineCap=`round`;let i=e===`clover`?4:3;for(let t=0;t<i;t++){let a=128*(.5+r.range(-.12,.12)),o=128*(e===`clover`?r.range(.45,.7):r.range(.62,.86)),s=128*(.5+(t-(i-1)/2)*.24+r.range(-.05,.05)),c=128-o;n.strokeStyle=`rgb(${70+r.next()*20},${112+r.next()*25},44)`,n.lineWidth=3.4,n.beginPath(),n.moveTo(a,128),n.quadraticCurveTo(a,128-o*.5,s,c),n.stroke();for(let e=0;e<2;e++){let e=r.range(.15,.5),t=a+(s-a)*e*e,i=128-o*e,c=r.next()<.5?-1:1;n.fillStyle=`rgb(${66+r.next()*24},${118+r.next()*24},46)`,n.beginPath(),n.ellipse(t+c*7,i-3,8,3.2,c*-.5,0,Math.PI*2),n.fill()}let l=128*(e===`poppy`?.115:e===`daisy`?.1:e===`clover`?.075:.07);if(n.save(),n.translate(s,c),n.rotate(r.range(-.35,.35)),e===`daisy`){for(let e=0;e<14;e++){let t=e/14*Math.PI*2;n.fillStyle=e%2?`#f6f4ea`:`#e6e6dc`,n.beginPath(),n.ellipse(Math.cos(t)*l*.62,Math.sin(t)*l*.4,l*.5,l*.2,Math.atan2(Math.sin(t)*.65,Math.cos(t)),0,Math.PI*2),n.fill()}n.fillStyle=`#e8b422`,n.beginPath(),n.ellipse(0,-l*.05,l*.36,l*.27,0,0,Math.PI*2),n.fill()}else if(e===`buttercup`){for(let e=0;e<5;e++){let t=e/5*Math.PI*2+.3;n.fillStyle=e%2?`#f4cf1c`:`#e9bd10`,n.beginPath(),n.ellipse(Math.cos(t)*l*.5,Math.sin(t)*l*.38,l*.55,l*.42,t,0,Math.PI*2),n.fill()}n.fillStyle=`#c99408`,n.beginPath(),n.arc(0,0,l*.25,0,Math.PI*2),n.fill()}else if(e===`poppy`){for(let e=0;e<4;e++){let t=e/4*Math.PI*2+.6;n.fillStyle=e%2?`#d8301c`:`#c4220f`,n.beginPath(),n.ellipse(Math.cos(t)*l*.42,Math.sin(t)*l*.3,l*.72,l*.58,t,0,Math.PI*2),n.fill()}n.fillStyle=`#2a1410`,n.beginPath(),n.ellipse(0,0,l*.26,l*.2,0,0,Math.PI*2),n.fill()}else for(let e=0;e<26;e++){let e=r.next()*Math.PI*2,t=Math.sqrt(r.next())*l,i=r.next();n.fillStyle=`rgb(${196+i*40},${120+i*50},${170+i*40})`,n.beginPath(),n.ellipse(Math.cos(e)*t,Math.sin(e)*t*.9,l*.3,l*.2,e,0,Math.PI*2),n.fill()}n.restore()}let a=new Ei(t);return a.colorSpace=Me,a}var Bu=class e extends $r{constructor(){let t=e.SkyShader,n=new Hi({name:t.name,uniforms:zi.clone(t.uniforms),vertexShader:t.vertexShader,fragmentShader:t.fragmentShader,side:1,depthWrite:!1});super(new Ai(1,1,1),n),this.isSky=!0}};Bu.SkyShader={name:`SkyShader`,uniforms:{turbidity:{value:2},rayleigh:{value:1},mieCoefficient:{value:.005},mieDirectionalG:{value:.8},sunPosition:{value:new q},cloudScale:{value:2e-4},cloudSpeed:{value:2e-5},cloudCoverage:{value:.4},cloudDensity:{value:.4},cloudElevation:{value:.5},showSunDisc:{value:1},time:{value:0}},vertexShader:`
		uniform vec3 sunPosition;
		uniform float rayleigh;
		uniform float turbidity;
		uniform float mieCoefficient;

		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		// constants for atmospheric scattering
		const float e = 2.71828182845904523536028747135266249775724709369995957;
		const float pi = 3.141592653589793238462643383279502884197169;

		// wavelength of used primaries, according to preetham
		const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
		// this pre-calculation replaces older TotalRayleigh(vec3 lambda) function:
		// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
		const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

		// mie stuff
		// K coefficient for the primaries
		const float v = 4.0;
		const vec3 K = vec3( 0.686, 0.678, 0.666 );
		// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
		const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

		// earth shadow hack
		// cutoffAngle = pi / 1.95;
		const float cutoffAngle = 1.6110731556870734;
		const float steepness = 1.5;
		const float EE = 1000.0;

		float sunIntensity( float zenithAngleCos ) {
			zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
			return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
		}

		vec3 totalMie( float T ) {
			float c = ( 0.2 * T ) * 10E-18;
			return 0.434 * c * MieConst;
		}

		void main() {

			vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			vWorldPosition = worldPosition.xyz;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			gl_Position.z = gl_Position.w; // set z to camera.far

			vSunDirection = normalize( sunPosition );

			vSunE = sunIntensity( vSunDirection.y );

			vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

			float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

			// extinction (absorption + out scattering)
			// rayleigh coefficients
			vBetaR = totalRayleigh * rayleighCoefficient;

			// mie coefficients
			vBetaM = totalMie( turbidity ) * mieCoefficient;

		}`,fragmentShader:`
		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		uniform float mieDirectionalG;
		uniform float cloudScale;
		uniform float cloudSpeed;
		uniform float cloudCoverage;
		uniform float cloudDensity;
		uniform float cloudElevation;
		uniform float showSunDisc;
		uniform float time;

		// gradient at a lattice corner; sinless hash so every GPU produces the same clouds
		vec2 gradient( vec2 i ) {
			vec3 p = fract( i.xyx * vec3( 0.1031, 0.1030, 0.0973 ) );
			p += dot( p, p.yzx + 33.33 );
			return fract( ( p.xx + p.yz ) * p.zy ) * 2.0 - 1.0;
		}

		// 2D gradient noise: isotropic lobes like Perlin at value-noise cost
		float noise( vec2 p ) {
			vec2 i = floor( p );
			vec2 f = fract( p );
			vec2 u = f * f * f * ( f * ( f * 6.0 - 15.0 ) + 10.0 ); // quintic fade
			float a = dot( gradient( i ), f );
			float b = dot( gradient( i + vec2( 1.0, 0.0 ) ), f - vec2( 1.0, 0.0 ) );
			float c = dot( gradient( i + vec2( 0.0, 1.0 ) ), f - vec2( 0.0, 1.0 ) );
			float d = dot( gradient( i + vec2( 1.0, 1.0 ) ), f - vec2( 1.0, 1.0 ) );
			return mix( mix( a, b, u.x ), mix( c, d, u.x ), u.y ) * 1.6; // ~[-1,1]
		}

		// fbm; per-octave drift makes clouds billow instead of scrolling as a rigid stamp
		float fbm( vec2 p, float drift ) {
			float result = 0.0;
			float amplitude = 1.0;
			for ( int i = 0; i < 4; i ++ ) {
				result += amplitude * noise( p );
				amplitude *= 0.5;
				p = p * 2.0 + drift;
			}
			return result;
		}

		// constants for atmospheric scattering
		const float pi = 3.141592653589793238462643383279502884197169;

		const float n = 1.0003; // refractive index of air
		const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

		// optical length at zenith for molecules
		const float rayleighZenithLength = 8.4E3;
		const float mieZenithLength = 1.25E3;
		// 66 arc seconds -> degrees, and the cosine of that
		const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

		// 3.0 / ( 16.0 * pi )
		const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
		// 1.0 / ( 4.0 * pi )
		const float ONE_OVER_FOURPI = 0.07957747154594767;

		float rayleighPhase( float cosTheta ) {
			return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
		}

		float hgPhase( float cosTheta, float g ) {
			float g2 = pow( g, 2.0 );
			float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
			return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
		}

		void main() {

			vec3 direction = normalize( vWorldPosition - cameraPosition );

			// optical length
			// cutoff angle at 90 to avoid singularity in next formula.
			float zenithAngle = acos( max( 0.0, direction.y ) );
			float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
			float sR = rayleighZenithLength * inverse;
			float sM = mieZenithLength * inverse;

			// combined extinction factor
			vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

			// in scattering
			float cosTheta = dot( direction, vSunDirection );

			float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
			vec3 betaRTheta = vBetaR * rPhase;

			float mPhase = hgPhase( cosTheta, mieDirectionalG );
			vec3 betaMTheta = vBetaM * mPhase;

			vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
			Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - vSunDirection.y, 5.0 ), 0.0, 1.0 ) );

			// nightsky
			float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
			float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
			vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
			vec3 L0 = vec3( 0.1 ) * Fex;

			// composition + solar disc
			float sundisc = clamp( ( cosTheta - sunAngularDiameterCos ) * 50000.0, 0.0, 1.0 ) * showSunDisc;
			vec3 sundiscColor = ( 760.0 * sundisc ) * min( vSunE * Fex, 80.0 );

			vec3 texColor = ( Lin + L0 ) * 0.04 + sundiscColor + vec3( 0.0, 0.0003, 0.00075 );

			// Clouds
			if ( direction.y > 0.0 && cloudCoverage > 0.0 ) {

				// Project to cloud plane (higher elevation = clouds appear lower/closer)
				float elevation = mix( 1.0, 0.1, cloudElevation );
				vec2 cloudUV = direction.xz / ( direction.y * elevation );
				cloudUV *= cloudScale;
				cloudUV += time * cloudSpeed;

				// Cloud density field
				float evolve = time * cloudSpeed * 300.0;
				float cloudNoise = clamp( fbm( cloudUV * 1000.0, evolve ) * 0.7 + 0.5, 0.0, 1.0 );

				// Large-scale coverage variation: clear gaps next to dense banks
				float region = noise( cloudUV * 300.0 ) * 0.37 + 0.5;
				float cov = clamp( cloudCoverage + ( region - 0.5 ) * 0.6, 0.0, 1.0 );

				// Carve clouds where noise rises above the coverage level
				float threshold = 1.0 - cov;
				float cloudMask = smoothstep( threshold, threshold + 0.3, cloudNoise );

				// Fade clouds near horizon (adjusted by elevation)
				float horizonFade = smoothstep( 0.0, 0.03 + 0.06 * cloudElevation, direction.y );
				cloudMask *= horizonFade;

				// Cloud lighting from the sky's own radiance
				float dayFactor = smoothstep( -0.08, 0.3, vSunDirection.y );
				vec3 sunColor = vSunE * Fex * 0.22 * 0.04; // 0.22 ~ albedo/pi, 0.04 = exposure; the aerial composite adds the eye-leg extinction
				vec3 skyAmbient = Lin * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

				// Beer-powder self-shadow from the sampled density
				float depth = max( 0.0, cloudNoise - threshold );
				float beer = exp( depth * -4.0 );
				float powder = 1.0 - beer * beer; // beer*beer == exp(-8*depth)
				float shade = mix( 0.45, 1.0, clamp( beer * powder * 2.6, 0.0, 1.0 ) ); // 2.6 = 1/0.385, normalizes beer*powder peak to 1

				// Henyey-Greenstein forward lobe ( g = 0.7 ): silver lining on rims toward the sun
				float silver = clamp( 0.51 / pow( 1.49 - cosTheta * 1.4, 1.5 ), 0.0, 3.0 ); // 0.51=1-g^2, 1.49=1+g^2, 1.4=2g
				float edge = cloudMask * ( 1.0 - cloudMask ) * 4.0;

				vec3 cloudColor = skyAmbient + sunColor * shade;
				cloudColor += sunColor * silver * edge * 0.6;
				cloudColor *= max( dayFactor, 0.03 );

				// Cloud opacity via Beer's law: density sets how solid the clouds get
				float alpha = ( 1.0 - exp( depth * cloudDensity * -12.0 ) ) * horizonFade;

				// Occlude the sun disc/glow behind opaque cloud
				texColor -= L0 * 0.04 * alpha;

				// Composite through the atmosphere so distant clouds dissolve into haze
				vec3 cloudAerial = mix( texColor, cloudColor, Fex );
				texColor = mix( texColor, cloudAerial, alpha );

			}

			gl_FragColor = vec4( texColor, 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`};var Vu=2600,Hu=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)};function Uu(e,t){let n=Math.imul(e,374761393)+Math.imul(t,668265263)|0;return n=Math.imul(n^n>>>13,1274126177),((n^n>>>16)>>>0)/4294967296}function Wu(e,t){let n=Math.floor(e),r=Math.floor(t),i=e-n,a=t-r,o=i*i*(3-2*i),s=a*a*(3-2*a),c=Uu(n,r),l=Uu(n+1,r),u=Uu(n,r+1),d=Uu(n+1,r+1);return c+(l-c)*o+(u-c)*s+(c-l-u+d)*o*s}function Gu(e,t,n){let r=0,i=.5,a=0;for(let o=0;o<n;o++)r+=i*Wu(e,t),a+=i,i*=.5,e=e*2.03+11.7,t=t*2.03-5.3;return r/a}function Ku(e,t){let n=Math.hypot(e,t);if(n<=66)return 0;let r=(Gu(e/150+7.3,t/150-2.1,3)-.5)*2,i=1-Math.abs(Gu(e/460+1.7,t/460+9.2,4)-.5)*2,a=Hu(66,210,n),o=Hu(130,560,n);return a*r*8*(1+n/500)+o*i*i*78+a*1.5}function qu(){let e=[14,22,30,36,42,48,54,60,66];for(let t=68.97;t<Vu;t*=1.045)e.push(t);let t=[0,0,0],n=[0,0],r=[];e.forEach((e,r)=>{for(let i=0;i<256;i++){let a=(i+(r&1)*.5)/256*Math.PI*2,o=Math.cos(a)*e,s=Math.sin(a)*e;t.push(o,Ku(o,s),s),n.push(o*.01,s*.01)}});let i=(e,t)=>1+e*256+t%256;for(let e=0;e<256;e++)r.push(0,i(0,e+1),i(0,e));for(let t=0;t+1<e.length;t++)for(let e=0;e<256;e++)t&1?r.push(i(t,e),i(t+1,e+1),i(t+1,e),i(t,e),i(t,e+1),i(t+1,e+1)):r.push(i(t,e),i(t,e+1),i(t+1,e),i(t,e+1),i(t+1,e+1),i(t+1,e));let a=new kr;a.setAttribute(`position`,new _r(t,3)),a.setAttribute(`uv`,new _r(n,2)),a.setIndex(r),a.computeVertexNormals();let o=a.attributes.normal.array,s=1.5,c=(e,t)=>Gu(e/34+3.3,t/13+1.1,3)*1.1+Gu(e/9-7.7,t/16+5.9,2)*.45;for(let e=0;e<o.length;e+=3){let n=t[e],r=t[e+2],i=Math.hypot(n,r),a=Hu(26,60,i)*(1-.6*Hu(500,1200,i))*1.7;if(a<=0)continue;let l=o[e]-a*(c(n+s,r)-c(n-s,r))/(2*s),u=o[e+2]-a*(c(n,r+s)-c(n,r-s))/(2*s),d=Math.hypot(l,o[e+1],u);o[e]=l/d,o[e+1]/=d,o[e+2]=u/d}return a}function Ju(){let e=[],t=(t,n,r,i,a,o)=>e.push({x:t,y:Ku(t,n),z:n,h:r,w:i,bush:a,hash:Uu(Math.floor(o*7)+3,59)});for(let e=0;e<110;e++){let n=Uu(e,101)*6.283,r=121+480*Uu(e,202)**1.1,i=Uu(e,303)<.5,a=i?1.8+2.2*Uu(e,404):7+8*Uu(e,404);t(Math.cos(n)*r,Math.sin(n)*r,a,i?a*1.5:a*(.8+.5*Uu(e,505)),i,e+1)}for(let e=0;e<5;e++){let n=Uu(e,11)*6.283,r=125+55*e+30*Uu(e,12),i=Math.cos(n)*r,a=Math.sin(n)*r,o=n+Math.PI/2+(Uu(e,13)-.5)*.9,s=60+Math.floor(50*Uu(e,14));for(let n=0;n<s;n++){if(o+=(Wu(n*.13+e*9,e)-.5)*.12,i+=Math.cos(o)*2.6,a+=Math.sin(o)*2.6,Math.hypot(i,a)<111||Uu(n,e+40)<.1)continue;let r=Uu(n,e+50)<.09,s=r?7+6*Uu(n,e+60):2.2+1.6*Uu(n,e+60);t(i,a,s,r?s*(.8+.4*Uu(n,e+70)):s*1.7,!r,e*100+n)}}for(let[e,n,r,i]of[[10,170,460,1],[19,460,1e3,1.7]])for(let a=-r;a<=r;a+=e)for(let o=-r;o<=r;o+=e){let s=Math.round(a/e),c=Math.round(o/e),l=a+(Uu(s,c)-.5)*e,u=o+(Uu(c+77,s)-.5)*e,d=Math.hypot(l,u);if(d<n||d>=r||Gu(l/230+4.4,u/230+8.8,3)+.08*Hu(300,700,d)<.57+.04*Uu(s+5,c))continue;let f=(9+8*Uu(s,c+9))*(.8+.2*i);t(l,u,f,f*(.9+.4*Uu(c,s+3))*i,!1,s*31+c)}return e}var Yu=Math.PI/180,Xu=29.53,Zu=.6*Yu,Qu=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)};function $u(e,t,n,r,i=new q){let a=t*Yu,o=18*Yu*Math.cos(r*Math.PI*2),s=(e-24*r-12)/24*Math.PI*2,c=-Math.cos(o)*Math.sin(s),l=Math.sin(a)*Math.sin(o)+Math.cos(a)*Math.cos(o)*Math.cos(s),u=Math.sin(a)*Math.cos(o)*Math.cos(s)-Math.cos(a)*Math.sin(o),d=n*Yu,f=Math.cos(d),p=Math.sin(d);return i.set(c*f+u*p,l,-c*p+u*f).normalize()}var ed=e=>(1-Math.cos(e*Math.PI*2))/2;function td(e,t){let n=Math.sin(e*127.1+t*311.7)*43758.5453;return n-Math.floor(n)}function nd(e,t){let n=Math.floor(e),r=Math.floor(t),i=e-n,a=t-r,o=i*i*(3-2*i),s=a*a*(3-2*a);return(td(n,r)*(1-o)+td(n+1,r)*o)*(1-s)+(td(n,r+1)*(1-o)+td(n+1,r+1)*o)*s}function rd(){let e=document.createElement(`canvas`);e.width=e.height=256;let t=e.getContext(`2d`),n=t.createImageData(256,256),r=n.data;for(let e=0;e<256;e++)for(let t=0;t<256;t++){let n=Math.hypot(t+.5-128,e+.5-128)/128,i=Math.max(0,1-n*n),a=(.55*Math.exp(-(n*n)/.0036)+.3*Math.exp(-n/.12)+.15*Math.exp(-n/.35))*i*i,o=(e*256+t)*4;r[o]=r[o+1]=r[o+2]=255,r[o+3]=Math.max(0,Math.min(255,Math.round(a*255+td(t,e)-.5)))}return t.putImageData(n,0,0),e}var id=128,ad=[[-.3,.42,.3,.5],[.12,.38,.19,.45],[.36,.14,.22,.48],[.6,.3,.11,.5],[.5,-.1,.17,.4],[-.56,.1,.34,.42],[-.3,-.28,.2,.38],[-.08,-.38,.17,.34],[-.52,-.38,.12,.36],[.24,-.02,.13,.3]],od=[[-.08,-.68,.05,.5],[-.3,.14,.04,.35],[-.58,.12,.03,.3],[-.66,.4,.03,.4]];function sd(){let e=new Float32Array(16384);for(let t=0;t<id;t++)for(let n=0;n<id;n++){let r=(n+.5)/id*2-1,i=1-(t+.5)/id*2,a=Math.hypot(r,i)/.94;if(a>1.03){e[t*id+n]=-1;continue}let o=r+.09*(nd(r*4+3,i*4)-.5),s=i+.09*(nd(r*4,i*4+7)-.5),c=0;for(let[e,t,n,r]of ad)c=Math.max(c,r*(1-Qu(n*.55,n*1.15,Math.hypot(o-e,s-t))));let l=.86-c+.1*(nd(r*9,i*9)-.5)+.07*(nd(r*23,i*23)-.5);for(let[e,t,n,a]of od){let o=Math.hypot(r-e,i-t);l+=a*Math.exp(-(o*o)/(n*n))+a*.25*Math.exp(-o/(n*5))*(.5+.5*nd(Math.atan2(i-t,r-e)*9,3))}e[t*id+n]=Math.max(.05,Math.min(1,l*(.82+.18*Math.sqrt(Math.max(0,1-a*a)))))}return e}var cd=class{stars;group=new En;sunGlow;sunGlare;moon;moonHalo;stats={frames:0,sumMs:0,maxMs:0,moonBakes:0,phase:-1};moonCanvas=document.createElement(`canvas`);moonTex;moonImg;albedo=sd();bakedPhase=-1;starBase;starPhase;starRate;starCol;starPos;t=0;tick=0;vx=new q;vy=new q;vz=new q;basis=new Zt;warm=new J(1,.62,.3);cool=new J(.88,.93,1);col=new J;constructor(e,t){this.stars=t;let n=t=>{let n=new Ei(t);return n.colorSpace=e.map?.colorSpace??`srgb`,n},r=new Vr({visible:!1});r.allowOverride=!1;let i=new Ni(1,1),a=n(rd());this.moonCanvas.width=this.moonCanvas.height=id,this.moonImg=this.moonCanvas.getContext(`2d`).createImageData(id,id),this.moonTex=n(this.moonCanvas);let o=(t,n)=>{let a=e.clone();a.map=t,a.color.setRGB(1,1,1),a.blending=2,a.depthWrite=!1;let o=new $r(i,a);return o.renderOrder=n,o.visible=!1,o.userData.gbufferMaterial=r,o.onBeforeRender=e=>e.getContext().depthRange(1,1),o.onAfterRender=e=>e.getContext().depthRange(0,1),this.group.add(o),o};this.moonHalo=o(a,1),this.moon=o(this.moonTex,2),this.sunGlow=o(a,3),this.sunGlare=o(a,9),this.sunGlare.material.depthTest=!1;let s=t.geometry;this.starPos=s.getAttribute(`position`),this.starCol=s.getAttribute(`color`);let c=this.starCol.count;this.starBase=new Float32Array(c*3),this.starPhase=new Float32Array(c),this.starRate=new Float32Array(c);for(let e=0;e<c;e++){let t=td(e,1.5),n=td(e,7.25),r=td(e,13.75),i=this.starCol.array,a=this.starPos.getY(e)/4e3,o=i[e*3+1]/.92*(t>.985?1.8:1)*(.25+.75*Qu(0,.25,a)),s=+(n<.18),c=+(n>.7),l=.25+.75*r;this.starBase[e*3]=o*(1+.12*s*l-.22*c*l),this.starBase[e*3+1]=o*(1-.22*s*l-.08*c*l),this.starBase[e*3+2]=o*(1-.5*s*l+.15*c*l),this.starPhase[e]=t*6.283,this.starRate[e]=2.5+7*r}}bakeMoon(e){let t=this.moonImg.data,n=this.albedo,r=Math.cos(e*Math.PI*2),i=e<.5,a=.13*(1-ed(e))+.04;for(let e=0;e<id;e++)for(let o=0;o<id;o++){let s=(e*id+o)*4,c=n[e*id+o];if(c<0){t[s]=t[s+1]=t[s+2]=0,t[s+3]=0;continue}let l=((o+.5)/id*2-1)/.94,u=(1-(e+.5)/id*2)/.94,d=Math.hypot(l,u),f=Math.sqrt(Math.max(0,1-u*u)),p=i?l-r*f:-r*f-l,m=c*(Qu(-.03,.2,p)*(.75+.25*Math.min(1,p*1.5+.3))),h=a*(.5+.5*c);t[s]=Math.min(255,255*Math.sqrt(m*m+h*h*.55)),t[s+1]=Math.min(255,255*Math.sqrt(m*m*.96+h*h*.7)),t[s+2]=Math.min(255,255*Math.sqrt(m*m*.88+h*h)),t[s+3]=255*(1-Qu(.97,1.03,d))}this.moonCanvas.getContext(`2d`).putImageData(this.moonImg,0,0),this.moonTex.needsUpdate=!0,this.bakedPhase=e,this.stats.moonBakes++,this.stats.phase=e}place(e,t,n,r,i){e.position.copy(t.position).addScaledVector(n,r);let a=2*r*Math.tan(i);e.scale.set(a,a,1)}frame(e,t,n,r,i,a){let o=performance.now();this.t+=i;let s=1-n,c=Math.max(1,Math.min(30,.03/Math.max(1e-5,r))),l=t.sunH,u=1-Qu(0,.4,l),d=Qu(-.13,0,l)*s,f=this.sunGlow,p=f.material;if(f.visible=d>.004,f.visible){this.place(f,e,t.sunDir,c,(7+17*u)*Yu),f.lookAt(e.position);let n=(.12+1.1*u)*d*(l<0?.55+.45*Qu(-.13,0,l):1);p.color.copy(t.sunColor).multiplyScalar(n)}let m=a?.3*u*Qu(0,.06,l)*s:0;if(m>.004){let n=Math.hypot(t.sunDir.x,t.sunDir.z)||1,r=t.sunDir.x/n,i=t.sunDir.z/n,a=0;for(let t=0,n=70;t<24;t++,n*=1.17)a=Math.max(a,(Ku(e.position.x+r*n,e.position.z+i*n)-e.position.y)/n);m*=Qu(a,a+.035,l/n)}let h=this.sunGlare;h.visible=m>.004,h.visible&&(this.place(h,e,t.sunDir,c,8*Yu),h.lookAt(e.position),h.material.color.copy(t.sunColor).multiplyScalar(m));let g=t.moonDir,_=t.moonPhase,v=ed(_),y=Qu(-.03,.03,g.y)*s,b=1-Qu(0,.3,g.y),x=this.moon,S=x.material;if(x.visible=y>.004,x.visible){let n=Math.round(_*96)/96;n!==this.bakedPhase&&this.bakeMoon(n),this.place(x,e,g,c,Zu*(1+.25*b));let r=this.vz.copy(g).negate(),i=this.vx.copy(t.sunDir).addScaledVector(g,-t.sunDir.dot(g));i.lengthSq()<1e-6&&i.set(0,1,0).cross(r),i.normalize().multiplyScalar(_<.5?1:-1),this.vy.crossVectors(r,i),x.quaternion.setFromRotationMatrix(this.basis.makeBasis(i,this.vy,r));let a=t.night,o=(.3+.7*a)*(1-.45*b);this.col.copy(this.cool).lerp(this.warm,b*b),S.color.copy(this.col).multiplyScalar(.72*o),S.opacity=y;let s=this.moonHalo,l=s.material,u=y*a*v*(.06+.08*b);s.visible=u>.003,s.visible&&(this.place(s,e,g,c,(7+5*b)*Yu),s.lookAt(e.position),l.color.copy(this.col).multiplyScalar(u))}else this.moonHalo.visible=!1;if(this.stars.visible){let e=this.starCol.array,t=this.starBase,n=this.starPos.array,r=this.starPhase.length,i=this.stars.rotation.y,a=Math.cos(i),o=Math.sin(i),s=(g.x*a-g.z*o)/4e3,c=g.y/4e3,l=(g.x*o+g.z*a)/4e3,u=y*v*.9,d=this.t,f=this.tick++&3,p=Math.floor(r*f/4),m=Math.floor(r*(f+1)/4);for(let r=p,i=p*3;r<m;r++,i+=3){let a=1+(.1+.32*(1-n[i+1]/4e3))*Math.sin(this.starPhase[r]+d*this.starRate[r]);if(u>.01){let e=n[i]*s+n[i+1]*c+n[i+2]*l;e>.6&&(a*=1-u*(e-.6)*(e-.6)*6.25)}e[i]=t[i]*a,e[i+1]=t[i+1]*a,e[i+2]=t[i+2]*a}this.starCol.clearUpdateRanges(),this.starCol.addUpdateRange(p*3,(m-p)*3),this.starCol.needsUpdate=!0}let C=performance.now()-o;this.stats.frames++,this.stats.sumMs+=C,C>this.stats.maxMs&&(this.stats.maxMs=C)}},ld=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)},ud=(e,t,n)=>e.clone().lerp(t,n);function dd(e,t,n,r=new q){let i=t*Math.PI/180,a=18*Math.PI/180,o=(e-12)/24*Math.PI*2,s=-Math.cos(a)*Math.sin(o),c=Math.sin(i)*Math.sin(a)+Math.cos(i)*Math.cos(a)*Math.cos(o),l=Math.sin(i)*Math.cos(a)*Math.cos(o)-Math.cos(i)*Math.sin(a);return r.set(s,c,l).normalize(),r.applyAxisAngle(new q(0,1,0),n*Math.PI/180)}function fd(e,t){let n=e.material;Object.assign(n.uniforms,t),n.fragmentShader=n.fragmentShader.replace(`void main() {`,`uniform vec3 fogCol; uniform float skyGain; uniform float horizonK; uniform vec3 skyTintCol; uniform float skyTint;
uniform vec3 disc1Dir; uniform vec3 disc1Col; uniform vec3 disc2Dir; uniform vec3 disc2Col; uniform float discSize; uniform float discOn;
vec3 tintSky(vec3 c) {
  float L = dot(c, vec3(0.3, 0.59, 0.11));
  return mix(c, skyTintCol * L * 2.2, skyTint);
}
vec3 disc(vec3 d, vec3 dir, vec3 col) {
  float c = dot(d, dir);
  float r = discSize * 0.012;
  float core = smoothstep(cos(r), cos(r * 0.8), c);
  float halo = pow(max(c, 0.0), 900.0 / discSize) * 0.35;
  return col * (core * 6.0 + halo);
}
void main() {`).replace(`gl_FragColor = vec4( texColor, 1.0 );`,`float hb = exp(-max(direction.y, 0.0) * horizonK);
			vec3 sc = min(mix(tintSky(texColor * skyGain), fogCol, hb), vec3(1.8));
			sc += discOn * (disc(direction, disc1Dir, disc1Col) + disc(direction, disc2Dir, disc2Col));
			gl_FragColor = vec4( sc, 1.0 );`)}var pd=class{renderer;scene;sky=new Bu;stars;sunDir=new q(0,1,0);moonDir=new q;moonPhase=.5;sunColor=new J;moonLight=0;night=0;sunH=1;fogColor=new J;keyDir=new q;keyColor=new J;keyIntensity=1;skyUniforms={fogCol:{value:new J},skyGain:{value:1},horizonK:{value:9},skyTintCol:{value:new J},skyTint:{value:0},disc1Dir:{value:new q},disc1Col:{value:new J},disc2Dir:{value:new q},disc2Col:{value:new J},discSize:{value:1},discOn:{value:1}};sun2Dir=new q;sun2Color=new J;sun2Intensity=0;envScene=new Fn;envSky=new Bu;envStarsCol=new J;pmrem;envRT=null;envU={turbidity:2.5,rayleigh:1.2,mieCoefficient:.004,horizonK:9,skyTint:0,skyGain:1,fogCol:new J,tintCol:new J};envKeep=new J;envKeepT=new J;lowWarm=new J(1,.66,.4);lowQ=!1;lastEnvDir=new q(9,9,9);envAge=1e9;basic=!1;bakes=0;constructor(e,t){this.renderer=e,this.scene=t,this.sky.scale.setScalar(4500),fd(this.sky,this.skyUniforms),fd(this.envSky,{...this.skyUniforms,discOn:{value:0}}),this.sky.material.uniforms.cloudCoverage.value=.35,this.sky.material.uniforms.cloudDensity.value=.35,t.add(this.sky),this.envSky.scale.setScalar(4500),this.envSky.material.uniforms.showSunDisc.value=0,this.envScene.add(this.envSky),this.pmrem=new So(e);let n=4500,r=new Float32Array(n*3),i=new Float32Array(n*3),a=7,o=()=>(a=a*16807%2147483647)/2147483647,s=new q(.3,.55,.78).normalize();for(let e=0;e<n;e++){let t;if(e<n*.45)t=new q(o()*2-1,o()*2-1,o()*2-1).normalize(),t.addScaledVector(s,-t.dot(s)*(.85+o()*.15)).normalize();else{let e=o()*2-1,n=o()*Math.PI*2;t=new q(Math.sqrt(1-e*e)*Math.cos(n),e,Math.sqrt(1-e*e)*Math.sin(n))}r.set([t.x*4e3,t.y*4e3,t.z*4e3],e*3);let a=o()**3.5*2.2+.15,c=o();i.set([a*(.85+.15*c),a*.92,a*(1.1-.2*c)],e*3)}let c=new kr;c.setAttribute(`position`,new mr(r,3)),c.setAttribute(`color`,new mr(i,3)),this.stars=new Ci(c,new vi({size:1.6,sizeAttenuation:!1,vertexColors:!0,transparent:!0,depthWrite:!1,fog:!1,blending:2})),this.stars.frustumCulled=!1,this.stars.renderOrder=-1,t.add(this.stars)}update(e,t,n){let r=e.sky;dd(r.timeOfDay,r.latitude,r.sunYaw,this.sunDir),r.cycle&&r.dayLength>0&&(r.moonPhase=(((r.moonPhase??.5)+t/r.dayLength/Xu)%1+1)%1);let i=this.moonPhase=Math.min(1,Math.max(0,r.moonPhase??.5));$u(r.timeOfDay,r.latitude,r.sunYaw,i,this.moonDir);let a=this.sunH=this.sunDir.y;this.night=1-ld(-.16,.02,a);let o=this.sky.material.uniforms,s=1-ld(0,.45,a);o.turbidity.value=2.5+6*s,o.rayleigh.value=1.2+1.8*s,o.mieCoefficient.value=.004+.008*s,o.mieDirectionalG.value=.8,o.sunPosition.value.copy(this.sunDir),o.time.value+=t,this.sky.position.copy(n),this.stars.position.copy(n);let c=ld(-.02,.14,this.moonDir.y),l=this.moonLight=ed(i)**1.3*c*ld(-.04,-.16,a),u=ld(0,-.18,a)*r.stars*(1-.45*l);this.stars.material.opacity=u,this.stars.visible=u>.01,this.stars.rotation.y=r.timeOfDay/24*Math.PI*2;let d=new J(1,.96,.9),f=new J(1,.72,.42),p=new J(1,.42,.18),m=a>.25?ud(f,d,ld(.25,.6,a)):ud(p,f,ld(0,.25,a));r.sunTint>0&&m.lerp(new J().setHSL(r.sunHue,.85,.6),Math.min(1,r.sunTint));let h=3.2*ld(-.04,.12,a)*(.55+.45*ld(.1,.6,a));this.sunColor.copy(m);let g=.32*l;a>-.04?(this.keyDir.copy(this.sunDir),this.keyColor.copy(m),this.keyIntensity=h):(this.keyDir.copy(this.moonDir),this.keyColor.setRGB(.56,.7,1).lerp(new J(1,.72,.48),.6*(1-ld(0,.3,this.moonDir.y))),this.keyIntensity=g);let _=new J(.7,.79,.9),v=new J(.93,.62,.42),y=new J(.12,.15,.29),b=new J(.012,.018,.036).lerp(new J(.036,.052,.095),l);a>.02?this.fogColor.copy(ud(v,_,ld(.02,.35,a))):this.fogColor.copy(a>-.1?ud(y,v,ld(-.1,.02,a)):ud(b,y,ld(-.22,-.1,a)));let x=new J().setHSL(r.skyHue,.6,.5);if(r.skyTint>0){let e=this.fogColor.r*.3+this.fogColor.g*.59+this.fogColor.b*.11;this.fogColor.lerp(x.clone().multiplyScalar(e*2.2),Math.min(1,r.skyTint))}this.skyUniforms.fogCol.value.copy(this.fogColor),this.skyUniforms.skyTintCol.value.copy(x),this.skyUniforms.skyTint.value=r.skyTint;let S=ld(-.06,.02,a);this.skyUniforms.disc1Dir.value.copy(this.sunDir);let C=ld(0,.3,a);this.skyUniforms.disc1Col.value.copy(m).multiplyScalar(S*(.4+3.6*C)),this.skyUniforms.disc1Col.value.g*=.55+.45*C,this.skyUniforms.disc1Col.value.b*=.3+.7*C,this.skyUniforms.discSize.value=r.sunSize*.42,dd(r.timeOfDay-1.2,r.latitude+8,r.sunYaw+r.sun2Yaw,this.sun2Dir);let w=this.sun2Dir.y;this.sun2Color.setHSL(r.sun2Hue,.8,.62);let T=ld(-.04,.06,w)*Math.min(1,r.sun2*2);this.sun2Intensity=r.sun2*1.8*T,this.skyUniforms.disc2Dir.value.copy(this.sun2Dir),this.skyUniforms.disc2Col.value.copy(this.sun2Color).multiplyScalar(T*.8),this.skyUniforms.skyGain.value=r.skyGain*(.3+.15*(1-ld(.03,.55,a)));let E=this.envU;if(E.turbidity=o.turbidity.value,E.rayleigh=o.rayleigh.value,E.mieCoefficient=o.mieCoefficient.value,E.horizonK=this.skyUniforms.horizonK.value=9,E.skyGain=this.skyUniforms.skyGain.value,E.skyTint=r.skyTint,E.fogCol.copy(this.fogColor),E.tintCol.copy(x),this.lowQ=r.quality===`Low`,this.lowQ){let e=1-ld(.4,.6,a),t=(1-ld(.05,.3,a))*ld(-.1,0,a);o.mieCoefficient.value+=(6e-4-o.mieCoefficient.value)*e,this.skyUniforms.horizonK.value=9-5.5*t,this.skyUniforms.fogCol.value.lerp(this.lowWarm,(.2*e+.4*t)*ld(-.1,.05,a)),this.skyUniforms.skyGain.value*=1-.6*t,r.skyTint<=0&&(this.skyUniforms.skyTintCol.value.setRGB(.42,.58,.95),this.skyUniforms.skyTint.value=.45*t)}this.envAge+=t;let D=r.quality===`Low`?3:0,O=this.lastEnvDir.distanceTo(this.sunDir);!this.basic&&this.envAge>=D&&(O>.03||this.envAge>4&&O>.002)&&this.regenEnv()}regenEnv(){let e=this.envSky.material.uniforms,t=this.sky.material.uniforms,n=this.envU,r=this.skyUniforms;for(let t of[`turbidity`,`rayleigh`,`mieCoefficient`])e[t].value=n[t];e.mieDirectionalG.value=t.mieDirectionalG.value;let i=r.horizonK.value,a=r.skyTint.value,o=r.skyGain.value;this.envKeep.copy(r.fogCol.value),this.envKeepT.copy(r.skyTintCol.value),this.lowQ&&(r.skyGain.value=n.skyGain,r.horizonK.value=n.horizonK,r.skyTint.value=n.skyTint,r.fogCol.value.copy(n.fogCol),r.skyTintCol.value.copy(n.tintCol)),e.sunPosition.value.copy(this.sunDir);let s=this.night;this.envScene.background=s>.02?this.envStarsCol.setRGB(.012*s,.018*s,.04*s):null,this.envSky.visible=this.sunH>-.2,wl.phase(`pmrem bake`);let c=this.pmrem.fromScene(this.envScene,0,1,2e3);wl.phase(`pmrem done`),this.bakes++,r.horizonK.value=i,r.skyTint.value=a,r.skyGain.value=o,r.fogCol.value.copy(this.envKeep),r.skyTintCol.value.copy(this.envKeepT),this.envRT?.dispose(),this.envRT=c,this.scene.environment=c.texture,this.lastEnvDir.copy(this.sunDir),this.envAge=0}},md={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},hd=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},gd=new ka(-1,1,1,-1,0,1),_d=new class extends kr{constructor(){super(),this.setAttribute(`position`,new _r([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new _r([0,2,0,0,2,0],2))}},vd=class{constructor(e){this._mesh=new $r(_d,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,gd)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},yd=class extends hd{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Hi?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=zi.clone(e.uniforms),this.material=new Hi({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new vd(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},bd=class extends hd{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},xd=class extends hd{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},Sd=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new K);this._width=n.width,this._height=n.height,t=new Jt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:v}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new yd(md),this.copyPass.material.blending=0,this.timer=new Ia}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}bd!==void 0&&(r instanceof bd?n=!0:r instanceof xd&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new K);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},Cd=class extends hd{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new J}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},wd={name:`GTAOShader`,defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new K},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new Zt},cameraProjectionMatrixInverse:{value:new Zt},cameraWorldMatrix:{value:new Zt},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new q(-1,-1,-1)},sceneBoxMax:{value:new q(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif

		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				vec4 clipSpacePosition = vec4( vec2( screenPosition ) * 2.0 - 1.0, depth, 1.0 );
			#else
				vec4 clipSpacePosition = vec4( vec3( screenPosition, depth ) * 2.0 - 1.0, 1.0 );
			#endif
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
			return textureLod(tDepth, uv.xy, 0.0).r;
		}

		float fetchDepth(const ivec2 uv) {
			return texelFetch(tDepth, uv.xy, 0).r;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}

		void main() {
			float depth = getDepth(vUv.xy);

			#ifdef USE_REVERSED_DEPTH_BUFFER
				if (depth <= 0.0) {
					discard;
					return;
				}
			#else
				if (depth >= 1.0) {
					discard;
					return;
				}
			#endif
			
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {

				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w);
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				#if PERSPECTIVE_CAMERA == 1
					vec3 viewDir = normalize(-viewPos.xyz);
				#else
					vec3 viewDir = vec3(0., 0., 1.);
				#endif
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));

				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));

				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},Td={name:`GTAODepthShader`,defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},Ed={name:`GTAOBlendShader`,uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function Dd(e=5){let t=Math.floor(e)%2==0?Math.floor(e)+1:Math.floor(e),r=Od(t),i=r.length,a=new Uint8Array(i*4);for(let e=0;e<i;++e){let t=r[e],n=2*Math.PI*t/i,o=new q(Math.cos(n),Math.sin(n),0).normalize();a[e*4]=(o.x*.5+.5)*255,a[e*4+1]=(o.y*.5+.5)*255,a[e*4+2]=127,a[e*4+3]=255}let o=new ni(a,t,t);return o.wrapS=n,o.wrapT=n,o.needsUpdate=!0,o}function Od(e){let t=Math.floor(e)%2==0?Math.floor(e)+1:Math.floor(e),n=t*t,r=Array(n).fill(0),i=Math.floor(t/2),a=t-1;for(let e=1;e<=n;)i===-1&&a===t?(a=t-2,i=0):(a===t&&(a=0),i<0&&(i=t-1)),r[i*t+a]===0?(r[i*t+a]=e++,a++,i--):(a-=2,i++);return r}var kd={name:`PoissonDenoiseShader`,defines:{SAMPLES:16,SAMPLE_VECTORS:Ad(16,2,1),NORMAL_VECTOR_TYPE:1},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new K},cameraProjectionMatrixInverse:{value:new Zt},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;

		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				vec4 clipSpacePosition = vec4( vec2( screenPosition ) * 2.0 - 1.0, depth, 1.0 );
			#else
				vec4 clipSpacePosition = vec4( vec3( screenPosition, depth ) * 2.0 - 1.0, 1.0 );
			#endif
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
			return textureLod(tDepth, uv.xy, 0.0).r;
		}

		float fetchDepth(const ivec2 uv) {
			return texelFetch(tDepth, uv.xy, 0).r;
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);

			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;

			denoised += w * neighborColor;
			totalWeight += w;
		}

		void main() {
			float depth = getDepth(vUv.xy);
			vec3 viewNormal = getViewNormal(vUv);
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);

			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}

			if (totalWeight > 0.) {
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function Ad(e,t,n){let r=jd(e,t,n),i=`vec3[SAMPLES](`;for(let t=0;t<e;t++){let n=r[t];i+=`vec3(${n.x}, ${n.y}, ${n.z})${t<e-1?`,`:`)`}`}return i}function jd(e,t,n){let r=[];for(let i=0;i<e;i++){let a=2*Math.PI*t*i/e,o=(i/(e-1))**n;r.push(new q(Math.cos(a),Math.sin(a),o))}return r}var Md=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,r,i,a=.5*(Math.sqrt(3)-1),o=(e+t)*a,s=Math.floor(e+o),c=Math.floor(t+o),l=(3-Math.sqrt(3))/6,u=(s+c)*l,d=s-u,f=c-u,p=e-d,m=t-f,h,g;p>m?(h=1,g=0):(h=0,g=1);let _=p-h+l,v=m-g+l,y=p-1+2*l,b=m-1+2*l,x=s&255,S=c&255,C=this.perm[x+this.perm[S]]%12,w=this.perm[x+h+this.perm[S+g]]%12,T=this.perm[x+1+this.perm[S+1]]%12,E=.5-p*p-m*m;E<0?n=0:(E*=E,n=E*E*this._dot(this.grad3[C],p,m));let D=.5-_*_-v*v;D<0?r=0:(D*=D,r=D*D*this._dot(this.grad3[w],_,v));let O=.5-y*y-b*b;return O<0?i=0:(O*=O,i=O*O*this._dot(this.grad3[T],y,b)),70*(n+r+i)}noise3d(e,t,n){let r,i,a,o,s=(e+t+n)*(1/3),c=Math.floor(e+s),l=Math.floor(t+s),u=Math.floor(n+s),d=1/6,f=(c+l+u)*d,p=c-f,m=l-f,h=u-f,g=e-p,_=t-m,v=n-h,y,b,x,S,C,w;g>=_?_>=v?(y=1,b=0,x=0,S=1,C=1,w=0):g>=v?(y=1,b=0,x=0,S=1,C=0,w=1):(y=0,b=0,x=1,S=1,C=0,w=1):_<v?(y=0,b=0,x=1,S=0,C=1,w=1):g<v?(y=0,b=1,x=0,S=0,C=1,w=1):(y=0,b=1,x=0,S=1,C=1,w=0);let T=g-y+d,E=_-b+d,D=v-x+d,O=g-S+2*d,k=_-C+2*d,A=v-w+2*d,j=g-1+3*d,M=_-1+3*d,N=v-1+3*d,P=c&255,F=l&255,I=u&255,L=this.perm[P+this.perm[F+this.perm[I]]]%12,R=this.perm[P+y+this.perm[F+b+this.perm[I+x]]]%12,ee=this.perm[P+S+this.perm[F+C+this.perm[I+w]]]%12,te=this.perm[P+1+this.perm[F+1+this.perm[I+1]]]%12,ne=.6-g*g-_*_-v*v;ne<0?r=0:(ne*=ne,r=ne*ne*this._dot3(this.grad3[L],g,_,v));let z=.6-T*T-E*E-D*D;z<0?i=0:(z*=z,i=z*z*this._dot3(this.grad3[R],T,E,D));let B=.6-O*O-k*k-A*A;B<0?a=0:(B*=B,a=B*B*this._dot3(this.grad3[ee],O,k,A));let V=.6-j*j-M*M-N*N;return V<0?o=0:(V*=V,o=V*V*this._dot3(this.grad3[te],j,M,N)),32*(r+i+a+o)}noise4d(e,t,n,r){let i=this.grad4,a=this.simplex,o=this.perm,s=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,l,u,d,f,p,m=(e+t+n+r)*s,h=Math.floor(e+m),g=Math.floor(t+m),_=Math.floor(n+m),v=Math.floor(r+m),y=(h+g+_+v)*c,b=h-y,x=g-y,S=_-y,C=v-y,w=e-b,T=t-x,E=n-S,D=r-C,O=w>T?32:0,k=w>E?16:0,A=T>E?8:0,j=w>D?4:0,M=T>D?2:0,N=+(E>D),P=O+k+A+j+M+N,F=+(a[P][0]>=3),I=+(a[P][1]>=3),L=+(a[P][2]>=3),R=+(a[P][3]>=3),ee=+(a[P][0]>=2),te=+(a[P][1]>=2),ne=+(a[P][2]>=2),z=+(a[P][3]>=2),B=+(a[P][0]>=1),V=+(a[P][1]>=1),re=+(a[P][2]>=1),ie=+(a[P][3]>=1),H=w-F+c,ae=T-I+c,oe=E-L+c,se=D-R+c,ce=w-ee+2*c,le=T-te+2*c,ue=E-ne+2*c,de=D-z+2*c,fe=w-B+3*c,pe=T-V+3*c,me=E-re+3*c,he=D-ie+3*c,ge=w-1+4*c,_e=T-1+4*c,ve=E-1+4*c,ye=D-1+4*c,be=h&255,xe=g&255,Se=_&255,Ce=v&255,we=o[be+o[xe+o[Se+o[Ce]]]]%32,Te=o[be+F+o[xe+I+o[Se+L+o[Ce+R]]]]%32,Ee=o[be+ee+o[xe+te+o[Se+ne+o[Ce+z]]]]%32,U=o[be+B+o[xe+V+o[Se+re+o[Ce+ie]]]]%32,De=o[be+1+o[xe+1+o[Se+1+o[Ce+1]]]]%32,Oe=.6-w*w-T*T-E*E-D*D;Oe<0?l=0:(Oe*=Oe,l=Oe*Oe*this._dot4(i[we],w,T,E,D));let ke=.6-H*H-ae*ae-oe*oe-se*se;ke<0?u=0:(ke*=ke,u=ke*ke*this._dot4(i[Te],H,ae,oe,se));let W=.6-ce*ce-le*le-ue*ue-de*de;W<0?d=0:(W*=W,d=W*W*this._dot4(i[Ee],ce,le,ue,de));let Ae=.6-fe*fe-pe*pe-me*me-he*he;Ae<0?f=0:(Ae*=Ae,f=Ae*Ae*this._dot4(i[U],fe,pe,me,he));let G=.6-ge*ge-_e*_e-ve*ve-ye*ye;return G<0?p=0:(G*=G,p=G*G*this._dot4(i[De],ge,_e,ve,ye)),27*(l+u+d+f+p)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,r){return e[0]*t+e[1]*n+e[2]*r}_dot4(e,t,n,r,i){return e[0]*t+e[1]*n+e[2]*r+e[3]*i}},Nd=class e extends hd{constructor(e,t,n=512,r=512,i,a,o){super(),this.width=n,this.height=r,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Dd(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new Jt(this.width,this.height,{type:v,depthBuffer:!1}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new Hi({defines:Object.assign({},wd.defines),uniforms:zi.clone(wd.uniforms),vertexShader:wd.vertexShader,fragmentShader:wd.fragmentShader,blending:0,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=+!!this.camera.isPerspectiveCamera,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Gi,this.normalMaterial.blending=0,this.pdMaterial=new Hi({defines:Object.assign({},kd.defines),uniforms:zi.clone(kd.uniforms),vertexShader:kd.vertexShader,fragmentShader:kd.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new Hi({defines:Object.assign({},Td.defines),uniforms:zi.clone(Td.uniforms),vertexShader:Td.vertexShader,fragmentShader:Td.fragmentShader,blending:0}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new Hi({uniforms:zi.clone(md.uniforms),vertexShader:md.vertexShader,fragmentShader:md.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:208,blendDst:200,blendEquation:100,blendSrcAlpha:206,blendDstAlpha:200,blendEquationAlpha:100}),this.blendMaterial=new Hi({uniforms:zi.clone(Ed.uniforms),vertexShader:Ed.vertexShader,fragmentShader:Ed.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:5,blendSrc:208,blendDst:200,blendEquation:100,blendSrcAlpha:206,blendDstAlpha:200,blendEquationAlpha:100}),this._fsQuad=new vd(null),this._originalClearColor=new J,this.setGBuffer(i?i.depthTexture:void 0,i?i.normalTexture:void 0),a!==void 0&&this.updateGtaoMaterial(a),o!==void 0&&this.updatePdMaterial(o)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget&&this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget&&this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){if(e!==void 0)this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1;else{if(this.normalRenderTarget===void 0){let e=new Di;e.format=O,e.type=x,this.normalRenderTarget=new Jt(this.width,this.height,{minFilter:a,magFilter:a,type:v,depthTexture:e})}this.depthTexture=this.normalRenderTarget.depthTexture,this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0}let n=+!!this.normalTexture;this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=n,this.gtaoMaterial.needsUpdate=!0,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=n,this.pdMaterial.needsUpdate=!0,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&+!!e.screenSpaceRadius!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=+!!e.screenSpaceRadius,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Ad(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(t,n,r){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(t,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(t,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(t,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case e.OUTPUT.Off:break;case e.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=r.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:n);break;case e.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:n);break;case e.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:n);break;case e.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(t,this.depthRenderMaterial,this.renderToScreen?null:n);break;case e.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalTexture||null,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:n);break;case e.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=r.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:n),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(t,this.blendMaterial,this.renderToScreen?null:n);break;default:console.warn(`THREE.GTAOPass: Unknown output type.`)}}_renderPass(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_renderOverride(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r=t.clearColor||r,i=t.clearAlpha||i,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(e){(e.isPoints||e.isLine||e.isLine2)&&e.visible&&(e.visible=!1,t.push(e))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new Md,r=e*e*4,i=new Uint8Array(r);for(let n=0;n<e;n++)for(let r=0;r<e;r++){let a=n,o=r;i[(n*e+r)*4]=(t.noise(a,o)*.5+.5)*255,i[(n*e+r)*4+1]=(t.noise(a+e,o)*.5+.5)*255,i[(n*e+r)*4+2]=(t.noise(a,o+e)*.5+.5)*255,i[(n*e+r)*4+3]=(t.noise(a+e,o+e)*.5+.5)*255}let a=new ni(i,e,e,E,d);return a.wrapS=n,a.wrapT=n,a.needsUpdate=!0,a}};Nd.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var Pd={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new J(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},Fd=class e extends hd{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new K(256,256):new K(e.x,e.y),this.clearColor=new J(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Jt(i,a,{type:v,depthBuffer:!1}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new Jt(i,a,{type:v,depthBuffer:!1});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new Jt(i,a,{type:v,depthBuffer:!1});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),i=Math.round(i/2),a=Math.round(a/2)}let o=Pd;this.highPassUniforms=zi.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Hi({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let s=[6,10,14,18,22];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(s[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new K(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new q(1,1,1),new q(1,1,1),new q(1,1,1),new q(1,1,1),new q(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=zi.clone(md.uniforms),this.blendMaterial=new Hi({uniforms:this.copyUniforms,vertexShader:md.vertexShader,fragmentShader:md.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new J,this._oldClearAlpha=1,this._basic=new Vr,this._fsQuad=new vd(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new K(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);let r=[],i=[];for(let n=1;n<e;n+=2){let a=t[n],o=n+1<e?t[n+1]:0,s=a+o;r.push((n*a+(n+1)*o)/s),i.push(s)}return new Hi({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new K(.5,.5)},direction:{value:new K(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:i}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new Hi({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};Fd.BlurDirectionX=new K(1,0),Fd.BlurDirectionY=new K(0,1);var Id={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},Ld=class extends hd{constructor(){super(),this.isOutputPass=!0,this.uniforms=zi.clone(Id.uniforms),this.material=new Ui({name:Id.name,uniforms:this.uniforms,vertexShader:Id.vertexShader,fragmentShader:Id.fragmentShader}),this._fsQuad=new vd(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Ft.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},Rd={uniforms:{tDiffuse:{value:null},sunUv:{value:new K(.5,.5)},strength:{value:0},tint:{value:new J(1,.8,.6)},aspect:{value:1}},vertexShader:`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,fragmentShader:`
    uniform sampler2D tDiffuse; uniform vec2 sunUv; uniform float strength; uniform vec3 tint; uniform float aspect;
    varying vec2 vUv;
    float bright(vec2 uv){ vec3 c = texture2D(tDiffuse, uv).rgb; float l = dot(c, vec3(0.3,0.59,0.11)); return smoothstep(0.9, 3.0, l); }
    void main(){
      vec4 base = texture2D(tDiffuse, vUv);
      if (strength <= 0.0) { gl_FragColor = base; return; }
      vec2 d = (sunUv - vUv);
      float dist = length(d * vec2(aspect, 1.0));
      vec2 stepv = d / 40.0;
      vec2 uv = vUv;
      float acc = 0.0, w = 1.0;
      float jit = fract(sin(dot(vUv, vec2(12.9898,78.233))) * 43758.5453);
      uv += stepv * jit;
      for (int i = 0; i < 40; i++) { float sd = length((uv - sunUv) * vec2(aspect, 1.0)); acc += bright(uv) * exp(-sd * 9.0) * w; w *= 0.965; uv += stepv; }
      acc /= 40.0;
      float fall = exp(-dist * 2.2);
      gl_FragColor = vec4(base.rgb + tint * acc * strength * fall, base.a);
    }`},zd={uniforms:{tDiffuse:{value:null},time:{value:0},vignette:{value:.35},grain:{value:.035},warm:{value:new J(1.04,1,.93)},cool:{value:new J(.92,.98,1.06)},saturation:{value:1.05}},vertexShader:`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,fragmentShader:`
    uniform sampler2D tDiffuse; uniform float time, vignette, grain, saturation; uniform vec3 warm, cool;
    varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)) + time * 61.0) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(0.2126,0.7152,0.0722));
      c *= mix(cool, warm, smoothstep(0.1, 0.75, l));
      c = mix(vec3(l), c, saturation);
      vec2 q = vUv - 0.5;
      c *= 1.0 - vignette * smoothstep(0.25, 0.85, dot(q, q) * 2.2);
      c += (h(vUv * 1000.0) - 0.5) * grain * (1.0 - 0.6 * l);
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`},Bd=class{composer;gtao;bloom;rays;grade;constructor(e,t,n){let r=window.innerWidth,i=window.innerHeight,a=new Jt(r,i,{type:v,samples:4}),o=this.composer=new Sd(e,a);o.addPass(new Cd(t,n)),this.gtao=new Nd(t,n,r,i),this.gtao.blendIntensity=.75,this.gtao.updateGtaoMaterial({radius:.6,distanceExponent:1.5,thickness:1.5,scale:1,samples:12}),this.gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:6,rings:2,samples:12}),o.addPass(this.gtao);let s=this.gtao,c=s._renderOverride.bind(s);s._renderOverride=(...e)=>{let n=[];t.traverseVisible(e=>{let t=e,r=e.userData.gbufferMaterial;t.isMesh&&r&&(n.push([t,t.material]),t.material=r)});try{c(...e)}finally{for(let[e,t]of n)e.material=t}},this.rays=new yd(Rd),o.addPass(this.rays),this.bloom=new Fd(new K(r,i),.2,.4,2.5),o.addPass(this.bloom),o.addPass(new Ld),this.grade=new yd(zd),o.addPass(this.grade)}setSize(e,t){this.composer.setSize(e,t),this.rays.uniforms.aspect.value=e/t}},Vd=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e||1e-6)));return r*r*(3-2*r)},Hd=e=>e-Math.floor(e),Ud=.25,Wd=.5,Gd=.78,Kd=.375,qd=.004;function Jd(e){let t=(t,n)=>[`Early`,`Mid`,`Late`][Math.min(2,Math.floor((e-t)/(n-t)*3))];return e<.25?`${t(0,Ud)} spring`:e<.5?`${t(Ud,Wd)} summer`:e<.78?`${t(Wd,Gd)} autumn`:`${t(Gd,1)} winter`}var Yd=new class{active=!1;phase=Kd;year=1;name=`Mid summer`;spring=0;summer=1;autumn=0;winter=0;leafOn=1;daylight=1;litterKeep=1;springTime=-1e9;jumped=!1;dPhase=0;offset=0;wrote=NaN;wasActive=!1;update(e,t){let n=Math.max(10,t.yearLength),r=e/n,i=this.phase;if(!t.on)this.phase=Kd,this.year=1+Math.floor(r+this.offset);else{Number.isFinite(t.date)||(t.date=0),(t.hold||t.date!==this.wrote)&&(this.offset=Math.max(0,Math.floor(r+this.offset+1e-9))+Hd(t.date)-r);let e=r+this.offset;this.phase=t.hold?Hd(t.date):Hd(e),this.year=1+Math.max(0,Math.floor(e+1e-9)),t.hold||(t.date=this.phase),this.wrote=t.date}this.active=t.on;let a=this.phase-i;a<-.5&&(a+=1),this.jumped=this.active!==this.wasActive||a<0||a>qd,this.dPhase=this.jumped?0:a,this.wasActive=this.active;let o=this.phase;this.springTime=this.active?e-o*n:-1e9,this.name=Jd(o),this.spring=Vd(0,.06,o)*(1-Vd(.2,.3,o)),this.summer=Vd(.2,.3,o)*(1-Vd(.47,.56,o)),this.autumn=Vd(.47,.56,o)*(1-Vd(.74,.82,o)),this.winter=o<.5?1-Vd(0,.06,o):Vd(.74,.82,o),this.leafOn=this.active?Vd(Xd,Xd+Zd+Qd,o)*(1-Vd(.56,.79,o)):1,this.daylight=.5-.5*Math.cos((o-.875)*2*Math.PI),this.litterKeep=this.active?o>=.78?1-Vd(.8200000000000001,.99,o):o<.03?0:1:1}},Xd=.018,Zd=.055,Qd=.05,$d=.06,ef={oak:{drop:!0,pal:{h0:.05,h1:.11,s:.7,l:1.15,brown:.35}},maple:{drop:!0,pal:{h0:0,h1:.075,s:.88,l:1.3,brown:.06}},birch:{drop:!0,pal:{h0:.125,h1:.155,s:.9,l:1.7,brown:.05}},ginkgo:{drop:!0,pal:{h0:.135,h1:.152,s:.95,l:1.8,brown:0}},willow:{drop:!0,pal:{h0:.135,h1:.175,s:.55,l:1.75,brown:.1}},round:{drop:!0,pal:{h0:.05,h1:.14,s:.78,l:1.4,brown:.2}},spray:{drop:!1,pal:null},frond:{drop:!0,pal:{h0:.72,h1:.84,s:.7,l:1.25,brown:0}},ring:{drop:!1,pal:{h0:.1,h1:.15,s:.9,l:1.5,brown:0}},spiral:{drop:!1,pal:null}},tf=e=>ef[e]??ef.oak,nf=e=>Xd+Zd*e,rf=(e,t)=>.485+.125*(1-e)+.06*t,af=(e,t)=>e+.05+.075*t;function of(e,t,n,r){return e>=n?0:r?1:e<=t?0:.12+.88*Vd(t,t+Qd,e)}var sf=[0,0,0];function cf(e,t,n,r,i,a,o,s,c,l,u,d=1){if(!a){let t=1-Vd(n+.03,n+.2,e);t>0&&(c-=.045*t,l=Math.min(1,l+.1*t),u*=1+.32*t)}let f=t.pal;if(f&&e>r){let n=Vd(r,r+$d,e);t.drop||(n*=1-Vd(.9,.995,e));let a=s<f.brown,p=a?.07+.03*o:f.h0+(f.h1-f.h0)*o,m=a?.42:f.s*(.85+.3*s),h=u*d*(a?.8:f.l*(.85+.3*o)),g=p-c;g>.5?--g:g<-.5&&(g+=1),p=c+g;let _=Vd(0,.75,n),v=Vd(.15,1,n);if(c+=(p-c)*_,l+=(m-l)*v,u+=(h-u)*v,t.drop){let t=Vd(r+$d,i+.02,e)*.45;l*=1-.45*t,u*=1-.3*t}}return sf[0]=c-Math.floor(c),sf[1]=Math.min(1,Math.max(0,l)),sf[2]=u,sf}var lf=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)},uf=e=>e-Math.floor(e),df=e=>e>=.305&&e<=.465?-1:Math.round(e*200);function ff(e,t){return t.fresh=lf(.015,.09,e)*(1-lf(.2,.3,e)),t.straw=lf(.47,.66,e)*(1-lf(.76,.86,e)),t.winter=e<.5?1-lf(.015,.1,e):lf(.74,.86,e),t.height=.5+.5*(e<.5?lf(.02,.2,e):1-lf(.7,.86,e)),t}var pf=(e,t)=>lf(.035+.03*t,.17+.045*t,e)*(1-lf(.47+.02*t,.6+.02*t,e));function mf(e,t){let n=ff(e,hf),r=n.fresh,i=n.straw,a=n.winter;return t[0]=(1+.12*r+1.05*i+.95*a)*(1-.2*a),t[1]=(1+.12*r+.1*i-.1*a)*(1-.2*a),t[2]=(1-.25*r-.3*i+.2*a)*(1-.2*a),t}var hf={fresh:0,straw:0,winter:0,height:1};function gf(e,t,n,r,i,a){let o=uf(t*13.7+n*5.3),s=uf(t*91.7+n*3.9);if(a.shade=uf(n*7.31+t*3.1),a.brown=uf(t*57.3)<.22,s<(i?.05:.07+.5*lf(.66,.8,r)))return a.leaf=1,a.bare=!1,a.evergreen=!0,a.bareSize=1,a.pale=a.turn=a.dry=0,a;a.evergreen=!1;let c=.02+.05*n+.03*r,l=.485+.1*o+.05*r,u=l+.08+.07*t;return a.leaf=e>=u||e<=c?0:(.72+.28*lf(c,c+.05,e))*(1-.18*lf(u-.03,u,e)),a.bare=e<c+.05||e>(i?u-.04:l+.004),a.bareSize=e>l&&e<u?.62+.38*lf(u-.06,u-.015,e):1,a.pale=1-lf(c+.03,c+.2,e),a.turn=lf(l,l+.06,e),a.dry=lf(l+.06,u,e),a}var _f=3,vf=[.76,.9,.4],yf=.3,bf=.34,xf=class e{renderer;scene=new Fn;camera;controls;sun;hemi;atmo;_post=null;get post(){return this._post||(this._post=new Bd(this.renderer,this.scene,this.camera),this._post.setSize(window.innerWidth,window.innerHeight)),this._post}quality=``;contextLost=!1;fog;backdrop=!0;groundU={trunk:{value:new q(0,0,.1)},tint:{value:new Kt(0,0,0,0)}};sun2;manual=!1;intro=!1;easeT=1e9;easePos=new q;easeTgt=new q;prevCinema=!0;prevAutoFrame=!0;cineT=0;cineYaw=0;cineOn=!1;center=new q(0,1,0);dist=6;sunUv=new q;constructor(e,t={}){let n=this.renderer=new dl({antialias:t.antialias??!0,powerPreference:`high-performance`,alpha:!1});n.setPixelRatio(1),n.setSize(window.innerWidth,window.innerHeight),n.toneMapping=4,n.outputColorSpace=Me,n.shadowMap.enabled=t.shadows??!0,n.shadowMap.type=1,e.appendChild(n.domElement),this.camera=new Oa(36,window.innerWidth/window.innerHeight,.05,9e3),this.camera.position.set(6,2.5,8),this.controls=new ru(this.camera,n.domElement),this.controls.enableDamping=!0,this.controls.dampingFactor=.06,this.controls.autoRotateSpeed=.35,this.controls.maxPolarAngle=Math.PI*.495,this.backdrop=t.backdrop??!0,this.fog=new Pn(12109782,.006),this.scene.fog=this.fog,this.atmo=new pd(n,this.scene),this.hemi=new ga(13624319,4870710,.5),this.scene.add(this.hemi),this.sun=new ja(16773596,2.6),this.sun.castShadow=t.shadows??!0,this.sun.shadow.mapSize.set(2048,2048),this.sun.shadow.bias=-3e-4,this.sun.shadow.normalBias=.025,this.sun.shadow.radius=5,this.scene.add(this.sun,this.sun.target),this.sun2=new ja(16777215,0),this.scene.add(this.sun2,this.sun2.target),this.scene.add(this.makeGround(t.backdrop??!0),this.makeHills(t.backdrop??!0)),window.addEventListener(`resize`,()=>{this.camera.aspect=window.innerWidth/window.innerHeight,this.camera.updateProjectionMatrix(),n.setSize(window.innerWidth,window.innerHeight),this._post?.setSize(window.innerWidth,window.innerHeight)}),document.addEventListener(`visibilitychange`,()=>this.dprHiddenSeen=!0);let r=!0;n.domElement.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),this.contextLost=!0,document.visibilityState===`hidden`?(wl.log(`ctx_loss_hidden`,{}),r=!0):(r=t.onContextLost?.()??!0,r&&Sf(`Graphics context lost (GPU reset or memory pressure). Reloading in safe mode when it comes back…`))}),n.domElement.addEventListener(`webglcontextrestored`,()=>{r&&(document.visibilityState===`hidden`?document.addEventListener(`visibilitychange`,()=>{document.visibilityState!==`hidden`&&location.reload()}):location.reload())})}applyQuality(e){if(e===this.quality)return;this.quality=e;let t=e===`High`,n=Number(new URLSearchParams(location.search).get(`dpr`));this.dprPinned=Number.isFinite(n)&&n>0,this.dprStart=this.dprPinned?Math.min(n,4):Math.min(t?1.5:2,window.devicePixelRatio||1),this.setDpr(this.dprStart),this.dprWinStart=-1,this.dprGoodSince=-1;let r=t?2048:1024;this.sun.shadow.mapSize.x!==r&&(this.sun.shadow.mapSize.set(r,r),this.sun.shadow.map?.dispose(),this.sun.shadow.map=null)}dprStart=1;dprPinned=!1;dprWinStart=-1;dprWinFrames=0;dprIv=new Float32Array(1024);dprLastFrame=0;dprGoodSince=-1;dprLastDown=-1e9;dprT0=-1;dprHiddenSeen=!1;static DPR_STEPS=[2,1.75,1.5,1.25,1];setDpr(e){this.renderer.setPixelRatio(e),this.renderer.setSize(window.innerWidth,window.innerHeight),this._post&&(this._post.composer.setPixelRatio(e),this._post.setSize(window.innerWidth,window.innerHeight))}adaptDpr(t){if(this.dprPinned)return;this.dprT0<0&&(this.dprT0=t);let n=t-this.dprLastFrame,r=this.dprHiddenSeen||n>2e3;if(this.dprHiddenSeen=!1,this.dprLastFrame=t,t-this.dprT0<3e3||document.visibilityState===`hidden`||r||this.dprWinStart<0){this.dprWinStart=t,this.dprWinFrames=0,(r||document.visibilityState===`hidden`)&&(this.dprGoodSince=-1);return}this.dprWinFrames<this.dprIv.length&&(this.dprIv[this.dprWinFrames]=n),this.dprWinFrames++;let i=t-this.dprWinStart;if(i<3e3)return;let a=this.dprWinFrames*1e3/i,o=Math.min(this.dprWinFrames,this.dprIv.length),s=this.dprIv.subarray(0,o).sort()[o>>1];this.dprWinStart=t,this.dprWinFrames=0;let c=this.renderer.getPixelRatio(),l=e.DPR_STEPS.filter(e=>e<=this.dprStart+1e-6);(!l.length||l[0]<this.dprStart-1e-6)&&l.unshift(this.dprStart);let u=c;if(s>25)u=l.find(e=>e<c-1e-6)??c,this.dprGoodSince=-1,u!==c&&(this.dprLastDown=t);else if(s<17.5){if(this.dprGoodSince<0&&(this.dprGoodSince=t-i),t-this.dprGoodSince>=1e4&&t-this.dprLastDown>=3e4){let e=[...l].reverse().find(e=>e>c+1e-6);e!==void 0&&(u=e),this.dprGoodSince=-1}}else this.dprGoodSince=-1;u!==c&&(this.setDpr(u),wl.log(`dpr_change`,{from:c,to:u,fps:+a.toFixed(1),medianMs:+s.toFixed(1),quality:this.quality}))}groundMat=null;groundBase=new J;groundK=[1,1,1];makeGround(e){let t=new Wi({map:Fu(e),roughness:.96,color:14474420});e&&t.color.setRGB(vf[0],vf[1],vf[2]);let n=this.groundU;t.onBeforeCompile=e=>{e.uniforms.uTrunk=n.trunk,e.uniforms.uTint=n.tint,e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec2 vGW;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
vGW = (modelMatrix * vec4(transformed, 1.0)).xz;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
varying vec2 vGW;
uniform vec3 uTrunk;
uniform vec4 uTint;`).replace(`#include <map_fragment>`,`{
            vec2 p = vGW;
            vec3 a = texture2D(map, p * 0.37).rgb;
            vec3 b = texture2D(map, mat2(0.8, -0.6, 0.6, 0.8) * p * 0.061 + 0.37).rgb;
            float m1 = texture2D(map, p * 0.0071 + 0.21).g;
            float m2 = texture2D(map, mat2(0.6, 0.8, -0.8, 0.6) * p * 0.0019).g;
            float macro = smoothstep(0.25, 0.55, m1 * 0.6 + m2 * 0.6);
            vec3 g = mix(a, b, 0.45);
            float lum = dot(g, vec3(0.3, 0.59, 0.11));
            g = mix(vec3(lum), g, 0.72);
            vec3 dry = vec3(0.62, 0.58, 0.38) * lum * 2.2;
            g = mix(g, dry, 0.35 * macro);
            g *= 0.85 + 0.3 * m2;
            g = mix(g, uTint.rgb * dot(g, vec3(0.3, 0.59, 0.11)) * 2.4, uTint.a);
            float rt = length(p - uTrunk.xy);
            g *= mix(0.35, 1.0, smoothstep(uTrunk.z * 0.6, uTrunk.z * 7.0, rt));
            diffuseColor.rgb *= g;
          }`)};let r=new $r(e?qu():new ji(3e3,96).rotateX(-Math.PI/2),t);return r.receiveShadow=!0,this.groundMat=t,this.groundBase=t.color.clone(),r}makeHills(e){if(e)return new En;let t=new Mi(900,900,1,256,1,!0),n=t.attributes.position;for(let e=0;e<n.count;e++){let t=n.getX(e),r=n.getZ(e),i=n.getY(e),a=Math.atan2(r,t),o=18+30*(.5+.5*Math.sin(a*3+1.3))*(.6+.4*Math.sin(a*7.1))+8*Math.sin(a*17.3)+4*Math.sin(a*41);n.setY(e,i>0?Math.max(4,o):-2)}return t.computeVertexNormals(),new $r(t,new Wi({color:4082228,roughness:1,side:1}))}takeControl(){this.manual=!0,this.easeT=1e9}autoCamera(){this.manual&&(this.manual=!1,this.easeT=0,this.easePos.copy(this.camera.position),this.easeTgt.copy(this.controls.target),this.center.copy(this.controls.target),this.dist=this.camera.position.distanceTo(this.controls.target),this.cineOn=!1)}nightFloor=0;frame(e,t,n,r=!1){let i=t.sky;i.cycle&&i.dayLength>0&&(i.timeOfDay=(i.timeOfDay+n*24/i.dayLength*(i.timeOfDay>=21||i.timeOfDay<4.5?Math.max(1,i.nightSpeed||1):1))%24),this.atmo.update(t,r?0:n,this.camera.position);let a=this.atmo,o=a.night;this.fog.color.copy(a.fogColor),this.fog.density=i.fog*.004*(this.backdrop?yf:1);let s=e.bboxMin,c=e.bboxMax,l=new q((s[0]+c[0])/2,(s[1]+c[1])/2,(s[2]+c[2])/2),u=Math.max(1.6,Math.hypot(c[0]-s[0],c[1]-s[1],c[2]-s[2])/2),d=this.camera.fov*Math.PI/360,f=Math.atan(Math.tan(d)*this.camera.aspect),p=Math.hypot(c[0]-s[0],c[1]-s[1],c[2]-s[2])/2,m=Math.max(.4,Math.min(p+.25,u)),h=Math.min(.35,Math.max(.12,.12+.2*c[1])),g=Math.hypot(c[0]-s[0],c[2]-s[2])/2+h,_=(c[1]-s[1])/2+h,v=this.camera.aspect<1?Math.max(g/Math.sin(f),_/Math.tan(d)+g,m*1.25)*1.1:m/Math.sin(Math.min(d,f))*1.06,y=1.1,b=Math.min(.6,Math.max(.15,c[1]*.6)),x=e=>.8*Math.min(1,Math.max(0,(2.6-e)/1.2)),S=e.nodes.length?Math.max(.03,e.nodes[0].radius??.05):.05;this.groundU.trunk.value.set(e.nodes[0]?.wx??0,e.nodes[0]?.wz??0,S);let C=a.keyDir.clone();if(C.y<.14&&C.setY(.14).normalize(),this.sun.color.copy(a.keyColor),this.sun.intensity=a.keyIntensity,this.sun.shadow.radius=4+4*(1-Math.min(1,Math.max(0,a.sunH)*2))+o,this.sun.position.copy(l).addScaledVector(C,u*4),this.sun.target.position.copy(l),this.sun2.color.copy(a.sun2Color),this.sun2.intensity=a.sun2Intensity,this.sun2.position.copy(l).addScaledVector(a.sun2Dir,u*4),this.sun2.target.position.copy(l),this.groundMat){let e=mf(Yd.phase,this.groundK),t=this.groundBase;this.groundMat.color.setRGB(t.r*e[0],t.g*e[1],t.b*e[2])}if(i.groundTint>0){let e=new J().setHSL(i.groundHue,.55,.4);this.groundU.tint.value.set(e.r,e.g,e.b,Math.min(1,i.groundTint))}else this.groundU.tint.value.w=0;let w=this.sun.shadow.camera,T=C.clone(),E=new q(0,1,0).cross(T);E.lengthSq()<1e-6&&E.set(1,0,0),E.normalize();let D=T.clone().cross(E),O=0,k=0;for(let e=0;e<8;e++){let t=new q(e&1?c[0]:s[0],e&2?c[1]:Math.min(0,s[1]),e&4?c[2]:s[2]).sub(l);O=Math.max(O,Math.abs(t.dot(E))),k=Math.max(k,Math.abs(t.dot(D)))}let A=i.quality!==`High`,j=Math.ceil(u*1.35*2)/2,M=A?Math.ceil((O+.6)*4)/4:j,N=A?Math.ceil((k+.6)*4)/4:j;w.left=-M,w.right=M,w.top=N,w.bottom=-N,w.near=.1,w.far=u*8,w.updateProjectionMatrix(),this.sun.shadow.normalBias=A?.045:.025,this.sun.shadow.bias=A?-6e-4:-3e-4;let P=1-o;this.hemi.color.copy(a.fogColor).lerp(new J(.55,.7,1),.4),this.hemi.groundColor.setRGB(.22,.2,.12).multiplyScalar(.3+.7*P),this.hemi.intensity=.15+.35*P+o*(.09*a.moonLight-.05*(1-a.moonLight)),this.nightFloor=(1-Et.smoothstep(a.sunH,-.16,-.06))*(1-a.moonLight),this.hemi.intensity+=bf*this.nightFloor,this.scene.environmentIntensity=.25+.3*P,this.renderer.toneMappingExposure=i.exposure*(1+1.6*o),this.applyWeather(o);let F=i.quality===`High`?this.post:null;if(F){let e=this.sunUv.copy(this.camera.position).addScaledVector(a.sunDir,1e3).project(this.camera),t=a.sunDir.dot(this.camera.getWorldDirection(new q)),n=1-Math.min(1,Math.max(0,(a.sunH-.05)/.4));F.rays.uniforms.sunUv.value.set(e.x*.5+.5,e.y*.5+.5),F.rays.uniforms.strength.value=i.godRays*Math.max(0,t)*n*+(a.sunH>-.02)*.5,F.rays.uniforms.tint.value.copy(a.keyColor),F.grade.uniforms.time.value=performance.now()/1e3,F.grade.uniforms.vignette.value=.38,F.grade.uniforms.grain.value=.03,F.grade.uniforms.saturation.value=1.04+.1*P}this.manual&&(t.camera.cinema&&!this.prevCinema||t.camera.autoFrame&&!this.prevAutoFrame)&&this.autoCamera(),this.prevCinema=t.camera.cinema,this.prevAutoFrame=t.camera.autoFrame;let I=!this.manual,L=t.camera.cinema&&I&&!this.intro;if(L&&!this.cineOn){let e=this.camera.position.clone().sub(this.controls.target);this.cineYaw=Math.atan2(e.x,e.z),t.camera.autoFrame=!0}if(this.cineOn=L,this.controls.autoRotate=t.camera.autoRotate&&!L&&I&&!this.intro,this.intro&&I){let e=r?1:1-Math.exp(-n*2);this.cineYaw+=n*.025,this.center.lerp(new q(l.x,1.9,l.z),e),this.dist+=(8-this.dist)*e,this.controls.target.copy(this.center),this.camera.position.set(this.center.x+Math.sin(this.cineYaw)*this.dist,this.center.y+.05*this.dist,this.center.z+Math.cos(this.cineYaw)*this.dist)}else if(L){this.cineT+=n;let e=this.cineT;this.cineYaw+=n*(.045+.02*Math.sin(e*.031));let t=Math.max(y,v),i=(.5+.5*Math.sin(e*.021-1.2))**3,a=this.camera.aspect<1?.1:.3,o=Math.max(m*1.35,t*(1.02-a*i+.03*Math.sin(e*.07))),s=.06+.1*(.5+.5*Math.sin(e*.043+.7))+.08*i,c=r?1:1-Math.exp(-n*(o>this.dist?2.5:.8)),u=new q(l.x,Math.max(b,l.y*(.97+.06*i)),l.z);this.center.lerp(u,c),this.dist+=(o-this.dist)*c;let d=Math.cos(s);this.controls.target.copy(this.center),this.camera.position.set(this.center.x+Math.sin(this.cineYaw)*d*this.dist,Math.max(.35+x(this.dist),this.center.y+Math.sin(s)*this.dist-this.center.y*.35),this.center.z+Math.cos(this.cineYaw)*d*this.dist)}else if(t.camera.autoFrame&&I){let e=Math.max(y,v),t=r?1:1-Math.exp(-n*(e>this.dist?2.5:1)),i=new q(l.x,Math.max(b,l.y),l.z);this.center.lerp(i,t),this.dist+=(e-this.dist)*t;let a=this.camera.position.clone().sub(this.controls.target);a.setLength(this.dist),r&&(a.y=this.dist*.08);let o=x(this.dist)-this.center.y;a.y<o&&(a.y=o,a.setLength(this.dist)),this.controls.target.copy(this.center),this.camera.position.copy(this.center).add(a)}if(I&&this.easeT<_f){this.easeT=r?_f:this.easeT+n;let e=Math.min(1,this.easeT/_f),t=e*e*(3-2*e);this.camera.position.lerpVectors(this.easePos,this.camera.position,t),this.controls.target.lerpVectors(this.easeTgt,this.controls.target,t)}this.controls.update(n)}wx={cloud:0,flash:0,clear:0,haze:0};wxCool=new J(.5,.57,.68);wxFog=new J;wxFlash=new J(.72,.82,1);wxGrey=new J(.4,.44,.51);wxFlashGain=1;applyWeather(e){this.wxFlashGain=1/(1+1.6*e);let t=this.wx.cloud,n=this.atmo.sky.material.uniforms,r=this.atmo.skyUniforms,i=this.wx.clear*(1-t),a=this.wx.haze;n.cloudCoverage.value=.35+.6*t-.27*i,n.cloudDensity.value=.35+.6*t-.17*i;let o=this.fog.color;if(a>0){let e=(o.r*.3+o.g*.59+o.b*.11)*1.08;this.wxFog.setRGB(e,e,e*1.04),o.lerp(this.wxFog,.7*a),r.fogCol.value.copy(o),this.fog.density*=1+7*a,this.sun.intensity*=1-.3*a;let t=r.skyTint.value,n=Math.max(t,.45*a);n>0&&r.skyTintCol.value.lerp(this.wxFog.setRGB(.62,.65,.69),1-t/n),r.skyTint.value=n}if(t<=0)return;let s=o.r*.3+o.g*.59+o.b*.11;this.wxFog.copy(this.wxCool).multiplyScalar(s*(.4+.4*e)/.57),o.lerp(this.wxFog,.85*t),r.fogCol.value.copy(o),r.skyGain.value*=1-.72*t;let c=r.skyTint.value,l=Math.max(c,.9*t);l>0&&r.skyTintCol.value.lerp(this.wxGrey,1-c/l),r.skyTint.value=l;let u=this.atmo.stars,d=u.material;d.opacity*=1-t,u.visible=d.opacity>.01,r.disc1Col.value.multiplyScalar(1-t),r.disc2Col.value.multiplyScalar(1-t),this.fog.density*=1+1.2*t,this.sun.intensity*=1-.78*t,this.sun.color.lerp(this.wxCool,.7*t),this.hemi.color.lerp(this.wxCool,.75*t),this.hemi.groundColor.multiplyScalar(1-.35*t),this.hemi.intensity*=1-.3*t,this.scene.environmentIntensity*=1-.55*t}applyFlash(){let e=this.wx.flash;if(e<=0)return;let t=this.atmo.skyUniforms,n=this.wxFlashGain;this.sun.intensity+=2.2*e*n,this.sun.color.lerp(this.wxFlash,.85*e),this.hemi.intensity+=1.1*e*n,this.hemi.color.lerp(this.wxFlash,.85*e),this.hemi.groundColor.lerp(this.wxFlash,.35*e),t.skyGain.value=t.skyGain.value*(1+1.5*e)+.12*e*n,this.fog.color.lerp(this.wxFlash,.2*e).multiplyScalar(1+.5*e).addScalar(.1*e*n),t.fogCol.value.copy(this.fog.color),this.scene.environmentIntensity*=1+.6*e}render(e){this.contextLost||(this.applyQuality(e.sky.quality),this.adaptDpr(performance.now()),e.sky.quality===`High`?this.post.composer.render():this.renderer.render(this.scene,this.camera))}};function Sf(e){let t=document.getElementById(`notice`);t||(t=document.createElement(`div`),t.id=`notice`,t.style.cssText=`position:fixed;left:50%;top:16px;transform:translateX(-50%);max-width:80vw;padding:8px 14px;border-radius:6px;background:#000b;color:#fff;font:13px/1.4 ui-sans-serif,system-ui,sans-serif;z-index:10;pointer-events:none`,document.body.appendChild(t)),t.textContent=e}var Cf=.35,wf=class e{mesh;geo=new kr;pos=new Float32Array;nrm=new Float32Array;uv=new Float32Array;idx=new Uint32Array;rest=new Float32Array;vNode=new Int32Array;vUsed=0;lastTopology=-1;ringCache=new Map;constructor(e){let t=e instanceof Fr?e:new Wi({map:e.map,normalMap:e.normalMap,normalScale:new K(1.4,1.4),roughnessMap:e.roughnessMap,roughness:1,metalness:0});this.mesh=new $r(this.geo,t),this.mesh.castShadow=!0,this.mesh.receiveShadow=!0,this.mesh.frustumCulled=!1}ring(e){let t=this.ringCache.get(e);if(!t){let n=new Float32Array(e+1),r=new Float32Array(e+1);for(let t=0;t<=e;t++)n[t]=Math.cos(t/e*Math.PI*2),r[t]=Math.sin(t/e*Math.PI*2);this.ringCache.set(e,t={c:n,s:r})}return t}static radial(e,t){return t>.08?16:t>.03?10:e<=2||t>.012?7:5}update(t,n=1,r=null){let i=t.nodes,a=t.chains,o=0,s=0,c=a.length,l=Array(a.length);for(let t=0;t<a.length;t++){let n=a[t],r=n.nodes.length;if(r<2||n.pruned){l[t]=0;continue}let u=e.radial(n.order,i[n.nodes[1]].radius);l[t]=u,c=c*31+u*r|0;let d=r+1;o+=d*(u+1),s+=(d-1)*u*6}let u=!1;if(o*3>this.pos.length){let e=Math.max(1024,o*2);this.pos=new Float32Array(e*3),this.nrm=new Float32Array(e*3),this.uv=new Float32Array(e*2),this.rest=new Float32Array(e*3),this.vNode=new Int32Array(e),u=!0}s>this.idx.length&&(this.idx=new Uint32Array(Math.max(4096,s*2)),u=!0),u&&(wl.log(`branch_realloc`,{verts:o,idx:s,vCap:this.pos.length/3,iCap:this.idx.length}),this.geo.dispose(),this.geo.setAttribute(`position`,new mr(this.pos,3).setUsage(Re)),this.geo.setAttribute(`normal`,new mr(this.nrm,3).setUsage(Re)),this.geo.setAttribute(`uv`,new mr(this.uv,2).setUsage(Re)),this.geo.setIndex(new mr(this.idx,1).setUsage(Re)),this.lastTopology=-1);let d=c!==this.lastTopology,f=this.pos,p=this.nrm,m=this.uv,h=this.idx,g=this.vNode,_=0,v=0,y=0,b=0,x=0;for(let e=0;e<a.length;e++){let t=l[e];if(!t)continue;let o=a[e].nodes,s=o.length,{c,s:u}=this.ring(t),S=i[o[1]].radius,C=Math.max(1,Math.round(Math.PI*2*S/.12)),w=1/(Cf*Math.max(.3,Math.min(2,S/.05+.3))),T=0,E=_,D=0,O=0,k=0;for(let a=0;a<=s;a++){let l=Math.min(a,s-1),d=i[o[l]],h=d.wx,v=d.wy,S=d.wz,E=a===0?i[o[1]].radius:d.radius,A=o[Math.max(0,l-1)],j=o[Math.min(s-1,l+1)],M=i[A],N=i[j],P=N.wx-M.wx,F=N.wy-M.wy,I=N.wz-M.wz;if(r){let e=o[l]*3,t=A*3,n=j*3;h+=r[e],v+=r[e+1],S+=r[e+2],P+=r[n]-r[t],F+=r[n+1]-r[t+1],I+=r[n+2]-r[t+2]}let L=Math.hypot(P,F,I);L<1e-7&&(P=d.wdx,F=d.wdy,I=d.wdz,L=1),P/=L,F/=L,I/=L;let R=0;if(e===0&&n>0){let e=n*Math.exp(-Math.max(0,v)/Math.max(.15,E*3));E*=1+.9*e,R=.22*e}a===s&&(h+=P*E*1.5,v+=F*E*1.5,S+=I*E*1.5,E=0),a===0?Math.abs(F)<.9?(y=-I,b=0,x=P):(y=1,b=0,x=0):T+=Math.hypot(h-D,v-O,S-k);let ee=y*P+b*F+x*I;y-=P*ee,b-=F*ee,x-=I*ee;let te=Math.hypot(y,b,x);te<1e-6&&(Math.abs(F)<.9?(y=-I,b=0,x=P):(y=1,b=0,x=0),te=Math.hypot(y,b,x)),y/=te,b/=te,x/=te;let ne=F*x-I*b,z=I*y-P*x,B=P*b-F*y;D=h,O=v,k=S;let V=T*w;for(let e=0;e<=t;e++){let n=c[e]*y+u[e]*ne,r=c[e]*b+u[e]*z,i=c[e]*x+u[e]*B,a=_*3,s=R>0?E*(1+R*Math.cos(e/t*Math.PI*10)):E;f[a]=h+n*s,f[a+1]=v+r*s,f[a+2]=S+i*s,p[a]=n,p[a+1]=r,p[a+2]=i,m[_*2]=e/t*C,m[_*2+1]=V,g[_]=o[l],_++}}if(d){let e=s+1;for(let n=0;n<e-1;n++){let e=E+n*(t+1),r=e+t+1;for(let n=0;n<t;n++)h[v++]=e+n,h[v++]=r+n,h[v++]=e+n+1,h[v++]=e+n+1,h[v++]=r+n,h[v++]=r+n+1}}}this.vUsed=r?0:_,r||this.rest.set(f.subarray(0,_*3));let S=this.geo;S.attributes.position.needsUpdate=!0,S.attributes.normal.needsUpdate=!0,S.attributes.uv.needsUpdate=!0,d&&(S.index.clearUpdateRanges(),S.index.addUpdateRange(0,v),S.index.needsUpdate=!0,this.lastTopology=c),S.attributes.position.clearUpdateRanges(),S.attributes.position.addUpdateRange(0,_*3),S.attributes.normal.clearUpdateRanges(),S.attributes.normal.addUpdateRange(0,_*3),S.attributes.uv.clearUpdateRanges(),S.attributes.uv.addUpdateRange(0,_*2),S.setDrawRange(0,s)}applyOffsets(e){let t=this.vUsed;if(t===0)return!1;let n=this.pos,r=this.rest,i=this.vNode;for(let a=0,o=0;a<t;a++,o+=3){let t=i[a]*3;n[o]=r[o]+e[t],n[o+1]=r[o+1]+e[t+1],n[o+2]=r[o+2]+e[t+2]}let a=this.geo.attributes.position;return a.clearUpdateRanges(),a.addUpdateRange(0,t*3),a.needsUpdate=!0,!0}};function Tf(){let e=new Ni(.6,1,2,4);e.translate(0,.62,0);let t=e.attributes.position;for(let e=0;e<t.count;e++){let n=t.getX(e),r=t.getY(e);t.setZ(e,n*n*.6-r*r*.18)}return e.computeVertexNormals(),e}function Ef(e=!1){let t=Tf().toNonIndexed(),n=t.attributes.position.array,r=t.attributes.normal.array,i=t.attributes.uv.array,a=n.length/3,o=new Float32Array(a*6),s=new Float32Array(a*6),c=new Float32Array(a*4);o.set(n),s.set(r),c.set(i);for(let e=0;e<a;e+=3)for(let t=0;t<3;t++){let l=e+[0,2,1][t],u=a+e+t;for(let e=0;e<3;e++)o[u*3+e]=n[l*3+e],s[u*3+e]=-r[l*3+e];c[u*2]=i[l*2],c[u*2+1]=i[l*2+1]}let l=new kr;if(l.setAttribute(`position`,new mr(o,3)),l.setAttribute(`normal`,new mr(s,3)),l.setAttribute(`uv`,new mr(c,2)),e){let e=new Float32Array(a*6);for(let t=0;t<2*a;t++){let n=(.85+.25*c[t*2+1])*(t<a?1:.85);e[t*3]=n,e[t*3+1]=n,e[t*3+2]=n*.96}l.setAttribute(`color`,new mr(e,3))}return t.dispose(),l}function Df(e,t=!1){let n=e.image,r=n.width,i=n.getContext(`2d`).getImageData(0,0,r,r).data,a=0,o=0,s=0,l=0;for(let e=0;e<i.length;e+=4)i[e+3]>=128&&(a+=i[e],o+=i[e+1],s+=i[e+2],l++);let d=[a/l,o/l,s/l],f=new Float32Array(r*r*4);for(let e=0;e<r*r;e++){let t=i[e*4+3]/255;for(let n=0;n<3;n++)f[e*4+n]=t>=.5?i[e*4+n]:d[n];f[e*4+3]=+(t>=.5)}let p=l/(r*r),m=e=>{let n=.5;if(t&&e.length<r*r*4&&e.length>=16){let t=new Float32Array(e.length/4);for(let n=0;n<t.length;n++)t[n]=e[n*4+3];t.sort(),n=Math.min(.5,Math.max(.1,t[Math.max(0,Math.min(t.length-1,Math.round(t.length*(1-p))))]))}let i=new Uint8Array(e.length);for(let t=0;t<e.length;t+=4)i[t]=e[t],i[t+1]=e[t+1],i[t+2]=e[t+2],i[t+3]=e[t+3]>=n?255:0;return i},h=[{data:m(f),width:r,height:r}];for(let e=r>>1;e>=1;e>>=1){let t=f,n=e*2;f=new Float32Array(e*e*4);for(let r=0;r<e;r++)for(let i=0;i<e;i++)for(let a=0;a<4;a++){let o=(e,r)=>t[(r*n+e)*4+a];f[(r*e+i)*4+a]=(o(2*i,2*r)+o(2*i+1,2*r)+o(2*i,2*r+1)+o(2*i+1,2*r+1))/4}h.push({data:m(f),width:e,height:e})}let g=new ni(h[0].data,r,r,E);return g.mipmaps=h,g.generateMipmaps=!1,g.minFilter=u,g.magFilter=c,g.flipY=e.flipY,g.colorSpace=e.colorSpace,g.anisotropy=1,g.needsUpdate=!0,g}function Of(e,t){let n=[0,.2,.45,.72,1],r=[0,.27,.3,.2,0],i=.12,a=(e,t)=>[e,i+t,Math.abs(e)*.38-t*t*.18],o=(e,t)=>(e===0?1.12:.92)*(.82+.18*Math.min(1,t*2.2)),s=[],c=[],l=(e,t,n)=>{for(let[r,i]of[e,t,n]){s.push(...a(r,i));let e=o(r,i);c.push(e,e,e*.96)}};for(let e of[1,-1])for(let t=0;t<n.length-1;t++){let i=[0,n[t]],a=[0,n[t+1]],o=[e*r[t],n[t]],s=[e*r[t+1],n[t+1]],c=(t,n,r)=>e>0?l(t,n,r):l(t,r,n);r[t]>0&&c(i,o,s),r[t+1]>0&&c(i,s,a)}let u=new kr;u.setAttribute(`position`,new _r(s,3)),u.computeVertexNormals();let d=u.attributes.position.array,f=u.attributes.normal.array,p=d.length/3,m=new Float32Array(p*6),h=new Float32Array(p*6),g=new Float32Array(p*6),_=new Float32Array(p*4);m.set(d),h.set(f),g.set(c);for(let e=0;e<p;e++)_[e*2]=d[e*3]+.5,_[e*2+1]=d[e*3+1]-i;for(let e=0;e<p;e+=3)for(let t=0;t<3;t++){let n=e+[0,2,1][t],r=p+e+t;for(let e=0;e<3;e++)m[r*3+e]=d[n*3+e],h[r*3+e]=-f[n*3+e],g[r*3+e]=c[n*3+e]*.85;_[r*2]=_[n*2],_[r*2+1]=_[n*2+1]}let v=new kr;return v.setAttribute(`position`,new mr(m,3)),v.setAttribute(`normal`,new mr(h,3)),t&&v.setAttribute(`color`,new mr(g,3)),e&&v.setAttribute(`uv`,new mr(_,2)),u.dispose(),v}var kf=[{name:`V0 quad+leafmap+alphaTest`,geo:`quad`,map:`leaf`,vertexColors:!1,emissive:!1},{name:`V1 V0+emissive`,geo:`quad`,map:`leaf`,vertexColors:!1,emissive:!0},{name:`V2 V0+vertexColors`,geo:`quad`,map:`leaf`,vertexColors:!0,emissive:!1},{name:`V3 poly+uv+whitemap+alphaTest`,geo:`poly`,map:`white`,vertexColors:!1,emissive:!1},{name:`V4 poly+vertexColors+emissive, no map`,geo:`poly`,map:null,vertexColors:!0,emissive:!0}],Af=typeof location<`u`&&new URLSearchParams(location.search).get(`leafmap`)===`raw`,jf=3.5,Mf=1,Nf=12,Pf={len:1,wid:1,swing:1};function Ff(e,t=jf){let n=Pf,r=e/t;return r>=1?(n.len=n.wid=n.swing=1,n):r<=0?(n.len=0,n.wid=.3,n.swing=.1,n):(n.len=.5*r*(2-r)+.5*r*r*(3-2*r),n.wid=.35+.65*Zf(.1,.85,r),n.swing=.1+.9*Zf(.1,.85,r),n)}var If=11,Lf=.0015,Rf=2e-4,zf=class{mesh;material;gbufferMaterial=null;mode;variant=null;uniforms={uTime:{value:0},uWind:{value:1},uSunDirV:{value:new q(0,1,0)},uSunCol:{value:new J(1,1,1)},uGlow:{value:new J(0,0,0)}};capacity=0;lit={cam:new q(0,2,8),sun:new q(0,1,0),sunCol:new J(1,1,1),sky:new J(.5,.6,.8),ground:new J(.1,.1,.05)};nightGrade=0;nightFloor=0;mapMean=new J(.7,.78,.6);sunT=null;sunTKey=``;maxInstances=0;rankScale=1;m=new Zt;passOpen=!1;passLi=0;passEnd=0;passN=0;passCand=0;passTime=0;passRs=1;passT=null;backC=new Float32Array;scratch=new Float32Array(16);scratch2=new Float32Array(16);poseAge=-1;followAt=0;backD=new Float32Array;backNode=new Int32Array;frontD=new Float32Array;frontNode=new Int32Array;nodeRef=new Float32Array;nodeMoved=new Uint8Array;lodPhase=NaN;passPhase=0;passSpring=-1e9;passSeasonOn=!1;passFs=tf(`oak`);drops={n:0,m:new Float32Array(768),c:new Float32Array(144)};dropChance=0;lodX=0;lodY=0;lodZ=0;lodH=0;lodShape=NaN;lodFade=NaN;lodForm=``;formId=`oak`;formKx=1;formKy=1;srcMap;followPlaced=0;followOk=!1;followMs=0;followMaxMs=0;follows=0;passes=0;passMs=0;passAcc=0;lastN=0;col=new J;pos=new q;constructor(e,t={shader:`full`,shadow:!0},n=1024){this.mode=t,this.srcMap=e;let r=e.userData.form;if(r&&(this.formId=r.id,this.formKx=r.kx,this.formKy=r.ky),this.mapMean.copy(Qf(e)),t.shader!==`full`){let i=this.variant=kf[t.variant??0]??kf[0],a=null;i.map===`leaf`?(a=Af?e:Df(e,!!r?.preserve),Af&&(e.anisotropy=1,e.generateMipmaps=!0,e.minFilter=u)):i.map===`white`&&(a=new ni(new Uint8Array([255,255,255,255]),1,1),a.needsUpdate=!0);let o={side:0};a&&(o.map=a,o.alphaTest=.5),i.vertexColors&&(o.vertexColors=!0),this.material=t.shader===`basic`?new Vr(o):new Ki(i.emissive?{...o,emissive:new J(.05,.075,.025)}:o),this.mesh=this.makeMesh(n);return}let i=new Wi({map:e,alphaTest:.5,side:2,roughness:.62,metalness:0,envMapIntensity:.3});this.material=i;let a=this.uniforms;i.onBeforeCompile=e=>{e.uniforms.uTime=a.uTime,e.uniforms.uWind=a.uWind,e.uniforms.uSunDirV=a.uSunDirV,e.uniforms.uSunCol=a.uSunCol,e.uniforms.uGlow=a.uGlow,e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform vec3 uSunDirV;
uniform vec3 uSunCol;
uniform vec3 uGlow;`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
          {
            // Bioluminescence: glowing veins along the midrib and brighter rims toward the tip.
            float mid = 1.0 - smoothstep(0.0, 0.16, abs(vMapUv.x - 0.5));
            float tip = smoothstep(0.35, 1.0, vMapUv.y);
            totalEmissiveRadiance += uGlow * (0.25 + 0.9 * mid + 0.6 * tip);
          }`).replace(`#include <lights_fragment_end>`,`#include <lights_fragment_end>
          {
            // Leaf translucency: light through the blade from behind, strongest looking into the sun.
            vec3 Vd = normalize(vViewPosition);
            float back = max(0.0, -dot(normal, uSunDirV));
            float into = pow(max(0.0, dot(-Vd, uSunDirV)), 5.0);
            vec3 tcol = diffuseColor.rgb * vec3(1.15, 1.2, 0.55);
            reflectedLight.indirectDiffuse += tcol * uSunCol * (0.45 * back + 1.6 * into);
          }`),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
uniform float uTime;
uniform float uWind;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
          vec3 ip = vec3(instanceMatrix[3]);
          float ph = dot(ip, vec3(1.7, 0.9, 1.3));
          float sway = uWind * position.y;
          transformed.z += sin(uTime * 2.3 + ph) * 0.12 * sway;
          transformed.x += sin(uTime * 1.7 + ph * 1.3) * 0.06 * sway;`)};let o=new Gi({side:2,blending:0});o.allowOverride=!1,o.onBeforeCompile=t=>{t.uniforms.leafMap={value:e},t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec2 vLeafUv;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
vLeafUv = uv;`),t.fragmentShader=t.fragmentShader.replace(`void main() {`,`uniform sampler2D leafMap;
varying vec2 vLeafUv;
void main() {`).replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>
if (texture2D(leafMap, vLeafUv).a < 0.5) discard;`)},this.gbufferMaterial=o,this.mesh=this.makeMesh(n)}makeMesh(e){let t=this.variant,n=new di(this.mesh?this.mesh.geometry:t?t.geo===`quad`?Ef(t.vertexColors):Of(t.map!==null,t.vertexColors):Tf(),this.material,e);n.instanceMatrix.setUsage(Re),n.instanceColor=new ri(new Float32Array(e*3),3).setUsage(Re);let r=this.mesh;if(n.castShadow=this.mode.shadow,n.receiveShadow=this.mode.shadow,n.frustumCulled=!1,this.gbufferMaterial&&(n.userData.gbufferMaterial=this.gbufferMaterial),n.count=0,r&&(n.instanceMatrix.array.set(r.instanceMatrix.array),n.instanceColor.array.set(r.instanceColor.array),n.count=r.count),this.capacity=e,this.restT.length<e*3){let t=new Float32Array(e*3);t.set(this.restT),this.restT=t}if(this.backC.length<e*3){this.backC=new Float32Array(e*3),this.backD=new Float32Array(e*If),this.backNode=new Int32Array(e);let t=new Float32Array(e*If),n=new Int32Array(e);t.set(this.frontD),n.set(this.frontNode),this.frontD=t,this.frontNode=n}return n}setForm(e){let t=e.userData.form;t&&(this.formId=t.id,this.formKx=t.kx,this.formKy=t.ky);let n=this.material.map;if(!this.variant||this.variant.map===`leaf`&&Af)this.srcMap.image=e.image,this.srcMap.needsUpdate=!0;else if(this.variant.map===`leaf`&&n){let r=Df(e,!!t?.preserve),i=n.mipmaps,a=r.mipmaps;for(let e=0;e<i.length&&e<a.length;e++)i[e].data.set(a[e].data);n.needsUpdate=!0,r.dispose()}else{e.dispose();return}this.mapMean.copy(Qf(e)),e.dispose()}tick(e){this.uniforms.uTime.value=e}setSun(e,t,n,r){this.uniforms.uSunDirV.value.copy(e).transformDirection(r),this.uniforms.uSunCol.value.copy(t).multiplyScalar(n*.35)}setLighting(e,t,n,r,i){let a=this.lit;a.cam.copy(e),a.sun.copy(t).normalize(),a.sunCol.copy(n),a.sky.copy(r),a.ground.copy(i)}sunTransmittance(e){let t=e.lightGrid;if(!t)return null;let n=this.lit.sun,r=`${e.lightVersion}|${n.x.toFixed(2)},${n.y.toFixed(2)},${n.z.toFixed(2)}`;if(r===this.sunTKey&&this.sunT)return this.sunT;this.sunTKey=r;let{dens:i,nx:a,ny:o,nz:s}=t,c=this.sunT&&this.sunT.length===i.length?this.sunT:new Float32Array(i.length),l=n.x,u=Math.max(.05,n.y),d=n.z;for(let e=0;e<o;e++)for(let t=0;t<s;t++)for(let n=0;n<a;n++){let r=(e*s+t)*a+n,f=i[r]*.5,p=n+.5,m=e+.5,h=t+.5;for(let e=0;e<64;e++){p+=l,m+=u,h+=d;let e=Math.floor(p),t=Math.floor(m),n=Math.floor(h);if(e<0||t<0||n<0||e>=a||t>=o||n>=s)break;f+=i[(t*s+n)*a+e]}c[r]=Math.exp(-.05*f)}return this.sunT=c}setGlow(e,t=1){this.uniforms.uGlow.value.copy(e);let n=this.material;n.isMeshLambertMaterial&&this.variant?.emissive&&n.emissive.setRGB(.05*t,.075*t,.022*t).add(e)}update(e,t,n){let r=this.beginPass(e,n);return this.stepPass(e,t,1/0),r}beginPass(e,t){this.uniforms.uTime.value=t;let n=null;if(this.lastN>this.capacity*.9&&e.leaves.length*2>this.capacity&&(this.maxInstances<=0||this.capacity<this.maxInstances)){let t=this.mesh;this.mesh=this.makeMesh(Math.max(e.leaves.length*3,this.capacity*2)),t.dispose(),n=this.mesh}if(this.passT=this.variant?this.sunTransmittance(e):null,this.passLi=0,this.passEnd=e.leaves.length,this.passN=0,this.passCand=0,this.passTime=e.time,this.passRs=this.rankScale,this.passPhase=Yd.phase,this.passSpring=Yd.springTime,this.passSeasonOn=Yd.active,this.passFs=tf(this.formId),this.passAcc=0,this.passOpen=!0,e.leaves.length<this.emergeN&&this.emerge.fill(-1),this.emergeN=e.leaves.length,this.emerge.length<this.emergeN){let e=new Float32Array(Math.max(4096,this.emergeN*2)).fill(-1);e.set(this.emerge),this.emerge=e}return this.passPend=!1,n}abortPass(){this.passOpen=!1,this.followOk=!1,this.emerge.fill(-1),this.emergeN=0}emerge=new Float32Array;emergeN=0;passPend=!1;place(e,t,n,r,i,a,o,s,c,l,u,d=null){let f=i.nodes,p=a.leaves,m=i.time,h=this.mesh&&l===this.mesh.instanceMatrix.array?this.restT:null,g=0,_=!0,v=Yd.active,y=Yd.phase,b=Yd.springTime,x=this.drops,S=h&&d!==null&&!Yd.jumped?this.dropChance:0,C=Math.max(2,i.bboxMax[1]),w=p.shape,T=(w>=0?1-.7*w:1-.6*w)*this.formKx,E=(w>=0?1+.9*w:1+.15*w)*this.formKy,D=p.maxBranchRadius*.7,O=p.maxBranchRadius,k=.9*C,A=2.6*C,j=-1,M=!1,N=0,P=1,F=0,I=1,L=0,R=0,ee=0,te=0,ne=0,z=0,B=0,V=0,re=0,ie=0,H=0,ae=1;for(let i=n;i<r;i++,u+=16){let n=t[i];if(n!==j){j=n;let e=f[n],t=e&&f[e.parent];if(M=!!t,_=d===null||d[n]===1,t){if(N=e.wdx,P=e.wdy,F=e.wdz,H=e.radius,Math.abs(P)<.9){let e=Math.hypot(F,N)||1;I=-F/e,L=N/e}else I=1,L=0;R=P*L,ee=F*I-N*L,te=-P*I,ne=t.wx,z=t.wy,B=t.wz,V=e.wx-ne,re=e.wy-z,ie=e.wz-B,ae=1-Zf(D,O,H)}}if(!M)continue;let r=i*If;if(!_&&m-e[r+8]>4.5&&!(v&&(y>=e[r+10]&&y<e[r+10]+.012||y>e[r+9]&&y<e[r+9]+.05+.012)))continue;g++;let a=v?of(y,e[r+9],e[r+10],e[r+8]>b||e[r+8]<0&&e[r+8]>=-2&&b>-1e8):1;if(a===0){if(S>0&&y>=e[r+10]&&x.n<48&&l[u+4]*l[u+4]+l[u+5]*l[u+5]+l[u+6]*l[u+6]>1e-8&&Math.random()<S){let e=x.n++,t=this.mesh.instanceColor.array;for(let t=0;t<16;t++)x.m[e*16+t]=l[u+t];x.c[e*3]=t[i*3],x.c[e*3+1]=t[i*3+1],x.c[e*3+2]=t[i*3+2]}for(let e=0;e<12;e++)l[u+e]=0;if(l[u+15]=1,h){let e=i*3;h[e]=l[u+12],h[e+1]=l[u+13],h[e+2]=l[u+14]}continue}let p=e[r],C=e[r+1],w=e[r+2],oe=e[r+3],se=e[r+4],ce=e[r+5],le=e[r+6],ue=I*C+R*w,de=ee*w,fe=L*C+te*w,pe=ne+V*p+ue*H,me=z+re*p+de*H,he=B+ie*p+fe*H,ge=ue*oe+N*se,_e=de*oe+P*se-.25,ve=fe*oe+F*se,ye=1/(Math.sqrt(ge*ge+_e*_e+ve*ve)||1);ge*=ye,_e*=ye,ve*=ye;let be=this.poseAge>=0?this.poseAge:m-e[r+8],xe=1,Se=1;if(be<jf){let e=Ff(be),t=e.swing;xe=e.len,Se=e.wid*xe,ge=N+(ge-N)*t,_e=P+(_e-P)*t,ve=F+(ve-F)*t,ye=1/(Math.sqrt(ge*ge+_e*_e+ve*ve)||1),ge*=ye,_e*=ye,ve*=ye}let Ce=ve,we=-ge,Te=Ce*Ce+we*we;Te<1e-6?(Ce=1,we=0):(ye=1/Math.sqrt(Te),Ce*=ye,we*=ye);let Ee=-we*_e,U=we*ge-Ce*ve,De=Ce*_e;ye=1/(Math.sqrt(Ee*Ee+U*U+De*De)||1),Ee*=ye,U*=ye,De*=ye;let Oe=Ce*ce-Ee*le,ke=-U*le,W=we*ce-De*le,Ae=Ce*le+Ee*ce,G=U*ce,je=we*le+De*ce,Me=pe-o,Ne=me-s,Pe=he-c,Fe=e[r+7]*a*ae*(1+.5*Zf(k,A,Math.sqrt(Me*Me+Ne*Ne+Pe*Pe))),Ie=Fe*T*Se,Le=Fe*E*xe,Re=Fe*xe;if(l[u]=Oe*Ie,l[u+1]=ke*Ie,l[u+2]=W*Ie,l[u+3]=0,l[u+4]=ge*Le,l[u+5]=_e*Le,l[u+6]=ve*Le,l[u+7]=0,l[u+8]=Ae*Re,l[u+9]=G*Re,l[u+10]=je*Re,l[u+11]=0,l[u+12]=pe,l[u+13]=me,l[u+14]=he,l[u+15]=1,h){let e=i*3;h[e]=pe,h[e+1]=me,h[e+2]=he}}return g}restT=new Float32Array;sway(e,t){let n=this.followOk?this.mesh.count:0;if(n===0)return;let r=this.mesh.instanceMatrix,i=r.array,a=this.restT,o=this.frontNode,s=this.frontD,c=e.length/3;for(let r=0,l=12,u=0;r<n;r++,l+=16,u+=3){let n=o[r];if(n<0||n>=c)continue;let d=n*3,f=t[n]*3,p=s[r*If];f<0||(i[l]=a[u]+e[f]+(e[d]-e[f])*p,i[l+1]=a[u+1]+e[f+1]+(e[d+1]-e[f+1])*p,i[l+2]=a[u+2]+e[f+2]+(e[d+2]-e[f+2])*p)}r.clearUpdateRanges(),r.addUpdateRange(0,n*16),r.needsUpdate=!0}takeInstances(e){let t=this.followOk?this.mesh.count:0,n=this.frontNode,r=e.length,i=0;for(let a=0;a<t;a++){let t=n[a];t>=0&&t<r&&e[t]&&i++}let a=new Float32Array(i*16),o=new Float32Array(i*3);if(i===0)return{n:0,matrices:a,colours:o};let s=this.mesh.instanceMatrix,c=s.array,l=this.mesh.instanceColor.array,u=-1,d=-1;i=0;for(let f=0;f<t;f++){let t=n[f];if(t<0||t>=r||!e[t])continue;let p=f*16;for(let e=0;e<16;e++)a[i*16+e]=c[p+e],c[p+e]=0;a[i*16+12]=this.restT[f*3],a[i*16+13]=this.restT[f*3+1],a[i*16+14]=this.restT[f*3+2],o[i*3]=l[f*3],o[i*3+1]=l[f*3+1],o[i*3+2]=l[f*3+2],n[f]=-1,i++,u<0?u=f:f-d>256&&(s.addUpdateRange(u*16,(d-u+1)*16),u=f),d=f}return s.addUpdateRange(u*16,(d-u+1)*16),s.needsUpdate=!0,{n:i,matrices:a,colours:o}}sampleInstance(e,t,n){let r=this.mesh.count;if(r<=0)return!1;let i=Math.min(r-1,Math.floor(e*r)),a=this.mesh.instanceMatrix.array,o=i*16;if(a[o]*a[o]+a[o+1]*a[o+1]+a[o+2]*a[o+2]<1e-8)return!1;for(let e=0;e<16;e++)t[e]=a[o+e];let s=this.mesh.instanceColor.array;return n[0]=s[i*3],n[1]=s[i*3+1],n[2]=s[i*3+2],!0}markMoved(e){let t=e.nodes,n=t.length;if(this.nodeMoved.length<n){let e=Math.ceil(n*1.5)+256,t=new Float32Array(e*10).fill(NaN);t.set(this.nodeRef),this.nodeRef=t,this.nodeMoved=new Uint8Array(e)}let r=this.nodeRef,i=this.nodeMoved,a=Lf,o=Math.abs;for(let e=0,s=0;e<n;e++,s+=10){let n=t[e],c=t[n.parent];c?o(r[s]-n.wx)<a&&o(r[s+1]-n.wy)<a&&o(r[s+2]-n.wz)<a&&o(r[s+3]-c.wx)<a&&o(r[s+4]-c.wy)<a&&o(r[s+5]-c.wz)<a&&o(r[s+6]-n.wdx)<.01&&o(r[s+7]-n.wdy)<.01&&o(r[s+8]-n.wdz)<.01&&o(r[s+9]-n.radius)<Rf?i[e]=0:(i[e]=1,r[s]=n.wx,r[s+1]=n.wy,r[s+2]=n.wz,r[s+3]=c.wx,r[s+4]=c.wy,r[s+5]=c.wz,r[s+6]=n.wdx,r[s+7]=n.wdy,r[s+8]=n.wdz,r[s+9]=n.radius):i[e]=0}}follow(e,t,n,r=1/0,i=0){let a=this.mesh.count;if(!this.followOk||a===0)return!1;let o=performance.now(),s=this.mesh.instanceMatrix,c=s.array;s.clearUpdateRanges();let l=0;if(r===1/0)i<a&&(l=this.place(this.frontD,this.frontNode,i,a,e,t,n.x,n.y,n.z,c,i*16),s.addUpdateRange(i*16,(a-i)*16)),i===0&&(this.lodX=n.x,this.lodY=n.y,this.lodZ=n.z,this.lodH=Math.max(2,e.bboxMax[1]),this.lodShape=t.leaves.shape,this.lodFade=t.leaves.maxBranchRadius,this.lodForm=this.formId,this.lodPhase=Yd.active?Yd.phase:-1);else{let i=this.followAt>=a?0:this.followAt,u=a;for(;u>0;){i===0&&this.markMoved(e);let d=Math.min(a,i+1024),f=this.place(this.frontD,this.frontNode,i,d,e,t,n.x,n.y,n.z,c,i*16,this.nodeMoved);if(f>0&&(s.addUpdateRange(i*16,(d-i)*16),l+=f),u-=d-i,i=d>=a?0:d,performance.now()-o>=r)break}this.followAt=i}return l>0&&(s.needsUpdate=!0),this.followPlaced=l,this.followMs=performance.now()-o,this.followMs>this.followMaxMs&&(this.followMaxMs=this.followMs),this.follows++,!0}stepPass(e,t,n,r=this.lit.cam){if(!this.passOpen)return!1;let i=performance.now(),a=t.leaves,o=e.nodes,s=this.backC,c=this.backD,l=this.backNode,u=this.scratch,d=this.emerge,f=n===1/0,p=!!this.variant,m=this.passT,h=e.lightGrid,g=this.lit,_=g.sun,v=this.mapMean,y=this.passRs,b=this.passTime,x=this.passSeasonOn,S=this.passPhase,C=this.passFs,w=Math.max(2,e.bboxMax[1]),T=this.passN,E=this.passCand,D=this.capacity,O=g.cam.x,k=g.cam.y,A=g.cam.z,j=Math.min(this.passEnd,e.leaves.length),M=this.passLi,N=M;for(;M<j&&!((M&255)==255&&performance.now()-i>=n);M++){let n=e.leaves[M];if(n.rank*4>=a.density)continue;let r=o[n.node];if(!r||e.chains[r.chain].pruned||r.wdy<-.75)continue;Bf=M*2246822519+n.node*3266489917+374761393>>>0;let i=Zf(.06,.4,r.light),j=Vf()<.85*i?2:1;for(let i=0;i<j;i++){let o=i===0?n.rank:(n.rank+Vf())%1;if(E++,o*4>=a.density*y||T>=D)continue;let j=1-Zf(a.maxBranchRadius*.7,a.maxBranchRadius,r.radius),N=a.size*n.size*(i===0?1:.8+.25*Vf());if(N*j<1e-4)continue;let P=-1,F=2,I=2,L=0,R=0,ee=!0;if(x&&(C.drop||C.pal)){let e=M*2+i;if(L=Hf(e*3+1),R=Hf(e*3+2),I=rf(Math.min(1,.5*Zf(.05,.4,r.light)+.5*Math.min(1,Math.max(0,(r.wy/w-.3)/.6))),L),C.drop&&(ee=n.born>this.passSpring,P=nf(Hf(e*3)),F=af(I,R),S>=F||!ee&&S<P-.012))continue}let te=i===0?n.t:.45+.55*Vf(),ne=d[M];ne<0&&(f||b-n.born>Nf?ne=d[M]=n.born:(d[M]=-2,this.passPend=!0));let z=Mf*Math.min(1,Math.max(0,(te-.6)/.4)),B=ne<0?-z:b-ne-z,V=i===0?n.around:n.around+1.9+.8*Vf(),re=i===0?n.tilt:.3+.7*Vf(),ie=i===0?n.roll:(Vf()-.5)*1.4,H=T*If;c[H]=te,c[H+1]=Math.cos(V),c[H+2]=Math.sin(V),c[H+3]=Math.cos(re),c[H+4]=Math.sin(re),c[H+5]=Math.cos(ie),c[H+6]=Math.sin(ie),c[H+7]=N,c[H+8]=ne<0?-1-z:ne+z,c[H+9]=P,c[H+10]=F,l[T]=n.node,this.place(c,l,T,T+1,e,t,O,k,A,u,0);let ae=p&&B<jf,oe=this.scratch2;ae&&(this.poseAge=jf,this.place(c,l,T,T+1,e,t,O,k,A,oe,0),(e.time-c[H+8]<.2||ne<0)&&(this.poseAge=.2,this.place(c,l,T,T+1,e,t,O,k,A,u,0)),this.poseAge=-1),this.pos.set(u[12],u[13],u[14]);let se=1-Zf(0,jf*1.4,B),ce=1-Zf(2,14,b-n.born),le=Math.max(ce,1-Zf(10,50,b-n.born))*.6+ce*.4;if(!p){let e=.45+.55*Math.min(1,r.light*1.4),t=a.hue+(n.tint-.5)*.06-ce*.05-se*.05,i=Math.min(1,a.saturation*(.8+n.tint*.35)+ce*.12),o=(.19+n.tint*.1+ce*.1+se*.1)*a.lightness;if(x){let e=cf(S,C,P,I,F,ee,n.tint,L,t,i,o,2.1);t=e[0],i=e[1],o=e[2]}this.col.setHSL(t,i,Math.min(.85,o*e),Me),this.col.r*=Xf.r/v.r,this.col.g*=Xf.g/v.g,this.col.b*=Xf.b/v.b,this.nightGrade>0&&Uf(this.col,v,this.nightGrade,1+qf*this.nightFloor),s[T*3]=this.col.r,s[T*3+1]=this.col.g,s[T*3+2]=this.col.b,T++;continue}let ue=a.hue+(n.tint-.5)*.07-le*.05-se*.05,de=Math.min(1,a.saturation*(.85+n.tint*.35)+le*.12+se*.15),fe=(.3+n.tint*.12+le*.12-se*.04)*a.lightness;if(x){let e=cf(S,C,P,I,F,ee,n.tint,L,ue,de,fe);ue=e[0],de=e[1],fe=e[2]}this.col.setHSL(ue,de,Math.min(.85,fe),Me);let pe=.42+.78*Zf(.15,.85,r.light),me,he,ge;if(!p)me=he=ge=.5+.5*pe;else{let e=1/(Math.hypot(u[8],u[9],u[10])||1),t=u[8]*e,r=u[9]*e,i=u[10]*e,a=g.cam.x-this.pos.x,o=g.cam.y-this.pos.y,s=g.cam.z-this.pos.z,c=1/(Math.hypot(a,o,s)||1);a*=c,o*=c,s*=c,t*a+r*o+i*s<0&&(t=-t,r=-r,i=-i);let l=.35+.65*pe;if(m&&h){let e=Math.floor((this.pos.x-h.ox)/h.cell),t=Math.floor((this.pos.y-h.oy)/h.cell),n=Math.floor((this.pos.z-h.oz)/h.cell);l=e>=0&&t>=0&&n>=0&&e<h.nx&&t<h.ny&&n<h.nz?Math.min(1,m[(t*h.nz+n)*h.nx+e]*(.75+.5*pe)):1}l*=.7+.3*n.tint;let d=t*_.x+r*_.y+i*_.z,f=.5*r+.5,p=Math.max(0,-(a*_.x+o*_.y+s*_.z)),y=(.15*(d<0?1:.3)+.55*p*p)*l,b=Math.abs(d)*l,x=ae?Math.hypot(oe[8],oe[9],oe[10]):0;if(x>0){let e=oe[8]/x,n=oe[9]/x,c=oe[10]/x;e*a+n*o+c*s<0&&(e=-e,n=-n,c=-c);let m=e*_.x+n*_.y+c*_.z,h=.5*n+.5,y=(.15*(m<0?1:.3)+.55*p*p)*l,b=Math.abs(m)*l,S=1-Zf(.6,1,B/jf),C=.1*S,w=Math.hypot(u[8],u[9],u[10]),T=Math.hypot(u[0],u[1],u[2]),E=Math.hypot(u[4],u[5],u[6]),D=t*u[8]+r*u[9]+i*u[10]<0?-1:1,O=T>0?Math.abs(u[0]*_.x+u[1]*_.y+u[2]*_.z)/T:0,k=E>0?D*(u[4]*_.x+u[5]*_.y+u[6]*_.z)/E:0,A=T>0?.36*w/T:0,j=E>0?(k>0?.4:.043)*w/E:0,M=(d+A*O+j*k)/Math.sqrt(1+A*A+j*j),N=Math.max(0,d),P=N+(Math.max(N,M)-N)*S;me=Yf(g.sky.r,g.ground.r,g.sunCol.r,1,v.r,f,P,h,pe,b,y,C),he=Yf(g.sky.g,g.ground.g,g.sunCol.g,1.15,v.g,f,P,h,pe,b,y,C),ge=Yf(g.sky.b,g.ground.b,g.sunCol.b,.35,v.b,f,P,h,pe,b,y,C)}else me=Jf(g.sky.r,g.ground.r,g.sunCol.r,1,v.r,f,d,pe,b,y),he=Jf(g.sky.g,g.ground.g,g.sunCol.g,1.15,v.g,f,d,pe,b,y),ge=Jf(g.sky.b,g.ground.b,g.sunCol.b,.35,v.b,f,d,pe,b,y)}p||(me/=v.r,he/=v.g,ge/=v.b),this.col.r*=me,this.col.g*=he,this.col.b*=ge,this.nightGrade>0&&Uf(this.col,v,this.nightGrade,p?.95:1),s[T*3]=this.col.r,s[T*3+1]=this.col.g,s[T*3+2]=this.col.b,T++}}if(this.passLi=M,this.passN=T,this.passCand=E,this.passAcc+=performance.now()-i,M<j||n!==1/0&&M>N&&performance.now()-i>1)return!1;this.passOpen=!1,this.passes++;let P=this.mesh.instanceColor;if(this.passPend){let t=e.time;for(let e=0;e<j;e++)d[e]===-2&&(d[e]=t);for(let e=0,n=8;e<T;e++,n+=If)c[n]<0&&(c[n]=t-1-c[n])}let F=0,I=Math.max(2,e.bboxMax[1]);if(this.followOk&&n!==1/0&&!(Yd.active?Math.abs(Yd.phase-this.lodPhase)>.02:this.lodPhase!==-1)&&a.shape===this.lodShape&&this.formId===this.lodForm&&a.maxBranchRadius===this.lodFade&&Math.abs(I-this.lodH)<.03*I&&Math.hypot(r.x-this.lodX,r.y-this.lodY,r.z-this.lodZ)<.05*I){let e=this.frontD,t=this.frontNode,n=Math.min(T,this.mesh.count);for(let r=0;F<n&&t[F]===l[F]&&e[r]===c[r]&&e[r+1]===c[r+1]&&e[r+3]===c[r+3]&&e[r+5]===c[r+5]&&e[r+7]===c[r+7]&&e[r+8]===c[r+8]&&e[r+10]===c[r+10];F++,r+=If);}return this.backD=this.frontD,this.frontD=c,this.backNode=this.frontNode,this.frontNode=l,this.followOk=!0,P.array.set(T*3===s.length?s:s.subarray(0,T*3)),this.mesh.count=T,this.lastN=T,this.rankScale=this.maxInstances>0&&E>this.maxInstances?this.maxInstances/E:1,this.follow(e,t,r,1/0,F),P.clearUpdateRanges(),P.addUpdateRange(0,T*3),P.needsUpdate=!0,this.passMs=this.passAcc,!0}},Bf=0;function Vf(){return Bf^=Bf<<13,Bf>>>=0,Bf^=Bf>>>17,Bf^=Bf<<5,Bf>>>=0,Bf/4294967296}function Hf(e){return e=Math.imul(e^2654435769,2246822507),e^=e>>>13,e=Math.imul(e,3266489909),e^=e>>>16,(e>>>0)/4294967296}function Uf(e,t,n,r){let i=e.r*t.r,a=e.g*t.g,o=e.b*t.b,s=.3*i+.59*a+.11*o,c=Wf*n,l=r<1?1+(r*(Kf/Math.max(.001,s))**.7-1)*n:r;e.r=(i+(s*Gf[0]-i)*c)*l/t.r,e.g=(a+(s*Gf[1]-a)*c)*l/t.g,e.b=(o+(s*Gf[2]-o)*c)*l/t.b}var Wf=.62,Gf=[.74,1,1.22],Kf=.4,qf=10;function Jf(e,t,n,r,i,a,o,s,c,l){let u=t+(e-t)*a,d=u+n*Math.max(0,o),f=u*s+n*(c+l*r);return Math.min(8,f/Math.max(.02,d))/i}function Yf(e,t,n,r,i,a,o,s,c,l,u,d){let f=t+(e-t)*a+n*(Math.max(0,o)+d),p=(t+(e-t)*s)*c+n*(l+u*r);return Math.min(8-66*d,p/Math.max(.02,f))/i}var Xf=new J(.7,.78,.6);function Zf(e,t,n){let r=Math.min(1,Math.max(0,(n-e)/(t-e||1e-6)));return r*r*(3-2*r)}function Qf(e){let t=new J(.7,.78,.6),n=e.image,r=n&&typeof n.getContext==`function`?n.getContext(`2d`):null;if(!r)return t;let i=r.getImageData(0,0,n.width,n.height).data,a=0,o=0,s=0,c=0;for(let e=0;e<i.length;e+=16)i[e+3]>=128&&(a+=i[e],o+=i[e+1],s+=i[e+2],c++);return c?t.setRGB(a/c/255,o/c/255,s/c/255,Me):t}var $f=1e-7,ep=.45,tp=6,np=class{mesh;S=256;canvas;ctx;tex;tau;tmp;noise;img;N=128;K=5;bufA;bufB;layers=[];colAcc;sig=new Float64Array(5);used=new Uint8Array(5);shown;from;to;fr={u0:0,w0:0,toU:1,toW:1,ux:1,uz:0,has:!1};fadeP=1;fadeStep=0;fadeUploads=0;fadeMs=0;key=``;lastT=-1e9;ver=-1;lastMs=0;maxMs=0;bakes=0;constructor(){let e=this.S;this.canvas=document.createElement(`canvas`),this.canvas.width=this.canvas.height=e,this.ctx=this.canvas.getContext(`2d`),this.img=this.ctx.createImageData(e,e),this.tex=new Ei(this.canvas),this.tex.colorSpace=Me,this.tau=new Float32Array(e*e),this.tmp=new Float32Array(e*e),this.shown=new Uint8Array(e*e),this.from=new Uint8Array(e*e),this.to=new Uint8Array(e*e);let t=this.N;for(let e=0;e<this.K;e++)this.layers.push(new Float32Array(t*t));this.bufA=new Float32Array(t*t),this.bufB=new Float32Array(t*t),this.colAcc=new Float64Array(t),this.img.data.fill(255),this.noise=new Float32Array(e*e);let n=e=>{let t=Math.sin(e*127.1+311.7)*43758.5453;return t-Math.floor(t)};for(let[t,r]of[[16,.6],[48,.4]])for(let i=0;i<e;i++)for(let a=0;a<e;a++){let o=a/e*t,s=i/e*t,c=Math.floor(o),l=Math.floor(s),u=o-c,d=s-l,f=(e,r)=>n((e%t+t)%t+(r%t+t)%t*97+t*7),p=u*u*(3-2*u),m=d*d*(3-2*d),h=(f(c,l)*(1-p)+f(c+1,l)*p)*(1-m)+(f(c,l+1)*(1-p)+f(c+1,l+1)*p)*m;this.noise[i*e+a]+=h*r}let r=new Vr({map:this.tex,transparent:!0,depthWrite:!1,color:659974});this.mesh=new $r(new Ni(1,1).rotateX(-Math.PI/2),r),this.mesh.renderOrder=1,this.mesh.visible=!1}update(e,t,n,r,i=2){let a=e.lightGrid;if(e.nodes.length<2){this.mesh.visible=!1,this.fr.has=!1,this.ver=-1;return}let o=a?e.lightVersion:-2-e.nodes.length,s=a?a.cell:.25,c=`${t.x.toFixed(2)},${t.y.toFixed(2)},${t.z.toFixed(2)}`,l=r-this.lastT;if(c===this.key&&(o===this.ver||l<i)||l<.5)return;this.key=c,this.ver=o,this.lastT=r;let u=performance.now(),d=this.S,f=this.N,p=this.K,m=this.sig,h=this.layers,g=this.used,_=Math.max(.3,t.y),v=Math.hypot(t.x,t.z),y=1,b=0;v>1e-4&&(y=-t.x/v,b=-t.z/v);let x=v/_,S=Math.min(2.5,1/_),C=.035,w=.12,T=e.bboxMin,E=e.bboxMax,D=Math.max(0,E[1]),O=1/0,k=-1/0,A=1/0,j=-1/0;for(let e=0;e<8;e++){let t=e&1?E[0]:T[0],n=e&2?E[2]:T[2],r=e&4?D:0,i=t*y+n*b+r*x,a=-t*b+n*y;i<O&&(O=i),i>k&&(k=i),a<A&&(A=a),a>j&&(j=a)}let M=w*1.3+D/_*C,N=s+1.5*M,P=s+1.5*M*S;O-=P,k+=P,A-=N,j+=N;let F=2**(Math.ceil(Math.log2((k-O)/(f-2))*3)/3),I=2**(Math.ceil(Math.log2((j-A)/(f-2))*3)/3);O=Math.floor(O/F)*F,k=O+f*F,A=Math.floor(A/I)*I,j=A+f*I;let L=k-O,R=j-A,ee=d/L,te=d/R,ne=f/L,z=f/R,B=.6/z,V=Math.max(1.01,M/B)**(1/(p-1));for(let e=0;e<p;e++)m[e]=B*V**+e,h[e].fill(0),g[e]=0;let re=ne*z,ie=(e,t,n,r,i)=>{let a=(e*y+n*b+t*x-O)*ne-.5,o=(-e*b+n*y-A)*z-.5;if(!(a>=0&&o>=0&&a<f-1&&o<f-1))return;let s=0;for(;s<p-2&&r>m[s+1];)s++;let c=m[s]*m[s],l=m[s+1]*m[s+1],u=Math.min(1,Math.max(0,(r*r-c)/(l-c))),d=a|0,_=o|0,v=a-d,S=o-_,C=_*f+d,w=i*re,T=(1-v)*(1-S),E=v*(1-S),D=(1-v)*S,k=v*S;if(u<1){let e=h[s],t=w*(1-u);e[C]+=t*T,e[C+1]+=t*E,e[C+f]+=t*D,e[C+f+1]+=t*k,g[s]=1}if(u>0){let e=h[s+1],t=w*u;e[C]+=t*T,e[C+1]+=t*E,e[C+f]+=t*D,e[C+f+1]+=t*k,g[s+1]=1}},H=e.nodes,ae=1,oe=()=>(ae=Math.imul(ae,1664525)+1013904223|0,(ae>>>8)/16777216-.5),se=2*Math.PI;for(let t=1;t<H.length;t++){let n=H[t];if(!n.leafy||e.chains[n.chain].pruned||n.wdy<-.75)continue;let r=oe()*.15,i=oe()*.15,a=w*(.8+.5*(oe()+.5));ie(n.wx+r,n.wy,n.wz+i,a+C*(n.wy/_),se*.1*a*a*S)}for(let t of e.chains){if(t.pruned||t.order>1)continue;let e=se*(t.order===0?1.2:.6);for(let n=1;n<t.nodes.length;n++){let r=H[t.nodes[n-1]],i=H[t.nodes[n]],a=Math.hypot(i.wx-r.wx,i.wy-r.wy,i.wz-r.wz),o=Math.max(1,Math.ceil(a*z)),s=Math.max(B,i.radius*.8),c=e*s*s;for(let e=0;e<o;e++){let t=(e+.5)/o,n=r.wy+(i.wy-r.wy)*t;ie(r.wx+(i.wx-r.wx)*t,n,r.wz+(i.wz-r.wz)*t,s+n/_*C,c)}}}let ce=this.bufA,le=this.bufB,ue=!1;ce.fill(0);for(let e=p-1;e>=0;e--){if(g[e]){let t=h[e];for(let e=0;e<f*f;e++)ce[e]+=t[e];ue=!0}if(!ue)continue;let t=m[e]*m[e]-(e>0?m[e-1]*m[e-1]:0);if(this.blur(ce,le,t*S*S*ne*ne,!0)){let e=ce;ce=le,le=e}if(this.blur(ce,le,t*z*z,!1)){let e=ce;ce=le,le=e}}let de=this.tau,fe=this.tmp,pe=this.colAcc;for(let e=0;e<d;e++){let t=Math.max(0,e*.5-.25),n=Math.min(f-2,t|0),r=Math.min(1,t-n),i=n*f,a=i+f,o=e*d;for(let e=0;e<f;e++){let t=ce[i+e];pe[e]=t+(ce[a+e]-t)*r}de[o]=pe[0],de[o+d-1]=pe[f-1];for(let e=0,t=o+1;e<f-1;e++,t+=2){let n=pe[e],r=pe[e+1];de[t]=.75*n+.25*r,de[t+1]=.25*n+.75*r}}let me=H[0],he=Math.max(.08,H[Math.min(1,H.length-1)].radius),ge=(me.wx*y+me.wz*b-O)*ee-.5,_e=(-me.wx*b+me.wz*y-A)*te-.5;for(let[e,t]of[[he*2.2,1.4],[he*5,.35]]){let n=2.5*e*ee,r=2.5*e*te,i=1/(2*e*e);for(let e=Math.max(0,Math.floor(_e-r));e<=Math.min(d-1,Math.ceil(_e+r));e++)for(let r=Math.max(0,Math.floor(ge-n));r<=Math.min(d-1,Math.ceil(ge+n));r++){let n=(r-ge)/ee,a=(e-_e)/te,o=(n*n+a*a)*i;o<3.2&&(de[e*d+r]+=t*Math.exp(-o))}}fe.fill(0);let ve=1,ye=()=>(ve=Math.imul(ve^ve>>>15,2246822519),ve=Math.imul(ve^ve>>>13,3266489917),ve^=ve>>>16,(ve>>>8)/16777216),be=.5,xe=Math.min(2.2,S),Se=1/0,Ce=-1/0,we=1/0,Te=-1/0;for(let e=0;e<4;e++){let t=e&1?k:O,n=e&2?j:A,r=t*y-n*b,i=t*b+n*y;r<Se&&(Se=r),r>Ce&&(Ce=r),i<we&&(we=i),i>Te&&(Te=i)}let Ee=Math.ceil(Ce/be),U=Math.ceil(Te/be);for(let e=Math.floor(we/be);e<U;e++)for(let t=Math.floor(Se/be);t<Ee;t++){ve=Math.imul(t,374761393)^Math.imul(e,668265263)|0;let n=(t+ye())*be,r=(e+ye())*be,i=(n*y+r*b-O)*ee,a=(-n*b+r*y-A)*te;if(!(i>=0&&a>=0&&i<d&&a<d))continue;let o=de[(a|0)*d+(i|0)];if(o<.15||o>2.2)continue;let s=.06+.11*ye(),c=Math.min(2.5*xe,Math.max(.8,s*xe*ee)),l=Math.min(2.5,Math.max(.8,s*te)),u=.55+.45*ye(),f=Math.ceil(c*1.6),p=Math.ceil(l*1.6),m=1/(c*c),h=1/(l*l);for(let e=Math.max(0,(a|0)-p);e<=Math.min(d-1,(a|0)+p);e++)for(let t=Math.max(0,(i|0)-f);t<=Math.min(d-1,(i|0)+f);t++){let n=t-i,r=e-a,o=n*n*m+r*r*h;if(o<2.5){let n=u*Math.exp(-o);n>fe[e*d+t]&&(fe[e*d+t]=n)}}}let De=this.to,Oe=this.noise,ke=y/ee*15,W=b/ee*15,Ae=255*Math.min(1,n);for(let e=0,t=0;e<d;e++){let n=A+(e+.5)/te,r=O+.5/ee,i=(r*y-n*b)*15+4096,a=(r*b+n*y)*15+4096,o=Math.min(e,d-1-e);for(let e=0;e<d;e++,t++,i+=ke,a+=W){let n=de[t],r=0;if(n>.001){let s=Oe[((a|0)&255)<<8|(i|0)&255],c=(1-Math.exp(-n*(.35+1.2*s*s)))*(1-.8*fe[t])*Ae;(o<4||e<4||e>d-5)&&(c*=Math.min(e,d-1-e,o)/4),r=c+.5|0}De[t]=r}}let G=this.fr,je=this.from,Me=this.shown;if(!G.has)je.fill(0);else{let e=y*G.ux+b*G.uz,t=y*G.uz-b*G.ux,n=e/ee*G.toU,r=-t/ee*G.toW;for(let i=0,a=0;i<d;i++){let o=O+.5/ee,s=A+(i+.5)/te,c=(o*e+s*t-G.u0)*G.toU-.5,l=(-o*t+s*e-G.w0)*G.toW-.5;for(let e=0;e<d;e++,a++,c+=n,l+=r){let e=Math.floor(c+1e-4),t=Math.floor(l+1e-4);if(e<-1||t<-1||e>=d||t>=d){je[a]=0;continue}let n=Math.max(0,c-e),r=Math.max(0,l-t),i=t*d+e,o=e>=0,s=e<d-1,u=t>=0,f=t<d-1,p=o&&u?Me[i]:0,m=s&&u?Me[i+1]:0,h=o&&f?Me[i+d]:0,g=s&&f?Me[i+d+1]:0;je[a]=p+(m-p)*n+(h-p+(g-m-h+p)*n)*r+.5|0}}}let Ne=!G.has&&i<2;G.u0=O,G.w0=A,G.toU=ee,G.toW=te,G.ux=y,G.uz=b,G.has=!0,this.fadeP=+!!Ne,this.fadeStep=Ne?5:0,this.fadeTo(this.fadeStep+1);let Pe=(O+k)/2,Fe=(A+j)/2;this.mesh.position.set(Pe*y-Fe*b,.015,Pe*b+Fe*y),this.mesh.rotation.y=Math.atan2(-b,y),this.mesh.scale.set(L,1,R),this.mesh.visible=!0,this.lastMs=performance.now()-u,this.lastMs>this.maxMs&&(this.maxMs=this.lastMs),this.bakes++}fade(e){if(this.fadeStep>=tp||!this.mesh.visible)return;this.fadeP=Math.min(1,this.fadeP+e/ep);let t=Math.max(this.fadeStep,Math.ceil(this.fadeP*tp));t>this.fadeStep&&(this.fadeTo(t),this.fadeUploads++)}fadeTo(e){this.fadeStep=e;let t=performance.now(),n=Math.round(256*e/tp),r=this.from,i=this.to,a=this.shown,o=this.img.data,s=this.S*this.S;for(let e=0;e<s;e++){let t=r[e],s=t+((i[e]-t)*n>>8);a[e]=s,o[e*4+3]=s}this.ctx.putImageData(this.img,0,0),this.tex.needsUpdate=!0,this.fadeMs+=performance.now()-t}blur(e,t,n,r){let i=this.N;if(n<.02)return!1;let a=0;for(;a<i>>1&&(a+1)*(a+2)/3<=n;)a++;let o=a*(a+1)*(2*a+1)/3,s=a+1,c=Math.min(1,Math.max(0,(n*(2*a+1)-o)/(2*s*s-2*n))),l=1/(2*a+1+2*c),u=this.colAcc;if(r)for(let n=0;n<i;n++){let r=n*i,o=0;for(let t=0;t<a;t++)o+=e[r+t];for(let n=0;n<i;n++){n+a<i&&(o+=e[r+n+a]);let u=(n>=s?e[r+n-s]:0)+(n+s<i?e[r+n+s]:0),d=o+c*u;t[r+n]=d>$f?d*l:0,n>=a&&(o-=e[r+n-a])}}else{u.fill(0);for(let t=0;t<a;t++){let n=t*i;for(let t=0;t<i;t++)u[t]+=e[n+t]}for(let n=0;n<i;n++){let r=n*i;if(n+a<i){let t=r+a*i;for(let n=0;n<i;n++)u[n]+=e[t+n]}let o=n>=s?r-s*i:-1,d=n+s<i?r+s*i:-1;for(let n=0;n<i;n++){let i=u[n]+c*((o>=0?e[o+n]:0)+(d>=0?e[d+n]:0));t[r+n]=i>$f?i*l:0}if(n>=a){let t=r-a*i;for(let n=0;n<i;n++)u[n]-=e[t+n]}}}return!0}},rp=new Set([`seed.seed`,`growth.maxNodes`,`growth.maxOrder`,`crown.attractors`,`time.speed`,`sky.dayLength`]);function ip(e){let t=[],n=e;for(let e of Object.keys(n))for(let r of Object.keys(n[e])){let i=`${e}.${r}`;typeof n[e][r]==`number`&&!rp.has(i)&&t.push(i)}return t}function ap(e,t){let[n,r]=t.split(`.`);return e[n][r]}function op(e,t,n){let[r,i]=t.split(`.`),a=e[r];a[i]!==n&&(a[i]=n,hl())}var sp=e=>e*e*(3-2*e);function cp(e,t){return Math.sin(e*1+t)*.5+Math.sin(e*.537+t*2.3)*.3+Math.sin(e*.231+t*4.1)*.2}var lp=class{p;journey=[];journeyOn=!0;drift={};wrap=new Set([`leaves.hue`,`leaves.glowHue`,`sky.skyHue`,`sky.sunHue`,`sky.sun2Hue`,`sky.groundHue`]);constructor(e){this.p=e}addKeyframe(e,t=ip(this.p)){let n={};for(let e of t)n[e]=ap(this.p,e);this.journey=this.journey.filter(t=>Math.abs(t.t-e)>.25),this.journey.push({t:e,values:n}),this.journey.sort((e,t)=>e.t-t.t)}clearJourney(){this.journey=[]}setDrift(e,t,n=.05,r=.3){let i=this.drift[e]??(this.drift[e]={on:!1,rate:n,range:r,base:ap(this.p,e),phase:Math.random()*100});t&&!i.on&&(i.base=ap(this.p,e)),!t&&i.on&&op(this.p,e,i.base),i.on=t,i.rate=n,i.range=r}userSet(e,t){let[n,r]=e.split(`.`);this.p[n][r]=t,hl();for(let t of this.journey)delete t.values[e];this.journey=this.journey.filter(e=>Object.keys(e.values).length>0);let i=this.drift[e];i&&(i.on=!1,i.base=typeof t==`number`?t:i.base)}drives(e){return this.drift[e]?.on?`drift`:this.journeyOn&&this.journey.filter(t=>e in t.values).length>=2?`journey`:null}journeyValue(e,t){let n=this.journey.filter(t=>e in t.values);if(!this.journeyOn||n.length<2)return n.length===1&&this.journeyOn,void 0;if(t<=n[0].t)return n[0].values[e];for(let r=0;r<n.length-1;r++){let i=n[r],a=n[r+1];if(t<=a.t){let n=sp((t-i.t)/Math.max(1e-6,a.t-i.t));return i.values[e]+(a.values[e]-i.values[e])*n}}return n[n.length-1].values[e]}apply(e){let t=new Set;if(this.journeyOn&&this.journey.length>=2)for(let e of this.journey)for(let n of Object.keys(e.values))t.add(n);for(let n of t){let t=this.journeyValue(n,e);t!==void 0&&op(this.p,n,t)}for(let[n,r]of Object.entries(this.drift)){if(!r.on)continue;let i=t.has(n)?ap(this.p,n):r.base,a=i+(this.wrap.has(n)||Math.abs(i)<.05?r.range:Math.abs(i)*r.range)*cp(e*r.rate*2*Math.PI,r.phase);this.wrap.has(n)?a=(a%1+1)%1:i>=0&&(a=Math.max(0,a)),op(this.p,n,a)}}};function X(e,t={},...n){let r=document.createElement(e);for(let[e,n]of Object.entries(t))e===`class`?r.className=String(n):e===`text`?r.textContent=String(n):n===!0?r.setAttribute(e,``):n!==!1&&r.setAttribute(e,String(n));for(let e of n)e&&r.append(e);return r}var up=e=>`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${e}</svg>`,dp={sliders:up(`<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>`),down:up(`<path d="M6 9l6 6 6-6"/>`),pause:up(`<path d="M8 5v14M16 5v14"/>`),play:up(`<path d="M8 5l11 7-11 7z" fill="currentColor"/>`)};function fp(e,t,n){e=(e%1+1)%1;let r=r=>{let i=(r+e*12)%12,a=n-t*Math.min(n,1-n)*Math.max(-1,Math.min(i-3,9-i,1));return Math.round(255*a).toString(16).padStart(2,`0`)};return`#${r(0)}${r(8)}${r(4)}`}function pp(e){let t=parseInt(e.slice(1,3),16)/255,n=parseInt(e.slice(3,5),16)/255,r=parseInt(e.slice(5,7),16)/255,i=Math.max(t,n,r),a=Math.min(t,n,r),o=(i+a)/2,s=i-a;if(s<1e-6)return[0,0,o];let c=s/(1-Math.abs(2*o-1));return[(i===t?((n-r)/s+6)%6:i===n?(r-t)/s+2:(t-n)/s+4)/6,Math.min(1,c),o]}var mp=[{key:`growth.gravity`,name:`Gravity`,help:`How heavy the world is. Low: tall and airy. High: squat, with sagging branches.`,min:0,max:3,step:.01},{key:`growth.phototropism`,name:`Reach for light`,help:`How strongly branch tips bend towards the sun.`,min:0,max:2,step:.01},{key:`growth.branchingProbability`,name:`Branchiness`,help:`How often new side branches sprout. More gives a denser tree.`,min:.02,max:1,step:.01},{key:`growth.branchAngle`,name:`Branch angle`,help:`How far side branches spread from their parent. Small: upright. Large: wide.`,min:10,max:100,step:1,fmt:e=>`${e.toFixed(0)}°`},{key:`growth.torsion`,name:`Twist`,help:`Spirals the branches as they grow. Middle is no twist.`,min:-20,max:20,step:.5},{key:`growth.weeping`,name:`Droop`,help:`Makes the twigs hang down, like a weeping willow.`,min:0,max:3,step:.01},{key:`growth.wander`,name:`Wildness`,help:`How much branches meander instead of growing straight.`,min:0,max:2,step:.01},{key:`crown.radius`,name:`Crown width`,help:`How wide the tree top may spread.`,min:.5,max:10,step:.1,crown:!0,fmt:e=>`${e.toFixed(1)} m`},{key:`crown.height`,name:`Crown height`,help:`How tall the tree top may become.`,min:.5,max:15,step:.1,crown:!0,fmt:e=>`${e.toFixed(1)} m`},{key:`crown.shape`,name:`Crown shape`,help:`Left: round. Middle: pointed like a fir. Right: wide like an umbrella.`,min:0,max:2,step:.01,crown:!0,fmt:e=>e<.5?`round`:e<1.5?`pointed`:`umbrella`},{key:`leaves.size`,name:`Leaf size`,help:`How big each leaf is.`,min:.03,max:2.5,log:!0,when:`now`,fmt:e=>`${(e*100).toFixed(0)} cm`},{key:`leaves.density`,name:`Leaf amount`,help:`How many leaves sit on each twig.`,min:0,max:4,step:.05,when:`now`}],hp=[[`auto`,`Changes on its own`],[`calm`,`Always calm`],[`storm`,`Storm (stays)`]],gp=[[`auto`,`Automatic`],[`clear`,`Clear`],[`fair`,`Fair`],[`cloudy`,`Sun and clouds`],[`overcast`,`Overcast`],[`mist`,`Mist`],[`windy`,`Windy`],[`drizzle`,`Drizzle`],[`shower`,`Shower`],[`rain`,`Rain`],[`storm`,`Thunderstorm`]],_p=[{key:`sky.timeOfDay`,name:`Time of day`,help:`Moves the sun. Try sunrise, noon, sunset or night.`,min:0,max:24,step:.05,when:`now`,fmt:e=>{let t=Math.floor(e)%24,n=Math.floor((e-Math.floor(e))*60);return`${String(t).padStart(2,`0`)}:${String(n).padStart(2,`0`)}`}},{key:`sky.dayLength`,name:`Length of a day`,help:`How long a full day and night takes when the cycle is on.`,min:10,max:1800,log:!0,when:`now`,fmt:e=>e<90?`${e.toFixed(0)} s`:`${(e/60).toFixed(+(e<600))} min`},{key:`sky.wind`,name:`Wind`,help:`How hard the wind blows across the meadow. Calmer at night.`,min:0,max:1,step:.01,when:`now`,fmt:e=>e<.05?`still`:e<.3?`light`:e<.6?`breezy`:`windy`},{key:`sky.moonPhase`,name:`Moon`,help:`Phase of the moon. It also moves on by itself, a little every day.`,min:0,max:1,step:.01,when:`now`,fmt:e=>e<.04||e>.96?`new`:Math.abs(e-.5)<.04?`full`:`${e<.5?`waxing`:`waning`} ${Math.abs(e-.5)>.29?`crescent`:Math.abs(e-.5)>.21?`half`:`gibbous`}`},{key:`sway.amount`,name:`Branch sway`,help:`How much limbs and twigs move with the wind. 0 keeps the tree still.`,min:0,max:2,step:.05,when:`now`,fmt:e=>e<.05?`still`:`${e.toFixed(2)}x`}],vp=[[`Growth (raw)`,`growth`,[[`gravity`,0,3,.01],[`phototropism`,0,2,.01],[`gravitropism`,-1,2,.01],[`attraction`,0,3,.01],[`straightness`,0,5,.01],[`wander`,0,2,.01],[`maxTurn`,2,90,.5],[`scaffoldBranching`,0,1.5,.01],[`selfPrune`,0,.8,.01],[`branchAngle`,5,110,.5],[`phyllotaxis`,0,360,.5],[`apicalDominance`,0,1,.01],[`branchingProbability`,0,2,.01],[`segmentLength`,.05,.6,.01],[`growthRate`,.1,5,.01],[`vigorDecay`,.4,1,.01],[`maxOrder`,1,10,1],[`weeping`,0,3,.01],[`torsion`,-20,20,.1],[`sag`,0,5,.01],[`maxNodes`,1e3,6e4,500]]],[`Crown (raw)`,`crown`,[[`shape`,0,2,.01],[`radius`,.5,10,.1],[`height`,.5,15,.1],[`base`,0,8,.1],[`bole`,0,6,.05],[`attractors`,200,2e4,100]]],[`Thickness`,`thickness`,[[`exponent`,1.5,3.5,.01],[`twigRadius`,.003,.04,.001],[`thickeningRate`,.05,5,.01],[`rootFlare`,0,3,.01]]],[`Leaves (raw)`,`leaves`,[[`size`,0,2.5,.005],[`density`,0,4,.05],[`hue`,0,1,.005],[`saturation`,0,1,.01],[`maxBranchRadius`,.005,.2,.001],[`shape`,-1,1,.01],[`lightness`,.3,2,.01],[`glow`,0,3,.01],[`glowHue`,0,1,.005]]],[`Growth light`,`light`,[[`azimuth`,0,360,1],[`elevation`,5,89,1]]],[`Sky and look (raw)`,`sky`,[[`timeOfDay`,0,24,.01],[`dayLength`,10,1800,1],[`latitude`,0,75,.5],[`sunYaw`,0,360,1],[`exposure`,.1,3,.01],[`skyGain`,.1,3,.01],[`fog`,0,5,.01],[`stars`,0,2,.01],[`godRays`,0,3,.01],[`skyHue`,0,1,.005],[`skyTint`,0,1,.01],[`sunHue`,0,1,.005],[`sunTint`,0,1,.01],[`sun2`,0,2,.01],[`sun2Hue`,0,1,.005],[`sun2Yaw`,0,360,1],[`sunSize`,0,4,.01],[`groundHue`,0,1,.005],[`groundTint`,0,1,.01]]],[`Time and seed`,``,[]]],yp=0;function bp(e,t,n,r={}){let i=e,a=e=>{let[t,n]=e.split(`.`);return i[t][n]},o=e=>a(e),s=[],c=null,l=()=>{for(let e of s)e()},u=(e,n)=>{t.userSet(e,n),e.startsWith(`crown.`)&&(d=!0)},d=!1,f=()=>{d&&(d=!1,n.crownChanged())},p=e=>{e.addEventListener(`pointerdown`,()=>c=e);for(let t of[`pointerup`,`pointercancel`,`change`,`blur`])e.addEventListener(t,()=>{c===e&&(c=null)})};function m(e){let n=`ap-${yp++}`,r=e.step??.01,i=e.fmt??(e=>e.toFixed(r>=1?0:r>=.1?1:2)),a=t=>e.log?1e3*Math.log(Math.max(e.min,Math.min(e.max,t))/e.min)/Math.log(e.max/e.min):t,d=t=>e.log?e.min*(e.max/e.min)**(t/1e3):t,m=X(`input`,{type:`range`,id:n,min:e.log?0:e.min,max:e.log?1e3:e.max,step:e.log?1:r,"data-param":e.key,"aria-describedby":`${n}-h`}),h=X(`output`,{for:n,class:`ap-val`}),g=e.drift?X(`button`,{type:`button`,class:`ap-drift`,"aria-pressed":`false`,"data-drift":e.key,"aria-label":`Let ${e.name} drift on its own`,title:`Let it drift: the value slowly wanders on its own`,text:`Drift`}):null,_=e.when?X(`span`,{class:`ap-tag ${e.when}`,text:e.when===`new`?`new growth`:`instant`}):null,v=X(`div`,{class:`ap-row${e.big?` big`:``}`},X(`div`,{class:`ap-head`},X(`label`,{for:n,text:e.name}),_,h),X(`div`,{class:`ap-line`},m,g),X(`p`,{class:`ap-help`,id:`${n}-h`,text:e.help}));p(m),m.addEventListener(`input`,()=>{u(e.key,d(Number(m.value))),y()}),m.addEventListener(`change`,f),g?.addEventListener(`click`,()=>{let n=!(t.drift[e.key]?.on??!1);t.setDrift(e.key,n,.03,.3),l()});let y=()=>{let n=o(e.key);c!==m&&(m.value=String(a(n))),h.textContent=i(n);let r=t.drives(e.key);g?.setAttribute(`aria-pressed`,String(r===`drift`)),v.classList.toggle(`driven`,r!==null),h.title=r===`journey`?`Changing over time (journey). Move the slider to take over.`:``};return s.push(y),v}function h(e,t,n){let r=`ap-${yp++}`,i=X(`input`,{type:`checkbox`,id:r,role:`switch`,"data-param":e});return i.addEventListener(`change`,()=>{u(e,i.checked),l()}),s.push(()=>i.checked=a(e)),X(`div`,{class:`ap-row ap-switch`},X(`label`,{for:r},X(`span`,{class:`ap-sw-name`,text:t}),n?X(`span`,{class:`ap-help`,text:n}):null),i)}function g(e){let t=`ap-${yp++}`,n=X(`input`,{type:`color`,id:t,"data-colour":e.id,"aria-describedby":`${t}-h`});p(n),n.addEventListener(`input`,()=>{e.set(...pp(n.value)),s.forEach(e=>e!==i&&e())});let r=X(`div`,{class:`ap-swatches`,role:`group`,"aria-label":`${e.name} suggestions`});for(let t of e.swatches){let n=X(`button`,{type:`button`,class:`ap-swatch${t.show?``:` none`}`,"aria-label":`${e.name}: ${t.label}`,title:t.label});t.show&&n.style.setProperty(`--c`,t.show),n.addEventListener(`click`,()=>{e.set(...t.hsl),l()}),r.append(n)}let i=()=>{c!==n&&(n.value=e.get())};return s.push(i),X(`div`,{class:`ap-row ap-colour`},X(`div`,{class:`ap-head`},X(`label`,{for:t,text:e.name}),n),r,X(`p`,{class:`ap-help`,id:`${t}-h`,text:e.help}))}let _=[[`red`,0],[`orange`,.08],[`yellow`,.15],[`green`,.33],[`teal`,.48],[`blue`,.6],[`violet`,.76],[`pink`,.9]],v=(e,t,n,r,i,a)=>({name:e,help:t,id:n,get:()=>fp(o(r),Math.min(1,o(i)),.55),set:(e,t)=>{t>.02&&u(r,e),u(i,t)},swatches:[{label:`natural (no tint)`,hsl:[0,0,.55]},..._.slice(0,6).map(([e,t])=>({label:e,hsl:[t,a,.55],show:fp(t,.7,.55)}))]}),y=(e,t,n,r)=>({label:e,hsl:[t,n,.36*r],show:fp(t,n,.36*r)}),b=X(`aside`,{class:`arbor-ui ap-panel`,id:`arbor-panel`,"aria-label":`Tree controls`}),x=X(`button`,{type:`button`,class:`arbor-ui ap-open`,id:`arbor-panel-open`,"aria-controls":`arbor-panel`,"aria-expanded":`false`});x.innerHTML=`${dp.sliders}<span>Controls</span>`;let S=X(`div`,{class:`ap-status`,role:`status`,"aria-live":`polite`}),C=X(`strong`,{id:`arbor-state`}),w=X(`span`,{});S.append(C,w);let T=X(`button`,{type:`button`,class:`ap-icon`,id:`arbor-pause`}),E=X(`button`,{type:`button`,class:`ap-icon`,id:`arbor-panel-close`,"aria-label":`Hide controls`,title:`Hide controls`});E.innerHTML=dp.down,T.addEventListener(`click`,()=>{e.time.paused=!e.time.paused,l()});let D=X(`div`,{class:`ap-grown`,hidden:!0},X(`span`,{text:`This tree is fully grown. Shape changes show on a new tree.`})),O=X(`button`,{type:`button`,class:`ap-btn primary`,text:`Plant a new tree`});O.addEventListener(`click`,()=>{n.newSeed(),l()}),D.append(O);let k=(e,t=!1)=>{b.classList.toggle(`open`,e),x.classList.toggle(`hidden`,e),x.setAttribute(`aria-expanded`,String(e)),document.body.classList.toggle(`panel-open`,e),e&&l(),t&&(e?E:x).focus()};x.addEventListener(`click`,()=>k(!0,!0)),E.addEventListener(`click`,()=>k(!1,!0)),b.addEventListener(`keydown`,e=>{e.key===`Escape`&&k(!1,!0)});let A=[],j=X(`div`,{class:`ap-tabs`,role:`tablist`,"aria-label":`Control groups`}),M=X(`div`,{class:`ap-body`}),N=e=>{for(let t of A){let n=t.id===e;t.btn.setAttribute(`aria-selected`,String(n)),t.btn.tabIndex=n?0:-1,t.body.hidden=!n}M.scrollTop=0},P=(e,t,...n)=>{let r=X(`button`,{type:`button`,role:`tab`,id:`ap-tab-${e}`,"data-tab":e,"aria-controls":`ap-pane-${e}`,text:t}),i=X(`div`,{class:`ap-pane`,role:`tabpanel`,id:`ap-pane-${e}`,"aria-labelledby":`ap-tab-${e}`},...n);r.addEventListener(`click`,()=>N(e)),j.append(r),M.append(i),A.push({id:e,label:t,body:i,btn:r})};j.addEventListener(`keydown`,e=>{let t=A.findIndex(e=>e.btn===document.activeElement);if(t<0||e.key!==`ArrowRight`&&e.key!==`ArrowLeft`)return;let n=A[(t+(e.key===`ArrowRight`?1:A.length-1))%A.length];N(n.id),n.btn.focus()});let F=e=>X(`p`,{class:`ap-note`,text:e}),I=(e,t,n=``,r=``)=>{let i=X(`button`,{type:`button`,class:`ap-btn ${n}`,text:e});return r&&(i.id=r),i.addEventListener(`click`,()=>{t(),l()}),i},L=X(`div`,{class:`ap-chips`,role:`group`,"aria-label":`Choose a tree`});for(let e of n.presetNames){let t=X(`button`,{type:`button`,class:`ap-chip`,"data-preset":e,"aria-pressed":`false`,text:e.replace(/^Journey: /,``)});t.addEventListener(`click`,()=>{n.preset(e),l()}),L.append(t)}s.push(()=>L.querySelectorAll(`button`).forEach(e=>e.setAttribute(`aria-pressed`,String(e.dataset.preset===n.currentPreset())))),P(`grow`,`Grow`,m({key:`time.speed`,name:`Growth speed`,help:`How fast time passes for the tree. Works at once, while the tree is still growing.`,min:.25,max:20,log:!0,big:!0,fmt:e=>`${e>=10?e.toFixed(0):e>=1?e.toFixed(1):e.toFixed(2)}x`}),X(`div`,{class:`ap-actions`},I(`Plant a new tree`,n.newSeed,`primary`,`arbor-new`),I(`Regrow this one`,n.regrow,``,`arbor-regrow`)),X(`div`,{class:`ap-actions`},I(`Choose another tree`,n.chooseTree,``,`arbor-choose`)),F(`A new tree grows differently with the same settings. Regrow replays this exact tree from a seedling.`),X(`h3`,{text:`Choose a tree`}),L,F(`Picking a tree loads its shape, colours and sky, and starts growing from a seedling.`)),P(`shape`,`Shape`,F(`Shape controls steer how the tree grows from now on. Branches that already exist keep their form, so plant a new tree to see the full effect. Drift lets a value wander slowly on its own.`),...mp.map(e=>m({when:`new`,drift:!0,...e})));let R=()=>{let e=X(`div`,{class:`ap-forms`,role:`group`,"aria-label":`Leaf shape`}),t=[];return Au.forEach((n,r)=>{let i=X(`canvas`,{width:96,height:96,"aria-hidden":`true`}),a=X(`button`,{type:`button`,class:`ap-form`,"data-form":n.id,"aria-pressed":`false`},i,X(`span`,{text:n.name}));a.addEventListener(`click`,()=>{u(`leaves.form`,n.id),l()}),t.push(a),e.append(a),setTimeout(()=>{let e=Mu(n.id,n.paint?192:512),t=i.getContext(`2d`),r=90*Math.min(1,1/n.aspect),a=r*n.aspect;t.imageSmoothingQuality=`high`,t.drawImage(e,(96-a)/2,(96-r)/2,a,r)},60+r*30)}),s.push(()=>{let e=a(`leaves.form`);for(let n of t)n.setAttribute(`aria-pressed`,String(n.dataset.form===e))}),X(`div`,{class:`ap-row`},X(`div`,{class:`ap-head`},X(`span`,{class:`ap-sw-name`,text:`Leaf shape`})),e,X(`p`,{class:`ap-help`,text:`What kind of leaf the tree wears. Changes at once, on the tree you are watching.`}))},ee=(e,t)=>e+Math.random()*(t-e);P(`colours`,`Leaves`,R(),X(`div`,{class:`ap-actions`},I(`Surprise me`,()=>{let e=Math.random(),t=[.5,.33,.67,.08,.92][Math.floor(Math.random()*5)];u(`leaves.hue`,e),u(`leaves.saturation`,ee(.5,.85)),u(`leaves.lightness`,ee(.9,1.35)),u(`sky.skyHue`,(e+t)%1),u(`sky.skyTint`,ee(.3,.65)),u(`sky.sunHue`,(e+t+.08)%1),u(`sky.sunTint`,ee(.2,.5)),u(`sky.groundHue`,(e+ee(-.06,.06)+1)%1),u(`sky.groundTint`,ee(.3,.6)),u(`leaves.glowHue`,(e+.5)%1),u(`leaves.glow`,Math.random()<.35?ee(.2,.5):0)},`primary`,`arbor-surprise`),I(`Natural colours`,()=>{u(`leaves.hue`,.27),u(`leaves.saturation`,.55),u(`leaves.lightness`,1),u(`leaves.glow`,0),u(`sky.skyTint`,0),u(`sky.sunTint`,0),u(`sky.groundTint`,0)},``,`arbor-natural`)),F(`Colours change at once, on the tree you are watching. Tap the round colour button for any colour, or pick a suggestion.`),g({name:`Leaf colour`,help:`The colour of the leaves.`,id:`leaf`,get:()=>fp(o(`leaves.hue`),o(`leaves.saturation`),Math.min(.8,.36*o(`leaves.lightness`))),set:(e,t,n)=>{t>.02&&u(`leaves.hue`,e),u(`leaves.saturation`,t),u(`leaves.lightness`,Math.max(.3,Math.min(2,n/.36)))},swatches:[y(`summer green`,.27,.55,1),y(`spring lime`,.2,.65,1.25),y(`autumn gold`,.12,.8,1.3),y(`autumn orange`,.06,.8,1.2),y(`red`,.98,.75,1),y(`blossom pink`,.92,.6,1.6),y(`violet`,.76,.5,1.1),y(`teal`,.48,.55,1.1)]}),m({key:`leaves.glow`,name:`Leaf glow at night`,help:`Leaves light up in the dark. Set the time of day to night to see it best.`,min:0,max:1.5,step:.01,when:`now`}),g({name:`Glow colour`,help:`The colour of the night glow.`,id:`glow`,get:()=>fp(o(`leaves.glowHue`),.9,.55),set:(e,t)=>{t>.02&&u(`leaves.glowHue`,e)},swatches:_.map(([e,t])=>({label:e,hsl:[t,.9,.55],show:fp(t,.9,.55)}))}),g(v(`Sky tint`,`Tints the sky and the haze. Grey or the first dot means a natural sky.`,`sky`,`sky.skyHue`,`sky.skyTint`,.55)),g(v(`Sun colour`,`The colour of the sunlight on the tree and the ground.`,`sun`,`sky.sunHue`,`sky.sunTint`,.5)),g(v(`Ground tint`,`Tints the grass.`,`ground`,`sky.groundHue`,`sky.groundTint`,.55)));let te=X(`select`,{id:`arbor-weather`,"aria-label":`Weather`,"data-param":`weather.event`});for(let[e,t]of hp)te.append(X(`option`,{value:e,text:t}));te.addEventListener(`change`,()=>{u(`weather.event`,te.value),l()});let ne=X(`select`,{id:`arbor-weather-kind`,"aria-label":`Weather right now`,"data-param":`weather.kind`});for(let[e,t]of gp)ne.append(X(`option`,{value:e,text:t}));ne.addEventListener(`change`,()=>{ne.value!==`auto`&&a(`weather.event`)!==`auto`&&u(`weather.event`,`auto`),u(`weather.kind`,ne.value),l()});let z=X(`output`,{id:`arbor-weather-info`,class:`ap-info`});s.push(()=>{te.value=String(a(`weather.event`)),ne.value=String(a(`weather.kind`));let e=n.weatherPhase();z.textContent=e===`calm`?n.weatherLabel?`${n.weatherLabel()} now.`:`Calm now.`:e===`breeze`?`The wind is picking up.`:e===`front`?`A storm front is arriving.`:e===`rain`?`Storm.`:`Clearing up.`});let B=X(`div`,{class:`ap-weather`},X(`div`,{class:`ap-raw`},X(`label`,{for:`arbor-weather`,text:`Weather`}),te),X(`div`,{class:`ap-raw`},X(`label`,{for:`arbor-weather-kind`,text:`Right now`}),ne),X(`div`,{class:`ap-row-actions`},I(`Storm now`,()=>n.stormNow(),``,`arbor-storm-now`),z)),V=X(`p`,{class:`ap-note`,id:`arbor-season-info`,role:`status`});s.push(()=>{let e=a(`season.on`),t=o(`season.date`);V.textContent=e?`Now: ${Jd(t).toLowerCase()} of year ${Yd.year}${a(`season.hold`)?`, held`:``}.`:`Seasons are off: it is always summer.`}),P(`seasons`,`Seasons`,h(`season.on`,`Seasons`,`The tree lives through the year: fresh leaves in spring, colour and leaf fall in autumn, bare in winter.`),V,m({key:`season.date`,name:`Time of year`,help:`Drag to jump to any time of the year. Starts in spring, ends in winter.`,min:0,max:.999,step:.001,big:!0,fmt:e=>Jd(e)}),m({key:`season.blossom`,name:`Blossom`,help:`How richly the tree flowers in spring. 0 = no blossom.`,min:0,max:1.5,step:.05,fmt:e=>e<=0?`Off`:`${Math.round(e*100)} %`}),h(`season.hold`,`Hold this season`,`Stay at this time of year. The tree keeps growing.`),m({key:`season.yearLength`,name:`Length of a year`,help:`How long one year takes at normal growth speed. Growth speed makes the year pass faster or slower too.`,min:60,max:1200,step:30,fmt:e=>`${(e/60).toFixed(1)} min`}),F(`Evergreen trees (the cypress) keep their leaves. Trees from other worlds follow their own calendar.`)),P(`sky`,`Sky`,m(_p[0]),h(`sky.cycle`,`Day and night cycle`,`Let the sun move on its own.`),m(_p[1]),m(_p[3]),m(_p[2]),h(`sky.meadow`,`Meadow`,`Grass tufts and wildflowers around the tree.`),m({key:`critters.amount`,name:`Wildlife`,help:`Butterflies over the flowers, fireflies at dusk, a pair of birds in the crown. 0 = none.`,min:0,max:1.5,step:.25,fmt:e=>e<=0?`Off`:`${Math.round(e*100)} %`}),X(`h3`,{class:`ap-sub`,text:`Weather`}),B,h(`weather.lightning`,`Lightning`,`Bright flashes during a storm. Turn off if flashing light bothers you.`),h(`leaffall.enabled`,`Falling leaves`,`Leaves let go now and then, are torn off in a storm and collect on the grass.`));let re=(e,t,n,r,i)=>{let a=`ap-${yp++}`,d=X(`input`,{type:`range`,id:a,min:n,max:r,step:i,"data-raw":e}),m=X(`input`,{type:`number`,min:n,max:r,step:i,"aria-label":`${t} value`,"data-rawnum":e});p(d);let h=t=>{Number.isFinite(t)&&(u(e,t),l())};d.addEventListener(`input`,()=>h(Number(d.value))),d.addEventListener(`change`,f),m.addEventListener(`change`,()=>{h(Number(m.value)),f()}),s.push(()=>{if(!g?.open)return;let t=o(e);c!==d&&(d.value=String(t)),document.activeElement!==m&&(m.value=String(+t.toFixed(4)))});let g;return queueMicrotask(()=>g=d.closest(`details`)),X(`div`,{class:`ap-raw`},X(`label`,{for:a,text:t}),d,m)},ie=(e,t,n,r=``)=>{let i=r||`ap-${yp++}`,a=X(`input`,{type:`checkbox`,id:i});return a.addEventListener(`change`,()=>{n(a.checked),l()}),s.push(()=>a.checked=t()),X(`div`,{class:`ap-raw check`},X(`label`,{for:i,text:e}),a)},H=(e,...t)=>{let n=X(`details`,{class:`ap-fold`},X(`summary`,{text:e}),...t);return n.addEventListener(`toggle`,l),n},ae=X(`output`,{id:`arbor-journey-info`,class:`ap-info`}),oe=X(`output`,{id:`arbor-drift-info`,class:`ap-info`}),se=X(`select`,{id:`arbor-drift-param`,"aria-label":`Value to drift`});for(let t of ip(e))se.append(X(`option`,{value:t,text:t}));se.value=`growth.gravity`;let ce=()=>t.drift[se.value],le=X(`input`,{type:`range`,min:.002,max:.3,step:.001,id:`arbor-drift-rate`}),ue=X(`input`,{type:`range`,min:0,max:1.5,step:.01,id:`arbor-drift-range`}),de=()=>t.setDrift(se.value,ce()?.on??!1,Number(le.value),Number(ue.value));le.addEventListener(`input`,de),ue.addEventListener(`input`,de),se.addEventListener(`change`,l),s.push(()=>{ae.textContent=`Keyframes: ${t.journey.map(e=>`${e.t.toFixed(0)} s`).join(`, `)||`none`}`,oe.textContent=`Drifting: ${Object.entries(t.drift).filter(([,e])=>e.on).map(([e])=>e.split(`.`)[1]).join(`, `)||`none`}`,c!==le&&(le.value=String(ce()?.rate??.03)),c!==ue&&(ue.value=String(ce()?.range??.3))}),p(le),p(ue);let fe=X(`select`,{id:`arbor-quality`},X(`option`,{value:`High`,text:`High`}),X(`option`,{value:`Low`,text:`Low`}));fe.addEventListener(`change`,()=>u(`sky.quality`,fe.value)),s.push(()=>fe.value=e.sky.quality),P(`more`,`More`,F(`Everything else, with its technical name. Nothing here is needed for everyday play.`),H(`Changes over time (journey)`,F(`A journey remembers all values at two or more moments of the tree's life and blends between them as it grows. A value you move by hand leaves the journey.`),ie(`Journey on`,()=>t.journeyOn,e=>t.journeyOn=e,`arbor-journey-on`),X(`div`,{class:`ap-actions`},I(`Add keyframe (now)`,()=>t.addKeyframe(n.simTime()),``,`arbor-add-keyframe`),I(`Clear journey`,()=>t.clearJourney(),``,`arbor-clear-journey`)),ae),H(`Drift (any value)`,X(`div`,{class:`ap-raw`},X(`label`,{for:`arbor-drift-param`,text:`value`}),se),ie(`Drift this value`,()=>ce()?.on??!1,e=>t.setDrift(se.value,e,Number(le.value),Number(ue.value)),`arbor-drift-on`),X(`div`,{class:`ap-raw`},X(`label`,{for:`arbor-drift-rate`,text:`rate`}),le),X(`div`,{class:`ap-raw`},X(`label`,{for:`arbor-drift-range`,text:`range`}),ue),oe),...vp.filter(([,e])=>e).map(([e,t,n])=>H(e,...n.map(([e,n,r,i])=>re(`${t}.${e}`,e,n,r,i)))),H(`Camera and quality`,ie(`Auto-frame the tree`,()=>e.camera.autoFrame,t=>e.camera.autoFrame=t),ie(`Auto-rotate`,()=>e.camera.autoRotate,t=>e.camera.autoRotate=t),ie(`Cinema camera (key C)`,()=>e.camera.cinema,t=>e.camera.cinema=t),X(`div`,{class:`ap-raw`},X(`label`,{for:`arbor-quality`,text:`quality`}),fe),re(`seed.seed`,`seed`,0,999999,1),re(`time.speed`,`speed`,0,20,.05),F(`Keys: H hides all controls, C toggles the cinema camera, D shows a debug line.`))),s.push(()=>{let t=n.growth(),r=t.grown?`Fully grown`:e.time.paused||e.time.speed<=0?`Paused`:`Growing`;C.textContent!==r&&(C.textContent=r),w.textContent=`${t.nodes.toLocaleString(`en`)} twigs · ${a(`season.on`)?`${Yd.name.toLowerCase()}, year ${Yd.year}`:`age ${t.age.toFixed(0)} s`}`,D.hidden=!t.grown,b.classList.toggle(`grown`,t.grown);let i=e.time.paused;T.dataset.p!==String(i)&&(T.dataset.p=String(i),T.innerHTML=i?dp.play:dp.pause,T.setAttribute(`aria-label`,i?`Resume growth`:`Pause growth`),T.title=i?`Resume growth`:`Pause growth`)}),b.append(X(`header`,{class:`ap-top`},S,T,E),j,D,M);let pe=X(`button`,{type:`button`,class:`arbor-ui ap-autocam`,id:`arbor-auto-camera`,hidden:!0,title:`Return to the automatic camera (key C)`});pe.innerHTML=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg><span>Auto camera</span>`;let me=()=>{let e=n.cameraManual();pe.hidden===e&&(pe.hidden=!e)};return pe.addEventListener(`click`,()=>{n.autoCamera(),me()}),setInterval(me,200),document.body.append(x,b,pe),N(A.some(e=>e.id===r.tab)?r.tab:`grow`),k(r.open??!matchMedia(`(max-width: 700px)`).matches),l(),setInterval(()=>{b.classList.contains(`open`)&&!document.hidden&&l()},400),{refresh:l,setOpen:k}}var xp={"Oak meadow":{params:{}},"Windswept cypress":{params:{growth:{branchAngle:22,gravitropism:.9,apicalDominance:.8,scaffoldBranching:.9,vigorDecay:.72,straightness:2.2,wander:.2,maxTurn:9,phototropism:.1},crown:{shape:1,radius:1.5,height:10,base:.9,bole:.5},leaves:{size:.17,density:3.4,hue:.33,saturation:.38,shape:.1,lightness:.8,form:`spray`},light:{azimuth:80,elevation:40},sky:{timeOfDay:17.2,latitude:40}}},"Weeping willow":{params:{growth:{weeping:1.6,branchAngle:48,gravitropism:.25,straightness:1.3,maxTurn:16,sag:2.2,vigorDecay:.86,wander:.25},crown:{shape:2,radius:4.6,height:6,base:2.2,bole:1.8},leaves:{size:.22,density:3.2,hue:.22,saturation:.5,shape:.15,lightness:1.15,form:`willow`},sky:{timeOfDay:9}}},"Low-gravity alien":{params:{growth:{gravity:.2,torsion:14,gravitropism:.05,phototropism:1.1,attraction:.8,wander:.4,maxTurn:12,growthRate:2.6,straightness:2.4,branchAngle:48,vigorDecay:.9,segmentLength:.42,sag:.3,scaffoldBranching:.5,branchingProbability:.09,apicalDominance:.85,selfPrune:.1,maxOrder:4},crown:{shape:1.8,radius:4.2,height:12,base:3.5,bole:4,attractors:1500},thickness:{exponent:2.2,twigRadius:.008,rootFlare:2},leaves:{size:2,density:.26,hue:.47,saturation:.55,shape:-.2,lightness:1.2,glow:.15,glowHue:.48,form:`frond`},light:{azimuth:35,elevation:82},sky:{timeOfDay:16.5,skyHue:.78,skyTint:.6,sunHue:.6,sunTint:.45,sun2:.5,sun2Hue:.95,sun2Yaw:110,sunSize:1.8,groundHue:.75,groundTint:.55}}},"Crimson world":{params:{growth:{gravity:.7,torsion:-12,branchAngle:80,gravitropism:.5,wander:.8,maxTurn:26,straightness:1.1,vigorDecay:.86,scaffoldBranching:1,phototropism:.6},crown:{shape:2,radius:6.5,height:4.5,base:3.2,bole:2.6},thickness:{exponent:2.2,rootFlare:2.2},leaves:{size:.42,density:2.2,hue:.95,saturation:.8,shape:0,lightness:1,form:`ring`},sky:{timeOfDay:17.8,skyHue:.47,skyTint:.65,sunHue:.02,sunTint:.6,sun2:.8,sun2Hue:.5,sun2Yaw:200,sunSize:2.4,groundHue:.88,groundTint:.6}}},"Bioluminescent night":{params:{growth:{gravity:.6,torsion:3,branchAngle:55,weeping:.7,wander:.5,maxTurn:16,vigorDecay:.86},crown:{shape:.4,radius:4.5,height:7,base:2.6,bole:2},leaves:{size:.3,density:2.4,hue:.52,saturation:.6,shape:0,lightness:.8,glow:.45,glowHue:.5,form:`spiral`},sky:{timeOfDay:23.3,stars:1.8,skyHue:.7,skyTint:.4,groundHue:.6,groundTint:.5}}},"Heavy world":{params:{growth:{gravity:3,gravitropism:.3,branchAngle:75,sag:.45,straightness:1.4,maxTurn:12,vigorDecay:.85,scaffoldBranching:1.1,segmentLength:.18},crown:{shape:2,radius:6.5,height:3.2,base:1,bole:.8},thickness:{exponent:1.6,twigRadius:.011,rootFlare:3},leaves:{size:.3,density:2.8,hue:.2,saturation:.55,shape:-.1,lightness:.85,form:`round`},sky:{timeOfDay:15,skyHue:.11,skyTint:.45,sunHue:.1,sunTint:.35,fog:2.2,groundHue:.15,groundTint:.3}}},"Journey: Earth → alien":{params:{sky:{timeOfDay:16.8}},journey:[{t:0,values:{"growth.gravity":1,"growth.torsion":0,"growth.wander":.3,"leaves.hue":.29,"leaves.size":.26,"leaves.shape":0,"leaves.saturation":.42,"sky.skyHue":.78,"sky.skyTint":0,"sky.sunTint":0,"sky.sun2":0,"sky.groundTint":0,"sky.groundHue":.85,"growth.branchAngle":42}},{t:25,values:{"growth.gravity":1,"growth.torsion":0,"growth.wander":.3,"leaves.hue":.29,"leaves.size":.26,"leaves.shape":0,"leaves.saturation":.42,"sky.skyHue":.78,"sky.skyTint":0,"sky.sunTint":0,"sky.sun2":0,"sky.groundTint":0,"sky.groundHue":.85,"growth.branchAngle":42}},{t:75,values:{"growth.gravity":.2,"growth.torsion":8,"growth.wander":.9,"leaves.hue":.86,"leaves.size":.45,"leaves.shape":-.5,"leaves.saturation":.7,"sky.skyHue":.78,"sky.skyTint":.6,"sky.sunTint":.5,"sky.sun2":.6,"sky.groundTint":.5,"sky.groundHue":.85,"growth.branchAngle":65}}]}};function Sp(e){let t=fl(),n=xp[e]??xp[`Oak meadow`],r=t;for(let[e,t]of Object.entries(n.params))Object.assign(r[e],t);return t}var Cp=class e{dirX=.906;dirZ=.423;base=.35;t=0;setDirection(e){this.dirX=Math.cos(e),this.dirZ=Math.sin(e)}storm=0;update(t,n,r=0,i=0){this.storm=i,this.t+=t*(1+1.6*i);let a=Math.max(0,n)*(1-.5*r);this.base=a+(Math.max(a,e.STORM_BASE)-a)*i}static STORM_BASE=1;static speed(e){return 2+20*e*e}speedAt(t,n){return e.speed(this.gust(t,n))}velocityAt(e,t,n=[0,0]){let r=this.speedAt(e,t);return n[0]=this.dirX*r,n[1]=this.dirZ*r,n}along(e,t){return this.dirX*e+this.dirZ*t}gust(e,t,n=this.t){return this.gustAlong(this.dirX*e+this.dirZ*t,n)}gustAlong(e,t=this.t){return this.base*(.6+.4*Math.sin(.21*t-.5*e))*(.75+.25*Math.sin(1.3*t-.9*e+1.7))}},wp=new Cp,Tp=24,Ep=14,Dp=26,Op=112,kp=27,Ap=1,jp=26e3,Mp=800,Np=[.62,.6,.8],Pp=64,Fp=4,Ip=2e4,Lp=900,Rp=[`daisy`,`buttercup`,`poppy`,`clover`],zp=8;function Bp(e){let t=e.image,n=t.getContext(`2d`).getImageData(0,0,t.width,t.height).data,r=0,i=0,a=0,o=0;for(let e=0;e<n.length;e+=16)n[e+3]>=128&&(r+=n[e],i+=n[e+1],a+=n[e+2],o++);let s=new J(.5,.6,.4);return o&&s.setRGB(r/o/255,i/o/255,a/o/255,Me),[Math.max(.02,s.r),Math.max(.02,s.g),Math.max(.02,s.b)]}var Vp={grass:1.1,flower:.7,scenery:.9},Hp=(e,t)=>{let n=new J(e),r=(.3*n.r+.59*n.g+.11*n.b)/t;return[n.r/r,n.g/r,n.b/r]},Up=Hp(8176188,1.18),Wp=Hp(14205040,1.45),Gp=Hp(10722414,.92),Kp=[0,.5,2,1],qp=[.95,.86,.62];function Jp(){let e=[],t=[],n=[];for(let r=0;r<3;r++){let i=r/3*Math.PI,a=Math.cos(i)*.5,o=Math.sin(i)*.5,s=[[-a,0,-o,0,0],[a,0,o,1,0],[a,1,o,1,1],[-a,1,-o,0,1]];for(let r of[[0,1,2],[0,2,3],[0,2,1],[0,3,2]])for(let i of r)e.push(s[i][0],s[i][1],s[i][2]),t.push(0,1,0),n.push(s[i][3],s[i][4])}let r=new kr;return r.setAttribute(`position`,new _r(e,3)),r.setAttribute(`normal`,new _r(t,3)),r.setAttribute(`uv`,new _r(n,2)),r}var Yp=(e,t)=>{let n=Math.sin(e*127.1+t*311.7)*43758.5453;return n-Math.floor(n)};function Xp(e,t){let n=Math.floor(e),r=Math.floor(t),i=e-n,a=t-r,o=i*i*(3-2*i),s=a*a*(3-2*a),c=Yp(n,r),l=Yp(n+1,r),u=Yp(n,r+1),d=Yp(n+1,r+1);return c+(l-c)*o+(u-c)*s+(c-l-u+d)*o*s}var Zp=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)},Qp=class{group=new En;patches=[];kx=new Float32Array(Tp);kz=new Float32Array(Tp);phaseD=new Float32Array(Tp);dirty=[];key=``;seasonKey=-1;LS={fresh:0,straw:0,winter:0,height:1};TS={leaf:1,bare:!1,bareSize:1,evergreen:!1,pale:0,turn:0,dry:0,shade:0,brown:!1};trunkKey=``;neverBaked=!0;nearPatches(){let e=[];return this.patches.forEach((t,n)=>{t.far||e.push(n)}),e}lightKeyT=-1e9;lightVersion=-1;L=null;shUp=new Float32Array(12544).fill(1);shSun=new Float32Array(12544).fill(1);bkUp=new Float32Array(12544);bkSun=new Float32Array(12544);shTmp=new Float32Array(12544);shKey=``;fillRow=-1;fillSun=[0,1,0];fillCol=-1;blurStage=0;rect=[0,-1,0,-1];col=new J;tintCol=new J;counts={grass:0,flowers:0,meshes:0};stats={lastMs:0,maxMs:0,bakes:0,sliceMaxMs:0,sumMs:0,seasonRebakes:0};constructor(e,t=7,n=!0){let r=e.isMeshLambertMaterial||e.isMeshBasicMaterial,i=(t,n=!1)=>{let i=Df(t,n),a;a=r?e.clone():new Ki({side:0,map:i,alphaTest:.5}),a.map=i,a.userData.mean=Bp(t);let o=new Gi({side:0,blending:0});return o.allowOverride=!1,o.onBeforeCompile=e=>{e.uniforms.cutMap={value:i},e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec2 vCutUv;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
vCutUv = uv;`),e.fragmentShader=e.fragmentShader.replace(`void main() {`,`uniform sampler2D cutMap;
varying vec2 vCutUv;
void main() {`).replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>
if (texture2D(cutMap, vCutUv).a < 0.5) discard;`)},{m:a,gb:o}},a=Jp(),o=new vl(t),s=30/Tp;for(let e=0;e<Tp;e++)this.phaseD[e]=-15+(e+.5)*s;let c=(e,t)=>Math.min(23,Math.max(0,Math.floor((wp.along(e,t)+15+o.range(-.5,.5))/s))),l=[],u=(e,t,n,r,i)=>{(l[e]??=[]).push(t,n,o.next()*Math.PI,r,i,o.next(),o.next(),Math.hypot(t,n))};for(let e=0;e<jp;e++){let e;if(o.next()<.3)do e=-6*Math.log(Math.max(1e-9,o.next()*o.next()));while(e>Dp);else do e=Dp*Math.sqrt(o.next());while(o.next()>1-.9*Zp(16,Dp,e));let t=o.next()*Math.PI*2,n=Math.cos(t)*e,r=Math.sin(t)*e,i=o.next()<.16,a=1-.65*Zp(18,27,e),s=(1+Math.min(e,Ep)/11)*a,l=o.range(.26,.5)*s,d=(i?o.range(.34,.5):o.range(.13,.3))*(1+e/22)*a;u(e>Ep?Math.floor(o.next()*Tp):c(n,r),n,r,l,d)}Rp.forEach((e,t)=>{let n=Math.round(Mp*[1,1,.45,.8][t]);for(;n>0;){let e=1.6+11*Math.sqrt(o.next()),r=o.next()*Math.PI*2,i=Math.cos(r)*e,a=Math.sin(r)*e,s=o.range(.35,1.3),l=Math.min(n,5+Math.floor(o.next()*o.next()*40));for(let e=0;e<l;e++){let e=i+(o.next()+o.next()-1)*s*1.4,n=a+(o.next()+o.next()-1)*s*1.4,r=o.range(.2,.38)*(t===3?.7:1)*(1+Math.hypot(e,n)/28);u(Tp+t*2+(c(e,n)%6<3?0:1),e,n,r*.8,r)}n-=l}});let d=Tp+Rp.length*2;if(n){let e=new vl(t+101),n=(t,n,r,i,a)=>{(l[t]??=[]).push(n,r,e.next()*Math.PI,i,a,e.next(),e.next(),Math.hypot(n,r))};for(let t=0;t<Ip;t++){let r;do r=13+51*e.next();while(e.next()>r/30*Math.exp(-(r-13)/12)*Zp(12,20,r)*2.2);let i=e.next()*Math.PI*2,a=1-.8*Zp(46,Pp,r),o=e.next()<.2,s=1+(r-13)/16;n(d+t%Fp,Math.cos(i)*r,Math.sin(i)*r,e.range(.6,1.1)*s*(.5+.5*a),(o?e.range(.4,.6):e.range(.2,.36))*(1+r/45)*a)}for(let t=0;t<3;t++){let r=Math.round(Lp*[.45,.4,.15][t]);for(;r>0;){let i=13+40*e.next()**1.5,a=e.next()*Math.PI*2,o=e.range(1,3.5),s=Math.min(r,4+Math.floor(e.next()*e.next()*30));for(let r=0;r<s;r++){let r=Math.cos(a)*i+(e.next()+e.next()-1)*o*1.6,s=Math.sin(a)*i+(e.next()+e.next()-1)*o,c=e.range(.3,.46)*(1+Math.hypot(r,s)/40);n(d+Fp+t,r,s,c*1.1,c)}r-=s}}}let f=d+Fp+3;if(n)for(let e of Ju())(l[f+(e.bush?2:e.hash<.5?0:1)]??=[]).push(e.x,e.z,e.hash*Math.PI,e.w,e.h,e.hash,e.hash*7.31%1,e.y);let p=[i(Iu(5)),i(Iu(9))],m=n?[i(Lu(3,!1)),i(Lu(8,!1)),i(Lu(5,!0)),i(Ru(3,!1),!0),i(Ru(8,!1),!0),i(Ru(5,!0),!0)]:[];if(n)for(let e=0;e<3;e++)l[f+3+e]=l[f+e]??[];let h=Rp.map(e=>i(zu(e)));for(let e=0;e<d+(n?13:0);e++){let t=new Float32Array(l[e]??[]),n=t.length/zp,r=e>=f,i=e>=d,o=r?!1:i?e>=d+Fp:e>=Tp,s=r?m[e-f]:i?o?h[e-d-Fp]:p[e%2]:o?h[e-Tp>>1]:p[e%2],c=new di(a,s.m,Math.max(1,n));c.instanceColor=new ri(new Float32Array(Math.max(1,n)*3),3),c.castShadow=!1,c.receiveShadow=!1,c.frustumCulled=!1,c.matrixAutoUpdate=!1,c.userData.gbufferMaterial=s.gb,c.count=0,e>=f+3&&(c.renderOrder=-1),this.group.add(c),this.patches.push({mesh:c,data:t,n,flower:o,far:i,scenery:r,phase:i?((e-d)*5+2)%Tp:o?(e-Tp)%2?16:13:e,bare:e>=f+3,shown:0,sum:[0,0,0],kind:o?i?e-d-Fp:e-Tp>>1:-1})}this.counts.meshes=this.patches.length,this.bushMat=n?m[2].m:null,this.bushBare=n?m[5].m:null}bushMat=null;bushBare=null;probe(){let e=()=>({n:0,rgb:[0,0,0]}),t={tufts:e(),flowers:e(),trees:e(),bare:e()};for(let e of this.patches){let n=e.bare?t.bare:e.scenery?t.trees:e.flower?t.flowers:t.tufts;n.n+=e.shown;for(let t=0;t<3;t++)n.rgb[t]+=e.sum[t]}for(let e of Object.values(t))e.rgb=e.rgb.map(t=>+(t/Math.max(1,e.n)).toFixed(4));return t}frame(e,t,n){for(let e=0;e<Tp;e++){let t=this.phaseD[e],n=wp.gustAlong(t),r=wp.base*.1,i=n*.95+r*Math.sin(wp.t*3.1+e*2.4),a=r*.8*Math.sin(wp.t*2.3+e*1.7);this.kx[e]=wp.dirX*i-wp.dirZ*a,this.kz[e]=wp.dirZ*i+wp.dirX*a}for(let e of this.patches){if(e.scenery)continue;let t=e.mesh.matrix.elements;t[4]=this.kx[e.phase],t[6]=this.kz[e.phase],e.mesh.matrixWorldNeedsUpdate=!0}e.lightVersion!==this.lightVersion&&n-this.lightKeyT>3&&(this.lightVersion=e.lightVersion,this.lightKeyT=n);let r=t.sunDir,i=e=>(e.r+e.g+e.b).toFixed(1),a=`${r.x.toFixed(2)},${r.y.toFixed(2)},${r.z.toFixed(2)}|${this.lightVersion}`,o=`${i(t.sunCol)}|${i(t.hemi)}|${t.night.toFixed(1)}${t.night>0?`n`:`d`}${t.night<1?``:`N`}|${t.tint.toFixed(2)},${t.tintHue.toFixed(2)}|${t.frac}`,s=(e.nodes[0]?.radius??0).toFixed(2);this.L=t,a!==this.shKey&&this.fillRow<0&&(this.shKey=a,this.fillSun=[r.x,Math.max(.08,r.y),r.z],this.beginFill(e)),o===this.key?s!==this.trunkKey&&(this.trunkKey=s,this.dirty=this.nearPatches()):(this.key=o,this.trunkKey=s,this.dirty=this.patches.map((e,t)=>t));let c=df(Yd.phase);c!==this.seasonKey&&(this.seasonKey=c,this.stats.seasonRebakes++,this.dirty.length<this.patches.length&&(this.dirty=[...new Set([...this.dirty,...this.patches.map((e,t)=>t)])]));let l=performance.now();if(this.fillRow>=0)this.fillShade(e,l+Ap);else for(;this.dirty.length&&(this.bake(e,this.dirty.shift()),!(performance.now()-l>Ap)););let u=performance.now()-l;u>this.stats.sliceMaxMs&&(this.stats.sliceMaxMs=u)}bakeAll(e){for(this.fillRow>=0&&this.fillShade(e,1/0);this.dirty.length;)this.bake(e,this.dirty.shift())}beginFill(e){let t=e.lightGrid,n=this.rect,r=Op/54;if(this.bkUp.fill(1),this.bkSun.fill(1),!t){n[0]=n[2]=0,n[1]=n[3]=-1,this.fillRow=0;return}let[i,a,o]=this.fillSun,s=(t.ny*t.cell+Math.max(0,t.oy))/a,c=t.ox,l=t.ox+t.nx*t.cell,u=t.oz,d=t.oz+t.nz*t.cell,f=e=>Math.min(111,Math.max(0,Math.floor((e+kp)*r)));n[0]=f(Math.min(c,c-i*s)-1.5),n[1]=f(Math.max(l,l-i*s)+1.5),n[2]=f(Math.min(u,u-o*s)-1.5),n[3]=f(Math.max(d,d-o*s)+1.5),this.fillRow=n[2]}fillShade(e,t){let[n,r,i]=this.fillSun,a=54/Op,[o,s,c,l]=this.rect;for(;this.fillRow<=l;){let c=-27+(this.fillRow+.5)*a,l=this.fillRow*Op;for(let u=this.fillCol<0?o:this.fillCol;u<=s;u++){let o=-27+(u+.5)*a;if(this.bkUp[l+u]=this.transmit(e,o,c,0,1,0),this.bkSun[l+u]=this.transmit(e,o,c,n,r,i),(u&7)==7&&u<s&&performance.now()>t){this.fillCol=u+1;return}}if(this.fillCol=-1,this.fillRow++,performance.now()>t)return}let u=this.shTmp,d=Math.max(0,o-2),f=Math.min(111,s+2),p=Math.max(0,c-2),m=Math.min(111,l+2);for(;this.blurStage<2;this.blurStage++){if(this.blurStage===1&&performance.now()>t)return;let e=this.blurStage?this.bkSun:this.bkUp,n=this.blurStage?this.shSun:this.shUp;n.fill(1),u.fill(1);for(let t=c;t<=l;t++)for(let n=d,r=t*Op;n<=f;n++){let t=n>0?n-1:0,i=n>1?n-2:0,a=n<111?n+1:111,o=n<110?n+2:111;u[r+n]=(e[r+i]+e[r+o]+4*(e[r+t]+e[r+a])+6*e[r+n])/16}for(let e=p;e<=m;e++){let t=(e>0?e-1:0)*Op,r=(e>1?e-2:0)*Op,i=(e<111?e+1:111)*Op,a=(e<110?e+2:111)*Op,o=e*Op;for(let e=d;e<=f;e++)n[o+e]=(u[r+e]+u[a+e]+4*(u[t+e]+u[i+e])+6*u[o+e])/16}}this.blurStage=0,this.fillRow=-1,this.dirty=this.neverBaked?this.patches.map((e,t)=>t):[...new Set([...this.dirty,...this.nearPatches()])]}shade(e,t,n){let r=Op/54,i=Math.min(110.999,Math.max(0,(t+kp)*r-.5)),a=Math.min(110.999,Math.max(0,(n+kp)*r-.5)),o=i|0,s=a|0,c=i-o,l=a-s,u=s*Op+o,d=e[u]+(e[u+1]-e[u])*c;return d+(e[u+Op]+(e[u+Op+1]-e[u+Op])*c-d)*l}transmit(e,t,n,r,i,a){let o=e.lightGrid;if(!o)return 1;let{dens:s,nx:c,ny:l,nz:u,cell:d}=o,f=(t-o.ox)/d,p=(.05-o.oy)/d,m=(n-o.oz)/d,h=0,g=1e9;for(let e=0;e<3;e++){let t=e===0?f:e===1?p:m,n=e===0?r:e===1?i:a,o=e===0?c:e===1?l:u;if(Math.abs(n)<1e-6){if(t<0||t>=o)return 1;continue}let s=-t/n,d=(o-t)/n;h=Math.max(h,Math.min(s,d)),g=Math.min(g,Math.max(s,d))}if(g<=h)return 1;f+=r*(h+.01),p+=i*(h+.01),m+=a*(h+.01);let _=0;for(let e=0;e<96;e++){let e=Math.floor(f),t=Math.floor(p),n=Math.floor(m);if(e<0||t<0||n<0||e>=c||t>=l||n>=u)break;_+=s[(t*u+n)*c+e],f+=r,p+=i,m+=a}return Math.exp(-.05*_)}bake(e,t){let n=this.L;if(!n)return;let r=performance.now(),i=this.patches[t],{data:a,mesh:o}=i,s=i.scenery?i.n:Math.min(i.n,Math.ceil(i.n*n.frac)),c=o.instanceMatrix.array,l=o.instanceColor.array,u=e.nodes[0],d=u?.wx??0,f=u?.wz??0,p=Math.max(.03,u?.radius??.05),m=n.sunCol,h=n.hemi,g=Math.max(0,n.sunDir.y),_=this.tintCol.setHSL(n.tintHue,.55,.4),v=1-n.night,y=n.night,b=o.material.userData.mean,x=Wf*y,S=1+((i.scenery?Vp.scenery:i.flower?Vp.flower:Vp.grass)-1)*y,C=Yd.phase,w=ff(C,this.LS),T=this.TS,E=df(C)!==-1,D=i.flower?pf(C,Kp[i.kind]??0):1,O=0,k=0,A=0,j=0,M=e=>{let t=l[e]*b[0],n=l[e+1]*b[1],r=l[e+2]*b[2],i=.3*t+.59*n+.11*r;l[e]=(t+(i*Gf[0]-t)*x)*S/b[0],l[e+1]=(n+(i*Gf[1]-n)*x)*S/b[1],l[e+2]=(r+(i*Gf[2]-r)*x)*S/b[2]};for(let e=0;e<s;e++){let t=e*zp,r=a[t],o=a[t+1],s=a[t+2],u=a[t+5],x=a[t+6],S=a[t+3],N=a[t+4],P=Math.hypot(r-d,o-f);E&&!i.scenery&&!i.flower&&(N*=w.height);let F=i.mesh.material===this.bushMat||i.mesh.material===this.bushBare;i.scenery&&gf(C,u,x,Xp(r/130+2.2,o/130-4.1),F,T);let I=i.far?1:this.shade(this.shUp,r,o),L=i.far?1:.38+.34*n.night+(.62-.34*n.night)*this.shade(this.shSun,r,o),R=P>p*1.3+.02;if(i.scenery){R=i.bare?T.bare:T.leaf>0;let e=i.bare?T.bareSize:T.leaf;S*=e,N*=e}else if(i.flower)(I<.55+.3*u||P<p*3+.5)&&(R=!1),D<1&&x*17.3%1>=D&&(R=!1),N*=1-.2*n.night;else{let e=P<p*2.2+.25;!e&&u>.4+.6*I&&(R=!1),N*=e?.8+.5*x:.55+.45*I,e&&(S*=.75);let t=Math.min(1,Math.max(0,(P-p*1.3)/.55));N*=.4+.6*t*t*(3-2*t)}let ee=i.scenery&&!i.bare&&!F?.2*T.turn:0,te=Math.cos(s),ne=Math.sin(s),z=e*16;R||(S=N=0),c[z]=te*S,c[z+1]=0,c[z+2]=-ne*S,c[z+3]=0,c[z+4]=(x-.5)*.3*N,c[z+5]=N,c[z+6]=(u-.5)*.3*N,c[z+7]=0,c[z+8]=ne*S,c[z+9]=0,c[z+10]=te*S,c[z+11]=0,c[z+12]=r,c[z+13]=(i.scenery?a[t+7]:0)-.03*N-ee*N,c[z+14]=o,c[z+15]=1;let B=this.col;if(i.bare)B.setRGB(qp[0],qp[1],qp[2]).multiplyScalar(.72+.4*u);else if(i.scenery){if(B.setRGB(Np[0],Np[1],Np[2]).multiplyScalar(.7+.5*u).multiply(this.tintCol.setRGB(1+.25*(x-.5),1,1-.3*(x-.5))),T.evergreen&&E&&B.multiplyScalar(1-.42*Math.max(w.winter,w.straw,.6*w.fresh)),T.pale>0&&(B.r*=1+.5*T.pale,B.g*=1+.3*T.pale,B.b*=1-.3*T.pale),T.turn>0){let e=B.r*b[0],t=B.g*b[1],n=B.b*b[2],r=.3*e+.59*t+.11*n,i=T.shade,a=this.tintCol.setHSL(T.brown?.075+.03*i:.052+.093*i,(T.brown?.38:.55+.3*i)*(1-.4*T.dry),.5,Me),o=r*(T.brown?.95:1.25+1.2*i)*(1-.25*T.dry)/(.3*a.r+.59*a.g+.11*a.b),s=T.turn;B.r=(e+(a.r*o-e)*s)/b[0],B.g=(t+(a.g*o-t)*s)/b[1],B.b=(n+(a.b*o-n)*s)/b[2]}}else if(i.flower)B.setRGB(1,.94,1.1).multiplyScalar((.62+.16*x)*(.6+.4*v));else{let e=Xp(r*.23+3.1,o*.23-1.7),s=Xp(r*1.3,o*1.3),c=i.scenery?1:Zp(9,22,a[t+7]),l=Zp(.5,.8,e*.7+s*.2+x*.25)*(1-.7*c),d=(.72+.34*u+.14*(s-.5))*(1-.16*c);if(B.setRGB(d*(.95+.45*l),d*(.66+.1*l),d*(1.7-.5*l)),E){let e=B.r*b[0],t=B.g*b[1],n=B.b*b[2],r=.3*e+.59*t+.11*n,i=.65*w.fresh,a=Math.min(.92,w.straw*(.45+.75*x)),o=w.winter*(.7+.25*u),s=Math.max(0,1-i-a-o);B.r=(e*s+r*(i*Up[0]+a*Wp[0]+o*Gp[0]))/b[0],B.g=(t*s+r*(i*Up[1]+a*Wp[1]+o*Gp[1]))/b[1],B.b=(n*s+r*(i*Up[2]+a*Wp[2]+o*Gp[2]))/b[2]}if(n.tint>0){let e=(B.r*.3+B.g*.59+B.b*.11)*2;B.r+=(_.r*e-B.r)*n.tint,B.g+=(_.g*e-B.g)*n.tint,B.b+=(_.b*e-B.b)*n.tint}B.multiplyScalar(.72+.28*Zp(p*.6,p*7,P))}let V=.78+.22*Math.min(I,L),re=g+.4*(1-g)*(1-g),ie=(e,t)=>Math.min(4,(e*V+t*re*L+1e-4)/(e+t*g+1e-4));if(i.scenery){let t=Math.min(1.5,ie(h.g,m.g));l[e*3]=B.r*t,l[e*3+1]=B.g*t,l[e*3+2]=B.b*t,y>0&&M(e*3),R&&(O++,k+=l[e*3],A+=l[e*3+1],j+=l[e*3+2])}else l[e*3]=B.r*ie(h.r,m.r),l[e*3+1]=B.g*ie(h.g,m.g),l[e*3+2]=B.b*ie(h.b,m.b),y>0&&M(e*3),R&&(O++,k+=l[e*3],A+=l[e*3+1],j+=l[e*3+2])}i.shown=O,i.sum[0]=k,i.sum[1]=A,i.sum[2]=j,i.bare&&(o.visible=O>0),i.far&&(this.neverBaked=!1),o.count=s,o.instanceMatrix.needsUpdate=!0,o.instanceColor.needsUpdate=!0;let N=0,P=0;for(let e of this.patches)e.flower?P+=e.mesh.count:N+=e.mesh.count;this.counts.grass=N,this.counts.flowers=P;let F=performance.now()-r;this.stats.sumMs+=F,this.stats.lastMs=F,this.stats.maxMs=Math.max(this.stats.maxMs,F),this.stats.bakes++}},$p={clear:{label:`Clear`,cloud:0,flutter:0,rain:0,wind:0,breeze:.5,clear:1,haze:0,min:12,max:20,type:`none`,base:0,odds:[2,3,1.5,1.5]},fair:{label:`Fair`,cloud:0,flutter:.14,rain:0,wind:0,breeze:1,clear:0,haze:0,min:10,max:17,type:`cumulus`,base:1500,odds:[2,2.5,1.5,1]},cloudy:{label:`Sun and clouds`,cloud:.06,flutter:.3,rain:0,wind:0,breeze:1.25,clear:0,haze:0,min:14,max:22,type:`stratocumulus`,base:1200,odds:[3,2.5,2,1.5]},overcast:{label:`Overcast`,cloud:.5,flutter:.06,rain:0,wind:0,breeze:.9,clear:0,haze:.12,min:12,max:19,type:`stratus`,base:700,odds:[1.5,.7,2.5,3]},drizzle:{label:`Drizzle`,cloud:.58,flutter:0,rain:.2,wind:0,breeze:.5,clear:0,haze:.3,min:14,max:22,type:`stratus`,base:400,odds:[1.2,.4,2,2]},shower:{label:`Shower`,cloud:.7,flutter:0,rain:.62,wind:.22,breeze:1.2,clear:0,haze:.1,min:8,max:14,type:`cumulonimbus`,base:900,odds:[2.5,1.5,1,.6]},rain:{label:`Rain`,cloud:.84,flutter:0,rain:.5,wind:.15,breeze:1,clear:0,haze:.25,min:19,max:29,type:`nimbostratus`,base:500,odds:[1,.6,2,1.5]},storm:{label:`Thunderstorm`,cloud:0,flutter:0,rain:0,wind:0,breeze:1,clear:0,haze:0,min:0,max:0,type:`cumulonimbus`,base:600,odds:[.5,1.6,.4,.1]},windy:{label:`Windy`,cloud:.06,flutter:.14,rain:0,wind:.42,breeze:1.5,clear:.3,haze:0,min:14,max:22,type:`cumulus`,base:1300,odds:[1.2,.5,2,1.5]},mist:{label:`Mist`,cloud:.14,flutter:0,rain:0,wind:0,breeze:.15,clear:0,haze:1,min:12,max:19,type:`fog`,base:0,odds:[1.5,.5,3,2]}},em=[`drizzle`,`shower`,`rain`,`storm`];function tm(e,t,n,r,i){return 10.5+9.5*Math.cos((e-.42)*2*Math.PI)+(4.5+3.5*(.5-.5*Math.cos((e-.875)*2*Math.PI)))*(1-.65*n)*Math.cos((t-15)/24*2*Math.PI)-3.5*r-1.2*n-2.5*Math.max(0,i-.35)}function nm(e){return e<.07?`Calm`:e<.2?`Light air`:e<.42?`Light breeze`:e<.56?`Breeze`:e<.72?`Fresh wind`:e<.9?`Strong wind`:`Gale`}function rm(e,t){let n=Math.atan2(-e,t)*180/Math.PI;return[`N`,`NE`,`E`,`SE`,`S`,`SW`,`W`,`NW`][(Math.round(n/45)%8+8)%8]}var im={calm:{wind:0,cloud:0,rain:0,min:0,max:0,next:`breeze`},breeze:{wind:.4,cloud:.45,rain:0,min:8,max:14,next:`front`},front:{wind:.85,cloud:1,rain:.12,min:8,max:12,next:`rain`},rain:{wind:1,cloud:1,rain:1,min:34,max:64,next:`clearing`},clearing:{wind:.25,cloud:.3,rain:0,min:14,max:19,next:`calm`}},am=new class{phase=`calm`;phaseT=0;phaseLen=0;wind=0;cloud=0;rain=0;flash=0;bolt={on:!1,variant:0,u:0,dist:500};strikes=0;onStrike=null;holdFlash=!1;nextStorm=240+Math.random()*420;pulses=[];strikeAge=1e9;nextStrike=3;wasForced=!1;amb=`fair`;kindT=0;kindLen=6+Math.random()*6;clear=0;haze=0;breeze=1;temp=15;sinceRain=0;sinceStorm=60+Math.random()*60;t=Math.random()*1e3;rnd=Math.random;sw=0;sc=0;sr=0;aw=0;ac=0;ar=0;quick=!1;wasWet=!1;held=``;seen={};get kind(){return this.phase!==`calm`&&this.phase!==`clearing`?`storm`:this.amb}get label(){return this.phase===`clearing`?`Clearing up`:$p[this.kind].label}get snow(){return this.rain>0&&this.temp<=.5}get precip(){return this.rain<=0?`none`:this.snow?`snow`:`rain`}get cover(){return Math.min(1,.35+.65*this.cloud-.27*this.clear*(1-this.cloud))}get cloudType(){return this.kind===`storm`?`cumulonimbus`:$p[this.amb].type}get cloudBase(){return $p[this.kind].base}cloudSpeed(e){return 3+28*e}snap(e){e&&$p[e]&&e!==`storm`&&(this.amb=e,this.kindT=0);let t=$p[this.amb];this.aw=t.wind,this.ac=t.cloud+t.flutter*.5,this.ar=t.rain,this.clear=t.clear,this.haze=t.haze,this.breeze=t.breeze,this.mix()}mix(){this.wind=Math.max(this.sw,this.aw),this.cloud=Math.max(this.sc,this.ac),this.rain=Math.max(this.sr,this.ar)}setKind(e){let t=$p[e];this.wasWet=em.includes(this.amb),this.amb=e,this.kindT=0,this.seen[e]=this.t,this.kindLen=t.min+this.rnd()*(t.max-t.min)}odds(e,t,n){let r=$p[e].odds,i=e=>Math.max(0,1-Math.min(Math.abs(t-e),1-Math.abs(t-e))*4),a=r[0]*i(.125)+r[1]*i(.375)+r[2]*i(.64)+r[3]*i(.89);return e===`mist`&&(a*=n>=4.5&&n<=8.5?10:0),a*Math.min(4,.35+(this.t-(this.seen[e]??-150))/110)}pick(e,t){let n=Object.keys($p).filter(e=>e!==this.amb);this.sinceStorm>235?n=[`storm`]:this.sinceRain>60?n=n.filter(e=>em.includes(e)):em.includes(this.amb)&&this.rnd()<.7&&(n=n.filter(e=>e===`clear`||e===`fair`||e===`cloudy`));let r=n.map(n=>this.odds(n,e,t)+1e-4),i=this.rnd()*r.reduce((e,t)=>e+t,0),a=n[n.length-1];for(let e=0;e<n.length;e++)if((i-=r[e])<=0){a=n[e];break}a===`storm`?(this.seen.storm=this.t,this.wasWet=em.includes(this.amb),this.amb=`fair`,this.kindT=0,this.kindLen=8+this.rnd()*8,this.quick=!0,this.enter(`breeze`)):this.setKind(a)}get violence(){return Math.max(this.sw,.5*this.aw)}get storming(){return this.phase!==`calm`||this.wind>0||this.cloud>0||this.rain>0}trigger(){(this.phase===`calm`||this.phase===`clearing`)&&this.enter(`breeze`)}snapStorm(){this.enter(`rain`),this.sw=this.sc=this.sr=1,this.mix()}strike(){this.strikeAge=0;let e=1+Math.floor(Math.random()*3);this.pulses=[0];for(let t=1;t<e;t++)this.pulses.push(this.pulses[t-1]+.09+Math.random()*.13);this.bolt.variant=Math.floor(Math.random()*3),this.bolt.u=Math.random()*2-1,this.bolt.dist=300+Math.random()*500,this.strikes++,this.onStrike?.(this.bolt.dist)}enter(e){let t=im[e];this.phase=e,this.phaseT=0,this.phaseLen=(t.min+Math.random()*(t.max-t.min))*(this.quick?e===`rain`?.4:.55:1),e===`rain`&&(this.nextStrike=2+Math.random()*4)}update(e,t,n,r={}){let i=t===`auto`&&r.kind&&r.kind!==`auto`&&$p[r.kind]?r.kind:null,a=t===`storm`||i===`storm`,o=r.phase??.375,s=r.hour??12;this.t+=e,i&&i!==`storm`&&this.phase!==`calm`&&(this.phase=`calm`,this.quick=!1),a&&this.phase===`calm`&&this.enter(`breeze`),(t===`calm`||this.wasForced&&!a)&&this.phase!==`calm`&&this.phase!==`clearing`&&this.enter(`clearing`),this.wasForced=a,this.phase===`calm`?(i&&i!==`storm`?this.amb!==i&&this.setKind(i):t===`auto`&&!a&&(this.kindT+=e,this.amb===`mist`&&s>9.5&&(this.kindT=this.kindLen),(this.kindT>=this.kindLen||this.held)&&this.pick(o,s)),this.held=i??``):(this.phaseT+=e,this.phaseT>=this.phaseLen&&!(a&&this.phase===`rain`)&&(this.enter(im[this.phase].next),this.phase===`calm`&&(this.nextStorm=240+Math.random()*420,this.quick=!1))),this.phase===`rain`?this.sinceStorm=0:this.sinceStorm+=e;let c=im[this.phase],l=(t,n,r)=>{let i=t+(n-t)*(1-Math.exp(-e/r));return Math.abs(i-n)<.002?n:i};this.sw=l(this.sw,c.wind,3.5),this.sc=l(this.sc,c.cloud,5),this.sr=l(this.sr,c.rain,3);let u=t===`auto`&&!a&&this.phase===`calm`,d=$p[u?this.amb:`storm`],f=.5+.5*Math.sin(.33*this.t+1.4*Math.sin(.117*this.t)),p=u?1+.35*Math.sin(.021*this.t+2*Math.sin(.0077*this.t)):1;this.aw=l(this.aw,d.wind,4),this.ac=l(this.ac,d.cloud+d.flutter*f,this.wasWet&&this.ac>d.cloud+d.flutter?2.6:5),this.ar=l(this.ar,d.rain,3),this.clear=l(this.clear,d.clear,6),this.haze=l(this.haze,d.haze,7),this.breeze=l(this.breeze,d.breeze*p,6),this.mix(),this.rain>.05?this.sinceRain=0:this.sinceRain+=e,this.temp=tm(o,s,this.cloud,this.rain,r.wind??.35),this.strikeAge+=e,n&&this.phase===`rain`&&this.rain>.6&&(this.nextStrike-=e)<=0&&(this.strike(),this.nextStrike=5+Math.random()*10);let m=0,h=!1;if(n){for(let e of this.pulses){let t=this.strikeAge-e;t<0||(t<.06&&(h=!0),m=Math.max(m,t<.05?1:Math.exp(-(t-.05)/.07)))}m<.01&&(m=0),this.holdFlash&&(m=1,h=!0)}this.flash=m,this.bolt.on=h}},om=[{d:16,tile:7,speed:9,alpha:.5},{d:6,tile:3.2,speed:10,alpha:.4},{d:2.2,tile:1.7,speed:11,alpha:.17}],sm=110,cm=80;function lm(e){return()=>{e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function um(e,t,n,r){let i=document.createElement(`canvas`);i.width=256,i.height=512;let a=i.getContext(`2d`),o=lm(e);a.lineCap=`round`;for(let e=0;e<t;e++){let e=o()*256,t=o()*512,i=n*(.5+o()),s=.25+.6*o();for(let n of[-512,0,512]){let c=a.createLinearGradient(0,t+n,0,t+n+i);c.addColorStop(0,`rgba(255,255,255,0)`),c.addColorStop(.7,`rgba(255,255,255,${s})`),c.addColorStop(1,`rgba(255,255,255,0)`),a.strokeStyle=c,a.lineWidth=r*(.6+.8*o()),a.beginPath(),a.moveTo(e,t+n),a.lineTo(e,t+n+i),a.stroke()}}return i}function dm(e){let t=document.createElement(`canvas`);t.width=256,t.height=512;let n=t.getContext(`2d`),r=lm(e),i=(e,t,a,o,s,c,l)=>{let u=[[e,t]];for(;t<a;)t+=8+r()*22,e+=(r()-.5)*34+o,e=Math.max(20,Math.min(236,e)),u.push([e,t]),l<2&&r()<.16&&i(e,t,Math.min(a,t+60+r()*150),(r()-.5)*16,s*.45,c*.6,l+1);for(let[e,t,r]of[[s*6,.035*c,8],[s*2.4,.12*c,3],[s,c,0]])n.strokeStyle=`rgba(255,255,255,${t})`,n.lineWidth=e,n.lineJoin=`round`,n.lineCap=`round`,n.shadowColor=`rgba(255,255,255,0.5)`,n.shadowBlur=r,n.beginPath(),u.forEach(([e,t],r)=>r?n.lineTo(e,t):n.moveTo(e,t)),n.stroke()};return i(128+(r()-.5)*60,0,510,0,1.7,1,0),t}var fm=class{group=new En;sheets=[];bolt;boltMaps=[];fwd=new q;right=new q;rot=new Dt;zAxis=new q(0,0,1);constructor(e){let t=(t,r)=>{let i=new Ei(t);return i.colorSpace=e.map?.colorSpace??`srgb`,r&&(i.wrapS=i.wrapT=n),i},r=new Vr({visible:!1});r.allowOverride=!1;let i=new Ni(1,1);om.forEach((n,a)=>{let o=e.clone();o.map=t(um(11+a*7,a===0?260:a===1?130:60,a===0?30:a===1?42:46,a===0?.9:a===1?1:1.1),!0),o.color.setRGB(1,1,1);let s=new $r(i,o);s.renderOrder=6+a,s.frustumCulled=!1,s.visible=!1,s.userData.gbufferMaterial=r,this.sheets.push(s),this.group.add(s)});for(let e=0;e<3;e++)this.boltMaps.push(t(dm(101+e*13),!1));let a=e.clone();a.map=this.boltMaps[0],a.blending=2,this.bolt=new $r(i,a),this.bolt.renderOrder=5,this.bolt.frustumCulled=!1,this.bolt.visible=!1,this.bolt.userData.gbufferMaterial=r,this.group.add(this.bolt)}frame(e,t,n,r,i,a,o=3){let s=t.rain,c=s>.01;if(e.getWorldDirection(this.fwd),this.right.set(1,0,0).applyQuaternion(e.quaternion),c){let a=Math.tan(e.fov*Math.PI/360),c=(n.dirX*this.right.x+n.dirZ*this.right.z)*n.base,l=Math.max(-.75,Math.min(.75,Math.atan(c*.95)));this.rot.setFromAxisAngle(this.zAxis,l);let u=i*(1+2.2*t.flash);for(let t=0;t<this.sheets.length;t++){let i=this.sheets[t],c=om[t],l=i.material;if(i.visible=t>=this.sheets.length-o,!i.visible)continue;let d=2*c.d*a*Math.hypot(1,e.aspect)*1.08;i.position.copy(e.position).addScaledVector(this.fwd,c.d),i.quaternion.copy(e.quaternion).multiply(this.rot),i.scale.set(d,d,1);let f=l.map;f.repeat.set(d/c.tile,d/(c.tile*2)),f.offset.y=(f.offset.y+r*c.speed*(1+.5*n.base)/(c.tile*2))%1,f.offset.x=(f.offset.x+r*.05*(t+1))%1,l.color.setRGB(.72*u,.78*u,.88*u),l.opacity=c.alpha*s}}else for(let e of this.sheets)e.visible=!1;let l=t.bolt;if(this.bolt.visible=l.on,l.on){let n=this.bolt.material;n.map=this.boltMaps[l.variant%3];let r=Math.atan2(this.fwd.x,this.fwd.z)+l.u*Math.atan(Math.tan(e.fov*Math.PI/360)*e.aspect)*.8;this.bolt.position.set(e.position.x+Math.sin(r)*sm,cm/2-2,e.position.z+Math.cos(r)*sm),this.bolt.rotation.set(0,r+Math.PI,0),this.bolt.scale.set(cm*.42,cm,1);let i=.5+.5*t.flash,o=1/(1+1.6*a);n.color.setRGB(4.2*i*o,4.8*i*o,6*i*o),n.opacity=1}}},pm=9.81,mm=.02,hm=3,gm=60,_m=0,vm=1,ym=2,bm=3,xm=new q,Sm=new q,Cm=new q,wm=new q,Tm=new Dt,Em=new q(0,-1,0),Dm=class{bark;leaves;group=new En;limbs=[];twigs=[];stats={limbs:0,twigs:0,falling:0,resting:0,leafFalls:0,lastBuildMs:0,maxBuildMs:0,lastLeaves:0,lastNodes:0,minY:0,takeMs:0,tubeMs:0};barkShadow=!0;leafSink=null;constructor(e,t){this.bark=e,this.leaves=t,this.group.name=`debris`}get state(){return this.limbs.map(e=>({phase:e.phase,t:+e.t.toFixed(2),com:e.com.toArray().map(e=>+e.toFixed(2)),ang:+e.ang.toFixed(2),speed:+e.vel.length().toFixed(2),spin:+e.omega.length().toFixed(2),lowest:+this.lowest(e).toFixed(3)}))}spawn(e,t,n){let r=performance.now(),i=e.nodes,a=new Uint8Array(i.length);for(let e of t.nodeIds)a[e]=1;let o=this.leaves.takeInstances(a);this.stats.takeMs=performance.now()-r;let s=this.leaves.mesh,c=null;t.nodeIds.length<12&&this.leafSink?(this.leafSink(o.matrices,o.colours,o.n),this.stats.twigs++,this.stats.leafFalls+=o.n,this.stats.lastBuildMs=performance.now()-r,this.stats.lastLeaves=o.n,this.stats.lastNodes=t.nodeIds.length):(o.n>0&&(c=new di(s.geometry,s.material,o.n),c.instanceMatrix.array.set(o.matrices),c.instanceColor=new ri(o.colours,3),c.castShadow=s.castShadow,c.receiveShadow=s.receiveShadow,c.frustumCulled=!1,s.userData.gbufferMaterial&&(c.userData.gbufferMaterial=s.userData.gbufferMaterial)),t.nodeIds.length<12?(c&&this.spawnTwig(c,o.n),this.stats.twigs++):this.spawnLimb(e,t,c,n),this.stats.lastBuildMs=performance.now()-r,this.stats.lastBuildMs>this.stats.maxBuildMs&&(this.stats.maxBuildMs=this.stats.lastBuildMs),this.stats.lastLeaves=o.n,this.stats.lastNodes=t.nodeIds.length)}spawnTwig(e,t){e.instanceMatrix.setUsage(Re);let n=new Float32Array(t*8);for(let e=0;e<t;e++){let t=(e+1)*2654435761+this.stats.twigs*40503>>>0,r=()=>(t^=t<<13,t>>>=0,t^=t>>>17,t^=t<<5,t>>>=0,t/4294967296),i=e*8;n[i]=.9+1.3*r(),n[i+1]=.5+.9*r(),xm.set(r()-.5,r()-.5,r()-.5).normalize(),n[i+2]=xm.x,n[i+3]=xm.y,n[i+4]=xm.z,n[i+5]=2+5*r(),n[i+6]=r()*6.28,n[i+7]=0}this.group.add(e),this.twigs.push({m:e,n:t,s:n,t:0,landed:0}),this.stats.leafFalls+=t}spawnLimb(e,t,n,r){let i=e.nodes,a=new wf(this.bark),o=t.chains.map(t=>({...e.chains[t],pruned:!1})),s=performance.now();a.update({nodes:i,chains:o},0),this.stats.tubeMs=performance.now()-s;let c=i[i[t.root].parent],l=new q(c.wx,c.wy,c.wz),u=0,d=0,f=0,p=0;for(let e of t.nodeIds){let t=i[e],n=t.len*t.radius*40+(t.leafy?.05:0)+1e-4;u+=n,d+=t.wx*n,f+=t.wy*n,p+=t.wz*n}let m=new q(d/u,f/u,p/u),h=0;for(let e of t.nodeIds){let t=i[e],n=t.len*t.radius*40+(t.leafy?.05:0)+1e-4;h+=n*((t.wx-m.x)**2+(t.wy-m.y)**2+(t.wz-m.z)**2)}h=Math.max(.05,h/u*.6);let g=Math.min(16,t.nodeIds.length+1),_=new Float32Array(g*4);_[0]=l.x-m.x,_[1]=l.y-m.y,_[2]=l.z-m.z,_[3]=t.radius;let v=new Float32Array(t.nodeIds.length).fill(1/0),y=l.x,b=l.y,x=l.z;for(let e=1;e<g;e++){let n=0,r=-1;for(let e=0;e<t.nodeIds.length;e++){let a=i[t.nodeIds[e]],o=(a.wx-y)**2+(a.wy-b)**2+(a.wz-x)**2;o<v[e]&&(v[e]=o),v[e]>r&&(r=v[e],n=e)}let a=i[t.nodeIds[n]];y=a.wx,b=a.wy,x=a.wz,_[e*4]=y-m.x,_[e*4+1]=b-m.y,_[e*4+2]=x-m.z,_[e*4+3]=a.radius+.03}let S=0;for(let e=0;e<g;e++)S=Math.max(S,Math.hypot(_[e*4],_[e*4+1],_[e*4+2]));let C=new xr(m.clone(),S+.5);a.mesh.geometry.boundingSphere=C,n&&(n.boundingSphere=C);let w=new En;a.mesh.position.copy(m).negate(),a.mesh.castShadow=!0,a.mesh.receiveShadow=!0,w.add(a.mesh),n&&(n.position.copy(m).negate(),w.add(n)),w.position.copy(m);let T=m.clone().sub(l),E=new q().crossVectors(T,Em);E.length()<.15*T.length()&&E.crossVectors(T,xm.set(r.dirX,-.2,r.dirZ)),E.normalize();let D=t.leaves/t.nodeIds.length;this.limbs.push({g:w,bm:a,lm:n,phase:_m,t:0,pivot:l,c0:T,com:m,q:new Dt,axis:E,ang:0,w:.45,vel:new q,omega:new q,pts:_,k2:h,drag:.35+.55*Math.min(1,D/6),contactT:-1,stillT:0,restT:0,cols:n?n.instanceColor.array.slice():null,brown:0,leave:0}),this.group.add(w),this.stats.limbs++;let O=0;for(let e=this.limbs.length-1;e>=0;e--){let t=this.limbs[e];t.phase!==bm&&++O>hm&&(t.phase=bm,t.leave=0)}}lowest(e){let t=1/0,n=e.pts;for(let r=0;r<n.length;r+=4){let i=wm.set(n[r],n[r+1],n[r+2]).applyQuaternion(e.q).y+e.com.y-n[r+3];i<t&&(t=i)}return t}frame(e,t){let n=0,r=0;for(let i=this.limbs.length-1;i>=0;i--){let a=this.limbs[i];if(a.bm.mesh.castShadow=this.barkShadow,a.phase===_m||a.phase===vm){n++;let r=Math.min(e,.1);for(;r>1e-5;){let e=Math.min(r,1/90);this.stepLimb(a,e,t),r-=e}a.g.position.copy(a.com),a.g.quaternion.copy(a.q)}else if(a.phase===ym){r++,a.restT+=e;let t=Math.min(1,a.restT/gm);if(a.lm&&a.cols&&t-a.brown>.5/gm){a.brown=t;let e=a.lm.instanceColor.array,n=a.cols,r=1+.25*t,i=1-.42*t,o=1-.55*t;for(let t=0;t<n.length;t+=3)e[t]=n[t]*r,e[t+1]=n[t+1]*i,e[t+2]=n[t+2]*o;a.lm.instanceColor.needsUpdate=!0}}else{a.leave+=e;let t=Math.max(0,1-a.leave/1.5);a.g.scale.setScalar(t*t*(3-2*t)+1e-4),t<=0&&(this.drop(a),this.limbs.splice(i,1))}}for(let n=this.twigs.length-1;n>=0;n--)if(this.stepTwig(this.twigs[n],e,t)){let e=this.twigs[n];this.group.remove(e.m),e.m.dispose(),this.twigs.splice(n,1)}this.stats.falling=n,this.stats.resting=r}stepLimb(e,t,n){e.t+=t;let r=n.gust(e.com.x,e.com.z);if(e.phase===_m){let i=xm.copy(e.c0).applyQuaternion(e.q),a=i.length()||1,o=Math.max(.35,Math.hypot(i.x,i.z)/a),s=4*r*r*Sm.set(n.dirX,0,n.dirZ).cross(Cm.copy(i).divideScalar(a)).dot(e.axis)*-1;e.w+=(1.5*pm*o/(2*a)+s)*t,e.w<.2&&(e.w=.2),e.ang+=e.w*t,e.q.setFromAxisAngle(e.axis,e.ang),e.com.copy(e.c0).applyQuaternion(e.q).add(e.pivot),(e.ang>.87||e.t>.9||this.lowest(e)<mm)&&(i.copy(e.c0).applyQuaternion(e.q),e.omega.copy(e.axis).multiplyScalar(e.w),e.vel.crossVectors(e.omega,i),e.vel.x+=n.dirX*r*1.5,e.vel.z+=n.dirZ*r*1.5,e.omega.addScaledVector(i.normalize(),(e.pivot.x*7.3+e.pivot.z*3.1)%1>.5?.5:-.5),e.phase=vm);return}let i=r*10;e.vel.x+=(n.dirX*i-e.vel.x)*e.drag*t,e.vel.z+=(n.dirZ*i-e.vel.z)*e.drag*t,e.vel.y+=(-9.81-e.vel.y*e.drag)*t,e.omega.multiplyScalar(Math.exp(-.6*t)),e.com.addScaledVector(e.vel,t);let a=e.omega.length();a>1e-5&&(Tm.setFromAxisAngle(xm.copy(e.omega).divideScalar(a),a*t),e.q.premultiply(Tm).normalize());let o=e.pts,s=0,c=!1;for(let t=0;t<o.length;t+=4){let n=xm.set(o[t],o[t+1],o[t+2]).applyQuaternion(e.q),r=e.com.y+n.y-o[t+3];if(r>=mm)continue;c=!0,mm-r>s&&(s=mm-r);let i=Sm.crossVectors(e.omega,n).add(e.vel);if(i.y<0){let t=-n.z,r=n.x,a=-1.15*i.y/(1+(t*t+r*r)/e.k2);e.vel.y+=a,e.omega.x+=t*a/e.k2,e.omega.z+=r*a/e.k2;let o=Math.hypot(i.x,i.z);if(o>1e-4){let t=-i.x/o,r=-i.z/o,s=n.y*r,c=n.z*t-n.x*r,l=-n.y*t,u=Math.min(.7*a,o/(1+(s*s+c*c+l*l)/e.k2));e.vel.x+=t*u,e.vel.z+=r*u,e.omega.x+=s*u/e.k2,e.omega.y+=c*u/e.k2,e.omega.z+=l*u/e.k2}}}if(c&&(e.com.y+=s,e.contactT<0&&(e.contactT=e.t),e.vel.multiplyScalar(Math.exp(-2.5*t)),e.omega.multiplyScalar(Math.exp(-3.5*t)),e.vel.lengthSq()<.09&&e.omega.lengthSq()<.2?e.stillT+=t:e.stillT=0),e.stillT>.35||e.contactT>=0&&e.t-e.contactT>5||e.t>15){e.phase=ym;let t=this.lowest(e);t<mm&&(e.com.y+=mm-t),this.stats.minY=this.lowest(e)}}stepTwig(e,t,n){e.t+=t;let r=e.m.instanceMatrix.array,i=e.s;if(e.landed>=e.n){let t=e.t-22;return t<0?!1:t>2||(e.m.scale.setScalar(1-t/2+1e-4),!1)}let a=0;for(let o=0;o<e.n;o++){let s=o*16,c=o*8;if(i[c+7]){a++;continue}let l=n.gust(r[s+12],r[s+14]),u=i[c+6]+e.t*3.1,d=Math.min(1,Math.max(0,e.t*4-i[c+6]/6.28*1.2));r[s+12]+=(n.dirX*l*5*i[c+1]+Math.sin(u)*.5)*t*d,r[s+14]+=(n.dirZ*l*5*i[c+1]+Math.cos(u*.8)*.5)*t*d,r[s+13]-=i[c]*(.8+.3*Math.sin(u*1.7))*t*d;let f=i[c+5]*t*d,p=Math.cos(f),m=Math.sin(f),h=i[c+2],g=i[c+3],_=i[c+4];for(let e=0;e<12;e+=4){let t=r[s+e],n=r[s+e+1],i=r[s+e+2],a=(h*t+g*n+_*i)*(1-p);r[s+e]=t*p+(g*i-_*n)*m+h*a,r[s+e+1]=n*p+(_*t-h*i)*m+g*a,r[s+e+2]=i*p+(h*n-g*t)*m+_*a}r[s+13]<=.03&&(r[s+13]=.03,i[c+7]=1,a++)}return e.landed=a,a>=e.n&&(e.t=0),e.m.instanceMatrix.needsUpdate=!0,!1}drop(e){this.group.remove(e.g),e.bm.mesh.geometry.dispose(),e.lm?.dispose()}clear(){for(let e of this.limbs)this.drop(e);for(let e of this.twigs)this.group.remove(e.m),e.m.dispose();this.limbs=[],this.twigs=[]}},Om=class{D=new Float32Array;P=new Int32Array;live=!1;maxOffset=0;maxNode=-1;lastMs=0;TH=new Float32Array;F=new Float32Array;S=new Float32Array;K=new Float32Array;C=new Int32Array;cTime=NaN;cTopo=-1;cN=-1;update(e,t,n){let r=e.nodes,i=e.chains,a=r.length;if(!(n>0)||!(t.base>0)||a===0)return this.live?(this.D.fill(0),this.live=!1,this.maxOffset=0,this.maxNode=-1,!0):!1;let o=performance.now();if(this.D.length<a*3){let e=Math.ceil(a*1.5)+256;this.D=new Float32Array(e*3),this.TH=new Float32Array(e*3),this.P=new Int32Array(e)}this.F.length<i.length*3&&(this.F=new Float32Array((i.length*2+64)*3));let s=this.D,c=this.TH,l=this.F,u=this.P;if(e.time!==this.cTime||e.topology!==this.cTopo||a!==this.cN){this.S.length<s.length&&(this.S=new Float32Array(s.length),this.K=new Float32Array(s.length/3),this.C=new Int32Array(s.length/3));let t=this.S,n=this.K,o=this.C;for(let e=0,s=0;e<a;e++,s+=3){let a=r[e],c=a.parent,l=c>=0?r[c]:void 0;if(u[e]=c,!l||i[a.chain].pruned){o[e]=-1;continue}o[e]=a.chain,t[s]=a.wx-l.wx,t[s+1]=a.wy-l.wy,t[s+2]=a.wz-l.wz;let d=a.radius>.002?a.radius:.002,f=km/(d*Math.sqrt(d));n[e]=f>Am?Am:f}this.cTime=e.time,this.cTopo=e.topology,this.cN=a}let d=this.S,f=this.K,p=this.C,m=t.dirX,h=t.dirZ,g=t.t;for(let e=0;e<i.length;e++){let a=i[e],o=e*3;if(a.pruned||a.nodes.length<=2){l[o]=l[o+1]=l[o+2]=0;continue}let s=r[a.nodes[1]],c=t.gustAlong(m*s.wx+h*s.wz,g-.35),u=c*c*Math.sqrt(c)*n,d=Mm*c*Math.sqrt(Math.sqrt(c))*n,f=(e*2654435761>>>0)/4294967296*6.2832,p=Math.min(7,.55/Math.sqrt(Math.max(.003,s.radius))),_=Math.sin(p*g+f),v=Math.sin(.83*p*g+2.1*f),y=Math.sin(1.31*p*g+3.7*f),b=u*.8+d*_,x=d*.9*v;l[o]=m*b-h*x,l[o+1]=d*.6*y,l[o+2]=h*b+m*x}let _=0,v=-1;for(let e=0,t=0;e<a;e++,t+=3){let n=p[e];if(n<0){s[t]=s[t+1]=s[t+2]=0,c[t]=c[t+1]=c[t+2]=0;continue}let r=u[e]*3,i=n*3,a=f[e],o=d[t],m=d[t+1],h=d[t+2],g=l[i],y=l[i+1],b=l[i+2],x=c[r]+(m*b-h*y)*a,S=c[r+1]+(h*g-o*b)*a,C=c[r+2]+(o*y-m*g)*a,w=x*x+S*S+C*C;if(w>jm*jm){let e=jm/Math.sqrt(w);x*=e,S*=e,C*=e}c[t]=x,c[t+1]=S,c[t+2]=C;let T=o+S*h-C*m,E=m+C*o-x*h,D=h+x*m-S*o,O=o*o+m*m+h*h,k=T*T+E*E+D*D;if(k>1e-12){let e=Math.sqrt(O/k);T*=e,E*=e,D*=e}let A=s[r]+T-o,j=s[r+1]+E-m,M=s[r+2]+D-h,N=A*A+j*j+M*M;if(N>Nm*Nm){let e=Nm/Math.sqrt(N);A*=e,j*=e,M*=e,N=Nm*Nm}s[t]=A,s[t+1]=j,s[t+2]=M,N>_&&(_=N,v=e)}return this.maxOffset=Math.sqrt(_),this.maxNode=v,this.live=!0,this.lastMs=performance.now()-o,!0}},km=35e-5,Am=.6,jm=.6,Mm=.25,Nm=1.3,Pm=.02,Fm=15,Im=512,Lm=2400,Rm=120,zm=.7,Bm=.3,Vm=.06,Hm=42,Um=new Float32Array(16),Wm=new Float32Array(3),Gm=new Float32Array(16),Km=new Float32Array(3),qm=class{leaves;group=new En;air;lit;st=new Float32Array(Im*Fm);tgt=new Float32Array(Im*16);n=0;aBase=new Float32Array(Im*3);refLum=0;lAge=new Float32Array(Lm).fill(-1);lBase=new Float32Array(Lm*3);lQ=new Uint8Array(Lm);head=0;scan=0;scanAcc=0;acc=0;seed=2654435769;colDirty=!1;stats={spawned:0,landed:0,gone:0,relaunched:0,adopted:0,air:0,airPeak:0,ground:0,recycled:0,rate:0,airCap:0,litterCap:0,lastMs:0,maxMs:0,sumMs:0,frames:0};constructor(e){this.leaves=e,this.group.name=`leaffall`;let t=e.mesh,n=e=>{let n=new di(t.geometry,t.material,e);return n.instanceMatrix.setUsage(Re),n.instanceMatrix.array.fill(0),n.instanceColor=new ri(new Float32Array(e*3),3).setUsage(Re),n.castShadow=!1,n.receiveShadow=t.receiveShadow,n.frustumCulled=!1,t.userData.gbufferMaterial&&(n.userData.gbufferMaterial=t.userData.gbufferMaterial),n.count=0,n.visible=!1,this.group.add(n),n};this.air=n(Im),this.lit=n(Lm)}rnd(){let e=this.seed;return e^=e<<13,e>>>=0,e^=e>>>17,e^=e<<5,e>>>=0,this.seed=e,e/4294967296}get counts(){return{air:this.n,ground:this.stats.ground}}get state(){let e=this.air.instanceMatrix.array,t=this.lit.instanceMatrix.array,n=[],r=[];for(let t=0;t<this.n;t++)n.push([e[t*16+12],e[t*16+13],e[t*16+14],Math.hypot(this.st[t*Fm],this.st[t*Fm+1],this.st[t*Fm+2])].map(e=>+e.toFixed(2)));for(let e=0;e<this.lit.count;e++)this.lAge[e]>=0&&r.push([t[e*16+12],t[e*16+13],t[e*16+14]].map(e=>+e.toFixed(2)));return{air:n,ground:r}}launch(e,t,n,r,i,a=0,o=!1,s=0){if(this.n>=Im)return!1;let c=this.n++,l=this.air.instanceMatrix.array,u=this.air.instanceColor.array,d=this.st,f=c*Fm;for(let n=0;n<16;n++)l[c*16+n]=e[t+n];let p=this.aBase;p[c*3]=u[c*3]=n[r],p[c*3+1]=u[c*3+1]=n[r+1],p[c*3+2]=u[c*3+2]=n[r+2];let m=.3*n[r]+.6*n[r+1]+.1*n[r+2]+1e-5;o||(this.refLum=this.refLum>0?this.refLum+(Math.min(m,3*this.refLum)-this.refLum)*.04:m),d[f+14]=o?1:Math.min(1.3*this.refLum,Math.max(.9*this.refLum,m))/m;let h=()=>this.rnd();d[f]=0,d[f+1]=o?.9+1.4*h():0,d[f+2]=0,d[f+3]=.7+.6*h()+i*(.5+1.2*h()),d[f+4]=o?.1+.12*h():.22+.2*h()+i*(.1+.3*h());let g=h()-.5,_=h()-.5,v=h()-.5,y=Math.hypot(g,_,v)||1;return g/=y,_/=y,v/=y,d[f+5]=g,d[f+6]=_,d[f+7]=v,d[f+8]=1.6+2.6*h()+i*(3+6*h()),d[f+9]=h()*6.283,d[f+10]=-a,d[f+11]=!o&&h()<.45*i?2+4.5*h():0,d[f+12]=-1,d[f+13]=s,this.colDirty=!0,!0}force(e=1,t=0){let n=0;for(let r=0;r<e*6&&n<e;r++)if(this.leaves.sampleInstance(this.rnd(),Um,Wm)){if(!this.launch(Um,0,Wm,0,t))break;n++,this.stats.spawned++}return n}adopt(e,t,n,r){for(let i=0;i<n;i++)this.launch(e,i*16,t,i*3,r*.6,this.rnd()*.45)&&this.stats.adopted++}adoptRaw(e,t,n,r){let i=this.refLum;for(let i=0;i<n;i++)this.launch(e,i*16,t,i*3,r*.6,this.rnd()*.3)&&(this.st[(this.n-1)*Fm+14]=1,this.stats.adopted++);this.refLum=i}clear(){this.n=0,this.air.count=0,this.air.visible=!1,this.lAge.fill(-1),this.head=0,this.lit.count=0,this.lit.visible=!1,this.stats.ground=0,this.lit.instanceMatrix.array.fill(0),this.lit.instanceMatrix.clearUpdateRanges(),this.lit.instanceMatrix.needsUpdate=!0}frame(e,t,n){let r=performance.now(),i=this.leaves.mesh;this.lit.receiveShadow=this.air.receiveShadow=i.receiveShadow;let a=Math.round((n.low?110:320)*n.scale),o=Math.min(Lm,Math.round((n.low?600:2e3)*n.scale*n.litter));this.stats.airCap=a,this.stats.litterCap=o;let s=(n.min[0]+n.max[0])/2,c=(n.min[2]+n.max[2])/2,l=Math.max(1,n.max[1]),u=Math.max(.5,(n.max[0]-n.min[0]+n.max[2]-n.min[2])/4),d=n.violence,f=Math.min(1,Math.max(0,(n.simLeaves-500)/2500)),p=t.gust(s,c),m=t.base>.001?p/t.base:0,h=m*m*m,g=(.04+.5*h)*Math.min(2,(t.base/.35)**2)*(1+2*n.dusk),_=d*(n.low?40:110)*n.scale*(.06+h),v=f*n.rate*(g+_);for(this.stats.rate=v,this.acc+=v*e;this.acc>=1;){if(--this.acc,this.n>=a){this.acc=0;break}let e=d>.3?4:1,n=-1/0;for(let r=0;r<e;r++){if(!this.leaves.sampleInstance(this.rnd(),Um,Wm))continue;let e=Um[12]-s,r=Um[14]-c,i=(-(e*t.dirX+r*t.dirZ)+.6*Math.hypot(e,r))/u+.4*(Um[13]/l)+.7*this.rnd();i>n&&(n=i,Gm.set(Um),Km.set(Wm))}n>-1/0&&this.launch(Gm,0,Km,0,d)&&this.stats.spawned++}this.stepAir(e,t,d,l,s,c,o),this.stepLitter(e,t,o,a,n.keep??1),this.stats.air=this.n,this.n>this.stats.airPeak&&(this.stats.airPeak=this.n),this.stats.lastMs=performance.now()-r,this.stats.sumMs+=this.stats.lastMs,this.stats.frames++,this.stats.lastMs>this.stats.maxMs&&(this.stats.maxMs=this.stats.lastMs)}stepAir(e,t,n,r,i,a,o){let s=this.air.instanceMatrix.array,c=this.air.instanceColor.array,l=this.st,u=this.tgt,d=this.aBase,f=-t.dirZ,p=t.dirX,m=1-Math.exp(-e/.4),h=1-Math.exp(-e/.3);for(let g=this.n-1;g>=0;g--){let _=g*Fm,v=g*16;if(l[_+10]<0){l[_+10]+=e;continue}l[_+10]+=e;let y=l[_+10],b=!1;if(l[_+12]>=0){let t=l[_+12];l[_+12]+=e;let n=Math.min(1,l[_+12]/Bm),r=n>=1?1:Math.min(1,(n-t/Bm)/Math.max(1e-4,1-t/Bm)),d=e*(1-n);s[v+12]+=l[_]*d,s[v+14]+=l[_+2]*d;for(let e=0;e<12;e++)s[v+e]+=(u[v+e]-s[v+e])*r;if(s[v+13]+=(u[v+13]-s[v+13])*r,n>=1){b=!0;let e=s[v+12],t=s[v+14];Math.hypot(e-i,t-a)>Hm||o<=0?this.stats.gone++:(this.toLitter(s,v,c,g*3,l[_+13],o),this.stats.landed++)}}else{let i=s[v+12],a=s[v+13],o=s[v+14];if(l[_+14]!==1&&y<1.2){let e=1+(l[_+14]-1)*Math.min(1,y);c[g*3]=d[g*3]*e,c[g*3+1]=d[g*3+1]*e,c[g*3+2]=d[g*3+2]*e,this.colDirty=!0}let x=Cp.speed(t.gust(i,o)),S=.3+.7*Math.min(1,Math.max(0,a/(.6*r))),C=l[_+9]+y*(2.4+2.5*n),w=x*l[_+4]*S,T=(.55+.05*x)*Math.sin(C),E=.35*Math.cos(C*.8+1);l[_]+=(t.dirX*(w+E)+f*T-l[_])*m,l[_+2]+=(t.dirZ*(w+E)+p*T-l[_+2])*m;let D=l[_+11]*Math.exp(-y/.9)+n*x*.07*Math.sin(C*.63+2);l[_+1]+=(-l[_+3]*(.8+.3*Math.sin(C*1.7))+D-l[_+1])*h,s[v+12]=i+l[_]*e,s[v+13]=a+l[_+1]*e,s[v+14]=o+l[_+2]*e;let O=l[_+8]*(.6+.08*Math.hypot(l[_],l[_+2]))*Math.min(1,y*3)*e,k=Math.cos(O),A=Math.sin(O),j=l[_+5],M=l[_+6],N=l[_+7];for(let e=0;e<12;e+=4){let t=s[v+e],n=s[v+e+1],r=s[v+e+2],i=(j*t+M*n+N*r)*(1-k);s[v+e]=t*k+(M*r-N*n)*A+j*i,s[v+e+1]=n*k+(N*t-j*r)*A+M*i,s[v+e+2]=r*k+(j*n-M*t)*A+N*i}let P=Math.hypot(s[v+4],s[v+5],s[v+6]);if(s[v+13]<=.32&&l[_+1]<0){l[_+12]=0;let e=this.rnd()*6.283,t=this.rnd()<.5?1:-1,n=(this.rnd()-.5)*.9,r=Math.cos(e),i=Math.sin(e),a=Math.cos(n),o=Math.sin(n),s=r*a,c=o,d=i*a,f=-r*o*t,p=a*t,m=-i*o*t;u[v]=(c*m-d*p)*P,u[v+1]=(d*f-s*m)*P,u[v+2]=(s*p-c*f)*P,u[v+4]=s*P,u[v+5]=c*P,u[v+6]=d*P,u[v+8]=f*P,u[v+9]=p*P,u[v+10]=m*P;let h=this.rnd();u[v+13]=Math.max(Pm+P*(t>0?.24:.07)+Math.max(0,-o)*P*1.1,Vm+.24*h*h)}else y>40&&(b=!0,this.stats.gone++)}if(b){let e=--this.n;e!==g&&(s.copyWithin(v,e*16,e*16+16),u.copyWithin(v,e*16,e*16+16),c.copyWithin(g*3,e*3,e*3+3),d.copyWithin(g*3,e*3,e*3+3),l.copyWithin(_,e*Fm,e*Fm+Fm)),this.colDirty=!0}}let g=this.air.instanceMatrix;if(this.air.count=this.n,this.air.visible=this.n>0,this.n>0&&(g.clearUpdateRanges(),g.addUpdateRange(0,this.n*16),g.needsUpdate=!0,this.colDirty)){let e=this.air.instanceColor;e.clearUpdateRanges(),e.addUpdateRange(0,this.n*3),e.needsUpdate=!0,this.colDirty=!1}}toLitter(e,t,n,r,i,a){this.head>=a&&(this.head=0);let o=this.head++,s=this.lit,c=s.instanceMatrix.array;this.lAge[o]>=0?this.stats.recycled++:this.stats.ground++;for(let n=0;n<16;n++)c[o*16+n]=e[t+n];c[o*16+15]=1,this.lBase[o*3]=n[r],this.lBase[o*3+1]=n[r+1],this.lBase[o*3+2]=n[r+2],this.lAge[o]=i,this.lQ[o]=255,this.paint(o),s.instanceMatrix.addUpdateRange(o*16,16),s.instanceMatrix.needsUpdate=!0,o>=s.count&&(s.count=o+1),s.visible=!0}paint(e){let t=Math.min(1,this.lAge[e]/Rm),n=Math.round(t*24);if(n===this.lQ[e])return;this.lQ[e]=n;let r=this.lit.instanceColor,i=r.array,a=this.lBase;i[e*3]=a[e*3]*(1+.25*t),i[e*3+1]=a[e*3+1]*(1-.42*t),i[e*3+2]=a[e*3+2]*(1-.55*t),r.addUpdateRange(e*3,3),r.needsUpdate=!0}stepLitter(e,t,n,r,i=1){let a=this.lit,o=a.count;if(o===0)return;let s=a.instanceMatrix.array;this.scanAcc+=o*e/zm;let c=Math.min(o,Math.floor(this.scanAcc));for(this.scanAcc-=c;c-->0;){this.scan>=o&&(this.scan=0);let e=this.scan++;if(this.lAge[e]<0)continue;if(e>=n||i<1&&(e*2246822519>>>8&1023)/1023>=i){this.hide(e);continue}this.lAge[e]+=zm;let c=s[e*16+12],l=s[e*16+14];if(e*2654435761>>>0&65536&&this.n<r){let n=t.gust(c,l);if(n>.72&&this.rnd()<(n-.72)*.9){let t=a.instanceColor.array;if(this.launch(s,e*16,this.lBase,e*3,.5,0,!0,this.lAge[e])){let n=this.n-1,r=this.air.instanceColor.array;r[n*3]=t[e*3],r[n*3+1]=t[e*3+1],r[n*3+2]=t[e*3+2],this.hide(e),this.stats.relaunched++;continue}}}this.paint(e)}}hide(e){let t=this.lit,n=t.instanceMatrix.array;for(let t=0;t<16;t++)n[e*16+t]=0;t.instanceMatrix.addUpdateRange(e*16,16),t.instanceMatrix.needsUpdate=!0,this.lAge[e]=-1,this.stats.ground--}},Jm=.008,Ym=.036,Xm=.016,Zm=.018,Qm=.05,$m=.03,eh=.022,th=.5,nh=.866,rh=3e3,ih=7e3,ah=16,oh=6,sh={oak:{kind:`flower`,petal:`#fbe3ea`,edge:`#ee8fb2`,centre:`#e0b040`,bud:[1,.5,.62],amount:.7,size:.36,fall:`#f9cfdc`},round:{kind:`flower`,petal:`#ffffff`,edge:`#f1ead8`,centre:`#d9c050`,bud:[.92,.95,.8],amount:.9,size:.38,fall:`#f6f2e6`},maple:{kind:`flower`,petal:`#c3d048`,edge:`#93a82a`,centre:`#6f7c1e`,bud:[.95,.72,.5],amount:.38,size:.28,fall:`#c2cf55`},willow:{kind:`catkin`,petal:`#c9cf45`,edge:`#98a830`,centre:`#e0dc70`,bud:[.85,.9,.8],amount:.3,size:.34,fall:`#c6cc55`},birch:{kind:`catkin`,petal:`#c4ad55`,edge:`#917a38`,centre:`#ddc97a`,bud:[.8,.7,.55],amount:.28,size:.36,fall:`#cdbd72`},ginkgo:{kind:`catkin`,petal:`#cfdc8a`,edge:`#a3b860`,centre:`#e9f0b8`,bud:[.85,.9,.7],amount:.2,size:.26,fall:null},spray:null,frond:{kind:`star`,petal:`#8ff5e6`,edge:`#2fb7c9`,centre:`#f4fffb`,bud:[.5,.7,1],amount:.8,size:.4,fall:`#9af0e4`},ring:{kind:`star`,petal:`#ffe9a6`,edge:`#f0a858`,centre:`#fffdf0`,bud:[1,.6,.4],amount:.8,size:.38,fall:`#ffe6a8`},spiral:{kind:`star`,petal:`#cfe4ff`,edge:`#7fa6ff`,centre:`#ffffff`,bud:[.6,.6,1],amount:.6,size:.36,fall:`#d6e6ff`}},ch=e=>e in sh?sh[e]:sh.oak,lh=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e||1e-6)));return r*r*(3-2*r)};function uh(e){return e=Math.imul(e^2654435769,2246822507),e^=e>>>13,e=Math.imul(e,3266489909),e^=e>>>16,(e>>>0)/4294967296}function dh(e,t,n){return e<=t-Xm||e>=n+eh?0:e<t?.16+.16*(e-(t-Xm))/Xm:e<n?.32+.68*lh(t,t+Zm,e):1-.75*lh(n,n+eh,e)}function fh(e,t=256){let n=document.createElement(`canvas`);n.width=n.height=t;let r=n.getContext(`2d`),i=12345,a=()=>(i=Math.imul(i,1664525)+1013904223>>>0,i/4294967296);if(e.kind===`flower`){let n=[];for(let e=0;e<400&&n.length<13;e++){let e=.13+.74*a(),t=.13+.74*a(),r=.105+.035*a();Math.hypot(e-.5,t-.5)<.44&&n.every(n=>Math.hypot(n[0]-e,n[1]-t)>(n[2]+r)*.8)&&n.push([e,t,r])}for(let[i,o,s]of n){let n=i*t,c=o*t,l=s*t,u=a()*6.283;for(let t=0;t<5;t++){let i=u+t*6.283/5;r.save(),r.translate(n+Math.cos(i)*l*.52,c+Math.sin(i)*l*.52),r.rotate(i);let a=r.createRadialGradient(-l*.35,0,0,0,0,l*.62);a.addColorStop(0,e.edge),a.addColorStop(.5,e.petal),a.addColorStop(.85,e.petal),a.addColorStop(1,e.edge),r.fillStyle=a,r.beginPath(),r.ellipse(0,0,l*.56,l*.42,0,0,6.283),r.fill(),r.restore()}r.fillStyle=e.centre,r.beginPath(),r.arc(n,c,l*.2,0,6.283),r.fill()}}else if(e.kind===`catkin`)for(let n=0;n<6;n++){let i=(.12+.152*n+.03*(a()-.5))*t,o=(.62+.36*a())*t,s=(.05+.02*a())*t,c=a()*6.283,l=Math.ceil(o/(s*.9));for(let n=0;n<l;n++){let a=n/l,u=a*o,d=i+Math.sin(c+a*3.2)*.03*t*a;r.fillStyle=n%3==0?e.edge:n%3==1?e.petal:e.centre,r.beginPath(),r.ellipse(d,u+s,s*(1.05-.35*a),s*.95,0,0,6.283),r.fill()}}else for(let[n,i,o]of[[.3,.3,.27],[.72,.3,.22],[.5,.62,.3],[.2,.75,.17],[.82,.76,.18]]){let s=n*t,c=i*t,l=o*t,u=a()*6.283;r.lineCap=`round`;for(let t=0;t<6;t++){let n=u+t*6.283/6;r.strokeStyle=e.edge,r.lineWidth=l*.3,r.beginPath(),r.moveTo(s,c),r.lineTo(s+Math.cos(n)*l*.85,c+Math.sin(n)*l*.85),r.stroke(),r.strokeStyle=e.petal,r.lineWidth=l*.17,r.beginPath(),r.moveTo(s,c),r.lineTo(s+Math.cos(n)*l*.8,c+Math.sin(n)*l*.8),r.stroke()}r.fillStyle=e.centre,r.beginPath(),r.arc(s,c,l*.26,0,6.283),r.fill()}return n}function ph(){let e=[-.5,0,.5,0,.5,1,-.5,0,.5,1,-.5,1],t=new Float32Array(36),n=new Float32Array(36),r=new Float32Array(24);for(let i=0;i<12;i++){let a=i>=6,o=a?[0,2,1,3,5,4][i-6]:i;t[i*3]=e[o*2],t[i*3+1]=e[o*2+1],t[i*3+2]=0,n[i*3+2]=a?-1:1,r[i*2]=e[o*2]+.5,r[i*2+1]=e[o*2+1]}let i=new kr;return i.setAttribute(`position`,new mr(t,3)),i.setAttribute(`normal`,new mr(n,3)),i.setAttribute(`uv`,new mr(r,2)),i.boundingSphere=new xr(new q(0,6,0),60),i}var mh=new Float32Array(96),hh=new Float32Array(18),gh=class{leaves;group=new En;mesh;tex;cap;rec;node;falling;sc;lastPh=NaN;tick=0;nf=0;n=0;key=``;formId=``;form=null;colKey=NaN;acc=0;seed=19088743;simT=0;petal=new J;stats={clusters:0,drawn:0,open:0,falling:0,petals:0,rebuilds:0,lastMs:0,maxMs:0,sumMs:0,frames:0};constructor(e,t){this.leaves=e,this.group.name=`blossom`,this.cap=t?rh:ih,this.rec=new Float32Array(this.cap*ah),this.node=new Int32Array(this.cap),this.falling=new Int32Array(this.cap),this.sc=new Float32Array(this.cap);let n=e.mesh.material,r=n.isMeshLambertMaterial||n.isMeshBasicMaterial,i=this.tex=this.paint(ch(`oak`)),a;a=r?n.clone():new Ki({side:0,map:i,alphaTest:.5}),a.map=i;let o=this.mesh=new di(ph(),a,this.cap);if(o.instanceMatrix.setUsage(Re),o.instanceMatrix.array.fill(0),o.instanceColor=new ri(new Float32Array(this.cap*3),3).setUsage(Re),o.castShadow=!1,o.receiveShadow=!1,o.frustumCulled=!1,o.matrixAutoUpdate=!1,!t){let e=new Gi({side:0,blending:0});e.allowOverride=!1,e.onBeforeCompile=e=>{e.uniforms.cutMap={value:i},e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec2 vCutUv;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
vCutUv = uv;`),e.fragmentShader=e.fragmentShader.replace(`void main() {`,`uniform sampler2D cutMap;
varying vec2 vCutUv;
void main() {`).replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>
if (texture2D(cutMap, vCutUv).a < 0.5) discard;`)},o.userData.gbufferMaterial=e}o.count=0,o.visible=!1,this.group.add(o)}paint(e){let t=new Ei(fh(e));t.colorSpace=Me;let n=Df(t,!0);return t.dispose(),n}setForm(e){this.formId=e;let t=this.form=ch(e);if(!t)return;let n=this.paint(t),r=this.tex.mipmaps,i=n.mipmaps;for(let e=0;e<r.length&&e<i.length;e++)r[e].data.set(i[e].data);if(this.tex.needsUpdate=!0,n.dispose(),t.fall){let e=this.leaves.mapMean;this.petal.set(t.fall),this.petal.r=Math.min(8,this.petal.r/Math.max(.02,e.r)),this.petal.g=Math.min(8,this.petal.g/Math.max(.02,e.g)),this.petal.b=Math.min(8,this.petal.b/Math.max(.02,e.b))}}rnd(){let e=this.seed;return e^=e<<13,e>>>=0,e^=e>>>17,e^=e<<5,e>>>=0,this.seed=e,e/4294967296}rebuild(e,t){let n=this.form,r=e.nodes,i=e.chains,a=this.rec,o=e.bboxMin,s=e.bboxMax,c=(o[0]+s[0])/2,l=(o[2]+s[2])/2,u=Math.max(1,s[1]-o[1]),d=Math.max(.5,(s[0]-o[0]+s[2]-o[2])/4),f=lh(600,3e3,e.leaves.length),p=Math.min(1,t.amount)*n.amount*f,m=t.amount>1?Math.min(3,2*t.amount):2,h=Yd.springTime,g=0;for(let e=0;e<2;e++){let s=e===0?1:Math.min(1,this.cap*Math.min(1,t.amount*n.amount/.7)/Math.max(1,g*m)),f=0;for(let _=1;_<r.length&&f<this.cap;_++){let v=r[_];if(!v.leafy||v.order===0||v.born>h||v.light<.06||i[v.chain]?.pruned)continue;let y=lh(.06,.28,v.light);if(uh(_*7+1)>=p*(.25+.75*y))continue;if(e===0){g++;continue}let b=v.wx-c,x=v.wz-l,S=Math.hypot(b,x)||1,C=Math.min(1,Math.max(0,(v.wy-o[1])/u)),w=.5+.5*Math.min(1,Math.max(-1,(b*th+x*nh)/d)),T=.4*y+.35*C+.25*w;for(let e=0;e<m&&f<this.cap;e++){let r=_*4+e;if(e>=2&&uh(r*5+4)>t.amount-1||uh(r*5+3)>=s)continue;let i=uh(r*5),o=uh(r*5+1),c=uh(r*5+2),l=f*ah,u=n.size*(.75+.5*c),d=b/S*.75+(i-.5)*1.1,p=n.kind===`catkin`?(o-.5)*.3:.55+(o-.5)*.9,m=x/S*.75+(c-.5)*1.1,h=Math.hypot(d,p,m)||1;d/=h,p/=h,m/=h;let g=-p*d,y=1-p*p,C=-p*m,w=Math.hypot(g,y,C)||1;g/=w,y/=w,C/=w;let E=y*m-C*p,D=C*d-g*m,O=g*p-y*d;a[l]=v.wx+(i-.5)*.3,a[l+1]=v.wy+(o-.5)*.24,a[l+2]=v.wz+(c-.5)*.3,a[l+3]=E*u,a[l+4]=D*u,a[l+5]=O*u,a[l+6]=g*u,a[l+7]=y*u,a[l+8]=C*u,a[l+9]=d*u,a[l+10]=p*u,a[l+11]=m*u;let k=Jm+Ym*(.72*(1-T)+.28*i);a[l+12]=k,a[l+13]=k+Qm+$m*o,a[l+14]=.86+.28*c,a[l+15]=n.kind===`catkin`?1:.5,this.node[f++]=_}}e===1&&(this.n=f)}this.stats.clusters=this.n,this.stats.rebuilds++,this.colKey=NaN,this.lastPh=NaN}frame(e,t,n){let r=performance.now(),i=this.mesh,a=Yd.phase,o=this.stats;if(n.formId!==this.formId&&(this.setForm(n.formId),this.key=``),!(Yd.active&&n.amount>0&&this.form!==null&&a<.148)){i.visible&&(i.visible=!1,i.count=0,this.key=``,o.drawn=o.open=o.falling=0);return}let s=this.form,c=`${t.topology}|${Math.round(t.time*2)}|${t.nodes.length}|${n.amount}|${this.formId}`;(c!==this.key||t.time<this.simT)&&(this.key=c,this.rebuild(t,n)),this.simT=t.time;let l=this.n,u=this.rec,d=n.D,f=this.node,p=i.instanceMatrix.array,m=Math.round(n.night*20)+Math.floor(performance.now()/1e3)*100,h=!(Math.abs(a-this.lastPh)<5e-4)||Yd.jumped||m!==this.colKey;if(this.tick++,!h){if(!n.low||this.tick&1){let e=this.sc;for(let t=0,n=0,r=12;t<l;t++,n+=ah,r+=16){let i=e[t],a=f[t]*3,o=u[n+15]*i;i===0||a+2>=d.length||(p[r]=u[n]-u[n+6]*o+d[a],p[r+1]=u[n+1]-u[n+7]*o+d[a+1],p[r+2]=u[n+2]-u[n+8]*o+d[a+2])}let t=i.instanceMatrix;t.clearUpdateRanges(),t.addUpdateRange(0,l*16),t.needsUpdate=!0}this.petals(e,n,s,l,this.nf,o.open),o.lastMs=performance.now()-r,o.sumMs+=o.lastMs,o.frames++,o.lastMs>o.maxMs&&(o.maxMs=o.lastMs);return}this.lastPh=a,this.colKey=m;let g=i.instanceColor.array,_=.74*(1-.5*n.night),v=n.sun,y=n.hemi,b=v.intensity,x=y.intensity,S=v.position.x-v.target.position.x,C=v.position.y-v.target.position.y,w=v.position.z-v.target.position.z,T=Math.hypot(S,C,w)||1;S/=T,C/=T,w/=T;let E=v.color.r*b,D=v.color.g*b,O=v.color.b*b,k=y.color.r*x,A=y.color.g*x,j=y.color.b*x,M=y.groundColor.r*x,N=y.groundColor.g*x,P=y.groundColor.b*x,F=.15*(k+M)+.3*(A+N)+.05*(j+P),I=.6*F+.2*(k+M),L=.6*F+.2*(A+N),R=.6*F+.2*(j+P),ee=n.cam.x,te=n.cam.y,ne=n.cam.z,z=0,B=0,V=0;for(let e=0,t=0,n=0;e<l;e++,t+=ah,n+=16){let r=u[t+12],i=u[t+13],o=dh(a,r,i);if(this.sc[e]=o,o===0){if(p[n+15]!==0)for(let e=0;e<16;e++)p[n+e]=0;continue}z++,a>=i?this.falling[V++]=e:a>=r+Zm&&B++;let c=f[e]*3,l=c+2<d.length,m=u[t+15]*o;p[n]=u[t+3]*o,p[n+1]=u[t+4]*o,p[n+2]=u[t+5]*o,p[n+3]=0,p[n+4]=u[t+6]*o,p[n+5]=u[t+7]*o,p[n+6]=u[t+8]*o,p[n+7]=0,p[n+8]=u[t+9]*o,p[n+9]=u[t+10]*o,p[n+10]=u[t+11]*o,p[n+11]=0,p[n+12]=u[t]-u[t+6]*m+(l?d[c]:0),p[n+13]=u[t+1]-u[t+7]*m+(l?d[c+1]:0),p[n+14]=u[t+2]-u[t+8]*m+(l?d[c+2]:0),p[n+15]=1;{let n=lh(r-.004,r+Zm,a),o=_*u[t+14]*(1-.2*lh(i,i+eh,a)),c=s.bud,l=1/(Math.hypot(u[t+9],u[t+10],u[t+11])||1),d=u[t+9]*l,f=u[t+10]*l,p=u[t+11]*l;d*(ee-u[t])+f*(te-u[t+1])+p*(ne-u[t+2])<0&&(d=-d,f=-f,p=-p);let m=Math.max(0,d*S+f*C+p*w),h=.5+.5*f,v=.24+.4*m+.14*h,y=Math.min(6,(I+E*v)/(M+(k-M)*h+E*m+1e-4)),b=Math.min(6,(L+D*v)/(N+(A-N)*h+D*m+1e-4)),x=Math.min(6,(R+O*v)/(P+(j-P)*h+O*m+1e-4));g[e*3]=o*y*(c[0]+(1-c[0])*n),g[e*3+1]=o*b*(c[1]+(1-c[1])*n),g[e*3+2]=o*x*(c[2]+(1-c[2])*n)}}i.count=l,i.visible=z>0;let re=i.instanceMatrix;re.clearUpdateRanges(),re.addUpdateRange(0,l*16),re.needsUpdate=!0;{let e=i.instanceColor;e.clearUpdateRanges(),e.addUpdateRange(0,l*3),e.needsUpdate=!0}o.drawn=z,o.open=B,o.falling=this.nf=V,this.petals(e,n,s,l,V,B),o.lastMs=performance.now()-r,o.sumMs+=o.lastMs,o.frames++,o.lastMs>o.maxMs&&(o.maxMs=o.lastMs)}petals(e,t,n,r,i,a){let o=t.fall,s=this.rec,c=this.node,l=this.stats,u=this.mesh.instanceMatrix.array;if(o&&n.fall&&!Yd.jumped&&i+a>0){let n=t.wind,d=(c[i>0?this.falling[0]:0],s),f=n.base>.001?n.gust(d[0],d[2])/n.base:0,p=f*f*f,m=Math.min(1.5,t.amount)*(t.low?60:110)*(Math.min(1,i/120)+.03*Math.min(1,a/400)*(1+6*p))*(.45+1.5*p+2.5*t.violence);this.acc=Math.min(oh,this.acc+m*e);let h=Math.max(0,Math.min(480,2*(o.stats.airCap||0))-o.counts.air),g=0;for(;this.acc>=1&&g<oh&&g<h;){--this.acc;let e=-1;if(i>0)e=this.falling[Math.floor(this.rnd()*i)];else for(let t=0;t<4&&e<0;t++){let t=Math.floor(this.rnd()*r);u[t*16+15]!==0&&(e=t)}if(e<0)continue;let n=g*16,a=.075+.04*this.rnd(),o=this.rnd()-.5,s=this.rnd()-.5,c=this.rnd()-.5,l=Math.hypot(o,s,c)||1;o/=l,s/=l,c/=l;let d=s,f=-o,p=0;Math.abs(c)>.95&&(d=1,f=0,p=-o/c);let m=Math.hypot(d,f,p)||1;d/=m,f/=m,p/=m,mh[n]=(f*c-p*s)*a,mh[n+1]=(p*o-d*c)*a,mh[n+2]=(d*s-f*o)*a,mh[n+3]=0,mh[n+4]=d*a,mh[n+5]=f*a,mh[n+6]=p*a,mh[n+7]=0,mh[n+8]=o*a,mh[n+9]=s*a,mh[n+10]=c*a,mh[n+11]=0,mh[n+12]=u[e*16+12]+(this.rnd()-.5)*.3,mh[n+13]=u[e*16+13]+(this.rnd()-.5)*.3,mh[n+14]=u[e*16+14]+(this.rnd()-.5)*.3,mh[n+15]=1;let h=(.85+.3*this.rnd())*(1-.5*t.night);hh[g*3]=this.petal.r*h,hh[g*3+1]=this.petal.g*h,hh[g*3+2]=this.petal.b*h,g++}g>0&&(o.adoptRaw(mh,hh,g,t.violence),l.petals+=g)}}},_h=Math.PI*2,vh=(e,t,n)=>{let r=Math.max(0,Math.min(1,(n-e)/(t-e)));return r*r*(3-2*r)},yh=[[1,.5,.1],[1,.97,.72],[.5,.68,1]],bh=6,xh=9,Sh=30,Ch=48,wh=2,Th=1.5;function Eh(e,t){let n=document.createElement(`canvas`);return n.width=e,n.height=t,[n,n.getContext(`2d`)]}function Dh(){let[e,t]=Eh(128,128),n=e=>{t.beginPath(),t.moveTo(e[0][0],e[0][1]);for(let n=1;n<e.length;n++)t.quadraticCurveTo(e[n][0],e[n][1],e[n][2],e[n][3]);t.closePath()};for(let e of[[[2,62],[70,60,96,80],[100,124,52,120],[10,112,2,70]],[[2,62],[40,0,122,8],[128,40,92,66],[50,74,2,66]]]){n(e),t.fillStyle=`#ffffff`,t.fill(),t.save(),t.clip(),t.strokeStyle=`#2a1e16`,t.lineWidth=11,n(e),t.stroke(),t.strokeStyle=`rgba(40,30,22,0.55)`,t.lineWidth=2.5;for(let e=0;e<6;e++)t.beginPath(),t.moveTo(2,64),t.lineTo(128,4+e*24),t.stroke();t.restore()}t.fillStyle=`#1c1612`;for(let[e,n,r]of[[88,30,7],[66,44,5],[62,96,6]])t.beginPath(),t.arc(e,n,r,0,_h),t.fill();t.fillStyle=`#fff`;for(let[e,n]of[[106,16],[112,30],[100,50],[84,100],[66,112]])t.beginPath(),t.arc(e,n,3,0,_h),t.fill();return t.fillStyle=`#15110e`,t.fillRect(0,26,7,86),e}function Oh(){let[e,t]=Eh(128,128),n=(e,n,r,i,a,o)=>{t.fillStyle=o,t.beginPath(),t.ellipse(e,n,r,i,a,0,_h),t.fill()};return t.fillStyle=`#3a2d22`,t.beginPath(),t.moveTo(34,62),t.lineTo(0,48),t.lineTo(2,64),t.lineTo(30,80),t.closePath(),t.fill(),t.fillStyle=`#2a2420`,t.fillRect(52,88,6,38),t.fillRect(66,88,6,38),n(60,68,36,25,-.22,`#6b5137`),n(66,76,28,18,-.2,`#d6c6a8`),n(80,66,18,16,-.3,`#cf7f3c`),n(92,46,18,17,0,`#6b5137`),n(97,52,10,8,0,`#cf7f3c`),n(50,64,26,13,.12,`#3f3226`),t.strokeStyle=`#cbb894`,t.lineWidth=3,t.beginPath(),t.moveTo(34,60),t.lineTo(66,66),t.stroke(),t.fillStyle=`#2a2420`,t.beginPath(),t.moveTo(107,41),t.lineTo(127,48),t.lineTo(107,53),t.closePath(),t.fill(),n(98,43,3.2,3.2,0,`#0c0a08`),e}function kh(){let[e,t]=Eh(128,128);t.beginPath(),t.moveTo(0,28),t.quadraticCurveTo(70,14,126,40),t.quadraticCurveTo(96,74,60,96),t.quadraticCurveTo(26,108,0,100),t.closePath(),t.fillStyle=`#5a4633`,t.fill(),t.save(),t.clip(),t.strokeStyle=`#33281d`,t.lineWidth=4;for(let e=0;e<9;e++)t.beginPath(),t.moveTo(10+e*9,50),t.lineTo(34+e*12,112-e*8),t.stroke();return t.strokeStyle=`#cbb894`,t.lineWidth=6,t.beginPath(),t.moveTo(0,52),t.quadraticCurveTo(50,44,96,50),t.stroke(),t.restore(),e}function Ah(){let[e,t]=Eh(256,128);for(let e=0;e<8;e++){let n=e%4*64+32,r=(e>>2)*64+32,i=(e+1)/8,a=t.createRadialGradient(n,r,0,n,r,29);a.addColorStop(0,`rgba(255,255,255,${i})`),a.addColorStop(.16,`rgba(255,255,255,${.9*i})`),a.addColorStop(.34,`rgba(255,255,255,${.22*i})`),a.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=a,t.fillRect(n-32,r-32,64,64)}return e}function jh(e){let t=e.length*12,n=new Float32Array(t*3),r=new Float32Array(t*3),i=new Float32Array(t*2),a=[0,0,1,0,1,1,0,0,1,1,0,1];e.forEach(([e,t,o],s)=>{for(let c=0;c<12;c++){let l=c>=6?[0,2,1,3,5,4][c-6]:c,u=a[l*2],d=a[l*2+1],f=s*12+c;for(let r=0;r<3;r++)n[f*3+r]=e[r]+t[r]*u+o[r]*d;r[f*3+1]=1,i[f*2]=u,i[f*2+1]=d}});let o=new kr;return o.setAttribute(`position`,new mr(n,3)),o.setAttribute(`normal`,new mr(r,3)),o.setAttribute(`uv`,new mr(i,2)),o.boundingSphere=new xr(new q(0,6,0),90),o}var Mh=class{group=new En;wings;bodies;birdWings;glow;force=null;stats={butterflies:0,settled:0,fireflies:0,lit:0,birds:0,perched:0,flushes:0,frames:0,sumMs:0,maxMs:0,pb:0,pf:0,pbird:0};bf=[];birds=[];ffN;ffH;t=0;seed=2654435769;m=new Zt;v=new q;right=new q;up=new q;P=[0,0,0];flushNow=!1;lastViolence=0;constructor(e,t,n){this.group.name=`critters`;let r=e.mesh.material,i=r.isMeshLambertMaterial||r.isMeshBasicMaterial,a=(e,t,a)=>{let o=new Ei(e);o.colorSpace=Me;let s=Df(o,!0);o.dispose();let c=i?r.clone():new Ki({side:0,map:s,alphaTest:.5});c.map=s;let l=new di(t,c,a);if(l.instanceMatrix.setUsage(Re),l.instanceMatrix.array.fill(0),l.instanceColor=new ri(new Float32Array(a*3).fill(1),3).setUsage(Re),l.castShadow=!1,l.receiveShadow=!1,l.frustumCulled=!1,l.matrixAutoUpdate=!1,!n){let e=new Gi({side:0,blending:0});e.allowOverride=!1,e.onBeforeCompile=e=>{e.uniforms.cutMap={value:s},e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec2 vCutUv;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
vCutUv = uv;`),e.fragmentShader=e.fragmentShader.replace(`void main() {`,`uniform sampler2D cutMap;
varying vec2 vCutUv;
void main() {`).replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>
if (texture2D(cutMap, vCutUv).a < 0.5) discard;`)},l.userData.gbufferMaterial=e}return l.visible=!1,this.group.add(l),l},o=n?bh:xh,s=jh([[[0,0,-.5],[1,0,0],[0,0,1]]]);this.wings=a(Dh(),s,o*2),this.bodies=a(Oh(),jh([[[-.5,-.5,0],[1,0,0],[0,1,0]],[[-.5,.02,-.2],[1,0,0],[0,0,.4]]]),wh),this.birdWings=a(kh(),s,4);for(let e=0;e<o;e++)this.bf.push({x:0,y:0,z:0,vx:0,vy:0,vz:0,hx:1,hz:0,tx:0,ty:0,tz:0,has:!1,sit:!1,timer:0,flap:this.rnd()*6,rate:9+3*this.rnd(),jx:0,jy:0,jz:0,jt:0,a:0,col:e%3,size:.85+.3*this.rnd()});for(let e=0;e<wh;e++)this.birds.push({st:0,t:0,dur:1,node:-1,to:-1,sx:0,sy:0,sz:0,x:0,y:0,z:0,hx:1,hz:0,gx:1,gz:0,wait:3+5*this.rnd()+e*2,next:1,pitch:0,flapping:!1,flap:0});let c=this.ffN=n?Sh:Ch;this.ffH=new Float32Array(c*8);for(let e=0;e<c*8;e++)this.ffH[e]=this.rnd();let l=new kr;l.setAttribute(`position`,new mr(new Float32Array(c*12),3).setUsage(Re));let u=new Float32Array(c*12);for(let e=0;e<c*4;e++)u[e*3+2]=1;l.setAttribute(`normal`,new mr(u,3)),l.setAttribute(`uv`,new mr(new Float32Array(c*8),2).setUsage(Re));let d=new Uint16Array(c*6);for(let e=0;e<c;e++)d.set([e*4,e*4+1,e*4+2,e*4,e*4+2,e*4+3],e*6);l.setIndex(new mr(d,1)),l.boundingSphere=new xr(new q(0,2,0),40);let f=t.clone(),p=new Ei(Ah());p.colorSpace=t.map?.colorSpace??`srgb`,f.map=p,f.blending=2,f.depthWrite=!1,f.opacity=1,this.glow=new $r(l,f),this.glow.frustumCulled=!1,this.glow.visible=!1,this.glow.renderOrder=4;let m=new Vr({visible:!1});m.allowOverride=!1,this.glow.userData.gbufferMaterial=m,this.group.add(this.glow)}rnd(){let e=this.seed;return e^=e<<13,e^=e>>>17,e^=e<<5,this.seed=e,(e>>>0)/4294967296}flush(){this.flushNow=!0}state(){return{butterflies:this.bf.filter(e=>e.a>0).map(e=>({x:e.x,y:e.y,z:e.z,sit:e.sit,col:e.col})),birds:this.birds.map(e=>({st:e.st,x:e.x,y:e.y,z:e.z,node:e.node,t:e.t,dur:e.dur}))}}frame(e,t,n){let r=performance.now(),i=this.stats,a=n.phase,o=this.force;this.t+=e;let s=1-vh(.01,.08,n.rain),c=Math.max(0,n.amount),l=vh(.035,.1,a)*(1-vh(.5,.58,a))*(1-vh(.02,.2,n.night))*s*(1-vh(.3,.6,n.cloud))*(1-vh(.5,.72,n.wind.base)),u=vh(.12,.2,a)*(1-vh(.42,.5,a))*vh(.25,.85,n.night)*s*(1-vh(.45,.7,n.wind.base)),d=a>.7,f=(n.night<.35&&n.rain<.03&&n.violence<.4)*(d?.5:1);o&&(o.butterflies!==void 0&&(l=o.butterflies),o.fireflies!==void 0&&(u=o.fireflies),o.birds!==void 0&&(f=o.birds)),l*=Math.min(1.5,c),u*=Math.min(1.5,c),c<=0&&(f=0),i.pb=l,i.pf=u,i.pbird=f;let p=n.sun.position,m=n.sun.target.position,h=Math.hypot(p.x-m.x,p.y-m.y,p.z-m.z)||1,g=n.sun.color,_=n.hemi.color,v=Th/Math.max(.12,n.sun.intensity*Math.max(0,(p.y-m.y)/h)*(.21*g.r+.72*g.g+.07*g.b)+n.hemi.intensity*(.21*_.r+.72*_.g+.07*_.b));this.butterflies(e,n,l,v),this.fireflies(n,u),this.birdFrame(e,t,n,f,v,d),this.lastViolence=n.violence;let y=performance.now()-r;i.frames++,i.sumMs+=y,y>i.maxMs&&(i.maxMs=y)}boost(e,t,n,r,i){let a=Math.hypot(t-e.cam.x,n-e.cam.y,r-e.cam.z);return 1+i*Math.max(0,Math.min(1,(a-3)/20))}pickFlower(e,t){let n=1e9,r=!1;for(let i=0;i<8;i++){let i=e.flowers[this.rnd()*e.flowers.length|0];if(!i||i.count<1)continue;let a=i.instanceMatrix.array,o=(this.rnd()*i.count|0)*16,s=Math.hypot(a[o+4],a[o+5],a[o+6]);if(s<.05)continue;let c=a[o+12],l=a[o+14],u=Math.hypot(c,l);if(u>17||u<1.2)continue;let d=Math.abs(Math.hypot(c-t.x,l-t.z)-6);d<n&&(n=d,t.tx=c,t.tz=l,t.ty=a[o+13]+s*.9,r=!0)}if(!r){let e=this.rnd()*_h,n=3+10*this.rnd();t.tx=Math.cos(e)*n,t.tz=Math.sin(e)*n,t.ty=.45}t.has=!0,t.timer=0}butterflies(e,t,n,r){let i=this.wings,a=this.stats,o=this.bf.length,s=Math.round(o*Math.min(1,n)),c=t.wind,l=0,u=0,d=i.instanceMatrix.array,f=i.instanceColor.array;for(let n=0;n<o;n++){let i=this.bf[n],a=n<s;if(i.a<=0&&!a)continue;i.a<=0&&(i.x=0,i.z=0,this.pickFlower(t,i),i.x=i.tx+(this.rnd()-.5)*3,i.z=i.tz+(this.rnd()-.5)*3,i.y=.8+this.rnd()*.6,i.vx=i.vy=i.vz=0,i.sit=!1,i.has=!1),i.a=a?Math.min(1,i.a+e*1.2):t.jumped?0:Math.max(0,i.a-e*.9),l++;let o=c.gust(i.x,i.z),p;if(i.sit){u++,i.timer-=e,i.x=i.tx,i.y=i.ty,i.z=i.tz;let t=Math.max(0,Math.sin(i.timer*2.6+i.rate));p=1.4-1.15*t*t,(i.timer<=0||!a||o>.62)&&(i.sit=!1,i.has=!1,i.vy=.8)}else{(!i.has||i.timer>18)&&this.pickFlower(t,i),i.timer+=e;let r=i.tx-i.x,s=i.tz-i.z,l=Math.hypot(r,s)||.001,u=Math.min(1,l/.6);i.jt-=e,i.jt<=0&&(i.jt=.1+.28*this.rnd(),i.jx=(this.rnd()-.5)*3.2,i.jz=(this.rnd()-.5)*3.2,i.jy=(this.rnd()-.5)*2.4);let d=Math.max(-.2,(Cp.speed(o)-Cp.speed(c.base*.7))*.3),f=1.5*u+.15,m=r/l*f+i.jx*u+c.dirX*d,h=s/l*f+i.jz*u+c.dirZ*d,g=(i.ty+Math.min(.75,l*.3)*(.7+.5*Math.sin(i.flap*.07+n))-i.y)*3+i.jy*(.25+.75*u);a||(g=1.2,m=c.dirX*2+i.jx,h=c.dirZ*2+i.jz);let _=Math.min(1,e/.14);i.vx+=(m-i.vx)*_,i.vy+=(g-i.vy)*_,i.vz+=(h-i.vz)*_,i.x+=i.vx*e,i.y=Math.max(.2,i.y+i.vy*e),i.z+=i.vz*e;let v=Math.hypot(i.vx,i.vz);if(v>.2){let t=Math.min(1,e*7);i.hx+=(i.vx/v-i.hx)*t,i.hz+=(i.vz/v-i.hz)*t;let n=Math.hypot(i.hx,i.hz)||1;i.hx/=n,i.hz/=n}i.flap+=e*_h*i.rate,p=.3+.95*Math.sin(i.flap),a&&l<.1&&Math.abs(i.y-i.ty)<.12&&(i.sit=!0,i.timer=2+4.5*this.rnd())}let m=.075*i.size*i.a*this.boost(t,i.x,i.y,i.z,3),h=Math.cos(p),g=Math.sin(p),_=i.hx,v=i.hz,y=-v,b=_,x=i.y+(i.sit?.01:-.035*g),S=yh[i.col];for(let e=0;e<2;e++){let t=e?-1:1,a=(n*2+e)*16;d[a]=t*y*h*m,d[a+1]=g*m,d[a+2]=t*b*h*m,d[a+3]=0,d[a+4]=-t*y*g*m,d[a+5]=h*m,d[a+6]=-t*b*g*m,d[a+7]=0,d[a+8]=_*m*1.15,d[a+9]=i.sit?0:.3*m,d[a+10]=v*m*1.15,d[a+11]=0,d[a+12]=i.x,d[a+13]=x,d[a+14]=i.z,d[a+15]=1;let o=(n*2+e)*3;f[o]=S[0]*r,f[o+1]=S[1]*r,f[o+2]=S[2]*r}i.a<=0&&d.fill(0,n*32,n*32+32)}a.butterflies=l,a.settled=u,(l||i.visible)&&(i.visible=l>0,i.instanceMatrix.needsUpdate=!0,i.instanceColor.needsUpdate=!0)}fireflies(e,t){let n=this.glow,r=this.stats,i=this.ffN,a=this.ffH,o=this.t,s=Math.min(i,i*Math.min(1,t));if(s<=.01){n.visible&&=!1,r.fireflies=0,r.lit=0;return}let c=n.geometry,l=c.attributes.position.array,u=c.attributes.uv.array,d=this.right.set(1,0,0).applyQuaternion(e.camQ),f=this.up.set(0,1,0).applyQuaternion(e.camQ),p=0,m=0;for(let t=0;t<i&&t<s;t++){let n=t*8,r=2.6+3.4*a[n],i=(o/r+a[n+1])%1*r,c=i<.22?i/.22:i<.5?1:i<1.25?1-(i-.5)/.75:0;if(a[n+7]<.25&&i>1.45&&i<2.1){let e=i-1.45;c=e<.15?e/.15:1-(e-.15)/.5}if(c=c*c*Math.min(1,s-t),c<.02)continue;m++;let h=a[n+2]*_h,g=1.6+13*a[n+3]*a[n+3],_=.6+.8*a[n+4],v=Math.cos(h)*g+1.3*Math.sin(o*.19*_+n)+.5*Math.sin(o*.53*_+2.1*n),y=Math.sin(h)*g+1.3*Math.sin(o*.17*_+1.7*n)+.5*Math.cos(o*.47*_+n),b=.5+1.5*a[n+5]*a[n+5]+(a[n+6]<.2?1.6*a[n+6]*5:0)+.22*Math.sin(o*.37*_+3*n)+.18*c,x=Math.hypot(v-e.cam.x,b-e.cam.y,y-e.cam.z),S=Math.max(.2,x*.021)*(.6+.4*c),C=Math.min(7,Math.floor(c*8)),w=C%4/4,T=1-((C>>2)+1)/2,E=p*12,D=p*8;for(let e=0;e<4;e++){let t=e===0||e===3?-1:1,n=e<2?-1:1;l[E+e*3]=v+(d.x*t+f.x*n)*S,l[E+e*3+1]=b+(d.y*t+f.y*n)*S,l[E+e*3+2]=y+(d.z*t+f.z*n)*S,u[D+e*2]=w+(t>0?.25:0),u[D+e*2+1]=T+(n>0?.5:0)}p++}r.fireflies=Math.ceil(s),r.lit=m,c.setDrawRange(0,p*6),n.visible=p>0,p&&(c.attributes.position.needsUpdate=!0,c.attributes.uv.needsUpdate=!0,n.material.color.setRGB(.85,1.05,.14))}perch(e,t,n,r){let i=e.nodes[n];if(!i)return!1;let a=n*3,o=t&&t.length>=a+3;return r[0]=i.wx+(o?t[a]:0),r[1]=i.wy+(o?t[a+1]:0)+i.radius,r[2]=i.wz+(o?t[a+2]:0),!e.chains[i.chain]?.pruned}okPerch(e,t,n){let r=e.nodes[t];if(!r||r.order<1||r.radius<.006||r.radius>.07||r.wy<.4*n||r.wy<2.2)return!1;let i=e.chains[r.chain];return!!i&&!i.pruned}pickPerch(e,t){let n=e.bboxMax[1],r=e.nodes.length;if(n<3.5||r<400)return-1;let i=-1,a=-1e9,o=t>=0?e.nodes[t]:null;for(let t=0;t<90;t++){let t=this.rnd()*r|0;if(!this.okPerch(e,t,n))continue;let s=e.nodes[t],c=s.light*1.2+s.wy/n*.8+Math.min(s.radius,.03)*12+this.rnd()*.3;if(o){let e=Math.hypot(s.wx-o.wx,s.wy-o.wy,s.wz-o.wz);if(e<.45)continue;c=-Math.abs(e-1)+s.light*.3}c>a&&(a=c,i=t)}return i}leave(e,t,n,r){e.st=3,e.t=0,e.sx=e.x,e.sy=e.y,e.sz=e.z,e.gx=Math.cos(r),e.gz=Math.sin(r),e.dur=n?5.2:7}birdFrame(e,t,n,r,i,a){let o=this.stats,s=Math.round(wh*Math.min(1,r)),c=this.P,l=this.flushNow||n.violence>.4&&this.lastViolence<=.4||n.rain>.05;this.flushNow=!1;for(let e of this.birds)e.st!==2&&e.st!==4||this.perch(t,n.D,e.node,c)||(l=!0);if(l){let e=Math.atan2(n.wind.dirZ,n.wind.dirX)+(this.rnd()-.5),t=!1;this.birds.forEach((r,i)=>{(r.st===1||r.st===2||r.st===4)&&(this.leave(r,n,!0,e+i*.12),t=!0)}),t&&o.flushes++}let u=0,d=0,f=this.bodies.instanceMatrix.array,p=this.birdWings.instanceMatrix.array;for(let r=0;r<wh;r++){let i=this.birds[r],o=r<s;if(n.jumped&&!o&&(i.st=0),i.st===0){if(f.fill(0,r*16,r*16+16),p.fill(0,r*32,r*32+32),i.wait-=e,!o||i.wait>0)continue;let a=this.birds[0];if(r>0&&a.st!==1&&a.st!==2){i.wait=.5;continue}if(i.node=this.pickPerch(t,r>0?a.node:-1),i.node<0){i.wait=4;continue}let s=r>0?Math.atan2(a.sz,a.sx)+.1:this.rnd()*_h;this.perch(t,n.D,i.node,c),i.sx=Math.cos(s)*55,i.sz=Math.sin(s)*55,i.sy=c[1]+3+6*this.rnd(),i.st=1,i.t=0,i.dur=6.2+this.rnd(),i.flap=0,i.x=i.sx,i.y=i.sy,i.z=i.sz}u++,i.t+=e;let l=Math.min(1,i.t/i.dur);if(i.flap+=e*_h*13,i.st===1){if(!this.perch(t,n.D,i.node,c)){this.leave(i,n,!0,this.rnd()*_h);continue}let e=1-(1-l)**1.8,r=i.t*1.8%1,o=Math.min(1,(1-l)*6),s=l>.9,u=c[0]-i.sx,d=c[2]-i.sz,f=Math.hypot(u,d)||1;i.x=i.sx+u*e,i.z=i.sz+d*e,i.y=i.sy+(c[1]+.05-i.sy)*e-.42*o*Math.cos(_h*r)+.5*Math.sin(Math.PI*Math.min(1,(1-l)*5))*(l>.8?-.6:0),i.hx=u/f,i.hz=d/f,i.flapping=r<.52||s,i.pitch=s?.7*(l-.9)*10:.45*o*Math.sin(_h*r),l>=1&&(i.st=2,i.t=0,i.dur=(a?6:9)+16*this.rnd(),i.next=.8+2*this.rnd(),i.gx=i.hx,i.gz=i.hz)}else if(i.st===2){d++,i.x=c[0],i.y=c[1],i.z=c[2],this.perch(t,n.D,i.node,c),i.x=c[0],i.y=c[1],i.z=c[2],i.flapping=!1,i.pitch=.3;let a=Math.min(1,e*18);i.hx+=(i.gx-i.hx)*a,i.hz+=(i.gz-i.hz)*a;let s=Math.hypot(i.hx,i.hz)||1;if(i.hx/=s,i.hz/=s,i.next-=e,i.next<=0){i.next=1+3*this.rnd();let e=t.chains[t.nodes[i.node].chain],n=e.nodes.indexOf(i.node),r=e.nodes[n+(this.rnd()<.5?-1:1)*(1+(this.rnd()*2|0))];if(this.rnd()<.45&&r!==void 0&&this.okPerch(t,r,0))i.st=4,i.to=r,i.dur=i.t,i.t=0,i.sx=.24;else{let e=Math.atan2(i.gz,i.gx)+(this.rnd()<.5?-1:1)*(.6+1.8*this.rnd());i.gx=Math.cos(e),i.gz=Math.sin(e)}}let l=this.birds[0];i.st===2&&(i.t>i.dur||!o||r>0&&l.st===3&&l.t>.5)&&this.leave(i,n,!1,r>0&&l.st===3?Math.atan2(l.gz,l.gx)+.1:this.rnd()*_h)}else if(i.st===4){d++;let e=Math.min(1,i.t/i.sx),r=c[0],a=c[1],o=c[2];this.perch(t,n.D,i.to,c),i.x=r+(c[0]-r)*e,i.y=a+(c[1]-a)*e+.07*Math.sin(Math.PI*e),i.z=o+(c[2]-o)*e,i.flapping=!0,i.pitch=.3,e>=1&&(i.st=2,i.node=i.to,i.t=i.dur,i.dur=i.t+4+8*this.rnd())}else{let t=l**1.7,n=i.t*1.8%1,o=Math.min(1,l*8);i.x=i.sx+i.gx*60*t,i.z=i.sz+i.gz*60*t,i.y=i.sy+9*l**.8+.5*Math.min(1,i.t*3)-.42*o*Math.cos(_h*n);let s=Math.min(1,e*10);i.hx+=(i.gx-i.hx)*s,i.hz+=(i.gz-i.hz)*s;let c=Math.hypot(i.hx,i.hz)||1;if(i.hx/=c,i.hz/=c,i.flapping=i.t<.7||n<.52,i.pitch=i.t<.7?.6:.45*Math.sin(_h*n),l>=1){i.st=0,i.wait=(a?18:6)+14*this.rnd()+r*1.5;continue}}let m=.17*this.boost(n,i.x,i.y,i.z,2.6),h=Math.cos(i.pitch),g=Math.sin(i.pitch),_=i.hx,v=i.hz,y=-v,b=_,x=r*16,S=_*h,C=g,w=v*h,T=-_*g,E=h,D=-v*g,O=i.x+T*m*.48,k=i.y+E*m*.48,A=i.z+D*m*.48;f[x]=S*m,f[x+1]=C*m,f[x+2]=w*m,f[x+3]=0,f[x+4]=T*m,f[x+5]=E*m,f[x+6]=D*m,f[x+7]=0,f[x+8]=y*m,f[x+9]=0,f[x+10]=b*m,f[x+11]=0,f[x+12]=O,f[x+13]=k,f[x+14]=A,f[x+15]=1;let j=.15+1.05*Math.sin(i.flap),M=Math.cos(j),N=Math.sin(j),P=i.flapping?m*.95:0;for(let e=0;e<2;e++){let t=e?-1:1,n=(r*2+e)*16;p[n]=(t*y*M+T*N)*P,p[n+1]=E*N*P,p[n+2]=(t*b*M+D*N)*P,p[n+3]=0,p[n+4]=(-t*y*N+T*M)*P,p[n+5]=E*M*P,p[n+6]=(-t*b*N+D*M)*P,p[n+7]=0,p[n+8]=S*P*.7,p[n+9]=C*P*.7,p[n+10]=w*P*.7,p[n+11]=0,p[n+12]=O+S*m*.05+T*m*.1,p[n+13]=k+C*m*.05+E*m*.1,p[n+14]=A+w*m*.05+D*m*.1,p[n+15]=1}}if(o.birds=u,o.perched=d,u||this.bodies.visible){let e=this.bodies.instanceColor.array,t=this.birdWings.instanceColor.array;e.fill(i*1.7),t.fill(i*1.9),this.bodies.visible=this.birdWings.visible=u>0,this.bodies.instanceMatrix.needsUpdate=this.birdWings.instanceMatrix.needsUpdate=!0,this.bodies.instanceColor.needsUpdate=this.birdWings.instanceColor.needsUpdate=!0}}};function Nh(){let e=navigator.wakeLock;if(!e){wl.log(`wakelock`,{ok:!1,why:window.isSecureContext?`unsupported`:`insecure-context`});return}let t=null,n=!1,r=async()=>{if(!(document.visibilityState!==`visible`||t&&!t.released))try{t=await e.request(`screen`),n||(n=!0,wl.log(`wakelock`,{ok:!0}))}catch(e){n||(n=!0,wl.log(`wakelock`,{ok:!1,why:String(e?.name??e)}))}};document.addEventListener(`visibilitychange`,r),window.addEventListener(`pointerdown`,r,{passive:!0}),r()}var Ph=/^(utm_|fbclid$|gclid$|ref$|source$|start$|roll$)/;function Fh(e){let t=e.get(`start`);if(t===`0`)return!1;if(t===`1`)return!0;for(let t of e.keys())if(!Ph.test(t))return!1;return!0}function Ih(e){return()=>{e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}var Lh=[`growth`,`crown`,`thickness`,`leaves`,`light`],Rh=[`timeOfDay`,`latitude`,`fog`,`stars`,`skyHue`,`skyTint`,`sunHue`,`sunTint`,`sun2`,`sun2Hue`,`sun2Yaw`,`sunSize`,`groundHue`,`groundTint`],zh=e=>{let t={};for(let[n,r]of Object.entries(xp[e].params))for(let[e,i]of Object.entries(r))t[`${n}.${e}`]=i;return t},Bh={oak:`oak`,maple:`maple`,round:`linden`,birch:`birch`,ginkgo:`ginkgo`,willow:`willow`,spray:`cypress`},Vh=[{w:22,make:(e,t)=>{let n=t([`oak`,`oak`,`oak`,`maple`,`round`]);return{adj:`Broad`,name:`Broad ${Bh[n]}`,blurb:`A full, rounded crown on a sturdy trunk.`,v:{"crown.shape":e(0,.3),"crown.height":e(5.6,7.4),"crown.radius":e(3.2,4.3),"crown.base":e(2.1,2.7),"crown.bole":e(1.4,1.9),"growth.branchAngle":e(38,50),"growth.wander":e(.25,.4),"leaves.form":n,"leaves.hue":e(.24,.31),"leaves.saturation":e(.46,.6),"leaves.lightness":e(.92,1.08),"leaves.size":e(.145,.165)}}}},{w:14,make:(e,t)=>{let n=t([`birch`,`birch`,`ginkgo`]);return{adj:`Slender`,name:`Slender ${Bh[n]}`,blurb:`Tall and airy, with a light, narrow crown.`,v:{"crown.shape":e(0,.35),"crown.height":e(7.4,9.2),"crown.radius":e(2.3,2.9),"crown.base":e(2.4,3.1),"crown.bole":e(1.9,2.5),"growth.branchAngle":e(30,40),"growth.apicalDominance":e(.58,.7),"growth.weeping":e(.15,.45),"growth.straightness":e(1.6,2),"leaves.form":n,"leaves.hue":e(.24,.3),"leaves.saturation":e(.48,.6),"leaves.lightness":e(1.04,1.18),"leaves.size":e(.14,.16)}}}},{w:13,make:e=>({name:`Weeping willow`,blurb:`Long shoots that hang down in curtains.`,v:{...zh(`Weeping willow`),"growth.weeping":e(1.25,1.7),"growth.sag":e(1.8,2.4),"crown.radius":e(4,5),"crown.height":e(5.4,6.6),"crown.base":e(2,2.5),"leaves.hue":e(.2,.26),"leaves.saturation":e(.45,.56),"leaves.lightness":e(1.05,1.2)}})},{w:12,make:e=>({name:`Columnar cypress`,blurb:`A dark, narrow spire reaching straight up.`,v:{...zh(`Windswept cypress`),"crown.radius":e(1.35,1.9),"crown.height":e(8.8,10.8),"crown.base":e(.8,1.2),"growth.branchAngle":e(20,27),"leaves.hue":e(.3,.36),"leaves.saturation":e(.33,.42),"leaves.lightness":e(.76,.9)}})},{w:11,make:(e,t)=>{let n=t([`maple`,`round`,`ginkgo`,`oak`]);return{adj:`Spreading`,name:`Spreading ${Bh[n]}`,blurb:`A wide parasol of a crown over a clear trunk.`,v:{"crown.shape":e(1.5,2),"crown.height":e(4.4,5.4),"crown.radius":e(4.7,5.7),"crown.base":e(2.6,3.2),"crown.bole":e(2,2.5),"growth.branchAngle":e(54,66),"growth.scaffoldBranching":e(.6,.9),"growth.vigorDecay":e(.83,.86),"thickness.rootFlare":e(1.6,2.2),"leaves.form":n,"leaves.hue":e(.22,.3),"leaves.saturation":e(.48,.6),"leaves.lightness":e(.95,1.1),"leaves.size":e(.15,.18)}}}},{w:8,make:(e,t)=>{let n=t([`ginkgo`,`maple`,`birch`]);return{adj:`Young`,name:`Young ${Bh[n]}`,blurb:`A neat cone that tapers to a point.`,v:{"crown.shape":e(.7,1),"crown.height":e(7,8.8),"crown.radius":e(2.7,3.4),"crown.base":e(1.6,2.2),"crown.bole":e(1.1,1.6),"growth.branchAngle":e(40,52),"growth.apicalDominance":e(.6,.75),"leaves.form":n,"leaves.hue":e(.2,.27),"leaves.saturation":e(.5,.62),"leaves.lightness":e(1.02,1.15),"leaves.size":e(.145,.165)}}}},{w:5,alien:!0,make:e=>({name:`Low-gravity alien`,blurb:`A tall spiral with giant fronds, under two suns.`,v:{...zh(`Low-gravity alien`),"growth.gravity":e(.15,.3),"growth.torsion":e(10,16),"crown.height":e(10.5,12.5),"leaves.hue":e(.42,.52)}})},{w:5,alien:!0,make:e=>({name:`Crimson world`,blurb:`A red, twisting umbrella under a teal sky.`,v:{...zh(`Crimson world`),"growth.torsion":e(-14,-8),"crown.radius":e(5.6,6.8),"leaves.hue":e(.92,1),"leaves.saturation":e(.7,.85)}})},{w:5,alien:!0,make:e=>({name:`Bioluminescent night`,blurb:`Glowing spirals under a field of stars.`,v:{...zh(`Bioluminescent night`),"growth.weeping":e(.5,.8),"crown.radius":e(4,5),"leaves.hue":e(.46,.58),"leaves.glow":e(.38,.52),"leaves.glowHue":e(.44,.58)}})},{w:5,alien:!0,make:e=>({name:`Heavy world`,blurb:`Squat and wide, pressed down by three times the gravity.`,v:{...zh(`Heavy world`),"growth.gravity":e(2.4,3.2),"crown.radius":e(5.6,6.8),"crown.height":e(3,3.8),"leaves.hue":e(.17,.24)}})}];function Hh(e=Math.floor(Math.random()*2**31)){let t=Ih(e),n=(e,n)=>+(e+t()*(n-e)).toFixed(3),r=e=>e[Math.floor(t()*e.length)],i=t()*Vh.reduce((e,t)=>e+t.w,0),a=Vh.find(e=>(i-=e.w)<0)??Vh[0],o=a.make(n,r),s=o.v;return a.alien||(s[`sky.timeOfDay`]=n(8.5,17.8)),s[`seed.seed`]=Math.floor(t()*999999),{name:o.name,adj:o.adj,blurb:o.blurb,alien:!!a.alien,values:s}}function Uh(e,t,n){let r=fl(),i=e,a={};for(let e of Lh)for(let t of Object.keys(r[e]))`${e}.${t}`!=`growth.maxNodes`&&(a[`${e}.${t}`]=r[e][t]);for(let e of Rh)a[`sky.${e}`]=r.sky[e];Object.assign(a,n.values),t.journey=[],t.drift={};for(let[e,n]of Object.entries(a)){let[r,a]=e.split(`.`);i[r][a]!==n&&t.userSet(e,n)}_l(e,location.search)}function Wh(e,t={},...n){let r=document.createElement(e);for(let[e,n]of Object.entries(t))e===`class`?r.className=String(n):e===`text`?r.textContent=String(n):r.setAttribute(e,String(n));return r.append(...n),r}var Gh=[{key:`crown.height`,label:`Height`,min:3,max:12.5,step:.1,fmt:(e,t)=>`${(e+t.crown.base).toFixed(0)} m`},{key:`crown.radius`,label:`Width`,min:1.3,max:7,step:.1,fmt:e=>`${(2*e).toFixed(0)} m`},{key:`growth.weeping`,label:`Droop`,min:0,max:1.7,step:.05,fmt:e=>e<.2?`upright`:e<.7?`arching`:e<1.2?`hanging`:`weeping`},{key:`leaves.hue`,label:`Leaf colour`,min:0,max:1,step:.005,cls:`as-hue`,fmt:()=>``}];function Kh(e,t,n){let r=null,i=t=>{let[n,r]=t.split(`.`);return e[n][r]},a=Wh(`h1`,{id:`arbor-start-name`,class:`as-name`}),o=Wh(`p`,{class:`as-blurb`,id:`arbor-start-blurb`}),s=Wh(`p`,{class:`as-facts`,id:`arbor-start-facts`}),c=[],l=()=>{for(let e of c)e()};window.addEventListener(`pageshow`,()=>setTimeout(l,0));let u=Wh(`div`,{class:`as-forms`,role:`group`,"aria-label":`Leaf shape`}),d=[];Au.forEach((e,n)=>{let r=Wh(`canvas`,{width:112,height:112,"aria-hidden":`true`}),i=Wh(`button`,{type:`button`,class:`as-form`,"data-form":e.id,"aria-pressed":`false`},r,Wh(`span`,{text:e.name}));i.addEventListener(`click`,()=>{t.userSet(`leaves.form`,e.id),l()}),d.push(i),u.append(i),setTimeout(()=>{let t=Mu(e.id,e.paint?192:512),n=r.getContext(`2d`),i=104*Math.min(1,1/e.aspect),a=i*e.aspect;n.imageSmoothingQuality=`high`,n.drawImage(t,(112-a)/2,(112-i)/2,a,i)},30+n*25)}),c.push(()=>{let e=ju(String(i(`leaves.form`))).id;for(let t of d){let n=t.dataset.form===e;t.setAttribute(`aria-pressed`,String(n)),n&&u.scrollWidth>u.clientWidth&&u.scrollTo({left:t.offsetLeft-(u.clientWidth-t.offsetWidth)/2})}});let f=Gh.map(n=>{let r=`arbor-start-${n.key.replace(`.`,`-`)}`,a=Wh(`input`,{type:`range`,id:r,autocomplete:`off`,min:n.min,max:n.max,step:n.step,"data-start-param":n.key,class:n.cls??``}),o=Wh(`span`,{class:`as-val`});return a.addEventListener(`input`,()=>{t.userSet(n.key,Number(a.value)),l()}),c.push(()=>{let t=Number(i(n.key));a.value=String(t),o.textContent=n.fmt(t,e),a.style.setProperty(`--fill`,`${100*(Math.min(n.max,Math.max(n.min,t))-n.min)/(n.max-n.min)}%`),n.cls&&a.style.setProperty(`--thumb`,`hsl(${(t*360).toFixed(0)} ${(Number(i(`leaves.saturation`))*100).toFixed(0)}% 45%)`)}),Wh(`div`,{class:`as-row`},Wh(`label`,{for:r,text:n.label}),a,o)});c.push(()=>{let t=ju(String(i(`leaves.form`))),n=e.sky.timeOfDay,o=n<5||n>21?`night`:n<11?`morning`:n<15?`midday`:n<19?`afternoon`:`dusk`;s.textContent=`${t.name} leaves · ${(e.crown.height+e.crown.base).toFixed(0)} m tall, ${(2*e.crown.radius).toFixed(0)} m wide · ${o}`,r?.adj&&(a.textContent=`${r.adj} ${Bh[t.id]??`${t.name.toLowerCase()} tree`}`)});let p=Wh(`button`,{type:`button`,class:`as-btn`,id:`arbor-start-reroll`,"aria-label":`Suggest another tree`});p.innerHTML=`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/></svg><span>Another</span>`;let m=Wh(`button`,{type:`button`,class:`as-btn as-go`,id:`arbor-start-go`,text:`Plant this tree`}),h=Wh(`div`,{class:`as-card`},Wh(`div`,{class:`as-eyebrow`,text:`Your tree`}),a,o,s,u,Wh(`div`,{class:`as-rows`},...f),Wh(`div`,{class:`as-actions`},p,m),Wh(`p`,{class:`as-foot`,text:`It grows from a seed through days, weather and seasons. Everything else is in Controls.`})),g=Wh(`div`,{id:`arbor-start`,class:`as-root`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":`arbor-start-name`,"aria-describedby":`arbor-start-blurb`,hidden:``},Wh(`div`,{class:`as-brand`},Wh(`span`,{class:`as-word`,text:`Arbor`}),Wh(`span`,{class:`as-tag`,text:`Watch a tree grow`})),h);document.body.append(g);let _=i=>{r=Hh(i),Uh(e,t,r),a.textContent=r.name,o.textContent=r.blurb,g.classList.toggle(`alien`,r.alien),n.proposed(r),l()},v=0;p.addEventListener(`click`,()=>{_(),h.classList.remove(`swap`),h.offsetWidth,h.classList.add(`swap`),p.style.setProperty(`--turn`,`${++v*180}deg`)});let y=0;return m.addEventListener(`click`,()=>{g.classList.contains(`leaving`)||(n.begin(a.textContent??``),g.classList.add(`leaving`),document.body.classList.remove(`starting`),y=window.setTimeout(()=>{g.hidden=!0,g.classList.remove(`leaving`)},700),document.getElementById(`arbor-panel-open`)?.focus({preventScroll:!0}))}),g.addEventListener(`keydown`,e=>{if(e.key!==`Tab`)return;let t=[...g.querySelectorAll(`button, input`)],n=t[0],r=t[t.length-1];e.shiftKey&&document.activeElement===n?(e.preventDefault(),r.focus()):!e.shiftKey&&document.activeElement===r&&(e.preventDefault(),n.focus())}),{open(e){clearTimeout(y),_(e),g.classList.remove(`leaving`),g.hidden=!1,document.body.classList.add(`starting`),matchMedia(`(hover: hover)`).matches&&m.focus({preventScroll:!0})},get isOpen(){return!g.hidden&&!g.classList.contains(`leaving`)},get proposal(){return r}}}Nh();var qh=new URLSearchParams(location.search);try{for(let e=localStorage.length-1;e>=0;e--){let t=localStorage.key(e);t&&(t.startsWith(`arbor.leafBad.`)||t===`arbor.ladder`)&&localStorage.removeItem(t)}}catch{}var Z=fl(),Jh=new lp(Z),Yh=qh.get(`preset`)??`Oak meadow`,Xh=1/0;function Zh(e){Yh=e;let t=Sp(e),n=Z;for(let e of Object.keys(t))e!==`seed`&&e!==`camera`&&e!==`time`&&e!==`weather`&&e!==`season`&&Object.assign(n[e],t[e]);Z.growth.maxNodes=Math.min(Z.growth.maxNodes,Xh),hl(),Jh.drift={},Jh.journey=(xp[e]?.journey??[]).map(e=>({t:e.t,values:{...e.values}}))}Zh(Yh),_l(Z,location.search),(qh.has(`timeOfDay`)||qh.has(`sky.timeOfDay`))&&!qh.has(`cycle`)&&!qh.has(`sky.cycle`)&&(Z.sky.cycle=!1);var Qh=ng();!qh.has(`quality`)&&!qh.has(`sky.quality`)&&Qh&&(Z.sky.quality=`Low`),Qh&&!qh.has(`maxNodes`)&&!qh.has(`growth.maxNodes`)&&(Z.growth.maxNodes=Math.min(Z.growth.maxNodes,Xh=7e3));var $h=Tl(qh),eg=`arbor.ctxLost`,tg=(()=>{try{return Number(sessionStorage.getItem(eg))||0}catch{return 0}})();tg>0&&!qh.has(`shadows`)&&($h.shadows=!1),$h.safe&&!qh.has(`quality`)&&(Z.sky.quality=`Low`),$h.grow||(Z.time.paused=!0);function ng(){return!!(navigator.userAgentData?.mobile||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||navigator.maxTouchPoints>1&&Math.min(screen.width,screen.height)<900||navigator.deviceMemory!==void 0&&navigator.deviceMemory<4)}wl.phase(`init stage`);var rg=null;try{rg=new xf(document.body,{antialias:$h.antialias,backdrop:$h.backdrop,shadows:$h.shadows,onContextLost:og})}catch(e){wl.log(`webgl_create_failed`,{msg:String(e?.message??e)}),ag()}rg||await new Promise(()=>{});var Q=rg,ig=`arbor.cam`;try{let e=JSON.parse(sessionStorage.getItem(ig)??`null`);sessionStorage.removeItem(ig),Array.isArray(e)&&e.length===6&&e.every(Number.isFinite)&&(Q.camera.position.set(e[0],e[1],e[2]),Q.controls.target.set(e[3],e[4],e[5]),Q.takeControl())}catch{}function ag(){let e=document.createElement(`div`);e.id=`nowebgl`,e.style.cssText=`position:fixed;inset:0;z-index:30;background:#1c2126;color:#e8ecef;padding:24px;font:17px/1.55 ui-sans-serif,system-ui,sans-serif;overflow:auto`,e.innerHTML=`<h2 style="margin:0 0 10px;font-size:20px">3D graphics are blocked</h2><p>Your browser has temporarily blocked 3D graphics for this page after a graphics reset. Fully close Chrome (swipe it away from recent apps) and open the page again.</p>`,document.body.appendChild(e)}function og(){let e=tg+1;try{e=(Number(sessionStorage.getItem(eg))||0)+1,sessionStorage.setItem(eg,String(e))}catch{}wl.log(`ctx_loss_count`,{n:e});try{rg?.manual&&sessionStorage.setItem(`arbor.cam`,JSON.stringify([...rg.camera.position.toArray(),...rg.controls.target.toArray()]))}catch{}return e<2||(sg(),!1)}function sg(){let e=document.createElement(`div`);e.id=`ctxlost`,e.style.cssText=`position:fixed;inset:0;z-index:20;background:#1c2126;color:#e8ecef;padding:20px;font:16px/1.5 ui-sans-serif,system-ui,sans-serif;overflow:auto`;let t=(e,t)=>`<a href="./${e}" style="display:block;margin:8px 0;padding:12px;border-radius:7px;background:#2c343b;color:#fff;text-decoration:none">${t}</a>`;e.innerHTML=`<h2 style="margin:0 0 8px;font-size:19px">The graphics driver crashed twice</h2><p>This page stopped reloading itself so it does not loop. Try one of these:</p>`+t(`?leafsafe=1&shadows=0`,`Safe leaves, no shadows`)+t(`?leafshader=basic&shadows=0`,`Unlit leaves, no shadows`)+t(`?leaves=0`,`No leaves`)+t(`?safe=1`,`Full safe mode`)+t(`diag.html`,`Diagnostics page`)+`<p style="color:#a9b3bb;font-size:13px">Closing this tab resets the crash counter.</p>`,document.body.appendChild(e)}$h.skyBasic&&(Q.atmo.basic=!0,Q.atmo.sky.visible=!1,Q.scene.background=Q.fog.color),wl.phase(`init sim`);var $=new Hl(Z);wl.phase(`init textures`);var cg=new wf(vu()),lg=dg(),ug=new zf(Nu(Z.leaves.form),lg,Z.sky.quality===`Low`?32e3:48e3);function dg(){let e=fg(Q.renderer.getContext()),t=$h.leafSafe===null?/PowerVR|Imagination/i.test(e)?`powervr`:Qh&&Z.sky.quality===`Low`?`mobile-low`:tg>0?`context-lost-before`:``:$h.leafSafe?`forced`:``,n=$h.leafShader??(t?`safe`:`full`),r=$h.leafShadow??(n===`full`&&$h.shadows),i=qh.get(`leafvariant`),a=i!==null&&/^\d+$/.test(i)&&Number(i)<kf.length,o=a?Number(i):0,s=a?`forced`:`default`,c={shader:n,shadow:r,variant:n===`full`?void 0:o};return wl.log(`leaf_mode`,{...c,variantName:n===`full`?null:kf[o].name,variantWhy:s,reason:t,gpu:e,ctxLosses:tg}),c}function fg(e){try{let t=e.getExtension(`WEBGL_debug_renderer_info`);return String(e.getParameter(t?t.UNMASKED_RENDERER_WEBGL:e.RENDERER)??``)}catch{return``}}Q.scene.add(cg.mesh),$h.leaves&&Q.scene.add(ug.mesh);var pg=new np;Q.scene.add(pg.mesh);var mg=$h.meadow?new Qp(ug.mesh.material,7,$h.backdrop):null;mg&&Q.scene.add(mg.group);var hg=[.062,.08,.1],gg=14,_g=new J,vg={sunDir:new q(0,1,0),sunCol:new J,hemi:new J,night:0,tintHue:0,tint:0,frac:1},yg=$h.rain?new fm(pg.mesh.material):null;yg&&Q.scene.add(yg.group);var bg=qh.get(`celestial`)===`0`?null:new cd(pg.mesh.material,Q.atmo.stars);bg&&Q.scene.add(bg.group);{let e=qh.get(`weather`);(e===`storm`||e===`calm`||e===`auto`)&&(Z.weather.event=e),e===`storm`?am.snapStorm():Z.weather.event===`auto`&&Z.weather.kind in $p&&am.snap(Z.weather.kind)}var xg=0,Sg=!1;function Cg(e){wl.phase(`weather`,!0),am.update(e,Z.weather.event,Z.weather.lightning,{kind:Z.weather.kind,phase:Yd.phase,hour:Z.sky.timeOfDay,wind:wp.base}),Q.wx.cloud=am.cloud,Q.wx.clear=am.clear,Q.wx.haze=am.haze,Q.wx.flash=am.flash,(Math.abs(am.cloud-xg)>.06||am.cloud!==xg&&(am.cloud===0||am.cloud===1))&&(xg=am.cloud,Zg=!0)}function wg(e){if(wl.phase(`weather`,!0),Q.applyFlash(),pg.mesh.material.opacity=1-.65*am.cloud,pg.fade(e),bg?.frame(Q.camera,Q.atmo,am.cloud,Q.fog.density,e,Z.sky.quality===`Low`),!yg)return;let t=Q.atmo.night,n=Z.sky.quality===`Low`;pg.mesh.visible&&(Sg=!0),yg.group.visible=!n||Sg,yg.group.visible&&yg.frame(Q.camera,am,wp,e,.5*(1-t)+.05,t,n&&Q.renderer.getPixelRatio()<1.5&&window.devicePixelRatio>=1.5?2:3)}function Tg(e){if(wp.update(e,Z.sky.wind*am.breeze,Q.atmo.night,am.wind),!mg||(mg.group.visible=Z.sky.meadow,!Z.sky.meadow))return;wl.phase(`meadow`,!0);let t=Q.sun,n=Q.hemi,r=vg;r.sunDir.copy(t.position).sub(t.target.position).normalize(),r.sunCol.copy(t.color).multiplyScalar(t.intensity),r.hemi.copy(n.color).multiplyScalar(n.intensity),r.night=Q.atmo.night,r.tintHue=Z.sky.groundHue,r.tint=Math.min(1,Z.sky.groundTint),r.frac=Z.sky.quality===`Low`?Q.renderer.getPixelRatio()<1.5&&window.devicePixelRatio>=1.5?.22:.45:1,mg.frame($,r,F_)}var Eg=new Dm(cg.mesh.material,ug);Q.scene.add(Eg.group);var Dg=0;function Og(e){$h.breakage&&Z.breakage.enabled&&(wl.phase(`wind load`,!0),$.windLoad(e,wp,Z.breakage.strength)),$.breaks.length&&(Z.time.paused||Z.time.speed<=0)&&$.updateStructure(0)}function kg(e){if($.time<Dg&&Eg.clear(),Dg=$.time,$.breaks.length){wl.phase(`debris spawn`);for(let e of $.breaks)$h.leaves&&Eg.spawn($,e,wp),wl.log(`limb_break`,{root:e.root,nodes:e.nodeIds.length,leaves:e.leaves,r:+e.radius.toFixed(3),t:+e.time.toFixed(1),ms:+Eg.stats.lastBuildMs.toFixed(1)});$.breaks.some(e=>!e.shed)&&Mg?.flush(),$.breaks.length=0,Zg=!0,$g=!0}Eg.barkShadow=cg.mesh.castShadow,Eg.frame(e,wp)}var Ag=$h.leaffall&&$h.leaves?new qm(ug):null;Ag&&(Q.scene.add(Ag.group),Eg.leafSink=(e,t,n)=>Ag.adopt(e,t,n,am.violence));var jg=$h.leaves&&new URLSearchParams(location.search).get(`blossom`)!==`0`?new gh(ug,Z.sky.quality===`Low`):null;jg&&Q.scene.add(jg.group);var Mg=$h.leaves&&qh.get(`critters`)!==`0`?new Mh(ug,pg.mesh.material,Z.sky.quality===`Low`):null;Mg&&Q.scene.add(Mg.group);var Ng=mg?mg.patches.filter(e=>e.flower&&!e.far).map(e=>e.mesh):[],Pg=0;function Fg(e){if(!Ag||($.time<Pg&&Ag.clear(),Pg=$.time,Ag.group.visible=Z.leaffall.enabled,!Z.leaffall.enabled))return;wl.phase(`leaf fall`,!0);let t=Z.sky.quality===`Low`,n=Q.atmo.night,r=ug.drops;if(r.n>0){let e=Math.max(0,(Ag.stats.airCap||0)-Ag.counts.air);Ag.adopt(r.m,r.c,Math.min(r.n,e),am.violence),r.n=0}{let e=wp.base>.001?wp.gust(($.bboxMin[0]+$.bboxMax[0])/2,($.bboxMin[2]+$.bboxMax[2])/2)/wp.base:0;ug.dropChance=Yd.active?Math.min(1,(Ag.stats.airCap||110)/1600*Z.leaffall.rate*(.35+1.3*e*e*e+3*am.violence)):0}Ag.frame(e,wp,{keep:Yd.litterKeep,violence:am.violence,dusk:4*n*(1-n),simLeaves:$.leaves.length,min:$.bboxMin,max:$.bboxMax,low:t,scale:t&&Q.renderer.getPixelRatio()<1.5&&window.devicePixelRatio>=1.5?.5:1,rate:Z.leaffall.rate,litter:Z.leaffall.litter})}var Ig=new q,Lg=new J,Rg=new J,zg=new J,Bg=1/20,Vg=``,Hg=()=>{let e=xl(Z);return[e.radius,e.height,e.base,Z.crown.shape].map(e=>e.toFixed(1)).join()};function Ug(e){let t=e;for(;t>1e-6;){let e=Math.min(Bg,t);Jh.apply($.time);let n=Hg();n!==Vg&&(Vg&&$.time>0&&$.rebuildAttractors(),Vg=n),$.step(e),t-=e}}function Wg(){Jh.apply(0),Vg=Hg(),$.reset(),g_()}var Gg=3,Kg=2.5,qg=1/0,Jg=-1,Yg=-1,Xg=-1,Zg=!0,Qg=-1,$g=!1,e_=1,t_=-1e9,n_=-1,r_=-1,i_=NaN,a_=-1,o_=``,s_=new q,c_=new q,l_=-1,u_=0,d_=-1,f_=NaN,p_=0,m_=0,h_=new Om;function g_(){Jg=-1,Zg=!0,d_=-1,ug?.abortPass()}function __(e,t,n=!1){qg+=t;let r=!1,i=ml(),a=Z.sky.quality===`Low`;$.topology!==l_&&(l_=$.topology,u_=e);let o=$h.rebuildHz>0?qg>=1/$h.rebuildHz:!a||!(B_&1),s=!1;(n||o)&&(wl.phase(`sway`,!0),s=h_.update($,wp,$h.sway?Z.sway.amount:0));let c=$.time!==Jg||$.topology!==Yg||i!==Xg;if(!n&&o&&s&&!c&&cg.applyOffsets(h_.D)?r=!0:(n||o&&(s||c))&&(wl.phase(`geometry rebuild`),cg.update($,Z.thickness.rootFlare),h_.live&&cg.applyOffsets(h_.D),p_++,qg=0,Jg=$.time,Yg=$.topology,Xg=i,r=!0),!$h.leaves)return;ug.tick(e);let l=!1;Z.leaves.form!==ug.formId&&(Z.leaves.form=ju(Z.leaves.form).id,Z.leaves.form!==ug.formId&&(wl.phase(`leaf form`),ug.setForm(Nu(Z.leaves.form)),l=ug.follow($,Z,Q.camera.position,1/0,0),Zg=!0,$g=!0)),Yd.jumped?(l=ug.follow($,Z,Q.camera.position,1/0,0)||l,Zg=!0,Qg=Yd.phase):Yd.active&&Math.abs(Yd.phase-Qg)>.004&&(Zg=!0,Qg=Yd.phase);let u=Q.sun,d=Q.hemi;Ig.copy(u.position).sub(u.target.position).normalize();let f=Math.round(Ig.x*100)*1e6+Math.round(Ig.y*100)*1e3+Math.round(Ig.z*100),p=Q.camera.position.distanceTo(Q.controls.target),m=e-t_;if(!Zg){let t=$h.rebuildHz>0?1/$h.rebuildHz:e-u_>5?.4:.12;($.time!==n_&&m>=t||$.lightVersion!==r_||f!==i_||i!==a_||Z.sky.quality!==o_||m>1&&(Math.abs(p/e_-1)>.25||ug.variant&&c_.copy(Q.camera.position).sub(Q.controls.target).normalize().dot(s_)<.978))&&(Zg=!0)}if(n&&(Zg=!0),Zg&&(n||$g||!ug.passOpen)){Zg=!1,$g=!1,e_=p,t_=e,n_=$.time,r_=$.lightVersion,i_=f,a_=i,o_=Z.sky.quality,s_.copy(Q.camera.position).sub(Q.controls.target).normalize(),wl.phase(`leaves rebuild`),ug.nightGrade=Q.atmo.night,ug.nightFloor=Q.nightFloor,ug.setLighting(Q.camera.position,Ig,zg.copy(u.color).multiplyScalar(u.intensity),Lg.copy(d.color).multiplyScalar(d.intensity),Rg.copy(d.groundColor).multiplyScalar(d.intensity)),ug.maxInstances=a?32e3:0;let t=!ug.mesh.castShadow&&u.castShadow;cg.mesh.castShadow=!t,t?(wl.phase(`canopy shadow`),pg.update($,Ig,Math.min(1,u.intensity*6)*Math.min(1,.4+u.intensity/2.5)*(.3+.25*Math.min(1,Math.max(0,(Ig.y-.1)/.6))),e,Z.time.paused||Z.time.speed<=0?.5:2),wl.phase(`leaves rebuild`)):pg.mesh.visible=!1;let n=ug.beginPass($,e);n&&(wl.log(`leaves_realloc`,{capacity:n.instanceMatrix.count,leaves:$.leaves.length}),Q.scene.children.filter(e=>e instanceof di).forEach(e=>Q.scene.remove(e)),Q.scene.add(n))}let h=!1;if(ug.passOpen&&(n||ug.passes===0||!a||!r)&&(wl.phase(`leaves rebuild`,!0),h=ug.stepPass($,Z,n||ug.passes===0?1/0:Gg,Q.camera.position)),r&&!h&&(wl.phase(`leaves follow`,!0),ug.follow($,Z,Q.camera.position,Kg)),s||h_.live&&(r||h||l)){wl.phase(`leaves sway`,!0);let e=performance.now();ug.sway(h_.D,h_.P),m_=performance.now()-e}}var v_=null,y_=e=>(v_??=Kh(Z,Jh,{proposed:()=>{Z.time.paused=!0,Q.intro=!0,Wg(),Q.manual&&Q.autoCamera()},begin:e=>{Yh=e,Z.time.paused=!1,Q.intro=!1}})).open(e);if(qh.get(`nogui`)!==`1`){let e=qh.get(`panel`);bp(Z,Jh,{regrow:()=>{Wg(),Q.autoCamera()},newSeed:()=>{Z.seed.seed=Math.floor(Math.random()*999999),Wg(),Q.autoCamera()},cameraManual:()=>Q.manual,autoCamera:()=>Q.autoCamera(),crownChanged:()=>$.rebuildAttractors(),preset:e=>{Zh(e),Wg(),Q.autoCamera()},chooseTree:()=>y_(),presetNames:Object.keys(xp),currentPreset:()=>Yh,simTime:()=>$.time,stormNow:()=>{Z.weather.event===`calm`&&Jh.userSet(`weather.event`,`auto`),am.trigger()},weatherPhase:()=>am.phase,weatherLabel:()=>Z.weather.event===`calm`?`Calm`:am.label,growth:()=>({nodes:$.nodes.length,age:$.time,grown:$.time>1&&($.nodes.length>=Z.growth.maxNodes||!$.chains.some(e=>e.alive))})},{open:e===`open`||e!==`closed`&&void 0,tab:qh.get(`tab`)??void 0})}{let e=Q.renderer.domElement,t=null;e.addEventListener(`pointerdown`,e=>t={x:e.clientX,y:e.clientY}),e.addEventListener(`pointerup`,()=>t=null),e.addEventListener(`pointercancel`,()=>t=null),e.addEventListener(`pointermove`,e=>{t&&Math.hypot(e.clientX-t.x,e.clientY-t.y)>8&&Q.takeControl()}),e.addEventListener(`wheel`,()=>Q.takeControl(),{passive:!0})}var b_=document.getElementById(`overlay`),x_=qh.get(`hideui`)===`1`,S_=0,C_=()=>document.body.classList.toggle(`watch`,x_),w_=document.getElementById(`wx`),T_={sun:`<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>`,moon:`<path d="M19 14.5A8 8 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>`,part:`<circle cx="8" cy="8" r="3"/><path d="M8 1.8v1.6M1.8 8h1.6M3.6 3.6l1.1 1.1M12.4 3.6l-1.1 1.1"/><path d="M8.5 20h9a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6 1.2A3 3 0 0 0 8.5 20z"/>`,cloud:`<path d="M7 19h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 19z"/>`,drizzle:`<path d="M7 15h10.5a4 4 0 0 0 .5-8A6 6 0 0 0 6.500 8.500 3.300 3.300 0 0 0 7 15z"/><path d="M9 18.500v.01M13 18.500v.01M11 21.500v.01M15 21.500v.01"/>`,rain:`<path d="M7 15h10.5a4 4 0 0 0 .5-8A6 6 0 0 0 6.500 8.500 3.300 3.300 0 0 0 7 15z"/><path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3"/>`,storm:`<path d="M7 14h10.5a4 4 0 0 0 .5-8A6 6 0 0 0 6.500 7.500 3.300 3.300 0 0 0 7 14z"/><path d="M12.500 15.500l-2.500 4h3l-2 3.500"/>`,wind:`<path d="M3 9h10.500a2.500 2.500 0 1 0-2.500-2.500M3 13h15a2.500 2.500 0 1 1-2.500 2.500M3 17h7"/>`,mist:`<path d="M4 8h16M6 12h14M4 16h13M8 20h10"/>`},E_={clear:`sun`,fair:`part`,cloudy:`part`,overcast:`cloud`,drizzle:`drizzle`,shower:`rain`,rain:`rain`,storm:`storm`,windy:`wind`,mist:`mist`},D_=``;w_.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"></svg><span class="wx-sky"></span><span class="wx-temp"></span><span class="wx-wind"></span>`;function O_(){let e=Q.atmo.night>.6,t=am.kind,n=e&&(t===`clear`||t===`fair`)?`moon`:E_[t];n!==D_&&(D_=n,w_.children[0].innerHTML=T_[n]);let r=Math.round(am.temp),i=e&&t===`cloudy`?`Passing clouds`:am.label;w_.children[1].textContent=i,w_.children[2].textContent=`${r<0?`−`:``}${Math.abs(r)} \u00b0C`,w_.children[3].textContent=`${nm(wp.base)} ${rm(wp.dirX,wp.dirZ)}`,w_.dataset.kind=t,w_.setAttribute(`aria-label`,`${i}, ${r} degrees, ${nm(wp.base).toLowerCase()} from ${rm(wp.dirX,wp.dirZ)}`)}C_();function k_(e){return e?e.tagName===`TEXTAREA`||e.tagName===`SELECT`||e.isContentEditable?!0:e.tagName===`INPUT`&&![`range`,`checkbox`,`color`,`button`].includes(e.type):!1}addEventListener(`keydown`,e=>{let t=e.target;k_(t)||e.ctrlKey||e.metaKey||e.altKey||((e.key===`h`||e.key===`H`)&&(x_=!x_,C_(),S_=0),(e.key===`c`||e.key===`C`)&&(Q.manual?(Z.camera.cinema=!0,Q.autoCamera()):Z.camera.cinema=!Z.camera.cinema))},!0),addEventListener(`pointermove`,()=>S_=0);var A_=qh.get(`hud`)===`1`,j_=()=>document.body.classList.toggle(`hud`,A_);j_(),addEventListener(`keydown`,e=>{e.ctrlKey||e.metaKey||e.altKey||k_(e.target)||(e.key===`d`||e.key===`D`)&&(A_=!A_,j_())},!0);var M_=new J,N_=document.getElementById(`hud`),P_=performance.now(),F_=0,I_=0,L_=0,R_=0,z_=0,B_=0;function V_(e){requestAnimationFrame(V_);try{H_(e)}catch(e){z_++<3&&console.error(`arbor frame error`,e),z_===1&&Sf(`Render error: ${e?.message??e} (still running)`)}}function H_(e){let t=Math.min(.1,(e-P_)/1e3);P_=e,F_+=t,B_++,wl.phase(`sim step`,!0);let n=gl(Z);n!==f_&&(f_=n,hl()),!Z.time.paused&&Z.time.speed>0?Ug(t*Z.time.speed):ml()!==d_&&$.updateStructure(0),d_=ml(),Yd.update($.time,Z.season),Cg(t),wl.phase(`stage frame`,!0),Q.frame($,Z,t),Og(t),__(F_,t),Tg(t),kg(t),Fg(t),jg&&(wl.phase(`blossom`,!0),jg.frame(t,$,{amount:Z.season.blossom,low:Z.sky.quality===`Low`,night:Q.atmo.night,D:h_.D,fall:Ag&&Z.leaffall.enabled?Ag:null,wind:wp,violence:am.violence,formId:ug.formId,sun:Q.sun,hemi:Q.hemi,cam:Q.camera.position})),Mg&&(wl.phase(`critters`,!0),Mg.frame(t,$,{amount:Z.critters.amount,low:Z.sky.quality===`Low`,night:Q.atmo.night,phase:Yd.active?Yd.phase:.375,jumped:Yd.jumped,rain:am.rain,cloud:am.cloud,violence:am.violence,wind:wp,D:h_.D,cam:Q.camera.position,camQ:Q.camera.quaternion,sun:Q.sun,hemi:Q.hemi,flowers:Ng})),S_+=t,b_.style.opacity=String(Math.max(0,Math.min(1,1-(S_-4)/2))*.85);let r=Z.leaves;M_.setHSL(r.glowHue,.9,.55).multiplyScalar(r.glow*(.12+.88*Q.atmo.night)),ug.setGlow(M_,1-Q.atmo.night),ug.setSun(Q.atmo.keyDir,Q.atmo.keyColor,Q.atmo.keyIntensity,Q.camera.matrixWorldInverse);let i=cg.mesh.material.color.setHex(Z.sky.quality===`High`?16777215:11569770);if(Q.atmo.night>0&&i.lerp(_g.setRGB(hg[0],hg[1],hg[2]).multiplyScalar((Z.sky.quality===`High`?2.2:1)*(1+gg*Q.nightFloor)),1-(1-Q.atmo.night)**3),wg(t),wl.phase(`render`,!0),Q.render(Z),wl.phase(`idle`,!0),I_++,L_+=t,L_>.5){R_=I_/L_,I_=0,L_=0;let e=Z.sky.timeOfDay,t=Math.floor(e),n=Math.floor((e-t)*60);b_.textContent=`${Yh} · ${Z.season.on?`${Yd.name}, year ${Yd.year}`:`age ${$.time.toFixed(0)} s`} · ${String(t).padStart(2,`0`)}:${String(n).padStart(2,`0`)}`,O_(),N_.textContent=`t ${$.time.toFixed(1)}s  nodes ${$.nodes.length}  leaves ${ug.mesh.count}  free attractors ${$.attractorCount}  ${R_.toFixed(0)} fps`}}Fh(qh)&&qh.get(`nogui`)!==`1`&&y_(/^\d+$/.test(qh.get(`roll`)??``)?Number(qh.get(`roll`)):void 0),wl.phase(`init regrow`),Wg();var U_=Number(qh.get(`t`)??0);U_>0&&(wl.phase(`init fast-forward`),Ug(U_)),$.updateStructure(0),wl.phase(`init first frame`),Q.frame($,Z,0,!0),wl.setStats(()=>{let e=Q.renderer;return{frames:B_,fps:+R_.toFixed(1),simT:+$.time.toFixed(2),nodes:$.nodes.length,leaves:$.leaves.length,leafInst:ug.mesh.count,leafCap:ug.mesh.instanceMatrix.count,rebuilds:p_,leafPasses:ug.passes,leafPassMs:+ug.passMs.toFixed(1),leafFollows:ug.follows,leafFollowMs:+ug.followMs.toFixed(2),leafFollowMaxMs:+ug.followMaxMs.toFixed(2),bakes:Q.atmo.bakes,frameErrors:z_,contextLost:Q.contextLost,quality:Z.sky.quality,gpuMem:{...e.info.memory},calls:e.info.render.calls,tris:e.info.render.triangles,programs:e.info.programs?.length,drawBuf:[e.domElement.width,e.domElement.height],pixelRatio:e.getPixelRatio()}});{let e=Q.renderer;wl.info({gl:wl.glInfo(e.getContext()),quality:Z.sky.quality,lowEnd:Qh,maxNodes:Z.growth.maxNodes,preset:Yh,pixelRatio:e.getPixelRatio(),shadowMap:Q.sun.shadow.mapSize.x,diag:$h})}requestAnimationFrame(V_),window.__arbor={params:Z,automation:Jh,loadPreset:e=>{Zh(e),Wg(),Q.autoCamera()},sim:$,leaves:ug,canopy:pg,branches:cg,meadow:mg,wind:wp,weather:am,rain:yg,sky:bg,debris:Eg,sway:h_,swayStats:()=>({live:h_.live,maxOffset:h_.maxOffset,maxNode:h_.maxNode,nodeMs:h_.lastMs,leafMs:m_}),leafFall:Ag,blossom:jg,critters:Mg,season:Yd,stage:Q,start:()=>v_,frameErrors:()=>z_,fastForward(e){return Ug(e),e>1&&($.breaks=$.breaks.filter(e=>!e.shed)),$.updateStructure(0),Q.frame($,Z,0,!0),__(F_,0,!0),Tg(0),mg?.bakeAll($),Q.render(Z),{nodes:$.nodes.length,leaves:$.leaves.length,time:$.time,height:+$.bboxMax[1].toFixed(2),width:+Math.max($.bboxMax[0]-$.bboxMin[0],$.bboxMax[2]-$.bboxMin[2]).toFixed(2)}}};{let e=(e,t=!1)=>{let n=[],r=-1,i=0;for(let t of $.chains){if(t.pruned||t.nodes.length<4)continue;let a=$.nodes[t.nodes[1]];(e?t.order>=2&&t.nodes.length<=10&&a.subLen<3:t.order===1&&a.subLen>4)&&(n.push(t.nodes[1]),a.subLen>i&&(i=a.subLen,r=t.nodes[1]))}return t?r:n.length?n[Math.floor(Math.random()*n.length)]:-1};Object.assign(window.__arbor,{breakLimb:t=>$.breakAt(typeof t==`number`?t:e(!1,t===`big`)),breakTwig:()=>$.breakAt(e(!0)),loadRatios:(e=1,t=Z.breakage.strength)=>{let n=[],r=[];$.loadRatios(wp,t,(e,t,i)=>{n.push(t),r.push({id:e,u:+t.toFixed(3),len:+i.toFixed(1)})},e),n.sort((e,t)=>e-t);let i=e=>+(n[Math.min(n.length-1,Math.floor(e*n.length))]??0).toFixed(4);return{n:n.length,p50:i(.5),p90:i(.9),p95:i(.95),p97:i(.97),p98:i(.98),p99:i(.99),max:i(1),top:r.sort((e,t)=>t.u-e.u).slice(0,8)}},stormTest:(e,t,n=Z.breakage.strength)=>{let r=wp.t,i=wp.base,a=$.loadStats.twigs,o=$.loadStats.limbs,s=[],c=0;for(let i=0;i<e;i+=.25){wp.t=r+i,wp.base=t;let e=$.windLoad(.25,wp,n);$.loadStats.max>c&&(c=$.loadStats.max),e&&s.push({t:i,nodes:e.nodeIds.length,leaves:e.leaves})}return wp.t=r,wp.base=i,{twigs:$.loadStats.twigs-a,limbs:$.loadStats.limbs-o,maxU:+c.toFixed(3),events:s}}})}