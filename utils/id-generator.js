
module.exports = (inq, type) => {
  let inqId = `${type}-`;
  let inqLength = (inq.length + 1).toString(),
      inqStrLength = inqLength.length,
      idLength = 5 - inqStrLength;
  if(idLength <= 5) {
    for(let x = 0; x < idLength; x++) {
      inqId = inqId + '0'
    }
    inqId = inqId + inqLength
  } else {
    inqId = inqId + inqLength
  }
  return inqId
}