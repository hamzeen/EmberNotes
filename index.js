window.Todos = Ember.Application.create();

Todos.ApplicationAdapter = DS.FixtureAdapter.extend();
Ember.TextField.reopen({
  attributeBindings: ['autofocus'],
  autofocus: 'autofocus'
});
Todos.Router.map(function () {
  this.resource('todos', { path: '/' });
});

Todos.TodosRoute = Ember.Route.extend({
  model: function () {
    return this.store.find('todo');
  }
});

Todos.Todo = DS.Model.extend({
  title: DS.attr('string'),
  isCompleted: DS.attr('boolean')
});

Todos.Todo.FIXTURES = [
  {id: 1,title: 'Code',isCompleted: false},
  {id: 2,title: 'Travel',isCompleted: false},
  {id: 3,title: 'Eat',isCompleted: true},
  {id: 4,title: 'Sleep',isCompleted: true},
  {id: 5,title: 'Repeat!',isCompleted: false}
];

Todos.TodoController = Ember.ObjectController.extend({
  actions: {

    editTodo: function () {
      this.set('isEditing', true);
    },

    doneEditing: function () {
				var title = this.get('title').trim();
				if (Ember.isEmpty(title)) {
					// The `doneEditing` action gets sent twice when the user hits
					// enter (once via 'insert-newline' and once via 'focus-out').
					// We debounce our call to 'removeTodo' so that it only gets
					// made once.
					Ember.run.debounce(this, 'removeTodo', 0);
				} else {
					var todo = this.get('model');
					todo.set('title', title);
					todo.save();
				}

				// Re-set newly edited title in order persist its trimmed version
				this.set('title', title);
				this.set('isEditing', false);
		},

    cancelEditing: function () {
      console.log("isEditing:: "+this.get('isEditing'));
			this.set('title', this.get('title'));
			this.set('isEditing', false);
      console.log("isEditing:: "+this.get('isEditing'));
		},

    removeTodo: function () {
			this.removeTodo();
		}
  },

  removeTodo: function () {
		var todo = this.get('model');
		todo.deleteRecord();
		todo.save();
	},
  isEditing: false,

  isCompleted: function(key, value){
    var model = this.get('model');

    if (value === undefined) {
      // property being used as a getter
      return model.get('isCompleted');
    } else {
      // property being used as  setter
      model.set('isCompleted', value);
      model.save();
      return value;
    }
  }.property('model.isCompleted')
});

Todos.TodosController = Ember.ArrayController.extend({
  actions: {
    createTodo: function () {
      // Get the todo title set by the "New Todo" text field
      var title = this.get('newTitle');
      if (!title.trim()) { return; }

      // Create the new Todo model
      var todo = this.store.createRecord('todo', {
        title: title,
        isCompleted: false
      });

      // Clear the "New Todo" text field
      this.set('newTitle', '');
      // Save the new model
      todo.save();
    }
  },

  remaining: function () {
    return this.filterProperty('isCompleted', false).get('length');
  }.property('@each.isCompleted'),

  inflection: function () {
    var remaining = this.get('remaining');
    return remaining === 1 ? 'item' : 'items';
  }.property('remaining')
});
