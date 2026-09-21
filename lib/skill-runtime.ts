export function stepNeedsImage(type:string,source?:string){
  return ["enhance","image_edit","vision"].includes(type)||(source==="original"&&["listing_text","pricing"].includes(type));
}

export function stepProducesImage(type:string){
  return ["enhance","image_edit","image_generate"].includes(type);
}
