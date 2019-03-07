const config = {
  baseURL: getApi(), // 'http://test.api-master.uniform.com'
  uploadURL: getUpload(),
  getAdminPrefix: 'test.admin.'
}
export default config
function getUpload(): string {
  // 域名访问
  const arr = document.domain.split('.')
  return window.location.protocol + '//' + 'test.res.' + arr.slice(arr.length - 2).join('.') + '/upload'
}
function getApi(): string {
  // 域名访问
  const arr = document.domain.split('.')
  return window.location.protocol + '//' + 'test.api-master.' + arr.slice(arr.length - 2).join('.')
}
