# Laravel API Client
## The simple package for authorization with token and data cache
## Install
```
npm i larapi
```

### First step
#### you can create instance or use static methods for first configuration and for further use
```js
const api = new API({
	host: 'https://my-host'
});
...
API.setHost('https://my-host');
```

#### To use typing - use new instanse
#### The first argument of the class takes the type of requests, and the second the type of the user

```js
type TTodo = {
	id: number;
	userId: number;
	title: string;
	completed: boolean;
};

type TApiTodos = {
	success: {
		'todos': () => TTodo[],
		[path: `todos/${number}`]: (request: Omit<TTodo, 'id'>) => TTodo;
	},
	error: {
		message: string;
	}
};

const api = new API<TApiTodos>({
	host: 'https://jsonplaceholder.typicode.com/',
});
...

api.get({
	path: 'todos/1',
	success: (e) => {
		console.log(e.id);
	},
	error: (e) => {
		console.log(e);
	}
});
```

### Authorization
#### token useds in the header Authorization: Bearer
```js
api.setToken('token');
api.setUser({...object-user});
```
#### you can use method getUser or property user for get user object
```js
api.getUser();
...
api.user;
```

### Requests

#### Get
```js
api.get({
  path: '/test',
  success: (e) => {
    console.log(e)
  }
});
```

#### Post
```js
api.post({
  path: '/test',
  data: {
    message: 'hello world'
  }
  success: (e) => {
    console.log(e)
  }
});
```

### Cache

#### for create simple cache use boolean true in the "cache" property
```js
const request = api.get({
  path: '/test',
  cache: true,
  ...
});
```

#### if you need clear current cache - use method "clearCache"
```js
request.clearCache();
```
#### or you can use method "updateCache" for update current cache data in the current request
#### first argument in the method is object updated data, and last argument is key field for search in the current cache, if you need update all data use null
```js
request.updateCache({
  message: 'update this string'
}, null);
```
