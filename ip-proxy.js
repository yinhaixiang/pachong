// var proxy = require('./proxy_pool.js')
//如果通过npm安装
var proxy = require('ip-proxy-pool')

//主程序，爬取ip+检查ip
var proxys = proxy.run

//不爬取，只检查数据库里现有的ip
var check = proxy.check

//提取所有ip
var ips = proxy.ips
//ips接收一个处理函数，然后向这个函数传递两个参数，一个为错误信息，另一个为数据库里的所有ip
ips((err, response) => {
  console.log(response)
})