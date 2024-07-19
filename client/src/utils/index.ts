const DateTimeFormat = (val: string, setting?: "date" | "time") => {
  const data = val.split("T");
  const time = data[1].split(":");
  time.pop();
  switch (setting) {
    case "date":
      return data[0];
    case "time":
      return `${time[0]}:${time[1]}`;
    default:
      return `${time[0]}:${time[1]}(${data[0]})`;
  }
};

// const imageToBase64Changer = async (val: string,cb:(a:string) => void) => {

//   let reader: any = new FileReader();
//   reader.readAsDataURL(val)
//   reader.onload =  async function () {
//     const base64String = await reader.result.replace("data:", "").replace(/^.+,/, "");
//     const combinebase64 = 'data:image/png;base64,' + base64String
//     console.log('combinebase64 :>> ', combinebase64);
//     cb(combinebase64)
//   }
function getBase64(file: any, cb: any) {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    cb(reader.result);
  };
  reader.onerror = function (error) {
    console.log("Error: ", error);
  };
}
// return 'hello';
// }
export { DateTimeFormat, getBase64 };
