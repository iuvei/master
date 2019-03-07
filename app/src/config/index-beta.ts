const config = {
  baseURL: getApi(), // 'https://api-master.zczx2255.com'
  uploadURL: getUpload(),
  getAdminPrefix: 'admin.'
}
export default config
function getUpload(): string {
  // 域名访问
  const arr = document.domain.split('.')
  return window.location.protocol + '//' + 'res.' + arr.slice(arr.length - 2).join('.') + '/upload'
}

function getApi(): string {
  // 域名访问
  const arr = document.domain.split('.')
  return window.location.protocol + '//' + 'api-master.' + arr.slice(arr.length - 2).join('.')
}
