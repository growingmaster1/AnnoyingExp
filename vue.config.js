module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  devServer:{
    proxy:{
      "^/":{
        target:"http://10.251.252.191:10000",
        changeOrigin:true,
        pathRewrite:{'^/':'/'}
      }
    }
  }
}
