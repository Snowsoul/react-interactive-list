import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


class ListItem extends Component {
  state = {
    edit: false
  }

  componentDidMount() {
    this.setState({ edit: this.props.edit });
  }

  setStateWithChange(values) {
    this.setState(values);
    this.props.onChange(this.state);
  }

  toggleEditMode() {
    this.setStateWithChange({
      edit: !this.state.edit
    });
  }

  render() {
    return (
      <li>
        { this.props.name }

        ({ this.state.edit.toString() }) -

        <button onClick={ this.toggleEditMode.bind(this) }> Edit </button>
        <button onClick={ this.props.onRemove }> Remove </button>
      </li>
    );
  }

}

class App extends Component {
  state = {
    stateIndex: 0,
    undoChanges: 0,

    present: {
      items:[],
      itemsRemoved: 0,
      itemsAdded: 0
    },

    past: [],
    future: []
  }

  componentDidMount() {
    var past = this.state.past;
    past.push(this.cloneState(this.state.present));

    this.setState({
      past: past
    });

    console.log(this.state);
  }

  cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  setTimeState(newPresentState) {
    var past = this.state.past;

    var newState = Object.assign(this.state.present, newPresentState);
    var presentState = this.cloneState(newState);
    past.push(this.cloneState(presentState));


    this.setState({
      present: presentState,
      past: past,
      stateIndex: this.state.stateIndex + 1
    });
  }

  addItem() {
    var items = this.state.present.items;
    var id = items.length + 1 + this.state.present.itemsRemoved;

    items.push({
      id: id,
      name: "Item " + id,
      edit: false
    });

    this.setTimeState({
      items: items,
      itemsAdded: this.state.present.itemsAdded + 1
    });
  }

  removeItem(itemToRemove) {
    var items = this.state.present.items;
    var itemToRemoveIndex = items.findIndex(item => item.id === itemToRemove.id);

    items.splice(itemToRemoveIndex, 1);

    this.setTimeState({
      items: items,
      itemsRemoved: this.state.itemsRemoved + 1
    });
  }


  clearList() {
    this.setTimeState({
      items: [],
      itemsRemoved: 0,
      itemsAdded: 0
    });

    console.log(this.state);
  }

  undoChange() {
    if (this.state.stateIndex > 0) {
      console.log("undo");

      var stateIndex = this.state.stateIndex - 1;
      // var stateBeforeUndo = this.state.present;
      var stateAfterUndo = this.cloneState(this.state.past[stateIndex]);

      this.setState({
        stateIndex: stateIndex,
        present: stateAfterUndo
      });

      console.log(this.state);
    }
  }

  redoChange() {

  }

  listItemChanged(id, itemState) {
    var item = this.state.present.items.find(item => item.id === id);
    console.log(itemState);
  }

  getListItem(item, i) {
    return (
      <ListItem key={ i }
                name={ item.name }
                edit={ item.edit }
                onRemove={ this.removeItem.bind(this, item) }
                onChange={ this.listItemChanged.bind(this, item) }
      >
      </ListItem>
    );
  }

  render() {
    var ItemsList = this.state.present.items.map((item, i) => this.getListItem(item, i));

    return (
      <div className="App">
        <div className="App-header">
          <img src={ logo } className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <div>
          <ul>
            { ItemsList }
          </ul>
        </div>
        <p>
          <button onClick={ this.addItem.bind(this) }> Add Item </button>
          <button onClick={ this.clearList.bind(this) }> Clear List </button>
        </p>

        <p>
          <button onClick={ this.undoChange.bind(this) }> Undo </button>
          <button onClick={ this.redoChange.bind(this) }> Redo </button>
        </p>
      </div>
    );
  }
}

export default App;
