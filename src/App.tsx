import React, { useEffect, useState } from 'react';
import './App.css';
import Axios from 'axios';

// you namespace code, that you obtained when doing `npx jastore namespace:create`
const namespace = `4ckdhi5dhmwvzu8d0c`;

// configuring axios to query that namespace's API
const ajax = Axios.create({
  baseURL: `https://${namespace}.jastore.space`,
  withCredentials: true,
});


function App() {

  // infos comming from the namespace API
  const [profile, setProfile] = useState<any>();
  const [todos, setTodos] = useState<any[]>([]);

  // loading states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingTodos, setLoadingTodos] = useState(true);
  const loading = loadingTodos || loadingProfile;

  const [newTodoTitle, setNewTodoTitle] = useState('');

  // this will fetch the list of todos from the resource we created
  // by doing `npx resource:create todos`
  const loadTodos = () => {
    if (profile) {
      setLoadingTodos(true);

      ajax.get(`/todos`, { params : { orderBy : `createdAt desc` }})
        .then(({ data }) => setTodos(data))
        .catch(console.error)
        .finally(() => setLoadingTodos(false))
    } else {
      setLoadingTodos(false);
      setTodos([]);
    }
  }

  // in a namespace, every logged-in user can access the /auth/profile endpoint
  // to get its own user infos (email...)
  // if the user is not connected, this will return a 401 error that we can use to
  // know that the user is not connected and display the sign-in / sign-up link
  const loadProfile = () => {
    setLoadingProfile(true);

    ajax.request({
      url: '/auth/profile',
      method: 'GET',
    })
      .then(({ data }) => setProfile(data))
      .catch(console.error)
      .finally(() => setLoadingProfile(false))
  }


  const handleAddTodo = () => {
    setLoadingTodos(true);

    ajax.post('/todos', {
      title: newTodoTitle,
      user: profile.email,
      createdAt: new Date(),
    })
    .then(loadTodos)
    .then(() => setNewTodoTitle(''))
  }

  useEffect(loadProfile, []);
  useEffect(loadTodos, [profile])
  
  
  return (
    <div className="App">
      {
        loading ? 
        'Loading...'
        :
        <div>
          {
            profile ?
            `Connected as ${profile.email}`
            :
            <>
              <a href={`https://${namespace}.jastore.space/pages/login`}>Log in</a>
              &nbsp;-&nbsp;
              <a href={`https://${namespace}.jastore.space/pages/signup`}>Sign up</a>
            </>
          }
        </div>
      }
      {
        !loading && profile && 
        <div>
          <ul>
            <li>
              <input type="text" value={newTodoTitle} onChange={e => setNewTodoTitle(e.target.value)} />
              <button onClick={handleAddTodo}>add</button>
            </li>
            {
              todos.map(todo => (
                <div key={todo.uuid}>
                  { todo.title }
                </div>
              ))
            }
          </ul>
        </div>
      }
    </div>
  );
}

export default App;
