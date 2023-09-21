<template>
  <v-app>
     <v-navigation-drawer
        permanent
        expand-on-hover
        app
    >
        <v-list
          dense
          nav
        >
          <v-list-item
            v-for="item in items"
            :key="item.title"
            router :to="item.route"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view/>
    </v-main>

  </v-app>
  
</template>

<script>

export default {
  name: 'App',
  data () {
      return {
        items: [
          { title: '镜像管理', icon: 'mdi-monitor-multiple', route: '/images'},
          { title: '容器管理', icon: 'mdi-cat', route: '/containers'},
          { title: '应用部署', icon: 'mdi-emoticon-poop', route: '/applications'},
        ],
      }
    },
};
</script>

<style>
*::-webkit-scrollbar{
  width:5px;
  height:5px;
}
*::-webkit-scrollbar-thumb{ /*滚动条里面小方块*/
  border-radius: 15px;
  -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
  /*background: #cce2f7;*/
  background: #999;
}
*::-webkit-scrollbar-track {/*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
  border-radius: 10px;
  background: #EDEDED;
}
</style>