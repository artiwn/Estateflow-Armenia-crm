export function currentRoute(){return location.hash.replace(/^#\//,"")||"dashboard"}export function navigate(route:string){location.hash="#/"+route}
