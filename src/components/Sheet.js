const { Component, h } = require('preact') /** @jsx h */
const c = require('classnames')

const store = require('../store')

class Sheet extends Component {
  constructor (props) {
    super(props)
    this._onClick = this._onClick.bind(this)
  }

  render (props) {
    return (
      <div
        class={c('relative pb6 ph4 min-vh-100 bg-black-40', props.class)}
        style={{ paddingTop: '5.6rem' }}
        onClick={this._onClick}
      >
        {props.children}
      </div>
    )
  }

  _onClick (e) {
    const { location, currentTrackUrl } = store

    if (location.name === 'track' || currentTrackUrl == null) return

    if (e.target !== e.currentTarget &&
        (!e.target.parentElement || e.target.parentElement !== e.currentTarget)) {
      return
    }
    store.dispatch('LOCATION_PUSH', currentTrackUrl)
  }
}

module.exports = Sheet
