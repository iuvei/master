const config = {
  baseURL: getApi(), // 'http://dev.api-master.uniform.com'
  uploadURL: getUpload(),
  getAdminPrefix: 'dev.admin.'
}
export default config
function getUpload(): string {
  // 域名访问
  const arr = document.domain.split('.')
  return window.location.protocol + '//' + 'dev.res.' + arr.slice(arr.length - 2).join('.') + '/upload'
}

function getApi(): string {
  // 域名访问
  const arr = document.domain.split('.')
  return window.location.protocol + '//' + 'dev.api-master.' + arr.slice(arr.length - 2).join('.')
}
