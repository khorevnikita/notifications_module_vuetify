//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script = {
  name: "Notifications",
  data: function () { return ({
    headers: [
      {text: 'ID', sortable: true, value: 'id'},
      {text: 'Тип', sortable: true, value: 'type'},
      {text: 'Заголовок', sortable: true, value: 'title'},
      {text: 'Текст', sortable: false, value: 'text'},
      {text: 'Кол-во получателей', sortable: true, value: 'customers_count'},
      {text: 'Дата отправки', sortable: true, value: 'sent_at'},
      {text: '', sortable: false, value: 'sending'},
      {text: '', sortable: false, value: 'actions'} ],
    options: {},
    notifications: [],
    page: 1,
    q: {
      search: "",
    },
    total: 0,
    pages: 0,
    edit_item: {},
    edit_dialog: false,
    errors: {},
    notificationTypes: [
      {key: "push", label: "Push-уведомление"},
      {key: "email", label: "E-mail"},
      {key: "any", label: "Все каналы"} ],


    usersListDialog: false,
    userHeaders: [
      {text: 'ID', sortable: false, value: 'id'},
      {text: 'Фамилия', sortable: false, value: 'lastName'},
      {text: 'Имя', sortable: false, value: 'firstName'},
      {text: 'E-mail', sortable: false, value: 'email'} ],
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
  }); },
  created: function created() {
    if (this.$route.query.page) {
      this.page = parseInt(this.$route.query.page);
    }
  },
  mounted: function mounted() {
    this.getNotifications();
  },
  watch: {
    '$route.query.page': function (v) {
      this.page = parseInt(v);
      this.getNotifications();
    },
    options: {
      handler: function handler() {
        this.getNotifications();
      },
      deep: true,
    },
    page: function page(v) {
      this.$router.replace(("/notifications?page=" + v)).catch(function () {
      });
    },

    userOptions: {
      handler: function handler() {
        this.fetchUsers();
      },
      deep: true,
    },
    userQ: {
      handler: function handler() {
        this.fetchUsers();
      }, deep: true
    },
    selected: {
      handler: function handler(v) {
        console.log(v);
      }, deep: true
    }
  },
  methods: {
    search: function search() {
      this.page = 1;
      this.getNotifications();
    },
    getNotifications: function getNotifications() {
      var this$1 = this;

      var data = Object.assign({}, this.q,
        {page: this.page,
        sortBy: this.options.sortBy[0] ? this.options.sortBy[0] : '',
        sortDesc: this.options.sortDesc[0] ? 1 : 0});
      var query = new URLSearchParams(data).toString();
      this.$http.get(("notifications?" + query)).then(function (r) {
        this$1.notifications = r.body.notifications;
        this$1.total = r.body.totaCount;
        this$1.pages = r.body.pagesCount;
      });
    },
    addItem: function addItem() {
      this.edit_item = {};
      this.edit_dialog = true;
    },
    edit: function edit(item) {
      this.edit_item = item;
      this.edit_dialog = true;
    },
    store: function store() {
      var this$1 = this;

      this.errors = {};
      this.$http.post("notifications", this.edit_item).then(function () {
        this$1.getNotifications();
        this$1.edit_dialog = false;
      }).catch(function (err) {
        this$1.errors = err.body.errors;
      });
    },
    update: function update() {
      var this$1 = this;

      this.errors = {};
      this.$http.put(("notifications/" + (this.edit_item.id)), this.edit_item).then(function () {
        this$1.edit_dialog = false;
      }).catch(function (err) {
        this$1.errors = err.body.errors;
      });
    },
    destroy: function destroy(item) {
      var this$1 = this;

      if (confirm("Вы уверены, что хотите удалить уведомление?")) {
        this.$http.delete(("notifications/" + (item.id))).then(function () {
          this$1.notifications.splice(this$1.notifications.indexOf(item), 1);
          this$1.edit_dialog = false;
        });
      }
    },
    selectUsers: function selectUsers(item) {
      this.edit_item = item;
      console.log('edit',this.edit_item);
      this.usersListDialog = true;
      this.getSelectedUsers();
      this.fetchUsers();
    },
    getSelectedUsers: function getSelectedUsers() {
      var this$1 = this;

      this.$http.get(("notifications/" + (this.edit_item.id) + "/customers")).then(function (r) {
        this$1.selected = r.body.customers;
      });
    },
    fetchUsers: function fetchUsers() {
      var this$1 = this;

      var pagination = {page: this.userOptions.page ? this.userOptions.page : 1, take: this.userOptions.itemsPerPage ? this.userOptions.itemsPerPage : 10};
      var query = new URLSearchParams(Object.assign({}, this.userQ, pagination)).toString();
      this.$http.get(("customers?" + query)).then(function (r) {
        this$1.totalUsers = r.body.total_count;
        this$1.users = r.body.customers;
      });
    },
    syncUsers: function syncUsers() {
      var this$1 = this;

      this.$http.post(("notifications/" + (this.edit_item.id) + "/set-customers"), {
        customers: this.selected.map(function (user) { return user.id; })
      }).then(function () {
        this$1.usersListDialog = false;
        this$1.getNotifications();
      });
    },
    send: function send(item) {
      var this$1 = this;

      this.$http.post(("notifications/" + (item.id) + "/send")).then(function (r) {
        this$1.notifications.splice(this$1.notifications.indexOf(item), 1, r.body.notification);
      });
    },
    showUsersList: function showUsersList(item) {
      this.edit_item = item;
      this.showUsersDialog = true;
      this.getSelectedUsers();
    }
  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    var options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    var hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            var originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

var isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return function (id, style) { return addStyle(id, style); };
}
var HEAD;
var styles = {};
function addStyle(id, css) {
    var group = isOldIE ? css.media || 'default' : id;
    var style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        var code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                { style.element.setAttribute('media', css.media); }
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            var index = style.ids.size - 1;
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index])
                { style.element.removeChild(nodes[index]); }
            if (nodes.length)
                { style.element.insertBefore(textNode, nodes[index]); }
            else
                { style.element.appendChild(textNode); }
        }
    }
}

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function () {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    [
      _c(
        "v-row",
        [
          _c(
            "v-col",
            { attrs: { cols: "12" } },
            [
              _c(
                "v-btn",
                {
                  staticClass: "float-right",
                  attrs: { outlined: "", color: "primary" },
                  on: {
                    click: function ($event) {
                      return _vm.addItem()
                    },
                  },
                },
                [_vm._v("Создать уведомление")]
              ) ],
            1
          ),
          _vm._v(" "),
          _c(
            "v-col",
            {
              staticClass: "d-flex align-center",
              attrs: { cols: "12", sm: "6" },
            },
            [
              _c("v-text-field", {
                staticClass: "mx-4",
                attrs: { label: "Поиск", dense: "", "hide-details": "" },
                model: {
                  value: _vm.q.search,
                  callback: function ($$v) {
                    _vm.$set(_vm.q, "search", $$v);
                  },
                  expression: "q.search",
                },
              }) ],
            1
          ),
          _vm._v(" "),
          _c(
            "v-col",
            {
              staticClass: "d-flex align-center",
              attrs: { cols: "12", sm: "3" },
            },
            [
              _c("v-select", {
                attrs: {
                  label: "Тип",
                  "item-value": "key",
                  "item-text": "label",
                  items: _vm.notificationTypes,
                  dense: "",
                  "hide-details": "",
                },
                model: {
                  value: _vm.q.type,
                  callback: function ($$v) {
                    _vm.$set(_vm.q, "type", $$v);
                  },
                  expression: "q.type",
                },
              }) ],
            1
          ),
          _vm._v(" "),
          _c(
            "v-col",
            {
              staticClass: "d-flex align-center",
              attrs: { cols: "12", sm: "3" },
            },
            [
              _c(
                "v-btn",
                {
                  attrs: { color: "primary" },
                  on: {
                    click: function ($event) {
                      return _vm.search()
                    },
                  },
                },
                [_vm._v("Найти")]
              ) ],
            1
          ) ],
        1
      ),
      _vm._v(" "),
      _c("v-data-table", {
        attrs: {
          headers: _vm.headers,
          items: _vm.notifications,
          "items-per-page": 30,
          options: _vm.options,
          "hide-default-footer": "",
        },
        on: {
          "update:options": function ($event) {
            _vm.options = $event;
          },
        },
        scopedSlots: _vm._u([
          {
            key: "item.type",
            fn: function (ref) {
              var item = ref.item;
              return [
                _c("span", [
                  _vm._v(
                    _vm._s(
                      _vm.notificationTypes.find(function (x) {
                        return x.key === item.type
                      }).label
                    )
                  ) ]) ]
            },
          },
          {
            key: "item.sent_at",
            fn: function (ref) {
              var item = ref.item;
              return [
                _c("span", [
                  _vm._v(_vm._s(item.sent_at ? item.sent_at : "Не отправлено")) ]) ]
            },
          },
          {
            key: "item.users_count",
            fn: function (ref) {
              var item = ref.item;
              return [
                _c(
                  "v-btn",
                  {
                    attrs: { text: "" },
                    on: {
                      click: function ($event) {
                        return _vm.showUsersList(item)
                      },
                    },
                  },
                  [_vm._v(_vm._s(item.users_count))]
                ) ]
            },
          },
          {
            key: "item.sending",
            fn: function (ref) {
              var item = ref.item;
              return [
                !item.sent_at
                  ? _c(
                      "v-btn",
                      {
                        attrs: { small: "", text: "", color: "primary" },
                        on: {
                          click: function ($event) {
                            return _vm.selectUsers(item)
                          },
                        },
                      },
                      [_vm._v("\n        Выбрать получателей\n      ")]
                    )
                  : _vm._e(),
                _vm._v(" "),
                !item.sent_at
                  ? _c(
                      "v-btn",
                      {
                        attrs: { small: "", text: "", color: "success" },
                        on: {
                          click: function ($event) {
                            return _vm.send(item)
                          },
                        },
                      },
                      [_vm._v("\n        Отправить\n      ")]
                    )
                  : _vm._e() ]
            },
          },
          {
            key: "item.actions",
            fn: function (ref) {
              var item = ref.item;
              return [
                !item.sent_at
                  ? _c(
                      "v-btn",
                      {
                        attrs: { small: "", icon: "", color: "warning" },
                        on: {
                          click: function ($event) {
                            return _vm.edit(item)
                          },
                        },
                      },
                      [_c("v-icon", [_vm._v("mdi-pencil")])],
                      1
                    )
                  : _vm._e(),
                _vm._v(" "),
                !item.sent_at
                  ? _c(
                      "v-btn",
                      {
                        attrs: { small: "", icon: "", color: "error" },
                        on: {
                          click: function ($event) {
                            return _vm.destroy(item)
                          },
                        },
                      },
                      [_c("v-icon", [_vm._v("mdi-delete")])],
                      1
                    )
                  : _vm._e() ]
            },
          } ]),
      }),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "text-center pt-2" },
        [
          _c("v-pagination", {
            attrs: { length: _vm.pages },
            model: {
              value: _vm.page,
              callback: function ($$v) {
                _vm.page = $$v;
              },
              expression: "page",
            },
          }) ],
        1
      ),
      _vm._v(" "),
      _c(
        "v-dialog",
        {
          attrs: { "max-width": "500" },
          model: {
            value: _vm.edit_dialog,
            callback: function ($$v) {
              _vm.edit_dialog = $$v;
            },
            expression: "edit_dialog",
          },
        },
        [
          _c(
            "v-card",
            [
              _c("v-card-title", [_vm._v("Изменить уведомление")]),
              _vm._v(" "),
              _c(
                "v-card-text",
                [
                  _c("v-select", {
                    attrs: {
                      label: "Тип",
                      "item-value": "key",
                      "item-text": "label",
                      items: _vm.notificationTypes,
                      outlined: "",
                    },
                    model: {
                      value: _vm.edit_item.type,
                      callback: function ($$v) {
                        _vm.$set(_vm.edit_item, "type", $$v);
                      },
                      expression: "edit_item.type",
                    },
                  }),
                  _vm._v(" "),
                  _c("v-text-field", {
                    attrs: {
                      label: "Заголовок",
                      outlined: "",
                      error: !!_vm.errors.title,
                      "error-count": 1,
                      "error-messages": _vm.errors.title,
                    },
                    model: {
                      value: _vm.edit_item.title,
                      callback: function ($$v) {
                        _vm.$set(_vm.edit_item, "title", $$v);
                      },
                      expression: "edit_item.title",
                    },
                  }),
                  _vm._v(" "),
                  _c("v-textarea", {
                    attrs: {
                      label: "Текст",
                      outlined: "",
                      error: !!_vm.errors.text,
                      "error-count": 1,
                      "error-messages": _vm.errors.text,
                    },
                    model: {
                      value: _vm.edit_item.text,
                      callback: function ($$v) {
                        _vm.$set(_vm.edit_item, "text", $$v);
                      },
                      expression: "edit_item.text",
                    },
                  }) ],
                1
              ),
              _vm._v(" "),
              _c(
                "v-card-actions",
                [
                  _c("v-spacer"),
                  _vm._v(" "),
                  _c(
                    "v-btn",
                    {
                      on: {
                        click: function ($event) {
                          _vm.edit_item.id ? _vm.update() : _vm.store();
                        },
                      },
                    },
                    [_vm._v("Сохранить")]
                  ) ],
                1
              ) ],
            1
          ) ],
        1
      ),
      _vm._v(" "),
      _c(
        "v-dialog",
        {
          attrs: { "max-width": "900" },
          model: {
            value: _vm.usersListDialog,
            callback: function ($$v) {
              _vm.usersListDialog = $$v;
            },
            expression: "usersListDialog",
          },
        },
        [
          _c(
            "v-card",
            [
              _c("v-card-title", [_vm._v("Выберите получателей")]),
              _vm._v(" "),
              _c(
                "v-card-text",
                [
                  _c(
                    "v-row",
                    [
                      _c(
                        "v-col",
                        {
                          staticClass: "d-flex align-center",
                          attrs: { cols: "12", md: "5" },
                        },
                        [
                          _c("v-text-field", {
                            staticClass: "mx-4",
                            attrs: { label: "Поиск" },
                            model: {
                              value: _vm.userQ.search,
                              callback: function ($$v) {
                                _vm.$set(_vm.userQ, "search", $$v);
                              },
                              expression: "userQ.search",
                            },
                          }) ],
                        1
                      ),
                      _vm._v(" "),
                      _c(
                        "v-col",
                        {
                          staticClass: "d-flex align-center",
                          attrs: { cols: "12", md: "2" },
                        },
                        [
                          _c("v-checkbox", {
                            attrs: {
                              label: "Прикреплённые",
                              value: _vm.edit_item.id,
                              "false-value": 0,
                              "true-value": _vm.edit_item.id,
                            },
                            model: {
                              value: _vm.userQ.notification_id,
                              callback: function ($$v) {
                                _vm.$set(_vm.userQ, "notification_id", $$v);
                              },
                              expression: "userQ.notification_id",
                            },
                          }) ],
                        1
                      ) ],
                    1
                  ),
                  _vm._v(" "),
                  _c("v-data-table", {
                    attrs: {
                      headers: _vm.userHeaders,
                      items: _vm.users,
                      "single-select": false,
                      "item-key": "id",
                      "show-select": "",
                      options: _vm.userOptions,
                      "server-items-length": _vm.totalUsers,
                    },
                    on: {
                      "update:options": function ($event) {
                        _vm.userOptions = $event;
                      },
                    },
                    model: {
                      value: _vm.selected,
                      callback: function ($$v) {
                        _vm.selected = $$v;
                      },
                      expression: "selected",
                    },
                  }) ],
                1
              ),
              _vm._v(" "),
              _c(
                "v-card-actions",
                [
                  _c("v-spacer"),
                  _vm._v(" "),
                  _c(
                    "v-btn",
                    {
                      attrs: { color: "primary" },
                      on: { click: _vm.syncUsers },
                    },
                    [_vm._v("Выбрать")]
                  ) ],
                1
              ) ],
            1
          ) ],
        1
      ),
      _vm._v(" "),
      _c(
        "v-dialog",
        {
          attrs: { "max-width": "500" },
          model: {
            value: _vm.showUsersDialog,
            callback: function ($$v) {
              _vm.showUsersDialog = $$v;
            },
            expression: "showUsersDialog",
          },
        },
        [
          _c(
            "v-card",
            [
              _c("v-card-title", [
                _vm._v("Получатели рассылки "),
                _c("br"),
                _vm._v(
                  ' "' +
                    _vm._s(_vm.edit_item.title) +
                    '" (' +
                    _vm._s(_vm.selected.length) +
                    ")"
                ) ]),
              _vm._v(" "),
              _c(
                "v-card-text",
                [
                  _c(
                    "v-list",
                    _vm._l(_vm.selected, function (u) {
                      return _c(
                        "v-list-item",
                        { key: u.id },
                        [
                          _c(
                            "v-list-item-content",
                            [
                              _c("v-list-item-title", [
                                _vm._v(
                                  _vm._s(u.lastName) + " " + _vm._s(u.firstName)
                                ) ]),
                              _vm._v(" "),
                              _c("v-list-item-subtitle", [
                                _vm._v(_vm._s(u.email)) ]) ],
                            1
                          ) ],
                        1
                      )
                    }),
                    1
                  ) ],
                1
              ),
              _vm._v(" "),
              _c(
                "v-card-actions",
                [
                  _c("v-spacer"),
                  _vm._v(" "),
                  _c(
                    "v-btn",
                    {
                      on: {
                        click: function ($event) {
                          _vm.showUsersDialog = false;
                        },
                      },
                    },
                    [_vm._v("Закрыть")]
                  ) ],
                1
              ) ],
            1
          ) ],
        1
      ) ],
    1
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-cd3e120c_0", { source: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", map: {"version":3,"sources":[],"names":[],"mappings":"","file":"Notifications.vue"}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-cd3e120c";
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

// Импорт vue компонента

// Объявление функции установки, выполняемой Vue.use()
function install(Vue) {
    if (install.installed) { return; }
    install.installed = true;
    Vue.component('Notifications', __vue_component__);
}

// Создание значения модуля для Vue.use()
var plugin = {
    install: install
};

// Автоматическая установка, когда vue найден (например в браузере с помощью тега <script>)
var GlobalVue = null;
if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
}
if (GlobalVue) {
    GlobalVue.use(plugin);
}

export default __vue_component__;
export { install };