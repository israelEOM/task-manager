export function setCurrentStyleName (state, name) {
  state.currentStyleName = name
}
export function setStyle (state, { name, value }) {
  this.$set(state.style, name, value)
}
