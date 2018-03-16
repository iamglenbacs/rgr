import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { fromGlobalId } from 'graphql-relay';

import likeTodoMutation from '../../mutations/likeTodo';
import TodoLikedSubscription from '../../subscriptions/todoAdded';

class Todo extends Component {
  _likeTodo = (e) => {
    e.preventDefault();
    const { viewer, todo } = this.props;
    const { id: clientUserId } = viewer; // userId is owner of the todo
    const mutation = likeTodoMutation(
      { todoId: fromGlobalId(todo.id).id, userId: fromGlobalId(clientUserId).id },
      {
        onSuccess: () => console.log('like mutation successful'),
        onError: e => console.log('like mutation failed = ', e),
        optimisticUpdater: store => {
          const todoProxy = store.get(todo.id)
          const todoProxyLikes = todoProxy.getValue('likes')
          const todoProxyLikersUserId = todoProxy.getValue('likersUserId')
          const userIdinDb = fromGlobalId(clientUserId).id
          const userLiked = todoProxyLikersUserId.includes(userIdinDb)
          const newTodoLikes = userLiked ? todoProxyLikes - 1 : todoProxyLikes + 1
          const newTodoLikersUserId = userLiked ? [...todoProxyLikersUserId].filter(id => id !== userIdinDb) : [...todoProxyLikersUserId, userIdinDb]
            todoProxy.setValue(newTodoLikes, 'likes')
            todoProxy.setValue(newTodoLikersUserId, 'likersUserId')
        },
        updater: store => {
          const todoFieldsToUpdate = [
            'text',
            'complete',
            'owner',
            'likes',
            'likersUserId',
          ];
          const likeTodoPayload = store.getRootField('likeTodo'); // payload from the mutation name
            const todoEdge = likeTodoPayload.getLinkedRecord('todo'); // the new todo added
            const todoNode = todoEdge.getLinkedRecord('node');
          const todoProxy = store.get(todo.id)
          todoFieldsToUpdate.forEach(field => {
            const value = todoNode.getValue(field);
            todoProxy.setValue(value, field)
          });
        },
      },
    );
    mutation.commit()
  }
  
  render() {
    const { todo, viewer } = this.props;
    const userIdinDb = fromGlobalId(viewer.id).id;
    const userLiked = todo.likersUserId.includes(userIdinDb);
    return (
      <div className="card text-center" style={{ width: '18rem' }}>
        <div className="card-body">
          <h5 className="card-title">{todo.owner}</h5>
          <p className="card-text">text: {todo.text} complete: {`${todo.complete}`} likes: {Number(todo.likes)}</p>
          <button
            className={userLiked ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={this._likeTodo}
          >
            Like
          </button>
          {userLiked ? ` you and ${Number(todo.likes) -1} people likes this todo` : ` ${Number(todo.likes)} likes this`}
        </div>
      </div>
    );
  }
}

// export default createRefetchContainer(
//   Todo,
//   graphql`
//     fragment Todo_todo on Todo {
//       id
//       text
//       complete
//       owner
//       likes
//       likersUserId
//     }
//     fragment Todo_viewer on User {
//       id
//       displayName
//     }
//   `,
//   graphql`
//     query TodoRefetchQuery($itemID: String) {
//       item: node(id: $itemID) {
//         ...TodoItem_item
//       }
//     }
//   `
// );

export default createFragmentContainer(
  Todo,
  {
    todo: graphql`
      fragment Todo_todo on Todo {
        id
        text
        complete
        owner
        likes
        likersUserId
      }
    `,
    viewer: graphql`
      fragment Todo_viewer on User {
        id
        displayName
      }
    `
  }
)