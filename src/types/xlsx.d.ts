declare module "xlsx" {
  export function read(data:ArrayBuffer|Uint8Array, options?:Record<string,unknown>):any;
  export const utils:{sheet_to_json:(sheet:any, options?:Record<string,unknown>)=>any[]};
}
