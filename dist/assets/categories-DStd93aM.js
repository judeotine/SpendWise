function t(o){return o==="groceries"?"food":["food","transportation","housing","entertainment","utilities","shopping","health","education","clothing","savings","debt","travel","other"].includes(o)?o:"other"}const e={food:{name:"Food & Dining",icon:"🍔",color:"bg-green-500"},transportation:{name:"Transportation",icon:"🚗",color:"bg-blue-500"},housing:{name:"Housing",icon:"🏠",color:"bg-purple-500"},entertainment:{name:"Entertainment",icon:"🎬",color:"bg-amber-500"},utilities:{name:"Utilities",icon:"⚡",color:"bg-red-500"},shopping:{name:"Shopping",icon:"🛍️",color:"bg-violet-500"},health:{name:"Health",icon:"❤️",color:"bg-pink-500"},education:{name:"Education",icon:"📚",color:"bg-teal-500"},clothing:{name:"Clothing",icon:"👕",color:"bg-indigo-500"},groceries:{name:"Groceries",icon:"🥕",color:"bg-emerald-500"},savings:{name:"Savings",icon:"🐖",color:"bg-lime-500"},debt:{name:"Debt",icon:"💳",color:"bg-slate-500"},travel:{name:"Travel",icon:"🌎",color:"bg-orange-500"},other:{name:"Other",icon:"⋯",color:"bg-neutral-500"}},i=()=>Object.keys(e),r=o=>{var n;return((n=e[o])==null?void 0:n.name)||o},a=o=>e[o]||e.other;export{e as C,i as a,r as f,a as g,t as m};
