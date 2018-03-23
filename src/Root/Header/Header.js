import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { createPaginationContainer, graphql } from 'react-relay';
import './style.css';

class Header extends React.Component {
  render() {
    const authorized = localStorage.getItem('token')
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="/">HighOutput</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarText">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <NavLink
                to="/home"
                activeClassName="active"
                className="nav-link"
              >
                <i className="fa fa-home"/>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/profile"
                activeClassName="active"
                className="nav-link"
              >
                <i className="fa fa-user-circle-o"/>
                Profile
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/messages"
                activeClassName="active"
                className="nav-link"
              >
                <i className="fa fa-envelope-o" aria-hidden="true"/>
                Messages
              </NavLink>
            </li>
            <li className="nav-item dropdown">
              <span className="nav-link dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Notifications
              </span>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <span style={{backgroundColor:'#fff !important'}}className="dropdown-item">
                  <ul style={{overflowY: 'scroll', height: '200px', backgroundColor:'#fff !important'}}>
                    {this.props.viewer.notifications.edges.map(({ node }) => (
                      <li>id: {`${node.id}`} todoId: {`${node.todoId}`} likerId: {`${node.likerId}`} seen: {`${node.seen}`} </li>
                    ))}
                  </ul>
                </span>
              </div>
            </li>
          </ul>
            {authorized ?
              <span
                className="navbar-text"
                onClick={() => {
                  localStorage.removeItem('token')
                  this.props.history.push('login')
                }}
              >
                <i className="fa fa-sign-out"/>
                Logout
              </span>
              :
              <NavLink
                to="/login"
                activeClassName="active"
                className="nav-link"
              >
                <span className="navbar-text">
                  <i className="fa fa-key"/>
                  Login
                </span>
              </NavLink>
            }
        </div>
      </nav>
    );
  }
}

export default createPaginationContainer(
  withRouter(Header),
  {
    viewer: graphql`
      fragment Header_viewer on User
      @argumentDefinitions(
        count: {type: "Int", defaultValue: 5}
        cursor: {type: "ID"}
      ) {
        id
        notifications(
          first: $count
          after: $cursor
        ) @connection(key: "Header_notifications") {
          edges {
            node {
              id
              todoId
              likerId
              seen
            }
          }
        }
      }
    `,
  },
  {
    direction: 'backward',
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.notifications;
    },
    // This is also the default implementation of `getFragmentVariables` if it isn't provided.
    getFragmentVariables(prevVars, totalCount) {
      return { ...prevVars, count: totalCount, };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      return { count, cursor, };
    },
    query: graphql`
      query FeedPaginationQuery(
        $count: Int!
        $cursor: ID
      ) {
        viewer {
          ...Header_viewer @arguments(count: $count, cursor: $cursor)
        }
      }
    `
  }
);
