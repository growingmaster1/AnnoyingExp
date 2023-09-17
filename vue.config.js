module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  devServer:{
    proxy:{
      "^/":{
        target:"http://82.156.172.212:10000",
        changeOrigin:true,
        pathRewrite:{'^/':'/'}
      }
    }
  }
}
