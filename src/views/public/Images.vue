<template>
  <div>
      <v-card-title>
        镜像管理
        <v-spacer></v-spacer>
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
          :headers="headers"
          :items="images"
          disable-pagination
          :hide-default-footer="true"
          :search="search"
      >
        <template
            v-for="header in headers.filter((header) =>
                header.hasOwnProperty('formatter')
              )"
            v-slot:[`item.${header.value}`]="{ header, value }"
        >
          {{ header.formatter(value) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-icon @click="inspectImage(item)">mdi-eye-outline</v-icon>
          &nbsp;
          <v-icon @click="deleteImage(item)">mdi-delete-outline</v-icon>
        </template>
      </v-data-table>
      <v-dialog v-model="dialogFlag" max-width="960px" v-if="dialogFlag">
        <v-card>
          <v-card-title>
            <span class="headline">{{ imageToInspect.name + ':' + imageToInspect.tag }}</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>IMAGE ID: {{imageToInspect.longId}}</v-row>
              <v-row>IMAGE SHORT ID: {{imageToInspect.id}}</v-row>
              <v-row>CREATED TIME: {{timeFormatter(imageToInspect.time)}}</v-row>
              <v-row>SIZE: {{imageToInspect.size}}</v-row>
              <v-row>
                TAGS:
                <v-chip v-for="tag in imageToInspect.raw.tags" :key="tag" class="ma-2" color="primary" small> {{ tag }} </v-chip>
              </v-row>
              <v-row>
                <v-btn text @click="showRawJson = !showRawJson" small>
                  <v-icon>mdi-code-braces</v-icon> {{showRawJson? 'HIDE RAW JSON' : 'VIEW RAW JSON'}}
                </v-btn>
              </v-row>
              <v-row v-if="showRawJson">
                <v-card max-height="600" style="overflow: auto">
                  <pre>{{imageToInspect.raw}}</pre>
                </v-card>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
    <v-speed-dial
        v-model="speedDialFlag"
        fixed :bottom="true" :right="true"
        :direction="'top'" :transition="'slide-y-reverse-transition'"
    >
      <template v-slot:activator>
        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="blue darken-2" dark fab
                   v-on="on" v-bind="attrs"
            >
              <v-icon v-if="speedDialFlag">mdi-close</v-icon>
              <v-icon v-else>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>添加镜像</span>
        </v-tooltip>
      </template>
      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn fab dark small color="green"
                 v-on="on" v-bind="attrs" @click="fromRemoteDialogFlag = true"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </template>
        <span>从远程镜像仓库</span>
      </v-tooltip>
      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn fab dark small color="indigo"
                 v-on="on" v-bind="attrs" @click="fromLocalDialogFlag = true"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
        <span>从本地Docker File</span>
      </v-tooltip>
    </v-speed-dial>
    <v-dialog v-model="fromRemoteDialogFlag" max-width="960px" @click:outside="refreshList" v-if="fromRemoteDialogFlag" >
      <FromRemoteDialogContent></FromRemoteDialogContent>
    </v-dialog>
    <v-dialog v-model="fromLocalDialogFlag" max-width="960px" @click:outside="refreshList" v-if="fromLocalDialogFlag">
      <FromLocalDialogContent></FromLocalDialogContent>
    </v-dialog>
  </div>
</template>

<script>
import FromRemoteDialogContent from "@/components/Images/FromRemoteDialogContent";
import FromLocalDialogContent from "@/components/Images/FromLocalDialogContent";
export default {
  name: 'Images',
  components: {
    FromLocalDialogContent,
    FromRemoteDialogContent
  },
  props: {
    search: {type: String, default: ''},
  },
  data () {
    return {
      headers: [
        {text: 'NAME', align: 'start', sortable: true, value: 'name'},
        {text: 'TAG', align: 'start', sortable: true, value: 'tag'},
        {text: 'IMAGE ID', align: 'start', sortable: true, value: 'longId'},
        {text: 'SHORT ID', align: 'start', sortable: true, value: 'id'},
        {text: 'CREATED', align: 'start', sortable: true, value: 'time', formatter: this.timeFormatter},
        {text: 'SIZE', align: 'start', sortable: true, value: 'size'},
        {text: 'ACTIONS', align: 'start', sortable: false, value: 'actions'},
      ],
      images: [],
      imageList: [],
      //search: '',
      dialogFlag: false,
      imageToInspect: 0,
      showRawJson: false,

      speedDialFlag: false,

      fromRemoteDialogFlag: false,
      fromLocalDialogFlag: false,
    }
  },
  methods: {
    timeFormatter(value) {
      return new Date(value).toLocaleString();
    },
    async deleteImage(item) {
      const index = this.images.indexOf(item);
      confirm('确认删除?') && this.images.splice(index, 1);

      let form = new FormData();
      form.append('image_id', item.longId);
      await this.$axios.post('/remove_image', form).then((res) => {
        if(res.data === 'delete success') alert(`镜像${item.id}已成功删除`);
        else throw res.data;
      }).catch(() => {
        alert(`镜像${item.id}删除失败`);
        this.refreshList();
      })
    },
    inspectImage(item) {
      this.imageToInspect = item;
      this.dialogFlag = true;
    },
    async refreshList() {

      await this.$axios.get('/list_images').then((res) => {
        if(res) {
          console.log(res);
          this.imageList = res.data;
        }
      }).catch((err) => {
        console.log(err);
      })
      this.images = [];
      for(let i = 0; i < this.imageList.length; i++) {
        let image = {};
        image.name = this.imageList[i].tags[0].slice(this.imageList[i].tags[0].lastIndexOf('/') + 1, this.imageList[i].tags[0].lastIndexOf(':'));
        image.tag = this.imageList[i].tags[0].slice(this.imageList[i].tags[0].lastIndexOf(':') + 1);
        image.id = this.imageList[i].short_id.slice(this.imageList[i].short_id.lastIndexOf(':') + 1);
        image.time = this.imageList[i].attrs.Created;
        image.size = this.$utils.byte2FormatSize(this.imageList[i].attrs.Size);
        image.longId = this.imageList[i].id.slice(7);
        image.raw = this.imageList[i];
        this.images.push(image);
      }
    }
  },
  async mounted() {
    await this.refreshList();
  }
}
</script>