import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


class ListItem extends Component {

  state = {
    name: "",
    isSelected: false,
    edit: false
  };

  settings = {
    name: "",
    edit: false,
    selected: false
  };

  componentDidMount() {
    this.setState({
      name: this.props.name,
      edit: this.props.edit
    });
  }

  triggerChange() {
    this.props.onChange(this.settings);
  }

  toggleEditMode() {
    this.setState({
      edit: !this.settings.edit
    });

    this.settings.edit = !this.settings.edit;
    this.triggerChange();
  }

  select() {
    var selected = !this.state.isSelected;
    this.setState({ isSelected: selected });
    this.settings.selected = selected;

    this.triggerChange();
  }

  nameChanged(e) {
    this.setState({
      name: e.target.value,
      edit: false
    });

    this.settings.edit = false;
    this.settings.name = e.target.value;
    this.triggerChange();
  }

  render() {
    this.settings.edit = this.props.edit;
    this.settings.name = this.props.name;

    let isSelected = (this.props.selected) ? 'list-item selected' : 'list-item';

    var itemText = (
      <div className="item-text">
        { this.props.name } ({ this.state.edit.toString() })
      </div>
    );

    var itemInput = (
      <div className="item-input">
        <input type="text" onBlur={ this.nameChanged.bind(this) } defaultValue={ this.state.name }/>
      </div>
    );

    return (
      <li className={ isSelected }>
        <div className="select-area" onClick={ this.select.bind(this) }></div>

        <span className="text">
          { (this.state.edit || this.settings.edit) ? itemInput : itemText }
        </span>

        <div className="buttons">
          <button className="btn-success" onClick={ this.toggleEditMode.bind(this) }> { (!this.state.edit) ? 'Edit' : 'Save' }  </button>
          <button className="btn-danger" onClick={ this.props.onRemove }> Remove </button>
        </div>
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
      itemsAdded: 0,
      itemsSelected: 0,
    },

    past: [],
    future: []
  };

  componentDidMount() {
    var past = this.state.past;
    past.push(this.cloneState(this.state.present));

    this.setState({
      past: past
    });
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
      edit: false,
      selected: false
    });

    this.setState({
      stateIndex: this.state.past.length - 1
    }, function() {
      this.setTimeState({
        items: items,
        itemsAdded: this.state.present.itemsAdded + 1
      });
    }.bind(this));
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
  }

  undoChange() {
    if (this.state.stateIndex > 0) {
      var stateIndex = this.state.stateIndex - 1;
      var stateAfterUndo = this.cloneState(this.state.past[stateIndex]);

      this.setState({
        stateIndex: stateIndex,
        present: stateAfterUndo
      });
    }
  }

  redoChange() {
    if(this.state.stateIndex < this.state.past.length - 1) {
      var stateIndex = this.state.stateIndex + 1;
      var stateAfterRedo = this.cloneState(this.state.past[stateIndex]);

      this.setState({
        stateIndex: stateIndex,
        present: stateAfterRedo
      });
    }
  }

  listItemChanged(changedItem, itemState) {
    var items = this.state.present.items;
    var itemIndex = items.findIndex(item => item.id === changedItem.id);
    items[itemIndex] = Object.assign(items[itemIndex], itemState);

    this.setTimeState({
      itemsSelected: items.filter(item => item.selected === true).length,
      items: items
    });

  }

  getListItem(item, i) {
    return (
      <ListItem key={ i }
                name={ item.name }
                edit={ item.edit }
                selected={ item.selected }
                onRemove={ this.removeItem.bind(this, item) }
                onChange={ this.listItemChanged.bind(this, item) }
      >
      </ListItem>
    );
  }

  render() {

    var ItemsList;

    if (this.state.present.items.length > 0) {
      ItemsList = this.state.present.items.map((item, i) => this.getListItem(item, i));
    } else {
      ItemsList = (
        <li className="empty-list"> No items added </li>
      );
    }

    return (
      <div className="App">
        <div className="App-header">
          <img src={ logo } className="App-logo" alt="logo" />
        </div>
        <div className="container">

          <div className="left-nav">
            <button onClick={ this.undoChange.bind(this) }> Undo </button>
            <button onClick={ this.redoChange.bind(this) }> Redo </button>

            { this.state.present.items.length > 0 && this.state.present.itemsSelected > 0 && (
              <div className="total-items"> { this.state.present.itemsSelected } items selected </div>
            )}

          </div>
          <ul>
            { ItemsList }
          </ul>

          <p>
            <button onClick={ this.addItem.bind(this) }> Add Item </button>
            <button onClick={ this.clearList.bind(this) }> Clear List </button>
          </p>


        </div>

      </div>
    );
  }
}

export default App;
