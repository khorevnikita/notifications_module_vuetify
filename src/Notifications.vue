<template>
  <v-row class="mx-3 mt-5">
    <v-col cols="12" class="d-flex justify-space-between align-center">
      <div class="text-h6">Уведомления</div>
      <v-btn small color="primary" @click="create">Создать уведомление</v-btn>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-card-title>Фильтр</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                  v-model="query.search"
                  label="Поиск"
                  class="mx-4"
                  dense
                  hide-details
                  outlined
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="3">
              <v-select
                  label="Тип"
                  item-value="key"
                  item-text="label"
                  :items="notificationTypes"
                  v-model="query.type"
                  dense
                  hide-details
                  outlined
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="replaceRoute()" color="primary">Найти</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12">
      <v-data-table
          :headers="headers"
          :items="notifications"
          :options.sync="options"
          :server-items-length="total"
          :loading="loading"
          class="elevation-1 mt-3"
          :items-per-page="10"
      >
        <template v-slot:item.type="{item}">
          <span>{{ notificationTypes.find(x => x.key === item.type).label }}</span>
        </template>

        <template v-slot:item.sent_at="{item}">
          <span>{{ item.sent_at ? item.sent_at : 'Не отправлено' }}</span>
        </template>

        <template v-slot:item.users_count="{item}">
          <v-btn text @click="showUsersList(item)">{{ item.users_count }}</v-btn>
        </template>
        <template v-slot:item.sending="{item}">
          <v-btn small text color="primary" @click="selectUsers(item)" v-if="!item.sent_at">
            Выбрать получателей
          </v-btn>
          <v-btn small text color="success" @click="send(item)" v-if="!item.sent_at">
            Отправить
          </v-btn>
        </template>
        <template v-slot:item.actions="{item}">

          <v-btn small icon color="warning" @click="edit(item)" v-if="!item.sent_at">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn small icon color="error" @click="destroy(item)" v-if="!item.sent_at">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-col>

    <v-dialog v-model="edit_dialog" max-width="500">
      <v-card>
        <v-card-title>Изменить уведомление</v-card-title>
        <v-card-text>
          <v-select
              label="Тип"
              item-value="key"
              item-text="label"
              :items="notificationTypes"
              v-model="edit_item.type"
              outlined
          />
          <v-text-field
              label="Заголовок"
              v-model="edit_item.title"
              outlined
              :error="!!errors.title"
              :error-count="1"
              :error-messages="errors.title"
          ></v-text-field>
          <v-textarea
              label="Текст"
              v-model="edit_item.text"
              outlined
              :error="!!errors.text"
              :error-count="1"
              :error-messages="errors.text"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn @click="edit_item.id?update():store()">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
        v-model="usersListDialog"
        max-width="900">
      <v-card>
        <v-card-title>Выберите получателей</v-card-title>
        <v-card-text>
          <v-row>
            <v-col class="d-flex align-center" cols="12" md="5">
              <v-text-field
                  v-model="userQ.search"
                  label="Поиск"
                  class="mx-4"
                  outlined
                  dense
              ></v-text-field>
            </v-col>
            <v-col class="d-flex align-center" cols="12" md="2">
              <v-checkbox
                  label="Прикреплённые"
                  v-model="userQ.notification_id"
                  :value="edit_item.id"
                  :false-value="0"
                  :true-value="edit_item.id"
              />
            </v-col>
          </v-row>
          <v-data-table
              v-model="selected"
              :headers="userHeaders"
              :items="users"
              :single-select="false"
              item-key="id"
              show-select
              :options.sync="userOptions"
              :server-items-length="totalUsers"
          ></v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn @click="syncUsers" color="primary">Выбрать</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
        v-model="showUsersDialog"
        max-width="500"
    >
      <v-card>
        <v-card-title>Получатели рассылки <br> "{{ edit_item.title }}" ({{ selected.length }})</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item :key="u.id" v-for="u in selected">
              <v-list-item-content>
                <v-list-item-subtitle>{{ [u.name, u.surname].join(" ") }}</v-list-item-subtitle>
                <v-list-item-subtitle v-if="u.phone">{{ u.phone }}</v-list-item-subtitle>
                <v-list-item-subtitle v-if="u.email">{{ u.email }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn @click="showUsersDialog=false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  name: "Notifications",
  data: () => ({
    headers: [
      {text: 'ID', sortable: true, value: 'id'},
      {text: 'Тип', sortable: true, value: 'type'},
      {text: 'Заголовок', sortable: true, value: 'title'},
      {text: 'Текст', sortable: false, value: 'text'},
      {text: 'Кол-во получателей', sortable: true, value: 'users_count'},
      {text: 'Дата отправки', sortable: true, value: 'sent_at'},
      {text: '', sortable: false, value: 'sending'},
      {text: '', sortable: false, value: 'actions'},
    ],
    notifications: [],
    options: {},
    query: {},
    total: 0,
    loading: false,
    edit_item: {},
    edit_dialog: false,
    errors: {},
    notificationTypes: [
      {key: "push", label: "Push-уведомление"},
      {key: "email", label: "E-mail"},
      {key: "any", label: "Все каналы"},
    ],


    usersListDialog: false,
    userHeaders: [
      {text: 'ID', sortable: false, value: 'id'},
//      {text: 'Фамилия', sortable: false, value: 'surname'},
      {text: 'Имя', sortable: false, value: 'name'},
      {text: 'Телефон', sortable: false, value: 'phone'},
      {text: 'E-mail', sortable: false, value: 'email'},
    ],
    userOptions: {},
    totalUsers: 0,
    users: [],
    selected: [],
    userQ: {
      search: "",
      short: 1,
      notification_id: 0,
    },

    showUsersDialog: false,
  }),
  mounted() {
    this.readRoute();
  },
  watch: {
    "$route": {
      handler() {
        this.readRoute();
      }, deep: true
    },
    options: {
      handler(v) {
        this.query = JSON.parse(JSON.stringify({...this.query, ...this.optionsToQuery(v)}));
        this.$nextTick(() => {
          this.getNotifications();
        })
      },
      deep: true,
    },

    userOptions: {
      handler() {
        this.fetchUsers();
      },
      deep: true,
    },
    userQ: {
      handler() {
        this.fetchUsers();
      }, deep: true
    },
  },
  methods: {
    readRoute() {
      this.query = this.$route.query;
      if (this.query.tags) {
        this.query.tags = this.query.tags.split(",").filter((v, i, self) => self.indexOf(v) === i).map(i => parseInt(i))
      }
      this.options = JSON.parse(JSON.stringify({...this.options, ...this.queryToOptions(this.query)}));
      this.$nextTick(() => {
        this.getNotifications();
      })
    },
    setQueryString(searchParams) {
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === undefined || searchParams[key] === null || searchParams[key] === "") {
          delete searchParams[key]
        } else if (searchParams[key] === true) {
          searchParams[key] = 1;
        } else if (searchParams[key] === false) {
          searchParams[key] = 0;
        }
      });
      return new URLSearchParams(searchParams).toString();
    },
    optionsToQuery(opts) {
      return {
        page: opts.page,
        take: opts.itemsPerPage,
        sort_by: opts.sortBy[0],
        sort_desc: opts.sortDesc[0],
      };
    },
    queryToOptions(query) {
      return {
        page: parseInt(query.page),
        itemsPerPage: parseInt(query.take),
        sortBy: [query.sort_by].filter(x => x),
        sortDesc: [!!parseInt(query.sort_desc)].filter(x => x),
      };
    },

    replaceRoute() {
      this.$router.replace(`/notifications?${this.setQueryString(this.query)}`).catch(() => {
      });
    },
    getNotifications() {
      this.loading = true;
      this.$http.get(`notifications?${this.setQueryString(this.query)}`).then(r => {
        this.notifications = r.body.notifications;
        this.total = r.body.total;
        this.loading = false;
      })
    },
    create() {
      this.edit_item = {};
      this.edit_dialog = true;
    },
    edit(item) {
      this.edit_item = item;
      this.edit_dialog = true;
    },
    store() {
      this.errors = {};
      this.$http.post(`notifications`, this.edit_item).then(() => {
        this.getNotifications();
        this.edit_dialog = false;
      }).catch(err => {
        this.errors = err.body.errors;
      })
    },
    update() {
      this.errors = {};
      this.$http.put(`notifications/${this.edit_item.id}`, this.edit_item).then(() => {
        this.edit_dialog = false;
      }).catch(err => {
        this.errors = err.body.errors;
      })
    },
    destroy(item) {
      if (confirm("Вы уверены, что хотите удалить уведомление?")) {
        this.$http.delete(`notifications/${item.id}`).then(() => {
          this.notifications.splice(this.notifications.indexOf(item), 1);
          this.edit_dialog = false;
        })
      }
    },
    selectUsers(item) {
      this.edit_item = item;
      this.usersListDialog = true;
      this.getSelectedUsers();
      this.fetchUsers();
    },
    getSelectedUsers() {
      this.$http.get(`notifications/${this.edit_item.id}/get-users`).then(r => {
        this.selected = r.body.users;
      })
    },
    fetchUsers() {
      let pagination = {
        page: this.userOptions.page ? this.userOptions.page : 1,
        take: this.userOptions.itemsPerPage ? this.userOptions.itemsPerPage : 10
      };
      let query = new URLSearchParams({...this.userQ, ...pagination}).toString();
      this.$http.get(`users?${query}`).then(r => {
        this.totalUsers = r.body.total;
        this.users = r.body.users;
      })
    },
    syncUsers() {
      this.$http.post(`notifications/${this.edit_item.id}/set-users`, {
        users: this.selected.map(user => user.id)
      }).then(() => {
        this.usersListDialog = false;
        this.getNotifications();
      })
    },
    send(item) {
      this.$http.post(`notifications/${item.id}/send`).then(r => {
        this.notifications.splice(this.notifications.indexOf(item), 1, r.body.notification);
      })
    },
    showUsersList(item) {
      this.edit_item = item;
      this.showUsersDialog = true;
      this.getSelectedUsers();
    }
  }
}
</script>

<style scoped>

</style>
